const Rating = require('../models/Rating');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const User = require('../models/User');
const TrustHistory = require('../models/TrustHistory');

const SIGNAL_WEIGHTS = {
  punctuality: 0.18,
  completion: 0.14,
  rating: 0.16,
  care: 0.12,
  contribution: 0.08,
  diversity: 0.12,
  verification: 0.08,
  responsiveness: 0.06,
  valueHandling: 0.06,
};

const TRUST_TIERS = [
  { label: 'LOW', min: 0, max: 0.4 },
  { label: 'MODERATE', min: 0.4, max: 0.6 },
  { label: 'RELIABLE', min: 0.6, max: 0.8 },
  { label: 'HIGHLY_RELIABLE', min: 0.8, max: 1.01 },
];

const BORROW_LIMITS = {
  LOW: { maxActive: 1, maxValueTier: 'LOW', maxDurationDays: 7 },
  MODERATE: { maxActive: 2, maxValueTier: 'MEDIUM', maxDurationDays: 14 },
  RELIABLE: { maxActive: 3, maxValueTier: 'HIGH', maxDurationDays: 21 },
  HIGHLY_RELIABLE: { maxActive: 4, maxValueTier: 'HIGH', maxDurationDays: 30 },
};

const VALUE_TIER_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const VALUE_TIER_WEIGHT = { LOW: 1, MEDIUM: 1.1, HIGH: 1.25 };
const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;
const MAX_TOTAL_PENALTY = 0.32;

const clamp01 = (value) => Math.min(Math.max(value || 0, 0), 1);
const roundMetric = (value, digits = 4) => Number(clamp01(value).toFixed(digits));
const roundValue = (value, digits = 2) => Number((value || 0).toFixed(digits));
const normalizeFiveStar = (value) => clamp01((value || 0) / 5);

const getTrustTier = (trustValue) => {
  const tier = TRUST_TIERS.find((entry) => trustValue >= entry.min && trustValue < entry.max);
  return tier ? tier.label : 'LOW';
};

const getBorrowLimits = (tierLabel) => {
  return BORROW_LIMITS[tierLabel] || BORROW_LIMITS.LOW;
};

const applyManualBorrowLimits = (baseLimits, manualLimits) => {
  if (!manualLimits) return baseLimits;
  const baseRank = VALUE_TIER_RANK[baseLimits.maxValueTier] || 1;
  const manualRank = VALUE_TIER_RANK[manualLimits.maxValueTier] || baseRank;
  const maxValueTier = manualLimits.maxValueTier
    ? manualRank < baseRank
      ? manualLimits.maxValueTier
      : baseLimits.maxValueTier
    : baseLimits.maxValueTier;
  return {
    maxActive: manualLimits.maxActive
      ? Math.min(baseLimits.maxActive, manualLimits.maxActive)
      : baseLimits.maxActive,
    maxValueTier,
    maxDurationDays: manualLimits.maxDurationDays
      ? Math.min(baseLimits.maxDurationDays, manualLimits.maxDurationDays)
      : baseLimits.maxDurationDays,
  };
};

const computeVerificationScore = (user) => {
  const verification = user?.verification || {};
  let score = 0.35;
  if (user?.email) score += 0.05;
  if (verification.emailVerified) score += 0.15;
  if (verification.communityVerified || user?.communityId) score += 0.2;
  if (verification.idVerified) score += 0.2;
  if (user?.avatar) score += 0.05;
  return clamp01(score);
};

const getValueWeight = (tier) => VALUE_TIER_WEIGHT[tier] || 1;

const getRecencyWeight = (date) => {
  if (!date) return 0.75;
  const ageDays = Math.max(0, (Date.now() - new Date(date).getTime()) / DAY_MS);
  return 0.6 + 0.4 * Math.exp(-ageDays / 180);
};

const getWeightedStats = (entries) => {
  let totalWeight = 0;
  let weightedSum = 0;

  entries.forEach((entry) => {
    if (!entry || typeof entry.value !== 'number') return;
    const safeWeight = entry.weight && entry.weight > 0 ? entry.weight : 1;
    totalWeight += safeWeight;
    weightedSum += entry.value * safeWeight;
  });

  return {
    totalWeight,
    average: totalWeight ? weightedSum / totalWeight : 0,
  };
};

const getShareStats = (values) => {
  const counts = values.reduce((accumulator, value) => {
    if (!value) return accumulator;
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
  const total = values.length;
  const uniqueCount = Object.keys(counts).length;
  const topShare = total
    ? Math.max(...Object.values(counts).map((count) => count / total))
    : 0;

  return { total, uniqueCount, topShare, counts };
};

const getDelayDays = (request) => {
  if (!request?.dueAt || !request?.returnedAt) return 0;
  const lateBy = new Date(request.returnedAt).getTime() - new Date(request.dueAt).getTime();
  return lateBy > 0 ? Math.ceil(lateBy / DAY_MS) : 0;
};

const getDelayScore = (daysLate) => {
  if (!daysLate) return 1;
  return clamp01(1 - Math.min(daysLate, 21) / 21);
};

const getResponseScore = (hours) => {
  if (hours <= 6) return 1;
  if (hours <= 24) return 0.88;
  if (hours <= 72) return 0.72;
  if (hours <= 168) return 0.55;
  return 0.35;
};

const getHistoryCap = (completedTransactions, uniqueCounterparties, riskyBorrowReturns) => {
  let cap = 1;

  if (completedTransactions === 0) cap = 0.39;
  else if (completedTransactions === 1) cap = 0.55;
  else if (completedTransactions <= 3) cap = 0.72;
  else if (completedTransactions <= 6) cap = 0.86;

  if (uniqueCounterparties <= 1) {
    cap = Math.min(cap, completedTransactions >= 4 ? 0.76 : 0.6);
  } else if (uniqueCounterparties === 2 && completedTransactions < 4) {
    cap = Math.min(cap, 0.72);
  }

  if (riskyBorrowReturns === 0 && completedTransactions < 4) {
    cap = Math.min(cap, 0.78);
  }

  return cap;
};

const buildStrengths = ({ signals, counts, averages }) => {
  const strengths = [];

  if (signals.punctuality >= 0.9 && counts.borrowReturns >= 2) {
    strengths.push('Strong on-time return pattern');
  }
  if (signals.care >= 0.85 && counts.ratingsReceived >= 2) {
    strengths.push('Items are consistently returned in good condition');
  }
  if (signals.diversity >= 0.7 && counts.uniqueCounterparties >= 3) {
    strengths.push('Trusted across multiple community members');
  }
  if (signals.responsiveness >= 0.8 && counts.handledIncoming >= 2) {
    strengths.push('Responds quickly to incoming requests');
  }
  if (averages.averageRating >= 4.5 && counts.uniqueRaters >= 3) {
    strengths.push('Maintains a high reputation with diverse raters');
  }

  return strengths;
};

const buildFlags = ({ counts, shares, penalties, user, averages }) => {
  const flags = [];

  if (counts.completedTransactions === 0) {
    flags.push({
      code: 'LOW_HISTORY',
      label: 'No completed transactions yet, so trust is capped.',
      severity: 'medium',
    });
  } else if (counts.completedTransactions < 3) {
    flags.push({
      code: 'LIMITED_HISTORY',
      label: 'Trust is still confidence-capped because the history is small.',
      severity: 'medium',
    });
  }

  if (counts.activeOverdueCount > 0) {
    flags.push({
      code: 'ACTIVE_OVERDUE',
      label: 'There are active overdue borrows affecting trust.',
      severity: 'high',
    });
  }

  if (shares.topCounterpartyShare >= 0.65 && counts.uniqueCounterparties <= 2 && counts.interactions >= 3) {
    flags.push({
      code: 'COUNTERPARTY_CONCENTRATION',
      label: 'Most activity happens with the same member, so anti-gaming limits apply.',
      severity: 'high',
    });
  }

  if (shares.topRaterShare >= 0.7 && counts.ratingsReceived >= 2) {
    flags.push({
      code: 'RATING_CONCENTRATION',
      label: 'Ratings are concentrated among a small set of users.',
      severity: 'high',
    });
  }

  if (counts.lateReturns > 0 && averages.averageLateDays >= 3) {
    flags.push({
      code: 'LATE_RETURN_PATTERN',
      label: 'Repeated or longer late returns are reducing the score.',
      severity: 'medium',
    });
  }

  if (penalties.signalMismatch > 0) {
    flags.push({
      code: 'SIGNAL_MISMATCH',
      label: 'Ratings look stronger than the completion or punctuality history.',
      severity: 'medium',
    });
  }

  if (user?.accountStatus === 'SUSPENDED') {
    flags.push({
      code: 'ACCOUNT_SUSPENDED',
      label: 'Account is suspended, so trust is penalized.',
      severity: 'high',
    });
  }

  return flags;
};

const computeTrustProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }

  const [ratings, requests, itemsListed] = await Promise.all([
    Rating.find({ toUserId: userId }).select('fromUserId score careScore borrowRequestId createdAt').lean(),
    BorrowRequest.find({
      $or: [{ borrowerId: userId }, { ownerId: userId }],
    })
      .select('borrowerId ownerId status requestedAt approvedAt rejectedAt returnedAt dueAt itemId')
      .populate('itemId', 'valueTier')
      .lean(),
    Item.countDocuments({ ownerId: userId }),
  ]);

  const userIdString = String(userId);
  const now = new Date();
  const requestById = new Map(requests.map((request) => [String(request._id), request]));
  const ratingsByRequest = new Map();

  ratings.forEach((rating) => {
    const key = String(rating.borrowRequestId);
    const group = ratingsByRequest.get(key) || [];
    group.push(rating);
    ratingsByRequest.set(key, group);
  });

  const borrowerRequests = requests.filter((request) => String(request.borrowerId) === userIdString);
  const ownerRequests = requests.filter((request) => String(request.ownerId) === userIdString);
  const returnedBorrows = borrowerRequests.filter((request) => request.status === 'RETURNED');
  const returnedLends = ownerRequests.filter((request) => request.status === 'RETURNED');
  const approvedBorrows = borrowerRequests.filter((request) =>
    ['ACTIVE', 'RETURNED'].includes(request.status)
  );
  const approvedLends = ownerRequests.filter((request) =>
    ['ACTIVE', 'RETURNED'].includes(request.status)
  );
  const resolvedInteractions = requests.filter((request) => request.status !== 'PENDING');
  const completedTransactions = requests.filter((request) => request.status === 'RETURNED').length;
  const riskyBorrowReturns = returnedBorrows.filter(
    (request) => (request.itemId?.valueTier || 'LOW') !== 'LOW'
  );

  const counterpartyIds = resolvedInteractions.map((request) =>
    String(request.borrowerId) === userIdString
      ? String(request.ownerId)
      : String(request.borrowerId)
  );
  const counterpartyShares = getShareStats(counterpartyIds);
  const raterShares = getShareStats(ratings.map((rating) => String(rating.fromUserId)));

  const averageRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
    : 0;
  const averageCare = ratings.length
    ? ratings.reduce((sum, rating) => sum + (rating.careScore || rating.score), 0) / ratings.length
    : 0;

  const ratingStats = getWeightedStats(
    ratings.map((rating) => {
      const request = requestById.get(String(rating.borrowRequestId));
      const tier = request?.itemId?.valueTier || 'LOW';
      return {
        value: normalizeFiveStar(rating.score),
        weight: getRecencyWeight(rating.createdAt) * getValueWeight(tier),
      };
    })
  );
  const careStats = getWeightedStats(
    ratings.map((rating) => {
      const request = requestById.get(String(rating.borrowRequestId));
      const tier = request?.itemId?.valueTier || 'LOW';
      return {
        value: normalizeFiveStar(rating.careScore || rating.score),
        weight: getRecencyWeight(rating.createdAt) * getValueWeight(tier),
      };
    })
  );

  const rating = clamp01((ratingStats.average * ratingStats.totalWeight + 0.76 * 4) / (ratingStats.totalWeight + 4));
  const care = clamp01((careStats.average * careStats.totalWeight + 0.74 * 4) / (careStats.totalWeight + 4));

  let lateReturns = 0;
  let severeLateReturns = 0;
  let totalLateDays = 0;
  const punctualityStats = getWeightedStats(
    returnedBorrows.map((request) => {
      const daysLate = getDelayDays(request);
      if (daysLate > 0) {
        lateReturns += 1;
        totalLateDays += daysLate;
        if (daysLate >= 3) severeLateReturns += 1;
      }

      return {
        value: getDelayScore(daysLate),
        weight:
          getRecencyWeight(request.returnedAt || request.dueAt) *
          getValueWeight(request.itemId?.valueTier || 'LOW'),
      };
    })
  );
  const punctuality = clamp01(
    (punctualityStats.average * punctualityStats.totalWeight + 0.68 * 2) /
      (punctualityStats.totalWeight + 2)
  );

  const activeOverdueBorrows = borrowerRequests.filter(
    (request) =>
      request.status === 'ACTIVE' &&
      request.dueAt &&
      new Date(request.dueAt).getTime() < now.getTime()
  );

  const activeOverdueWeight = activeOverdueBorrows.reduce((sum, request) => {
    const daysLate = Math.max(
      1,
      Math.ceil((now.getTime() - new Date(request.dueAt).getTime()) / DAY_MS)
    );
    return sum + daysLate * getValueWeight(request.itemId?.valueTier || 'LOW');
  }, 0);

  const completion = clamp01(
    (returnedBorrows.length + returnedLends.length + 2.1) /
      (approvedBorrows.length + approvedLends.length + 3)
  );

  const contributionRaw =
    itemsListed * 0.45 +
    returnedLends.length * 1.1 +
    approvedLends.length * 0.35 +
    returnedBorrows.length * 0.2;
  const contribution = clamp01(1 - Math.exp(-contributionRaw / 7));

  const counterpartyDiversity = counterpartyShares.total
    ? counterpartyShares.uniqueCount / counterpartyShares.total
    : 0;
  const raterDiversity = raterShares.total ? raterShares.uniqueCount / raterShares.total : 0;
  const diversity =
    counterpartyShares.total || raterShares.total
      ? clamp01(0.3 + 0.45 * counterpartyDiversity + 0.25 * raterDiversity)
      : 0.45;

  const verification = computeVerificationScore(user);

  const handledIncomingEntries = ownerRequests
    .map((request) => {
      const resolvedAt =
        request.status === 'REJECTED'
          ? request.rejectedAt
          : ['ACTIVE', 'RETURNED'].includes(request.status)
            ? request.approvedAt
            : null;
      if (!resolvedAt || !request.requestedAt) return null;

      const responseHours = Math.max(
        0,
        (new Date(resolvedAt).getTime() - new Date(request.requestedAt).getTime()) / HOUR_MS
      );

      return {
        value: getResponseScore(responseHours),
        weight: getRecencyWeight(resolvedAt),
        hours: responseHours,
      };
    })
    .filter(Boolean);

  const responsivenessStats = getWeightedStats(handledIncomingEntries);
  const responsiveness = clamp01(
    (responsivenessStats.average * responsivenessStats.totalWeight + 0.62 * 2) /
      (responsivenessStats.totalWeight + 2)
  );
  const averageResponseHours = handledIncomingEntries.length
    ? handledIncomingEntries.reduce((sum, entry) => sum + entry.hours, 0) /
      handledIncomingEntries.length
    : 0;

  const valueHandlingStats = getWeightedStats(
    riskyBorrowReturns.map((request) => {
      const requestRatings = ratingsByRequest.get(String(request._id)) || [];
      const requestCare =
        requestRatings.length > 0
          ? requestRatings.reduce((sum, rating) => sum + normalizeFiveStar(rating.careScore || rating.score), 0) /
            requestRatings.length
          : null;
      const requestRating =
        requestRatings.length > 0
          ? requestRatings.reduce((sum, rating) => sum + normalizeFiveStar(rating.score), 0) /
            requestRatings.length
          : null;
      const borrowerOutcome = getDelayScore(getDelayDays(request));
      const ratingComponent = requestCare ?? requestRating ?? 0.7;

      return {
        value: clamp01(borrowerOutcome * 0.55 + ratingComponent * 0.45),
        weight:
          getValueWeight(request.itemId?.valueTier || 'LOW') *
          getRecencyWeight(request.returnedAt || request.dueAt),
      };
    })
  );
  const valueHandling = clamp01(
    (valueHandlingStats.average * valueHandlingStats.totalWeight + 0.62 * 2) /
      (valueHandlingStats.totalWeight + 2)
  );

  const transactionConfidence = clamp01(
    1 - Math.exp(-(completedTransactions + (approvedBorrows.length + approvedLends.length) * 0.4) / 6)
  );
  const ratingConfidence = clamp01(
    1 - Math.exp(-(ratings.length + raterShares.uniqueCount * 1.2) / 7)
  );
  const diversityConfidence = clamp01(
    1 - Math.exp(-(counterpartyShares.uniqueCount + riskyBorrowReturns.length) / 6)
  );
  const overallConfidence = clamp01(
    transactionConfidence * 0.5 + ratingConfidence * 0.3 + diversityConfidence * 0.2
  );
  const confidenceBlend = 0.28 + 0.72 * overallConfidence;
  const priorScore = clamp01(0.34 + verification * 0.36);

  const signals = {
    punctuality,
    completion,
    rating,
    care,
    contribution,
    diversity,
    verification,
    responsiveness,
    valueHandling,
  };

  const baseComposite = roundMetric(
    Object.entries(SIGNAL_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + (signals[key] || 0) * weight,
      0
    )
  );

  const lateReturnRatio = returnedBorrows.length ? lateReturns / returnedBorrows.length : 0;
  const averageLateDays = lateReturns ? totalLateDays / lateReturns : 0;

  const penalties = {
    overdueExposure: Math.min(
      0.18,
      activeOverdueBorrows.length * 0.05 + Math.min(activeOverdueWeight / 45, 0.08)
    ),
    latePattern: Math.min(
      0.12,
      lateReturnRatio * 0.08 + severeLateReturns * 0.02 + (averageLateDays >= 5 ? 0.03 : 0)
    ),
    ratingConcentration:
      ratings.length >= 2
        ? Math.min(0.12, Math.max(0, raterShares.topShare - 0.45) * 0.25)
        : 0,
    counterpartyConcentration:
      counterpartyShares.total >= 3
        ? Math.min(0.14, Math.max(0, counterpartyShares.topShare - 0.5) * 0.24)
        : 0,
    signalMismatch:
      averageRating >= 4.7 && (punctuality < 0.65 || completion < 0.65) ? 0.05 : 0,
    suspension: user.accountStatus === 'SUSPENDED' ? 0.1 : 0,
  };
  penalties.total = Math.min(
    MAX_TOTAL_PENALTY,
    penalties.overdueExposure +
      penalties.latePattern +
      penalties.ratingConcentration +
      penalties.counterpartyConcentration +
      penalties.signalMismatch +
      penalties.suspension
  );

  const prePenaltyScore = clamp01(baseComposite * confidenceBlend + priorScore * (1 - confidenceBlend));
  const historyCap = getHistoryCap(
    completedTransactions,
    counterpartyShares.uniqueCount,
    riskyBorrowReturns.length
  );
  const cappedScore = Math.min(prePenaltyScore, historyCap);
  const finalNormalized = clamp01(cappedScore - penalties.total);

  let trustTier = getTrustTier(finalNormalized);
  let trustScore = Math.round(finalNormalized * 100);

  const manualOverride = user?.manualTrustOverride;
  if (manualOverride && typeof manualOverride.score === 'number') {
    trustScore = Math.round(manualOverride.score);
    trustTier = manualOverride.tier || trustTier;
  }

  const flags = buildFlags({
    counts: {
      ratingsReceived: ratings.length,
      uniqueRaters: raterShares.uniqueCount,
      completedTransactions,
      borrowReturns: returnedBorrows.length,
      lendReturns: returnedLends.length,
      interactions: counterpartyShares.total,
      uniqueCounterparties: counterpartyShares.uniqueCount,
      activeOverdueCount: activeOverdueBorrows.length,
      lateReturns,
      itemsListed,
      riskyBorrowReturns: riskyBorrowReturns.length,
      handledIncoming: handledIncomingEntries.length,
    },
    shares: {
      topRaterShare: raterShares.topShare,
      topCounterpartyShare: counterpartyShares.topShare,
    },
    penalties,
    user,
    averages: {
      averageRating,
      averageCare,
      averageResponseHours,
      averageLateDays,
    },
  });

  const strengths = buildStrengths({
    signals,
    counts: {
      ratingsReceived: ratings.length,
      uniqueRaters: raterShares.uniqueCount,
      borrowReturns: returnedBorrows.length,
      uniqueCounterparties: counterpartyShares.uniqueCount,
      handledIncoming: handledIncomingEntries.length,
    },
    averages: {
      averageRating,
    },
  });

  const borrowLimits = applyManualBorrowLimits(getBorrowLimits(trustTier), user?.manualBorrowLimits);

  return {
    trustScore,
    trustTier,
    borrowLimits,
    breakdown: {
      formulaVersion: 'v2-multiparameter-anti-gaming',
      punctuality: roundMetric(punctuality),
      completion: roundMetric(completion),
      rating: roundMetric(rating),
      care: roundMetric(care),
      contribution: roundMetric(contribution),
      diversity: roundMetric(diversity),
      verification: roundMetric(verification),
      responsiveness: roundMetric(responsiveness),
      valueHandling: roundMetric(valueHandling),
      signals: Object.fromEntries(
        Object.entries(signals).map(([key, value]) => [key, roundMetric(value)])
      ),
      signalWeights: SIGNAL_WEIGHTS,
      penalties: {
        overdueExposure: roundMetric(penalties.overdueExposure),
        latePattern: roundMetric(penalties.latePattern),
        ratingConcentration: roundMetric(penalties.ratingConcentration),
        counterpartyConcentration: roundMetric(penalties.counterpartyConcentration),
        signalMismatch: roundMetric(penalties.signalMismatch),
        suspension: roundMetric(penalties.suspension),
        total: roundMetric(penalties.total),
      },
      confidence: {
        transaction: roundMetric(transactionConfidence),
        rating: roundMetric(ratingConfidence),
        diversity: roundMetric(diversityConfidence),
        overall: roundMetric(overallConfidence),
        blend: roundMetric(confidenceBlend),
        historyCap: roundMetric(historyCap),
      },
      counts: {
        ratingsReceived: ratings.length,
        uniqueRaters: raterShares.uniqueCount,
        completedTransactions,
        borrowReturns: returnedBorrows.length,
        lendReturns: returnedLends.length,
        activeOverdueCount: activeOverdueBorrows.length,
        lateReturns,
        itemsListed,
        interactions: counterpartyShares.total,
        uniqueCounterparties: counterpartyShares.uniqueCount,
        riskyBorrowReturns: riskyBorrowReturns.length,
        handledIncoming: handledIncomingEntries.length,
      },
      averages: {
        averageRating: roundValue(averageRating),
        averageCare: roundValue(averageCare),
        averageLateDays: roundValue(averageLateDays),
        averageResponseHours: roundValue(averageResponseHours),
      },
      antiGaming: {
        priorScore: roundMetric(priorScore),
        baseComposite: roundMetric(baseComposite),
        prePenaltyScore: roundMetric(prePenaltyScore),
        finalNormalized: roundMetric(finalNormalized),
        topRaterShare: roundMetric(raterShares.topShare),
        topCounterpartyShare: roundMetric(counterpartyShares.topShare),
        historyCapApplied: historyCap < 1,
      },
      flags,
      strengths,
    },
    override: manualOverride || null,
  };
};

const recomputeTrustScore = async (userId) => {
  const profile = await computeTrustProfile(userId);
  await User.findByIdAndUpdate(userId, {
    trustScore: profile.trustScore,
    trustTier: profile.trustTier,
    trustLastComputedAt: new Date(),
  });

  const latest = await TrustHistory.findOne({ userId }).sort({ createdAt: -1 });
  const now = new Date();
  const shouldWrite =
    !latest ||
    latest.trustScore !== profile.trustScore ||
    now - latest.createdAt > 1000 * 60 * 60 * 6;

  if (shouldWrite) {
    await TrustHistory.create({
      userId,
      trustScore: profile.trustScore,
      trustTier: profile.trustTier,
      breakdown: profile.breakdown,
    });
  }

  return profile;
};

const isValueTierAllowed = (itemTier, maxTier) => {
  const itemRank = VALUE_TIER_RANK[itemTier] || 1;
  const maxRank = VALUE_TIER_RANK[maxTier] || 1;
  return itemRank <= maxRank;
};

module.exports = {
  computeTrustProfile,
  recomputeTrustScore,
  getTrustTier,
  getBorrowLimits,
  applyManualBorrowLimits,
  isValueTierAllowed,
};

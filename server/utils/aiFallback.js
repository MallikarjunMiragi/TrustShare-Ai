const { isValueTierAllowed } = require('./trust');

const SIGNAL_LABELS = {
  punctuality: 'return punctuality',
  completion: 'completion rate',
  rating: 'reputation quality',
  care: 'item care',
  contribution: 'community contribution',
  diversity: 'interaction diversity',
  verification: 'verification',
  responsiveness: 'responsiveness',
  valueHandling: 'high-value handling',
};

const VALUE_TIER_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const clamp01 = (value) => Math.min(Math.max(value || 0, 0), 1);

const normalizeText = (value) => String(value || '').trim();

const getRiskLevel = ({ trustScore, penaltyTotal, activeOverdueCount, lateReturns }) => {
  if (activeOverdueCount > 0 || trustScore < 45 || penaltyTotal >= 0.2) return 'HIGH';
  if (lateReturns > 0 || trustScore < 65 || penaltyTotal >= 0.1) return 'MEDIUM';
  return 'LOW';
};

const getLendingAdvice = ({ trustScore, riskLevel, maxValueTier, historyCapApplied }) => {
  if (riskLevel === 'HIGH') {
    return 'Recommend manual review before approving expensive or long-duration requests.';
  }
  if (historyCapApplied) {
    return `Good early pattern, but still build more history before handling ${maxValueTier} value items freely.`;
  }
  if (trustScore >= 80) {
    return 'Safe to lend for standard durations, including higher-value items within limits.';
  }
  return 'Suitable for normal community borrowing, with best results on shorter and well-defined requests.';
};

const buildPositiveDrivers = (signals = {}, weights = {}) => {
  return Object.entries(signals)
    .map(([key, value]) => ({
      key,
      label: SIGNAL_LABELS[key] || key,
      value: value || 0,
      weight: weights[key] || 0,
      impact: (value || 0) * (weights[key] || 0),
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map((entry) => ({
      label: entry.label,
      impact: Math.round(entry.value * 100),
      detail: `${Math.round(entry.value * 100)}% on ${entry.label}`,
    }));
};

const buildRiskDrivers = ({ penalties = {}, flags = [] }) => {
  const drivers = [];

  if ((penalties.overdueExposure || 0) > 0) {
    drivers.push({
      label: 'overdue exposure',
      impact: Math.round((penalties.overdueExposure || 0) * 100),
      detail: 'Active overdue items reduce confidence and borrowing freedom.',
    });
  }
  if ((penalties.latePattern || 0) > 0) {
    drivers.push({
      label: 'late return pattern',
      impact: Math.round((penalties.latePattern || 0) * 100),
      detail: 'Delayed returns are being treated as behavioural risk.',
    });
  }
  if ((penalties.counterpartyConcentration || 0) > 0 || (penalties.ratingConcentration || 0) > 0) {
    drivers.push({
      label: 'concentrated interactions',
      impact: Math.round(
        ((penalties.counterpartyConcentration || 0) + (penalties.ratingConcentration || 0)) * 100
      ),
      detail: 'Repeated activity with a very small set of users is treated cautiously.',
    });
  }

  flags.slice(0, 2).forEach((flag) => {
    drivers.push({
      label: flag.code?.replaceAll('_', ' ').toLowerCase() || 'trust flag',
      impact: flag.severity === 'high' ? 85 : flag.severity === 'medium' ? 60 : 35,
      detail: flag.label,
    });
  });

  return drivers.slice(0, 3);
};

const buildActions = ({ riskLevel, counts = {}, penalties = {}, borrowLimits = {}, trustTier }) => {
  const actions = [];

  if ((counts.lateReturns || 0) > 0) {
    actions.push('Focus on on-time returns for the next few requests to lift the trust ceiling faster.');
  }
  if ((counts.uniqueCounterparties || 0) < 3) {
    actions.push('Borrow and lend with a wider set of community members to increase trust diversity.');
  }
  if ((penalties.ratingConcentration || 0) > 0 || (penalties.counterpartyConcentration || 0) > 0) {
    actions.push('Avoid repeated closed-loop borrowing with the same people; broader activity helps more.');
  }
  if (trustTier === 'LOW' || riskLevel === 'HIGH') {
    actions.push(
      `Start with ${borrowLimits.maxDurationDays || 7}-day or shorter requests and lower-value items.`
    );
  } else {
    actions.push('Keep response time fast and complete more successful cycles to move into the next tier.');
  }

  return actions.slice(0, 3);
};

const buildTrustAnalysis = ({ user, profile }) => {
  const breakdown = profile?.breakdown || {};
  const signals = breakdown.signals || {};
  const penalties = breakdown.penalties || {};
  const counts = breakdown.counts || {};
  const flags = breakdown.flags || [];
  const confidence = breakdown.confidence || {};
  const trustScore = profile?.trustScore ?? user?.trustScore ?? 0;
  const weightedSignalStrength = Object.entries(signals).reduce((sum, [key, value]) => {
    return sum + (value || 0) * (breakdown.signalWeights?.[key] || 0);
  }, 0);
  const modelScore = Math.round(
    clamp01(
      trustScore / 100 * 0.42 +
        weightedSignalStrength * 0.32 +
        (confidence.overall || 0) * 0.16 -
        (penalties.total || 0) * 0.35 +
        (signals.verification || 0) * 0.05
    ) * 100
  );

  const riskLevel = getRiskLevel({
    trustScore,
    penaltyTotal: penalties.total || 0,
    activeOverdueCount: counts.activeOverdueCount || 0,
    lateReturns: counts.lateReturns || 0,
  });

  const historyCapApplied = Boolean(breakdown.antiGaming?.historyCapApplied);
  const positiveDrivers = buildPositiveDrivers(signals, breakdown.signalWeights || {});
  const riskDrivers = buildRiskDrivers({ penalties, flags });
  const borrowLimits = profile?.borrowLimits || {};

  return {
    source: 'embedded-ai-fallback',
    engineVersion: 'hybrid-behavior-v1',
    modelScore,
    riskLevel,
    confidence: Math.round((confidence.overall || 0) * 100),
    lendingAdvice: getLendingAdvice({
      trustScore,
      riskLevel,
      maxValueTier: borrowLimits.maxValueTier || 'LOW',
      historyCapApplied,
    }),
    summary:
      riskLevel === 'LOW'
        ? 'AI analysis sees this account as dependable for normal community borrowing.'
        : riskLevel === 'MEDIUM'
          ? 'AI analysis sees healthy potential, but some behavioural signals still need strengthening.'
          : 'AI analysis recommends caution due to weak history or active risk factors.',
    positiveDrivers,
    riskDrivers,
    recommendedActions: buildActions({
      riskLevel,
      counts,
      penalties,
      borrowLimits,
      trustTier: profile?.trustTier,
    }),
  };
};

const categoryAffinityFromHistory = (history = []) => {
  const categoryMap = new Map();
  let total = 0;

  history.forEach((entry) => {
    const category = normalizeText(entry?.itemId?.category || entry?.category);
    if (!category) return;
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    total += 1;
  });

  return { categoryMap, total };
};

const scoreRecommendation = ({ item, profile, affinity, seenOwnerIds }) => {
  const trustScore = profile?.trustScore || 0;
  const ownerTrust = item.ownerId?.trustScore || 0;
  const maxValueTier = profile?.borrowLimits?.maxValueTier || 'LOW';
  const maxDurationDays = profile?.borrowLimits?.maxDurationDays || 7;
  const categoryHits = affinity.categoryMap.get(item.category) || 0;
  const affinityScore = affinity.total ? categoryHits / affinity.total : 0.45;
  const valueMatch = isValueTierAllowed(item.valueTier || 'LOW', maxValueTier) ? 1 : 0;
  const ownerRepeatPenalty = seenOwnerIds.has(String(item.ownerId?._id || item.ownerId)) ? 0.08 : 0;
  const recencyBoost = item.createdAt
    ? Math.max(
        0,
        0.12 - (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 120)
      )
    : 0.04;

  const rawScore =
    affinityScore * 0.34 +
    (ownerTrust / 100) * 0.28 +
    valueMatch * 0.18 +
    (trustScore / 100) * 0.1 +
    recencyBoost -
    ownerRepeatPenalty;

  const bounded = clamp01(rawScore);
  const reasons = [];

  if (categoryHits > 0) {
    reasons.push(`Matches your past interest in ${item.category.toLowerCase()} items`);
  } else {
    reasons.push('Adds variety beyond your usual borrowing pattern');
  }

  if (ownerTrust >= 75) {
    reasons.push('Shared by a highly trusted community member');
  } else if (ownerTrust >= 55) {
    reasons.push('Shared by a reasonably trusted owner');
  }

  if (valueMatch) {
    reasons.push(`Fits within your current ${maxValueTier.toLowerCase()} value-tier limit`);
  }

  let caution = '';
  if (!valueMatch) {
    caution = `Your current trust tier does not yet comfortably support ${item.valueTier?.toLowerCase()}-value borrowing.`;
  } else if ((item.valueTier || 'LOW') === 'HIGH') {
    caution = 'Use a shorter duration and message the owner clearly because this is a high-value item.';
  }

  const suggestedDurationDays = Math.max(
    2,
    Math.min(
      maxDurationDays,
      item.valueTier === 'HIGH' ? 5 : item.valueTier === 'MEDIUM' ? 7 : 10
    )
  );

  return {
    itemId: String(item._id),
    score: Math.round(bounded * 100),
    fitLabel: bounded >= 0.75 ? 'High fit' : bounded >= 0.58 ? 'Good fit' : 'Explore',
    reasons: reasons.slice(0, 3),
    caution,
    suggestedDurationDays,
  };
};

const buildRecommendations = ({ user, profile, items = [], borrowHistory = [], limit = 4 }) => {
  const affinity = categoryAffinityFromHistory(borrowHistory);
  const seenOwnerIds = new Set(
    borrowHistory.map((entry) => String(entry?.itemId?.ownerId || entry?.ownerId || ''))
  );

  const recommendations = items
    .filter((item) => String(item.ownerId?._id || item.ownerId) !== String(user?._id || user?.id))
    .filter((item) => item.available)
    .map((item) => ({
      ...scoreRecommendation({ item, profile, affinity, seenOwnerIds }),
      item,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 8)));

  return {
    source: 'embedded-ai-fallback',
    engineVersion: 'hybrid-recommender-v1',
    summary:
      affinity.total > 0
        ? 'Recommendations are personalized using your past borrowing categories, trust limits, and owner reliability.'
        : 'Recommendations are generated using owner reliability, trust limits, and fresh community availability.',
    recommendations,
  };
};

module.exports = {
  buildTrustAnalysis,
  buildRecommendations,
};

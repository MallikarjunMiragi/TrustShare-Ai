const Rating = require('../models/Rating');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const User = require('../models/User');
const TrustHistory = require('../models/TrustHistory');

const WEIGHTS = {
  punctuality: 0.35,
  rating: 0.3,
  care: 0.2,
  contribution: 0.15,
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

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

const computeVerificationScore = (user) => {
  const verification = user?.verification || {};
  let score = 0.3;
  if (verification.emailVerified) score += 0.1;
  if (verification.communityVerified || user?.communityId) score += 0.1;
  if (verification.idVerified) score += 0.1;
  return clamp01(score);
};

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

const computeTrustProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const ratings = await Rating.find({ toUserId: userId });
  const averageRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
    : 0;
  const averageCare = ratings.length
    ? ratings.reduce((sum, rating) => sum + (rating.careScore || rating.score), 0) / ratings.length
    : 0;

  const returnedRequests = await BorrowRequest.find({ borrowerId: userId, status: 'RETURNED' }).select(
    'returnedAt dueAt'
  );

  let onTime = 0;
  let late = 0;
  returnedRequests.forEach((request) => {
    if (!request.dueAt || (request.returnedAt && request.returnedAt <= request.dueAt)) {
      onTime += 1;
    } else {
      late += 1;
    }
  });

  const totalReturned = returnedRequests.length;
  const punctuality = totalReturned ? onTime / totalReturned : 1;

  const itemsListed = await Item.countDocuments({ ownerId: userId });
  const lendsActive = await BorrowRequest.countDocuments({ ownerId: userId, status: 'ACTIVE' });
  const lendsReturned = await BorrowRequest.countDocuments({ ownerId: userId, status: 'RETURNED' });
  const contributionRaw = itemsListed + lendsActive + lendsReturned;
  const contribution = clamp01(contributionRaw / 10);

  const ratingMetric = clamp01(averageRating / 5);
  const careMetric = clamp01(averageCare / 5);

  const trustRaw =
    WEIGHTS.punctuality * punctuality +
    WEIGHTS.rating * ratingMetric +
    WEIGHTS.care * careMetric +
    WEIGHTS.contribution * contribution;

  const tInitial = computeVerificationScore(user);

  const tRaw = clamp01(trustRaw);
  const tBase = clamp01(0.7 * tRaw + 0.3 * tInitial);

  const tBayes = clamp01((onTime + 1) / (onTime + late + 2));
  const alpha = Math.min(totalReturned / 3, 1);
  const tFinal = clamp01(alpha * tBase + (1 - alpha) * tBayes);

  let trustTier = getTrustTier(tFinal);
  let trustScore = Math.round(tFinal * 100);
  if (totalReturned === 0) {
    trustTier = 'LOW';
    trustScore = Math.min(trustScore, 40);
  }
  const manualOverride = user?.manualTrustOverride;
  if (manualOverride && typeof manualOverride.score === 'number') {
    trustScore = Math.round(manualOverride.score);
    trustTier = manualOverride.tier || trustTier;
  }

  const borrowLimits = applyManualBorrowLimits(
    getBorrowLimits(trustTier),
    user?.manualBorrowLimits
  );

  return {
    trustScore,
    trustTier,
    borrowLimits,
    breakdown: {
      punctuality,
      rating: ratingMetric,
      care: careMetric,
      contribution,
      tInitial,
      tBayes,
      tRaw,
      tFinal,
      averageRating,
      averageCare,
      onTimeReturns: onTime,
      lateReturns: late,
      totalReturned,
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

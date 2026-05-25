const asyncHandler = require('../utils/asyncHandler');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const { recomputeTrustScore } = require('../utils/trust');
const { getTrustAnalysis, getRecommendations } = require('../utils/aiClient');

const toPlainUser = (user) => (user?.toObject ? user.toObject() : user);

exports.getMyTrustAnalysis = asyncHandler(async (req, res) => {
  const profile = await recomputeTrustScore(req.user._id);
  const result = await getTrustAnalysis({
    user: toPlainUser(req.user),
    profile,
  });

  res.json(result);
});

exports.getMyRecommendations = asyncHandler(async (req, res) => {
  if (!req.user.communityId) {
    return res.status(400).json({ message: 'User must belong to a community' });
  }

  const limit = Number(req.query.limit || 4);
  const profile = await recomputeTrustScore(req.user._id);

  const [items, borrowHistory] = await Promise.all([
    Item.find({
      communityId: req.user.communityId,
      available: true,
    })
      .populate('ownerId', 'name trustScore trustTier')
      .lean(),
    BorrowRequest.find({
      borrowerId: req.user._id,
      status: { $in: ['ACTIVE', 'RETURNED'] },
    })
      .populate('itemId', 'title category valueTier ownerId')
      .lean(),
  ]);

  const result = await getRecommendations({
    user: toPlainUser(req.user),
    profile,
    items,
    borrowHistory,
    limit,
  });

  res.json(result);
});

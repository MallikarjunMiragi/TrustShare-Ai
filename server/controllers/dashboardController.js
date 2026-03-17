const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const asyncHandler = require('../utils/asyncHandler');
const { recomputeTrustScore } = require('../utils/trust');

exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [itemsLent, itemsBorrowed, pendingRequests, trustProfile] = await Promise.all([
    Item.countDocuments({ ownerId: userId }),
    BorrowRequest.countDocuments({
      borrowerId: userId,
      status: { $in: ['ACTIVE', 'RETURNED'] },
    }),
    BorrowRequest.countDocuments({ ownerId: userId, status: 'PENDING' }),
    recomputeTrustScore(userId),
  ]);

  res.json({
    trustScore: trustProfile.trustScore,
    trustTier: trustProfile.trustTier,
    trustBreakdown: trustProfile.breakdown,
    borrowLimits: trustProfile.borrowLimits,
    trustOverride: trustProfile.override,
    creditPoints: req.user.creditPoints,
    itemsLent,
    itemsBorrowed,
    pendingRequests,
  });
});

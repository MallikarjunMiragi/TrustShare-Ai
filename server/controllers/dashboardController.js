const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [itemsLent, itemsBorrowed, pendingRequests] = await Promise.all([
    Item.countDocuments({ ownerId: userId }),
    BorrowRequest.countDocuments({
      borrowerId: userId,
      status: { $in: ['ACTIVE', 'RETURNED'] },
    }),
    BorrowRequest.countDocuments({ ownerId: userId, status: 'PENDING' }),
  ]);

  res.json({
    trustScore: req.user.trustScore,
    creditPoints: req.user.creditPoints,
    itemsLent,
    itemsBorrowed,
    pendingRequests,
  });
});

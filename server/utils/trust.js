const Rating = require('../models/Rating');
const BorrowRequest = require('../models/BorrowRequest');
const User = require('../models/User');

const recomputeTrustScore = async (userId) => {
  const ratings = await Rating.find({ toUserId: userId });
  const averageRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
    : 0;

  const totalApproved = await BorrowRequest.countDocuments({
    borrowerId: userId,
    status: { $in: ['ACTIVE', 'RETURNED'] },
  });
  const returnedCount = await BorrowRequest.countDocuments({
    borrowerId: userId,
    status: 'RETURNED',
  });

  const returnRate = totalApproved ? returnedCount / totalApproved : 1;

  const ratingScore = averageRating * 20;
  const trustScore = Math.round(ratingScore * 0.6 + returnRate * 100 * 0.4);

  await User.findByIdAndUpdate(userId, { trustScore });
  return { trustScore, averageRating, returnRate };
};

module.exports = { recomputeTrustScore };

const BorrowRequest = require('../models/BorrowRequest');
const Rating = require('../models/Rating');
const asyncHandler = require('../utils/asyncHandler');
const { recomputeTrustScore } = require('../utils/trust');

exports.createRating = asyncHandler(async (req, res) => {
  const { borrowRequestId, score, comment } = req.body;
  if (!borrowRequestId || !score) {
    return res.status(400).json({ message: 'Borrow request and score required' });
  }
  if (score < 1 || score > 5) {
    return res.status(400).json({ message: 'Score must be between 1 and 5' });
  }

  const request = await BorrowRequest.findById(borrowRequestId);
  if (!request) {
    return res.status(404).json({ message: 'Borrow request not found' });
  }
  if (request.status !== 'RETURNED') {
    return res.status(400).json({ message: 'You can rate only after the item is returned' });
  }

  if (
    request.borrowerId.toString() !== req.user._id.toString() &&
    request.ownerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized to rate this request' });
  }

  const existing = await Rating.findOne({
    borrowRequestId,
    fromUserId: req.user._id,
  });
  if (existing) {
    return res.status(400).json({ message: 'Rating already submitted' });
  }

  const toUserId =
    request.borrowerId.toString() === req.user._id.toString()
      ? request.ownerId
      : request.borrowerId;

  const rating = await Rating.create({
    fromUserId: req.user._id,
    toUserId,
    borrowRequestId,
    score,
    comment,
  });

  const trust = await recomputeTrustScore(toUserId);

  res.status(201).json({ rating, trust });
});

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true },
  score: { type: Number, min: 1, max: 5, required: true },
  careScore: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rating', ratingSchema);

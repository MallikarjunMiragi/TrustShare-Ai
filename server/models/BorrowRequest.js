const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationDays: { type: Number, default: null },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'RETURNED'],
    default: 'PENDING',
  },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  returnedAt: { type: Date },
  dueAt: { type: Date },
});

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);

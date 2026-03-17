const mongoose = require('mongoose');

const trustHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trustScore: { type: Number, required: true },
  trustTier: { type: String, required: true },
  breakdown: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('TrustHistory', trustHistorySchema);

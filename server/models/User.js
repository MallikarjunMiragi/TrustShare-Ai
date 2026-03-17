const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  trustScore: { type: Number, default: 0 },
  creditPoints: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  trustScore: { type: Number, default: 0 },
  trustTier: { type: String, default: 'LOW' },
  verification: {
    emailVerified: { type: Boolean, default: true },
    communityVerified: { type: Boolean, default: false },
    idVerified: { type: Boolean, default: false },
  },
  accountStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  manualBorrowLimits: {
    maxActive: { type: Number },
    maxValueTier: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    maxDurationDays: { type: Number },
    reason: { type: String, default: '' },
    updatedAt: { type: Date },
  },
  manualTrustOverride: {
    score: { type: Number },
    tier: { type: String },
    reason: { type: String, default: '' },
    updatedAt: { type: Date },
  },
  creditPoints: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  trustLastComputedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

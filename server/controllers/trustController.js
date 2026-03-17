const asyncHandler = require('../utils/asyncHandler');
const { computeTrustProfile, recomputeTrustScore } = require('../utils/trust');
const TrustHistory = require('../models/TrustHistory');
const TrustEvent = require('../models/TrustEvent');

exports.getMyTrustProfile = asyncHandler(async (req, res) => {
  const profile = await recomputeTrustScore(req.user._id);
  res.json({ profile });
});

exports.getMyTrustHistory = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 12);
  const history = await TrustHistory.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 50));
  res.json({ history: history.reverse() });
});

exports.getMyTrustTimeline = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 20);
  const timeline = await TrustEvent.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100));
  res.json({ timeline: timeline.reverse() });
});

const TrustEvent = require('../models/TrustEvent');

const createTrustEvent = async ({ userId, type, label, meta = {} }) => {
  if (!userId || !type || !label) return null;
  return TrustEvent.create({ userId, type, label, meta });
};

module.exports = { createTrustEvent };

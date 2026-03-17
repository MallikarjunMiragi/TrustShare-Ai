const Community = require('../models/Community');

const requireCommunityAdmin = async (req, res, next) => {
  if (!req.user?.communityId) {
    return res.status(403).json({ message: 'Community admin only' });
  }
  const community = await Community.findById(req.user.communityId);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  if (community.adminId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Community admin only' });
  }
  req.community = community;
  next();
};

module.exports = { requireCommunityAdmin };

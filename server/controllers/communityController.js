const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateInviteCode = require('../utils/generateInviteCode');

exports.createCommunity = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Community name required' });
  }
  if (req.user.communityId) {
    return res.status(400).json({ message: 'User already belongs to a community' });
  }

  const inviteCode = generateInviteCode();
  const community = await Community.create({
    name,
    adminId: req.user._id,
    inviteCode,
    members: [req.user._id],
  });

  await User.findByIdAndUpdate(req.user._id, { communityId: community._id });

  res.status(201).json({ community });
});

exports.getMyCommunity = asyncHandler(async (req, res) => {
  if (!req.user.communityId) {
    return res.status(404).json({ message: 'User not assigned to a community' });
  }

  const community = await Community.findById(req.user.communityId).populate('members', 'name email trustScore');
  res.json({ community });
});

exports.refreshInviteCode = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.user.communityId);
  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }
  if (community.adminId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only admins can refresh invite codes' });
  }

  community.inviteCode = generateInviteCode();
  await community.save();

  res.json({ inviteCode: community.inviteCode });
});

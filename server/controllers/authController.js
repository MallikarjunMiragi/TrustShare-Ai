const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateInviteCode = require('../utils/generateInviteCode');
const { recomputeTrustScore } = require('../utils/trust');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const attachCommunityToUser = async (user, community) => {
  if (!community) return;
  if (!community.adminId) {
    community.adminId = user._id;
  }
  const alreadyMember = community.members.some(
    (memberId) => memberId.toString() === user._id.toString()
  );
  if (!alreadyMember) {
    community.members.push(user._id);
  }
  await community.save();

  user.communityId = community._id;
  if (user.verification) {
    user.verification.communityVerified = true;
  }
  await user.save();
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, inviteCode, createCommunity, communityName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  let community = null;
  if (inviteCode) {
    community = await Community.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!community) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
  } else if (createCommunity) {
    if (!communityName) {
      return res.status(400).json({ message: 'Community name required' });
    }
    community = await Community.create({
      name: communityName,
      inviteCode: generateInviteCode(),
      members: [],
    });
  } else {
    return res
      .status(400)
      .json({ message: 'Invite code required unless creating a new community' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    communityId: community ? community._id : undefined,
    verification: {
      emailVerified: true,
      communityVerified: Boolean(community),
      idVerified: false,
    },
  });

  if (community) {
    await attachCommunityToUser(user, community);
  }

  const trustProfile = await recomputeTrustScore(user._id);
  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      communityId: user.communityId,
      trustScore: trustProfile.trustScore,
      trustTier: trustProfile.trustTier,
      creditPoints: user.creditPoints,
      verification: user.verification,
      accountStatus: user.accountStatus,
      manualBorrowLimits: user.manualBorrowLimits,
      manualTrustOverride: user.manualTrustOverride,
    },
    community,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      communityId: user.communityId,
      trustScore: user.trustScore,
      trustTier: user.trustTier,
      creditPoints: user.creditPoints,
      verification: user.verification,
      accountStatus: user.accountStatus,
      manualBorrowLimits: user.manualBorrowLimits,
      manualTrustOverride: user.manualTrustOverride,
    },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      communityId: user.communityId,
      trustScore: user.trustScore,
      trustTier: user.trustTier,
      creditPoints: user.creditPoints,
      avatar: user.avatar,
      createdAt: user.createdAt,
      verification: user.verification,
      accountStatus: user.accountStatus,
      manualBorrowLimits: user.manualBorrowLimits,
      manualTrustOverride: user.manualTrustOverride,
    },
  });
});

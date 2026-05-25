const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const Rating = require('../models/Rating');
const TrustEvent = require('../models/TrustEvent');
const TrustHistory = require('../models/TrustHistory');
const { createTrustEvent } = require('../utils/trustEvents');
const { recomputeTrustScore } = require('../utils/trust');

const getCommunityMember = async (memberId, communityId) => {
  if (!memberId.match(/^[a-f\d]{24}$/i)) return null;
  return User.findOne({ _id: memberId, communityId }).select('-password');
};

exports.getAdminOverview = asyncHandler(async (req, res) => {
  const communityId = req.user.communityId;
  const itemIds = await Item.find({ communityId }).distinct('_id');

  const [membersCount, itemsCount, activeBorrows, pendingRequests] = await Promise.all([
    User.countDocuments({ communityId }),
    Item.countDocuments({ communityId }),
    BorrowRequest.countDocuments({
      status: 'ACTIVE',
      itemId: { $in: itemIds },
    }),
    BorrowRequest.countDocuments({ status: 'PENDING', itemId: { $in: itemIds } }),
  ]);

  const members = await User.find({ communityId })
    .select('name email trustScore trustTier creditPoints accountStatus manualBorrowLimits manualTrustOverride')
    .sort({ trustScore: 1 })
    .limit(50);

  const lowTrustMembers = members.filter((member) => (member.trustScore || 0) < 40);

  const lateReturns = await BorrowRequest.find({
    status: 'RETURNED',
    returnedAt: { $exists: true },
    dueAt: { $exists: true },
    itemId: { $in: itemIds },
  })
    .populate('borrowerId', 'name email trustScore trustTier')
    .populate('itemId', 'title')
    .limit(50);

  const lateReturnEntries = lateReturns
    .filter((entry) => entry.returnedAt > entry.dueAt)
    .map((entry) => ({
      id: entry._id,
      borrower: entry.borrowerId,
      item: entry.itemId,
      daysLate: Math.ceil((entry.returnedAt - entry.dueAt) / (1000 * 60 * 60 * 24)),
    }));

  const avgTrust = members.length
    ? Math.round(
        (members.reduce((sum, member) => sum + (member.trustScore || 0), 0) / members.length) *
          10
      ) / 10
    : 0;

  res.json({
    stats: {
      membersCount,
      itemsCount,
      activeBorrows,
      pendingRequests,
      avgTrust,
    },
    members,
    lowTrustMembers,
    lateReturns: lateReturnEntries,
  });
});

exports.getMemberProfile = asyncHandler(async (req, res) => {
  const member = await getCommunityMember(req.params.id, req.user.communityId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  const trustProfile = await recomputeTrustScore(member._id);

  const [freshMember, items, borrowedRequests, lentRequests, ratings, trustEvents, trustHistory] =
    await Promise.all([
      User.findById(member._id).select('-password'),
      Item.find({ ownerId: member._id }).select('title category valueTier available createdAt'),
      BorrowRequest.find({ borrowerId: member._id })
        .populate('itemId', 'title category valueTier')
        .populate('ownerId', 'name email trustScore trustTier')
        .sort({ requestedAt: -1 })
        .limit(12),
      BorrowRequest.find({ ownerId: member._id })
        .populate('itemId', 'title category valueTier')
        .populate('borrowerId', 'name email trustScore trustTier')
        .sort({ requestedAt: -1 })
        .limit(12),
      Rating.find({ toUserId: member._id })
        .populate('fromUserId', 'name email')
        .populate('borrowRequestId', 'status returnedAt dueAt')
        .sort({ createdAt: -1 })
        .limit(12),
      TrustEvent.find({ userId: member._id }).sort({ createdAt: -1 }).limit(12),
      TrustHistory.find({ userId: member._id }).sort({ createdAt: -1 }).limit(12),
    ]);

  const allRequests = [...borrowedRequests, ...lentRequests];
  const stats = {
    itemsListed: items.length,
    borrowedCount: borrowedRequests.length,
    lentCount: lentRequests.length,
    activeBorrowed: borrowedRequests.filter((request) => request.status === 'ACTIVE').length,
    pendingIncoming: lentRequests.filter((request) => request.status === 'PENDING').length,
    pendingOutgoing: borrowedRequests.filter((request) => request.status === 'PENDING').length,
    returnedCount: allRequests.filter((request) => request.status === 'RETURNED').length,
    lateReturnedCount: allRequests.filter(
      (request) =>
        request.status === 'RETURNED' &&
        request.returnedAt &&
        request.dueAt &&
        request.returnedAt > request.dueAt
    ).length,
  };

  res.json({
    member: freshMember,
    trustProfile,
    stats,
    items,
    borrowedRequests,
    lentRequests,
    ratings,
    trustEvents,
    trustHistory: trustHistory.reverse(),
  });
});

exports.updateMemberProfile = asyncHandler(async (req, res) => {
  const member = await getCommunityMember(req.params.id, req.user.communityId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  const { name, email, avatar, creditPoints, verification } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    member.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: member._id } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    member.email = normalizedEmail;
  }

  if (avatar !== undefined) {
    member.avatar = String(avatar || '').trim();
  }

  if (creditPoints !== undefined) {
    const parsedPoints = Number(creditPoints);
    if (Number.isNaN(parsedPoints)) {
      return res.status(400).json({ message: 'Credit points must be a number' });
    }
    member.creditPoints = parsedPoints;
  }

  if (verification && typeof verification === 'object') {
    member.verification = {
      ...(member.verification || {}),
      emailVerified:
        verification.emailVerified === undefined
          ? member.verification?.emailVerified
          : Boolean(verification.emailVerified),
      communityVerified:
        verification.communityVerified === undefined
          ? member.verification?.communityVerified
          : Boolean(verification.communityVerified),
      idVerified:
        verification.idVerified === undefined
          ? member.verification?.idVerified
          : Boolean(verification.idVerified),
    };
  }

  await member.save();
  const trustProfile = await recomputeTrustScore(member._id);

  await createTrustEvent({
    userId: member._id,
    type: 'PROFILE_UPDATED',
    label: 'Profile updated by admin',
    meta: { adminId: req.user._id },
  });

  const freshMember = await User.findById(member._id).select('-password');
  res.json({ member: freshMember, trustProfile });
});

exports.updateMemberStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const member = await User.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  member.accountStatus = status;
  await member.save();

  await createTrustEvent({
    userId: member._id,
    type: status === 'SUSPENDED' ? 'SUSPENDED' : 'UNSUSPENDED',
    label: status === 'SUSPENDED' ? 'Account suspended by admin' : 'Account reinstated by admin',
    meta: { reason: reason || '' },
  });

  res.json({ member });
});

exports.setBorrowLimits = asyncHandler(async (req, res) => {
  const { maxActive, maxValueTier, maxDurationDays, reason } = req.body;
  const member = await User.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  if (maxValueTier && !['LOW', 'MEDIUM', 'HIGH'].includes(maxValueTier)) {
    return res.status(400).json({ message: 'Invalid value tier' });
  }

  member.manualBorrowLimits = {
    maxActive: maxActive ? Number(maxActive) : undefined,
    maxValueTier: maxValueTier || undefined,
    maxDurationDays: maxDurationDays ? Number(maxDurationDays) : undefined,
    reason: reason || '',
    updatedAt: new Date(),
  };
  await member.save();

  await createTrustEvent({
    userId: member._id,
    type: 'LIMIT_SET',
    label: 'Borrow limits updated by admin',
    meta: member.manualBorrowLimits,
  });

  res.json({ member });
});

exports.resetTrust = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const member = await User.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  member.manualTrustOverride = {
    score: 30,
    tier: 'LOW',
    reason: reason || 'Admin reset',
    updatedAt: new Date(),
  };
  await member.save();
  await recomputeTrustScore(member._id);

  await createTrustEvent({
    userId: member._id,
    type: 'TRUST_RESET',
    label: 'Trust reset by admin',
    meta: { reason: reason || '' },
  });

  res.json({ member });
});

exports.clearTrustOverride = asyncHandler(async (req, res) => {
  const member = await User.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  member.manualTrustOverride = undefined;
  await member.save();
  await recomputeTrustScore(member._id);

  await createTrustEvent({
    userId: member._id,
    type: 'TRUST_OVERRIDE_CLEARED',
    label: 'Trust override cleared',
    meta: {},
  });

  res.json({ member });
});

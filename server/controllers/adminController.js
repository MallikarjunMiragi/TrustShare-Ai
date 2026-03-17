const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const { createTrustEvent } = require('../utils/trustEvents');
const { recomputeTrustScore } = require('../utils/trust');

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

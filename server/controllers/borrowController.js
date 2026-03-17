const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail } = require('../utils/email');
const { approvalTemplate, returnTemplate } = require('../utils/emailTemplates');

const safeSendEmail = async (payload) => {
  try {
    await sendEmail(payload);
  } catch (error) {
    console.warn('Email failed:', error.message);
  }
};

exports.createBorrowRequest = asyncHandler(async (req, res) => {
  const { itemId, durationDays, message } = req.body;
  if (!itemId) {
    return res.status(400).json({ message: 'Item id required' });
  }
  if (!req.user.communityId) {
    return res.status(400).json({ message: 'User must belong to a community' });
  }

  const item = await Item.findById(itemId);
  if (!item || item.communityId.toString() !== req.user.communityId.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }
  if (!item.available) {
    return res.status(400).json({ message: 'Item not available' });
  }
  if (item.ownerId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot borrow your own item' });
  }

  const existing = await BorrowRequest.findOne({
    itemId: item._id,
    borrowerId: req.user._id,
    status: { $in: ['PENDING', 'ACTIVE'] },
  });
  if (existing) {
    return res.status(400).json({ message: 'You already requested this item' });
  }

  const durationNumber =
    durationDays === undefined || durationDays === null ? null : Number(durationDays);
  if (durationNumber !== null && (Number.isNaN(durationNumber) || durationNumber < 1)) {
    return res.status(400).json({ message: 'Duration must be at least 1 day' });
  }

  const request = await BorrowRequest.create({
    itemId: item._id,
    borrowerId: req.user._id,
    ownerId: item.ownerId,
    durationDays: durationNumber,
    message: message || '',
  });

  res.status(201).json({ request });
});

exports.getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BorrowRequest.find({
    $or: [{ borrowerId: req.user._id }, { ownerId: req.user._id }],
  })
    .populate('itemId', 'title category')
    .populate('borrowerId', 'name trustScore')
    .populate('ownerId', 'name trustScore')
    .sort({ requestedAt: -1 });

  res.json({ requests });
});

exports.approveRequest = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id);
  if (!request || request.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ message: 'Request already processed' });
  }

  const item = await Item.findById(request.itemId);
  if (!item || !item.available) {
    return res.status(400).json({ message: 'Item is no longer available' });
  }

  request.status = 'ACTIVE';
  request.approvedAt = new Date();
  if (request.durationDays) {
    const dueAt = new Date(request.approvedAt);
    dueAt.setDate(dueAt.getDate() + request.durationDays);
    request.dueAt = dueAt;
  }
  await request.save();

  await Item.findByIdAndUpdate(request.itemId, { available: false });
  await User.findByIdAndUpdate(req.user._id, { $inc: { creditPoints: 10 } });

  const borrower = await User.findById(request.borrowerId);
  if (borrower?.email) {
    const template = approvalTemplate({
      itemTitle: item.title,
      dueAt: request.dueAt ? request.dueAt.toDateString() : null,
      appUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    });
    await safeSendEmail({ to: borrower.email, ...template });
  }

  res.json({ request });
});

exports.rejectRequest = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id);
  if (!request || request.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (request.status !== 'PENDING') {
    return res.status(400).json({ message: 'Request already processed' });
  }

  request.status = 'REJECTED';
  await request.save();

  res.json({ request });
});

exports.markReturned = asyncHandler(async (req, res) => {
  const request = await BorrowRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (
    request.ownerId.toString() !== req.user._id.toString() &&
    request.borrowerId.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (request.status !== 'ACTIVE') {
    return res.status(400).json({ message: 'Only active requests can be returned' });
  }

  request.status = 'RETURNED';
  request.returnedAt = new Date();
  await request.save();

  const item = await Item.findById(request.itemId);
  if (item) {
    item.available = true;
    await item.save();
  }
  const onTime = request.dueAt ? request.returnedAt <= request.dueAt : true;
  await User.findByIdAndUpdate(request.borrowerId, {
    $inc: { creditPoints: onTime ? 5 : -10 },
  });

  const [borrower, owner] = await Promise.all([
    User.findById(request.borrowerId),
    User.findById(request.ownerId),
  ]);
  const template = returnTemplate({
    itemTitle: item?.title || 'Shared item',
    onTime,
    appUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  });
  if (borrower?.email) {
    await safeSendEmail({ to: borrower.email, ...template });
  }
  if (owner?.email) {
    await safeSendEmail({ to: owner.email, ...template });
  }

  res.json({ request });
});

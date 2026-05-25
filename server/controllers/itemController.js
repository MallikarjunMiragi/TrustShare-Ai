const mongoose = require('mongoose');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');
const asyncHandler = require('../utils/asyncHandler');
const { recomputeTrustScore } = require('../utils/trust');

exports.createItem = asyncHandler(async (req, res) => {
  const { title, description, category, imageUrl, valueTier } = req.body;
  if (!title || !category) {
    return res.status(400).json({ message: 'Title and category required' });
  }
  if (valueTier && !['LOW', 'MEDIUM', 'HIGH'].includes(valueTier)) {
    return res.status(400).json({ message: 'Invalid value tier' });
  }

  if (!req.user.communityId) {
    return res.status(400).json({ message: 'User must belong to a community' });
  }

  const item = await Item.create({
    title,
    description,
    category,
    imageUrl,
    valueTier,
    ownerId: req.user._id,
    communityId: req.user.communityId,
  });
  await recomputeTrustScore(req.user._id);

  res.status(201).json({ item });
});

exports.getItems = asyncHandler(async (req, res) => {
  const { q, category, available, owner } = req.query;
  if (!req.user.communityId) {
    return res.status(400).json({ message: 'User must belong to a community' });
  }
  const filter = { communityId: req.user.communityId };

  if (q) {
    filter.title = { $regex: q, $options: 'i' };
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (available !== undefined) {
    filter.available = available === 'true';
  }
  if (owner === 'me') {
    filter.ownerId = req.user._id;
  } else if (owner && mongoose.Types.ObjectId.isValid(owner)) {
    filter.ownerId = owner;
  }

  const items = await Item.find(filter)
    .populate('ownerId', 'name trustScore trustTier')
    .sort({ createdAt: -1 });
  res.json({ items });
});

exports.getItemById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  const item = await Item.findById(req.params.id).populate('ownerId', 'name trustScore trustTier');
  if (!item || item.communityId.toString() !== req.user.communityId.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json({ item });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  const { available } = req.body;
  const item = await Item.findById(req.params.id);
  if (!item || item.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (typeof available !== 'boolean') {
    return res.status(400).json({ message: 'Availability must be a boolean' });
  }
  item.available = available;
  await item.save();

  res.json({ item });
});

exports.updateItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }
  const item = await Item.findById(req.params.id);
  if (!item || item.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const fields = ['title', 'description', 'category', 'imageUrl', 'valueTier'];
  const updates = {};
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  if (updates.valueTier && !['LOW', 'MEDIUM', 'HIGH'].includes(updates.valueTier)) {
    return res.status(400).json({ message: 'Invalid value tier' });
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  Object.assign(item, updates);
  await item.save();
  await recomputeTrustScore(req.user._id);

  res.json({ item });
});

exports.deleteItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }

  const item = await Item.findById(req.params.id);
  if (!item || item.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const activeLinkedRequests = await BorrowRequest.countDocuments({
    itemId: item._id,
    status: { $in: ['PENDING', 'ACTIVE'] },
  });

  if (activeLinkedRequests > 0) {
    return res.status(400).json({
      message: 'This item has pending or active borrow requests. Resolve them before removing it.',
    });
  }

  await Item.deleteOne({ _id: item._id });
  await recomputeTrustScore(req.user._id);

  res.json({ message: 'Item removed successfully' });
});

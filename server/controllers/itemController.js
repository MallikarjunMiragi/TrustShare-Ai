const Item = require('../models/Item');
const asyncHandler = require('../utils/asyncHandler');

exports.createItem = asyncHandler(async (req, res) => {
  const { title, description, category, imageUrl } = req.body;
  if (!title || !category) {
    return res.status(400).json({ message: 'Title and category required' });
  }

  if (!req.user.communityId) {
    return res.status(400).json({ message: 'User must belong to a community' });
  }

  const item = await Item.create({
    title,
    description,
    category,
    imageUrl,
    ownerId: req.user._id,
    communityId: req.user.communityId,
  });

  res.status(201).json({ item });
});

exports.getItems = asyncHandler(async (req, res) => {
  const { q, category, available } = req.query;
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

  const items = await Item.find(filter).populate('ownerId', 'name trustScore');
  res.json({ items });
});

exports.getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('ownerId', 'name trustScore');
  if (!item || item.communityId.toString() !== req.user.communityId.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json({ item });
});

exports.updateAvailability = asyncHandler(async (req, res) => {
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
  const item = await Item.findById(req.params.id);
  if (!item || item.ownerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const fields = ['title', 'description', 'category', 'imageUrl'];
  const updates = {};
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  Object.assign(item, updates);
  await item.save();

  res.json({ item });
});

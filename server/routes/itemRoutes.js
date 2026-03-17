const express = require('express');
const {
  createItem,
  getItems,
  getItemById,
  updateAvailability,
  updateItem,
} = require('../controllers/itemController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getItems);
router.post('/', auth, createItem);
router.get('/:id', auth, getItemById);
router.patch('/:id', auth, updateItem);
router.patch('/:id/availability', auth, updateAvailability);

module.exports = router;

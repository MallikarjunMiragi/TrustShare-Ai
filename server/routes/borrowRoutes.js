const express = require('express');
const {
  createBorrowRequest,
  getMyRequests,
  approveRequest,
  rejectRequest,
  markReturned,
} = require('../controllers/borrowController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createBorrowRequest);
router.get('/', auth, getMyRequests);
router.patch('/:id/approve', auth, approveRequest);
router.patch('/:id/reject', auth, rejectRequest);
router.patch('/:id/return', auth, markReturned);

module.exports = router;

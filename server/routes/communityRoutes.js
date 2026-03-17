const express = require('express');
const {
  createCommunity,
  getMyCommunity,
  refreshInviteCode,
} = require('../controllers/communityController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createCommunity);
router.get('/me', auth, getMyCommunity);
router.patch('/invite-code', auth, refreshInviteCode);

module.exports = router;

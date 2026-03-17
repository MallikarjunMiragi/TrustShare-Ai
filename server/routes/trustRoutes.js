const express = require('express');
const { getMyTrustProfile, getMyTrustHistory, getMyTrustTimeline } = require('../controllers/trustController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, getMyTrustProfile);
router.get('/history', auth, getMyTrustHistory);
router.get('/timeline', auth, getMyTrustTimeline);

module.exports = router;

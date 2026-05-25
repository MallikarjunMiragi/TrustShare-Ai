const express = require('express');
const auth = require('../middleware/auth');
const { getMyTrustAnalysis, getMyRecommendations } = require('../controllers/aiController');

const router = express.Router();

router.use(auth);
router.get('/trust-analysis', getMyTrustAnalysis);
router.get('/recommendations', getMyRecommendations);

module.exports = router;

const express = require('express');
const {
  getAdminOverview,
  updateMemberStatus,
  setBorrowLimits,
  resetTrust,
  clearTrustOverride,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { requireCommunityAdmin } = require('../middleware/admin');

const router = express.Router();

router.get('/overview', auth, requireCommunityAdmin, getAdminOverview);
router.patch('/users/:id/status', auth, requireCommunityAdmin, updateMemberStatus);
router.patch('/users/:id/limits', auth, requireCommunityAdmin, setBorrowLimits);
router.patch('/users/:id/reset-trust', auth, requireCommunityAdmin, resetTrust);
router.patch('/users/:id/clear-trust-override', auth, requireCommunityAdmin, clearTrustOverride);

module.exports = router;

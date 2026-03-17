const express = require('express');
const authRoutes = require('./authRoutes');
const communityRoutes = require('./communityRoutes');
const itemRoutes = require('./itemRoutes');
const borrowRoutes = require('./borrowRoutes');
const ratingRoutes = require('./ratingRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/communities', communityRoutes);
router.use('/items', itemRoutes);
router.use('/borrows', borrowRoutes);
router.use('/ratings', ratingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;

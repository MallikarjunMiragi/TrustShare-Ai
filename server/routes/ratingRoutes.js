const express = require('express');
const { createRating } = require('../controllers/ratingController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createRating);

module.exports = router;

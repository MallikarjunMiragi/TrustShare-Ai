const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('Only image files are allowed');
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

router.post('/image', auth, upload.single('image'), uploadImage);

module.exports = router;

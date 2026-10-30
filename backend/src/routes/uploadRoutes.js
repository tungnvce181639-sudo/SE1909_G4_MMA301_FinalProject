const express = require('express');
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/image', verifyToken, uploadController.uploadListingImage);

module.exports = router;

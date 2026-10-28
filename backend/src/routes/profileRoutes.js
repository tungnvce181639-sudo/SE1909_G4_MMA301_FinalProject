const express = require('express');
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// All profile routes are protected
router.get('/me', verifyToken, profileController.getProfile);
router.put('/me', verifyToken, profileController.updateProfile);

module.exports = router;

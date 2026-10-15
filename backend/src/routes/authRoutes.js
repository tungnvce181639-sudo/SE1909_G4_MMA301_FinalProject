const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/google-signin', authController.googleSignIn);
router.post('/google', authController.googleSignIn);
router.post('/firebase-login', authController.googleSignIn);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;

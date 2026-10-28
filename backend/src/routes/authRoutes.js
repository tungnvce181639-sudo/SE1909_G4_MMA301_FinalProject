const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/google-signin', authController.googleSignIn);
router.post('/google', authController.googleSignIn);
router.post('/firebase-login', authController.googleSignIn);
router.post('/check-email', authController.checkEmail);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/register-otp', authController.requestRegisterOTP);
router.post('/verify-register-otp', authController.verifyRegisterOTP);
router.post('/register-with-otp', authController.registerWithOTP);

// Protected routes
// Note: /api/auth/me is now handled by /api/profile/me
// This endpoint is kept for backward compatibility
router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;

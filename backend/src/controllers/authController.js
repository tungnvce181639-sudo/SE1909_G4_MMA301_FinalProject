const authService = require('../services/authService');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

class AuthController {
  /**
   * Google Sign-In with Firebase ID token
   * @route POST /api/auth/google
   */
  googleSignIn = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    const { token, user } = await authService.verifyFirebaseTokenAndLogin(idToken);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  });

  /**
   * Check if email already exists
   * @route POST /api/auth/check-email
   */
  checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const userRepository = require('../repositories/userRepository');

    const existingUser = await userRepository.findByEmail(email);

    res.status(200).json({
      success: true,
      exists: !!existingUser,
    });
  });

  /**
   * Register a new user locally
   * @route POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { token, user } = await authService.registerLocal(req.body);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  });

  /**
   * Login user locally with email and password
   * @route POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await authService.loginLocal(email, password);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  });

  /**
   * Request OTP for password reset
   * @route POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
      otp: result.otp, // Include OTP in development for testing
    });
  });

  /**
   * Verify password reset OTP
   * @route POST /api/auth/verify-otp
   */
  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const { resetToken } = await authService.verifyResetOtp(email, otp);

    res.status(200).json({
      success: true,
      resetToken,
      message: 'OTP verified successfully',
    });
  });

  /**
   * Reset password with new password
   * @route POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    await authService.updateNewPassword(email, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  });

  /**
   * Request OTP for registration
   * @route POST /api/auth/register-otp
   */
  requestRegisterOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.requestRegisterOTP(email);

    res.status(200).json({
      success: true,
      message: result.message,
      otp: result.otp, // Include OTP in development for testing
    });
  });

  /**
   * Verify OTP for registration
   * @route POST /api/auth/verify-register-otp
   */
  verifyRegisterOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const { registerToken } = await authService.verifyRegisterOTP(email, otp);

    res.status(200).json({
      success: true,
      registerToken,
      message: 'OTP verified successfully',
    });
  });

  /**
   * Register with OTP verification
   * @route POST /api/auth/register-with-otp
   */
  registerWithOTP = asyncHandler(async (req, res) => {
    const { token, user } = await authService.registerWithOTP(req.body, req.body.registerToken);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  });
}

module.exports = new AuthController();

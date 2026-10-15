const authService = require('../services/authService');

class AuthController {
  /**
   * Google Sign-In with Firebase ID token
   * @route POST /api/auth/google
   */
  async googleSignIn(req, res, next) {
    try {
      const { idToken } = req.body;
      const { token, user } = await authService.verifyFirebaseTokenAndLogin(idToken);

      res.status(200).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new user locally
   * @route POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { token, user } = await authService.registerLocal(req.body);

      res.status(201).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user locally with email and password
   * @route POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.loginLocal(email, password);

      res.status(200).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request OTP for password reset
   * @route POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: 'OTP has been generated and sent to your email',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify password reset OTP
   * @route POST /api/auth/verify-otp
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      const { resetToken } = await authService.verifyResetOtp(email, otp);

      res.status(200).json({
        success: true,
        resetToken,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with new password
   * @route POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { email, newPassword } = req.body;
      await authService.updateNewPassword(email, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

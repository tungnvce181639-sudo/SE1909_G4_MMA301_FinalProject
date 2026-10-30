const profileService = require('../services/profileService');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

class ProfileController {
  /**
   * Get current user profile
   * @route GET /api/profile/me
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const user = await profileService.getProfile(userId);

    res.status(200).json({
      success: true,
      user,
    });
  });

  /**
   * Update current user profile
   * @route PUT /api/profile/me
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { fullName, phoneNumber, avatarUrl } = req.body;

    const updatedUser = await profileService.updateProfile(userId, {
      fullName,
      phoneNumber,
      avatarUrl,
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  });
}

module.exports = new ProfileController();

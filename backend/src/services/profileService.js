const userRepository = require('../repositories/userRepository');

class ProfileService {
  /**
   * Get current user profile by user ID
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    try {
      const user = await userRepository.findById(userId);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Return user data without sensitive fields
      return user.toJSON ? user.toJSON() : user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update current user profile
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updateData) {
    try {
      // Filter allowed fields to update
      const allowedFields = ['fullName', 'phoneNumber', 'avatarUrl'];
      const filteredData = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        const error = new Error('No valid fields to update');
        error.statusCode = 400;
        throw error;
      }

      const updatedUser = await userRepository.updateUser(userId, filteredData);
      
      if (!updatedUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      return updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileService();

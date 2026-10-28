const User = require('../models/User');
const PendingOTP = require('../models/PendingOTP');

class UserRepository {
  /**
   * Creates and saves a new user.
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a user by their email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a user by their Firebase UID.
   * @param {string} uid
   * @returns {Promise<Object|null>}
   */
  async findByFirebaseUid(uid) {
    try {
      return await User.findOne({ firebaseUid: uid });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a user by their database ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates user information and returns the updated document.
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  async updateUser(id, updateData) {
    try {
      return await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a user's document to store resetOtp and otpExpiresAt.
   * @param {string} userId
   * @param {string} otp
   * @param {Date} expiresAt
   * @returns {Promise<Object|null>}
   */
  async saveOtp(userId, otp, expiresAt) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          resetOtp: otp,
          otpExpiresAt: expiresAt,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clears the OTP by setting resetOtp and otpExpiresAt to null.
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async clearOtp(userId) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        {
          resetOtp: null,
          otpExpiresAt: null,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atomically increments/decrements the user's walletPoints using Mongoose's $inc operator.
   * @param {string} userId
   * @param {number} pointsToAdd
   * @returns {Promise<Object|null>}
   */
  async updateWalletPoints(userId, pointsToAdd) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { walletPoints: pointsToAdd } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Saves OTP for pending registration
   * @param {string} email
   * @param {string} otp
   * @param {Date} expiresAt
   * @returns {Promise<Object>}
   */
  async savePendingOtp(email, otp, expiresAt) {
    try {
      // Delete any existing OTP for this email
      await PendingOTP.deleteOne({ email });

      const pendingOTP = new PendingOTP({
        email,
        otp,
        expiresAt,
      });
      return await pendingOTP.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets pending OTP for an email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async getPendingOtp(email) {
    try {
      return await PendingOTP.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clears pending OTP for an email
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async clearPendingOtp(email) {
    try {
      return await PendingOTP.deleteOne({ email });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();

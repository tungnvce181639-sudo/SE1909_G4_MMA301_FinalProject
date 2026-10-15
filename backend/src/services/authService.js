const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const admin = require('../../config/firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'smartcampus_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_RESET_EXPIRES_IN = '10m';

class AuthService {
  /**
   * Helper method to generate session JWT
   * @param {Object} user 
   * @returns {string}
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Verifies Firebase ID token (Google Sign-In) and logs the user in.
   * If the user doesn't exist, creates a new user profile.
   * @param {string} idToken 
   * @returns {Promise<{token: string, user: Object}>}
   */
  async verifyFirebaseTokenAndLogin(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        throw new Error('Firebase token does not contain an email address');
      }

      // Check if user exists by Firebase UID or email
      let user = await userRepository.findByFirebaseUid(uid);

      if (!user) {
        user = await userRepository.findByEmail(email);

        if (user) {
          // Link Firebase UID if user exists with matching email
          user = await userRepository.updateUser(user._id, { firebaseUid: uid });
        } else {
          // Create new user profile in database
          user = await userRepository.createUser({
            firebaseUid: uid,
            email,
            fullName: name || email.split('@')[0],
            avatarUrl: picture || 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(name || 'User'),
          });
        }
      }

      if (user.status === 'banned') {
        throw new Error('Your account has been banned. Please contact support.');
      }

      const token = this.generateToken(user);
      const userData = user.toJSON ? user.toJSON() : user;

      return {
        token,
        user: userData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers a new user with local credentials.
   * @param {Object} userData 
   * @returns {Promise<{token: string, user: Object}>}
   */
  async registerLocal(userData) {
    try {
      const { email, password, fullName, phoneNumber } = userData;

      if (!email || !password || !fullName) {
        throw new Error('Email, password, and full name are required');
      }

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email is already registered');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const createdUser = await userRepository.createUser({
        email,
        password: hashedPassword,
        fullName,
        phoneNumber: phoneNumber || null,
      });

      const token = this.generateToken(createdUser);
      const userResponse = createdUser.toJSON ? createdUser.toJSON() : createdUser;

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticates user using email and password.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, user: Object}>}
   */
  async loginLocal(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.password) {
        throw new Error('This account uses Google Sign-In. Please sign in with Google.');
      }

      if (user.status === 'banned') {
        throw new Error('Your account has been banned. Please contact support.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = this.generateToken(user);
      const userData = user.toJSON ? user.toJSON() : user;

      return {
        token,
        user: userData,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a 6-digit OTP for password reset and stores it in the database.
   * @param {string} email 
   * @returns {Promise<{message: string, otp: string}>}
   */
  async requestPasswordReset(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('User with this email not found');
        error.statusCode = 404;
        throw error;
      }

      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Set OTP expiration to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await userRepository.saveOtp(user._id, otp, expiresAt);

      // NOTE: Call an email sending service (e.g., Nodemailer, SendGrid, or AWS SES) here to dispatch the OTP to the user's email address.
      // Example: await emailService.sendPasswordResetOtp(email, otp);

      return {
        message: 'Password reset OTP has been sent to your email',
        otp,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validates OTP and returns a short-lived reset token for setting a new password.
   * @param {string} email 
   * @param {string} otp 
   * @returns {Promise<{message: string, resetToken: string}>}
   */
  async verifyResetOtp(email, otp) {
    try {
      if (!email || !otp) {
        throw new Error('Email and OTP are required');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (!user.resetOtp || user.resetOtp !== otp) {
        throw new Error('Invalid OTP');
      }

      if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
        throw new Error('OTP has expired');
      }

      // Clear the OTP once verified
      await userRepository.clearOtp(user._id);

      // Generate short-lived reset token (10 minutes)
      const resetToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          purpose: 'password_reset',
        },
        JWT_SECRET,
        { expiresIn: JWT_RESET_EXPIRES_IN }
      );

      return {
        message: 'OTP verified successfully',
        resetToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Hashes and updates password in MongoDB and synchronizes with Firebase Auth.
   * @param {string} email 
   * @param {string} newPassword 
   * @returns {Promise<{message: string}>}
   */
  async updateNewPassword(email, newPassword) {
    try {
      if (!email || !newPassword) {
        throw new Error('Email and new password are required');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // 1. Update password in local MongoDB database
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await userRepository.updateUser(user._id, { password: hashedPassword });

      // 2. Synchronize password update with Firebase Authentication
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        if (firebaseUser && firebaseUser.uid) {
          await admin.auth().updateUser(firebaseUser.uid, { password: newPassword });
        }
      } catch (firebaseError) {
        // Handle case where user is only registered locally and not present in Firebase Auth
        if (firebaseError.code !== 'auth/user-not-found') {
          throw firebaseError;
        }
      }

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();

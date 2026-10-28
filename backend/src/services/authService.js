const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const admin = require('../../config/firebaseAdmin');
const emailService = require('./emailService');

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
      // Check if Firebase Admin is properly initialized
      if (!admin.apps.length) {
        const error = new Error('Firebase Admin SDK is not configured. Please check your service account configuration.');
        error.statusCode = 503;
        throw error;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        const error = new Error('Firebase token does not contain an email address');
        error.statusCode = 400;
        throw error;
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
        const error = new Error('Your account has been banned. Please contact support.');
        error.statusCode = 403;
        throw error;
      }

      const token = this.generateToken(user);
      const userData = user.toJSON ? user.toJSON() : user;

      return {
        token,
        user: userData,
      };
    } catch (error) {
      // If it's a Firebase-specific error, wrap it with a more user-friendly message
      if (error.code && error.code.startsWith('auth/')) {
        const customError = new Error(`Firebase authentication failed: ${error.message}`);
        customError.statusCode = 401;
        throw customError;
      }
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
        const error = new Error('Email, password, and full name are required');
        error.statusCode = 400;
        throw error;
      }

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in MongoDB
      const createdUser = await userRepository.createUser({
        email,
        password: hashedPassword,
        fullName,
        phoneNumber: phoneNumber || null,
      });

      // Sync with Firebase Auth (create user in Firebase)
      try {
        if (admin.apps.length) {
          await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName,
          });
          console.log(`[AuthService] Firebase user created for ${email}`);
        }
      } catch (firebaseError) {
        // If Firebase user already exists, log warning but don't fail
        if (firebaseError.code === 'auth/email-already-exists') {
          console.warn(`[AuthService] Firebase user already exists for ${email}`);
        } else {
          console.error('[AuthService] Firebase sync error:', firebaseError);
        }
      }

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
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      if (!user.password) {
        const error = new Error('This account uses Google Sign-In. Please sign in with Google.');
        error.statusCode = 400;
        throw error;
      }

      if (user.status === 'banned') {
        const error = new Error('Your account has been banned. Please contact support.');
        error.statusCode = 403;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
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
        const error = new Error('Email is required');
        error.statusCode = 400;
        throw error;
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

      // Send OTP via email service
      await emailService.sendPasswordResetOtp(email, otp);

      return {
        message: 'Password reset OTP has been sent to your email',
        otp, // Return OTP for development/testing
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
        const error = new Error('Email and OTP are required');
        error.statusCode = 400;
        throw error;
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (!user.resetOtp || user.resetOtp !== otp) {
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
      }

      if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
        const error = new Error('OTP has expired');
        error.statusCode = 400;
        throw error;
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
   * Hashes and updates password in MongoDB and Firebase Auth.
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<{message: string}>}
   */
  async updateNewPassword(email, newPassword) {
    try {
      if (!email || !newPassword) {
        const error = new Error('Email and new password are required');
        error.statusCode = 400;
        throw error;
      }

      if (newPassword.length < 6) {
        const error = new Error('Password must be at least 6 characters long');
        error.statusCode = 400;
        throw error;
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Update password in local MongoDB database
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await userRepository.updateUser(user._id, { password: hashedPassword });

      // Sync password with Firebase Auth
      try {
        if (admin.apps.length) {
          // Find Firebase user by email
          const firebaseUser = await admin.auth().getUserByEmail(email);
          // Update password in Firebase
          await admin.auth().updateUser(firebaseUser.uid, {
            password: newPassword,
          });
          console.log(`[AuthService] Firebase password updated for ${email}`);
        }
      } catch (firebaseError) {
        // If Firebase user doesn't exist, log warning but don't fail
        if (firebaseError.code === 'auth/user-not-found') {
          console.warn(`[AuthService] Firebase user not found for ${email}, creating new user`);
          try {
            await admin.auth().createUser({
              email: email,
              password: newPassword,
              displayName: user.fullName,
            });
            console.log(`[AuthService] Firebase user created for ${email}`);
          } catch (createError) {
            console.error('[AuthService] Failed to create Firebase user:', createError);
          }
        } else {
          console.error('[AuthService] Firebase password sync error:', firebaseError);
        }
      }

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates and sends OTP for email verification during registration
   * @param {string} email
   * @returns {Promise<{message: string, otp: string}>}
   */
  async requestRegisterOTP(email) {
    try {
      if (!email) {
        const error = new Error('Email is required');
        error.statusCode = 400;
        throw error;
      }

      // Check if email already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
      }

      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Set OTP expiration to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Store OTP temporarily (using the email as key for pending registrations)
      await userRepository.savePendingOtp(email, otp, expiresAt);

      // Send OTP via email service
      await emailService.sendRegisterOtp(email, otp);

      return {
        message: 'Registration OTP has been sent to your email',
        otp, // Return OTP for development/testing
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validates OTP for registration
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<{message: string, registerToken: string}>}
   */
  async verifyRegisterOTP(email, otp) {
    try {
      if (!email || !otp) {
        const error = new Error('Email and OTP are required');
        error.statusCode = 400;
        throw error;
      }

      const pendingOtp = await userRepository.getPendingOtp(email);
      if (!pendingOtp) {
        const error = new Error('OTP not found or expired. Please request a new OTP.');
        error.statusCode = 400;
        throw error;
      }

      if (pendingOtp.otp !== otp) {
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
      }

      if (new Date(pendingOtp.expiresAt) < new Date()) {
        const error = new Error('OTP has expired');
        error.statusCode = 400;
        throw error;
      }

      // Clear the OTP once verified
      await userRepository.clearPendingOtp(email);

      // Generate short-lived register token (10 minutes)
      const registerToken = jwt.sign(
        {
          email,
          purpose: 'register_verification',
        },
        JWT_SECRET,
        { expiresIn: JWT_RESET_EXPIRES_IN }
      );

      return {
        message: 'OTP verified successfully',
        registerToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers a new user after OTP verification
   * @param {Object} userData
   * @param {string} registerToken
   * @returns {Promise<{token: string, user: Object}>}
   */
  async registerWithOTP(userData, registerToken) {
    try {
      const { email, password, fullName, phoneNumber } = userData;

      if (!email || !password || !fullName) {
        const error = new Error('Email, password, and full name are required');
        error.statusCode = 400;
        throw error;
      }

      // Verify register token
      let decoded;
      try {
        decoded = jwt.verify(registerToken, JWT_SECRET);
      } catch (err) {
        const error = new Error('Invalid or expired register token');
        error.statusCode = 401;
        throw error;
      }

      if (decoded.purpose !== 'register_verification' || decoded.email !== email) {
        const error = new Error('Invalid register token');
        error.statusCode = 401;
        throw error;
      }

      // Check if email already exists (double-check)
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in MongoDB
      const createdUser = await userRepository.createUser({
        email,
        password: hashedPassword,
        fullName,
        phoneNumber: phoneNumber || null,
      });

      // Sync with Firebase Auth (create user in Firebase)
      try {
        if (admin.apps.length) {
          await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName,
          });
          console.log(`[AuthService] Firebase user created for ${email}`);
        }
      } catch (firebaseError) {
        // If Firebase user already exists, log warning but don't fail
        if (firebaseError.code === 'auth/email-already-exists') {
          console.warn(`[AuthService] Firebase user already exists for ${email}`);
        } else {
          console.error('[AuthService] Firebase sync error:', firebaseError);
        }
      }

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
}

module.exports = new AuthService();

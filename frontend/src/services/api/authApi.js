import apiClient from './apiClient';

/**
 * Auth API endpoints for backend communication
 */
export const authApi = {
  /**
   * Exchange Firebase ID token for session JWT & user profile
   */
  firebaseLogin: (idToken) => apiClient.post('/auth/firebase-login', { idToken }),

  /**
   * Google Sign-In exchange
   */
  googleSignIn: (idToken) => apiClient.post('/auth/google', { idToken }),

  /**
   * Local user registration
   */
  register: (userData) => apiClient.post('/auth/register', userData),

  /**
   * Local user login
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Forgot password OTP request
   */
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  /**
   * Verify password reset OTP
   */
  verifyOtp: (payload) => apiClient.post('/auth/verify-otp', payload),

  /**
   * Reset password
   */
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),

  /**
   * Fetch currently authenticated user profile
   */
  getMe: () => apiClient.get('/auth/me'),
};

export default authApi;

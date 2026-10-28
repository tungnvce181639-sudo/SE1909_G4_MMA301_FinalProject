import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import apiClient, { TOKEN_STORAGE_KEY, USER_DATA_KEY } from './api/apiClient';

/**
 * Standardize and map Firebase & API error codes to user-friendly messages
 * @param {Error|Object} error
 * @returns {string}
 */
export const formatAuthErrorMessage = (error) => {
  if (!error) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

  // Firebase auth error codes
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa. Vui lòng liên hệ hỗ trợ.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Mật khẩu hoặc email không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.';
    default:
      break;
  }

  // Backend API error message
  if (error.message) {
    return error.message;
  }

  return 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.';
};

/**
 * Helper to store session credentials into AsyncStorage
 * @param {string} token 
 * @param {Object} user 
 */
const persistSession = async (token, user) => {
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  if (user) {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
};

/**
 * Sign in with Email and Password using backend API (local authentication)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const loginWithEmail = async (email, password) => {
  try {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    // Call backend API for local authentication (not Firebase)
    const response = await apiClient.post('/auth/login', {
      email: trimmedEmail,
      password,
    });

    // Response structure from backend: { success: true, token, user }
    const backendToken = response?.token;
    const userData = response?.user;

    if (!backendToken || !userData) {
      throw new Error('Không thể lấy thông tin đăng nhập từ máy chủ.');
    }

    // Persist backend token and user data in AsyncStorage
    await persistSession(backendToken, userData);

    return {
      user: userData,
      token: backendToken,
    };
  } catch (error) {
    const formattedError = new Error(formatAuthErrorMessage(error));
    formattedError.originalError = error;
    throw formattedError;
  }
};



/**
 * Register a new user with email, password, and full name
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const registerWithEmail = async (email, password, fullName) => {
  try {
    const trimmedEmail = email?.trim();
    if (!trimmedEmail || !password || !fullName) {
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
    }

    // 1. Create account on Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const firebaseUser = userCredential.user;

    // 2. Update display name in Firebase profile
    await updateProfile(firebaseUser, { displayName: fullName.trim() });

    // 3. Obtain Firebase ID Token
    const idToken = await firebaseUser.getIdToken();

    // 4. Sync profile with backend
    const response = await apiClient.post('/auth/firebase-login', { idToken });

    const backendToken = response?.token || idToken;
    const userData = response?.user || {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName,
    };

    await persistSession(backendToken, userData);

    return {
      user: userData,
      token: backendToken,
      firebaseUser,
    };
  } catch (error) {
    const formattedError = new Error(formatAuthErrorMessage(error));
    formattedError.originalError = error;
    throw formattedError;
  }
};

/**
 * Sign out user from Firebase and clear AsyncStorage session
 */
export const logout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_DATA_KEY]);
  } catch (error) {
    console.error('[authService] Error logging out:', error);
    throw error;
  }
};

/**
 * Get stored session token from AsyncStorage
 * @returns {Promise<string|null>}
 */
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('[authService] Error retrieving stored token:', error);
    return null;
  }
};

/**
 * Get stored user profile from AsyncStorage
 * @returns {Promise<Object|null>}
 */
export const getStoredUser = async () => {
  try {
    const rawData = await AsyncStorage.getItem(USER_DATA_KEY);
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.warn('[authService] Error retrieving stored user:', error);
    return null;
  }
};

export default {
  loginWithEmail,
  registerWithEmail,
  logout,
  getStoredToken,
  getStoredUser,
  formatAuthErrorMessage,
};

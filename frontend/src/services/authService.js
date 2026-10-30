import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
let GoogleSignin = null;
let statusCodes = {};
try {
  const gSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = gSignInModule.GoogleSignin;
  statusCodes = gSignInModule.statusCodes || {};
} catch (e) {
  // Graceful fallback for non-native / Expo Go environments
}
import { auth, configureGoogleSignIn } from '../config/firebaseConfig';
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
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập Google đã bị đóng.';
    default:
      break;
  }

  // Google Sign-in status codes
  if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
    return 'Người dùng đã hủy quá trình đăng nhập Google.';
  } else if (error.code === statusCodes?.IN_PROGRESS) {
    return 'Quá trình đăng nhập đang được tiến hành.';
  } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services không khả dụng hoặc chưa được cập nhật.';
  }

  // Backend API error message
  if (error.message) {
    return error.message;
  }

  return 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.';
};

export const isGoogleSignInCancelled = (error) =>
  Boolean(statusCodes.SIGN_IN_CANCELLED) &&
  (error?.code === statusCodes.SIGN_IN_CANCELLED ||
    error?.originalError?.code === statusCodes.SIGN_IN_CANCELLED);

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
 * Sign in with Email and Password using Firebase SDK and sync with Node.js backend
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

    // 1. Authenticate against Firebase Auth modular SDK
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const firebaseUser = userCredential.user;

    // 2. Retrieve Firebase ID Token for backend verification
    const idToken = await firebaseUser.getIdToken();

    // 3. Sync with Node.js backend to get session JWT and DB user profile
    const response = await apiClient.post('/auth/firebase-login', { idToken });

    // Response structure from backend: { success: true, token, user }
    const backendToken = response?.token || idToken;
    const userData = response?.user || {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      avatarUrl: firebaseUser.photoURL,
    };

    // 4. Persist backend token and user data in AsyncStorage
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
 * Sign in with Google using GoogleSignin + Firebase SDK, then sync with backend
 * @returns {Promise<{ user: Object, token: string }>}
 */
export const loginWithGoogle = async () => {
  try {
    if (!GoogleSignin) {
      throw new Error(
        'Đăng nhập Google yêu cầu cấu hình native hoặc development build (EAS Build / Android build).'
      );
    }

    // 1. Ensure Google Sign-In is configured with webClientId
    configureGoogleSignIn();

    // 2. Ensure Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 3. Initiate Google OAuth sign-in prompt
    const signInResult = await GoogleSignin.signIn();
    const googleIdToken = signInResult.data?.idToken || signInResult.idToken;

    if (!googleIdToken) {
      throw new Error('Không thể lấy ID Token từ Google Sign-In.');
    }

    // 4. Authenticate with Firebase using the Google credential
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // 5. Get fresh Firebase ID Token
    const firebaseIdToken = await firebaseUser.getIdToken();

    // 6. Sync with Node.js backend (/api/auth/firebase-login or /api/auth/google)
    const response = await apiClient.post('/auth/google', {
      idToken: firebaseIdToken || googleIdToken,
    });

    const backendToken = response?.token || firebaseIdToken;
    const userData = response?.user || {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || 'Sinh viên FPT',
      avatarUrl: firebaseUser.photoURL,
    };

    // 7. Persist session token and user profile
    await persistSession(backendToken, userData);

    return {
      user: userData,
      token: backendToken,
      firebaseUser,
    };
  } catch (error) {
    const formattedError = new Error(formatAuthErrorMessage(error));
    formattedError.code = error.code;
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
 * Sign out user from Firebase, Google Sign-in, and clear AsyncStorage session
 */
export const logout = async () => {
  try {
    await signOut(auth);

    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch (e) {
      // Ignored if GoogleSignin wasn't active or in web
    }

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
  loginWithGoogle,
  registerWithEmail,
  logout,
  getStoredToken,
  getStoredUser,
  formatAuthErrorMessage,
};

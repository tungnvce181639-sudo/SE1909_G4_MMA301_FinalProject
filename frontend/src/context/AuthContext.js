import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
//import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db, USERS_COLLECTION } from '../services/firebaseConfig';

const USER_TOKEN_KEY = 'userToken';

export const AuthContext = createContext(null);

function logAuthError(operation, error) {
  console.error(`[AuthContext] ${operation} failed:`, error);
}

function showAuthError(operation, error) {
  const messages = {
    'auth/email-already-in-use': 'Email đã tồn tại',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/invalid-credential': 'Sai mật khẩu',
    'auth/user-not-found': 'Tài khoản không tồn tại',
    'auth/wrong-password': 'Sai mật khẩu',
  };

  Alert.alert(
    `${operation} thất bại`,
    messages[error?.code] || 'Đã xảy ra lỗi. Vui lòng thử lại.',
  );
}

async function persistUserToken(firebaseUser) {
  const token = await firebaseUser.getIdToken();
  await AsyncStorage.setItem(USER_TOKEN_KEY, token);
  return token;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await persistUserToken(firebaseUser);
          setUser(firebaseUser);
          setUserToken(token);
        } else {
          setUser(null);
          setUserToken(null);
          await AsyncStorage.removeItem(USER_TOKEN_KEY);
        }
      } catch (error) {
        logAuthError('Restoring authentication session', error);
        showAuthError('Khôi phục phiên đăng nhập', error);
        setUser(null);
        setUserToken(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await persistUserToken(result.user);
      setUser(result.user);
      setUserToken(token);
      return { user: result.user, token };
    } catch (error) {
      logAuthError('Login', error);
      showAuthError('Đăng nhập', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, USERS_COLLECTION, result.user.uid), {
        email: result.user.email || email.trim(),
        fullName: name,
        role: 'student',
        createdAt: serverTimestamp(),
      });

      if (name?.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }

      const token = await persistUserToken(result.user);
      setUser(result.user);
      setUserToken(token);
      return { user: result.user, token };
    } catch (error) {
      logAuthError('Registration', error);
      showAuthError('Đăng ký', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    setLoading(true);

    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
      });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In did not return an ID token.');
      }

      const result = await signInWithCredential(
        auth,
        GoogleAuthProvider.credential(idToken),
      );
      const token = await persistUserToken(result.user);
      setUser(result.user);
      setUserToken(token);
      return { user: result.user, token };
    } catch (error) {
      logAuthError('Google sign-in', error);
      showAuthError('Đăng nhập Google', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await signOut(auth);
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
      setUser(null);
      setUserToken(null);
    } catch (error) {
      logAuthError('Logout', error);
      showAuthError('Đăng xuất', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoading: loading,
      userToken,
      login,
      register,
      googleSignIn,
      logout,
    }),
    [googleSignIn, loading, login, logout, register, user, userToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

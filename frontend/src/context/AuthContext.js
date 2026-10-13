import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../services/firebaseConfig';

const USER_TOKEN_KEY = 'userToken';

export const AuthContext = createContext(null);

function logAuthError(operation, error) {
  console.error(`[AuthContext] ${operation} failed:`, error);
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
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (name?.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }

      const token = await persistUserToken(result.user);
      setUser(result.user);
      setUserToken(token);
      return { user: result.user, token };
    } catch (error) {
      logAuthError('Registration', error);
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

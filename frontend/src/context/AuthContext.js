import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, {
  loginWithEmail as serviceLoginWithEmail,
  loginWithGoogle as serviceLoginWithGoogle,
  registerWithEmail as serviceRegisterWithEmail,
  logout as serviceLogout,
  formatAuthErrorMessage,
  isGoogleSignInCancelled,
} from '../services/authService';
import { TOKEN_STORAGE_KEY, USER_DATA_KEY } from '../services/api/apiClient';
import { unregisterFromRemoteNotifications } from '../services/notificationService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

        if (storedToken) {
          setUserToken(storedToken);
          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Failed to restore session from AsyncStorage:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await serviceLoginWithEmail(email, password);
      setUser(result.user);
      setUserToken(result.token);
      return result;
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.message || formatAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    setLoading(true);
    try {
      const result = await serviceRegisterWithEmail(email, password, fullName);
      setUser(result.user);
      setUserToken(result.token);
      return result;
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.message || formatAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const result = await serviceLoginWithGoogle();
      setUser(result.user);
      setUserToken(result.token);
      return result;
    } catch (error) {
      if (!isGoogleSignInCancelled(error)) {
        Alert.alert('Đăng nhập Google thất bại', error.message || formatAuthErrorMessage(error));
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      try {
        await unregisterFromRemoteNotifications();
      } catch (notificationError) {
        console.warn('[AuthContext] Could not unregister push token before logout:', notificationError);
      }
      await serviceLogout();
      setUser(null);
      setUserToken(null);
    } catch (error) {
      Alert.alert('Đăng xuất thất bại', error.message);
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

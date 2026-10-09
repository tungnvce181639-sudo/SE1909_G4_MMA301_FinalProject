import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

const MOCK_TOKEN = 'mock-auth-token';

function createUser({ name, email }) {
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';

  return {
    id: `mock-user-${normalizedEmail}`,
    name: name || normalizedEmail.split('@')[0] || 'Mock User',
    email: normalizedEmail,
  };
}

function simulateRequest(result) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 300);
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    try {
      const normalizedEmail = typeof email === 'string' ? email.trim() : '';
      const authenticatedUser = createUser({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
      });
      const result = await simulateRequest({
        user: authenticatedUser,
        token: MOCK_TOKEN,
      });

      setUser(result.user);
      setUserToken(result.token);

      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);

    try {
      const registeredUser = createUser({ name, email });
      const result = await simulateRequest({
        user: registeredUser,
        token: MOCK_TOKEN,
      });

      setUser(result.user);
      setUserToken(result.token);

      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await simulateRequest(null);
      setUser(null);
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      userToken,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user, userToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

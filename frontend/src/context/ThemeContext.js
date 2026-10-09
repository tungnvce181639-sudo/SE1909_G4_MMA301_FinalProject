import React, { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const lightTheme = {
  background: '#f9f9fd',
  card: '#ffffff',
  text: '#1a1c1f',
  textSecondary: '#584238',
  border: '#e2e2e6',
};

const darkTheme = {
  background: '#17181c',
  card: '#24252a',
  text: '#f5f5f5',
  textSecondary: '#b9b9c0',
  border: '#4a4b52',
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#f26f21');
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const value = useMemo(
    () => ({
      theme: isDarkMode ? darkTheme : lightTheme,
      isDarkMode,
      primaryColor,
      fontSizeScale,
      toggleDarkMode: () => setIsDarkMode((value) => !value),
      toggleTheme: () => setIsDarkMode((value) => !value),
      setPrimaryColor,
      setFontSizeScale,
    }),
    [fontSizeScale, isDarkMode, primaryColor],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext) || {
    theme: lightTheme,
    isDarkMode: false,
    primaryColor: '#f26f21',
    fontSizeScale: 1,
    toggleDarkMode: () => {},
    setPrimaryColor: () => {},
    setFontSizeScale: () => {},
  };
}
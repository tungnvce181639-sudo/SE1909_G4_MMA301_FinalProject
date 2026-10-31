import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const SETTINGS_KEY = '@smartcampus/settings';
const DEFAULT_PRIMARY_COLOR = '#f26f21';
const ALLOWED_COLORS = ['#f26f21', '#0031e8', '#006b55', '#8b5cf6', '#d946ef'];
const ALLOWED_FONT_SCALES = [0.9, 1, 1.15];

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
  const [primaryColor, setPrimaryColorState] = useState(DEFAULT_PRIMARY_COLOR);
  const [fontSizeScale, setFontSizeScaleState] = useState(1);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!storedSettings) return;

        const settings = JSON.parse(storedSettings);
        if (!active || !settings || typeof settings !== 'object') return;

        if (typeof settings.isDarkMode === 'boolean') setIsDarkMode(settings.isDarkMode);
        if (ALLOWED_COLORS.includes(settings.primaryColor)) setPrimaryColorState(settings.primaryColor);
        if (ALLOWED_FONT_SCALES.includes(settings.fontSizeScale)) {
          setFontSizeScaleState(settings.fontSizeScale);
        }
      } catch (error) {
        console.warn('[ThemeContext] Could not load saved appearance settings:', error);
      } finally {
        if (active) setSettingsLoaded(true);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    AsyncStorage.mergeItem(
      SETTINGS_KEY,
      JSON.stringify({ isDarkMode, primaryColor, fontSizeScale }),
    ).catch((error) => console.warn('[ThemeContext] Could not save appearance settings:', error));
  }, [fontSizeScale, isDarkMode, primaryColor, settingsLoaded]);

  const toggleDarkMode = useCallback(() => setIsDarkMode((value) => !value), []);
  const setPrimaryColor = useCallback((color) => {
    if (ALLOWED_COLORS.includes(color)) setPrimaryColorState(color);
  }, []);
  const setFontSizeScale = useCallback((scale) => {
    if (ALLOWED_FONT_SCALES.includes(scale)) setFontSizeScaleState(scale);
  }, []);

  const value = useMemo(
    () => ({
      theme: isDarkMode ? darkTheme : lightTheme,
      isDarkMode,
      primaryColor,
      fontSizeScale,
      toggleDarkMode,
      toggleTheme: toggleDarkMode,
      setPrimaryColor,
      setFontSizeScale,
    }),
    [fontSizeScale, isDarkMode, primaryColor, setFontSizeScale, setPrimaryColor, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext) || {
    theme: lightTheme,
    isDarkMode: false,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    fontSizeScale: 1,
    toggleDarkMode: () => {},
    toggleTheme: () => {},
    setPrimaryColor: () => {},
    setFontSizeScale: () => {},
  };
}

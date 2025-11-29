import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPalette, lightColors, ColorPalette } from '../theme/colors';

type ThemeValue = {
  darkMode: boolean;
  colors: ColorPalette;
  toggleTheme: () => void;
  setTheme: (darkMode: boolean) => void;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);
const STORAGE_KEY = '@xrpl_theme_mode';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDarkMode(stored === 'dark');
      }
    })();
  }, []);

  const setTheme = async (mode: boolean) => {
    setDarkMode(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    setTheme(!darkMode);
  };

  const value = useMemo(
    () => ({
      darkMode,
      colors: getPalette(darkMode),
      toggleTheme,
      setTheme,
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
};

export const useThemedColors = () => {
  const { colors } = useThemeMode();
  return colors ?? lightColors;
};

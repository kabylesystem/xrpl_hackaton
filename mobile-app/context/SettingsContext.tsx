import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  autoScale: boolean;
  manualMaxBalance: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  getMaxBalance: (currentBalance: number) => number;
}

const defaultSettings: Settings = {
  autoScale: true,
  manualMaxBalance: 10000,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@xrpl_wallet_settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const getMaxBalance = (currentBalance: number): number => {
    if (!settings.autoScale) {
      return settings.manualMaxBalance;
    }

    // Auto scale logic
    if (currentBalance < 100) {
      return 250;
    } else if (currentBalance < 500) {
      return 1000;
    } else if (currentBalance < 1000) {
      return 1500;
    } else if (currentBalance < 5000) {
      return 10000;
    } else {
      // For balances >= 5000, use balance * 2
      return currentBalance * 2;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getMaxBalance }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

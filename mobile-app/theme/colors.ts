export type ColorPalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textWhite: string;
  background: string;
  backgroundDark: string;
  surface: string;
  surfaceDark: string;
  surfaceVariant: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  border: string;
  borderDark: string;
  gradientStart: string;
  gradientEnd: string;
  overlay: string;
  overlayLight: string;
  nfcBlue: string;
  qrGreen: string;
};

export const lightColors: ColorPalette = {
  // Primary
  primary: '#2F80ED',
  primaryDark: '#2570D8',
  primaryLight: '#5A9BF2',

  // Secondary
  secondary: '#27AE60',
  secondaryDark: '#229954',
  secondaryLight: '#4FC57A',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9E9E9E',
  textWhite: '#FFFFFF',

  // Background
  background: '#F8F9FB',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  surfaceVariant: '#2A2A2A',

  // Status
  success: '#27AE60',
  error: '#EB5757',
  warning: '#F2994A',
  info: '#2F80ED',

  // Borders
  border: '#E5E5E5',
  borderDark: '#333333',

  // Gradients
  gradientStart: '#2F80ED',
  gradientEnd: '#1E5BB8',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // NFC/QR specific
  nfcBlue: '#2F80ED',
  qrGreen: '#27AE60',
};

export const darkColors: ColorPalette = {
  primary: '#5A9BF2',
  primaryDark: '#2570D8',
  primaryLight: '#7CB3FF',
  secondary: '#4FC57A',
  secondaryDark: '#27AE60',
  secondaryLight: '#7CE3A0',
  textPrimary: '#F5F5F5',
  textSecondary: '#C2C2C2',
  textTertiary: '#9E9E9E',
  textWhite: '#FFFFFF',
  background: '#0F1115',
  backgroundDark: '#0B0D10',
  surface: '#1A1E24',
  surfaceDark: '#121418',
  surfaceVariant: '#2A2F38',
  success: '#4FC57A',
  error: '#F66',
  warning: '#F5A524',
  info: '#5A9BF2',
  border: '#2A2F38',
  borderDark: '#1E1E1E',
  gradientStart: '#1E5BB8',
  gradientEnd: '#0F2F70',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  nfcBlue: '#5A9BF2',
  qrGreen: '#4FC57A',
};

export const colors = lightColors;

export const getPalette = (isDark: boolean): ColorPalette => (isDark ? darkColors : lightColors);

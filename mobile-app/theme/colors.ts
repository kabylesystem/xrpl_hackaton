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
  primary: '#008850',
  primaryDark: '#006B3D',
  primaryLight: '#00A563',

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
  info: '#008850',

  // Borders
  border: '#E5E5E5',
  borderDark: '#333333',

  // Gradients
  gradientStart: '#008850',
  gradientEnd: '#006B3D',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // NFC/QR specific
  nfcBlue: '#008850',
  qrGreen: '#27AE60',
};

export const darkColors: ColorPalette = {
  primary: '#00A563',
  primaryDark: '#008850',
  primaryLight: '#00C277',
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
  info: '#00A563',
  border: '#2A2F38',
  borderDark: '#1E1E1E',
  gradientStart: '#00A563',
  gradientEnd: '#006B3D',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  nfcBlue: '#00A563',
  qrGreen: '#4FC57A',
};

export const colors = lightColors;

export const getPalette = (isDark: boolean): ColorPalette => (isDark ? darkColors : lightColors);

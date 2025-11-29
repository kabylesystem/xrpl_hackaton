import { TextStyle } from 'react-native';

export const typography: { [key: string]: TextStyle } = {
  // Headings
  h1: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Small
  small: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  // Button
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
};

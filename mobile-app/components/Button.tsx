import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { typography, borderRadius, shadows } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const BUTTON_SIZES = {
  small: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
};

const ICON_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getButtonStyle = (): ViewStyle[] => {
    const sizeStyle = BUTTON_SIZES[size];
    const baseStyle: ViewStyle[] = [
      styles.button,
      {
        paddingVertical: sizeStyle.paddingVertical,
        paddingHorizontal: sizeStyle.paddingHorizontal,
      },
    ];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    } else {
      baseStyle.push(styles.outlineButton);
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text];

    if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  // Clone icon element with proper size if it's a React element
  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return (
        <View style={styles.iconContainer}>
          {React.cloneElement(icon as React.ReactElement<any>, {
            size: ICON_SIZES[size],
          })}
        </View>
      );
    }

    return <View style={styles.iconContainer}>{icon}</View>;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textWhite} />
      ) : (
        <>
          {renderIcon()}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xl,
      gap: 8,
      ...shadows.sm,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    disabledButton: {
      backgroundColor: colors.textTertiary,
      borderColor: colors.textTertiary,
    },
    text: {
      ...typography.button,
      color: colors.textWhite,
    },
    outlineText: {
      color: colors.primary,
    },
    disabledText: {
      color: colors.textWhite,
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

interface KeypadProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onNumberPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderKey = (key: string) => {
    return (
      <TouchableOpacity
        key={key}
        style={styles.key}
        onPress={() => (key === 'del' ? onDelete() : onNumberPress(key))}
        activeOpacity={0.7}
      >
        {key === 'del' ? (
          <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
        ) : (
          <Text style={styles.keyText}>{key}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {keys.map((key) => renderKey(key))}
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
      maxWidth: '100%',
      alignSelf: 'center',
    },
    key: {
      width: '30%',
      maxWidth: 110,
      minWidth: 80,
      height: 68,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyText: {
      ...typography.h2,
      color: colors.textPrimary,
    },
  });

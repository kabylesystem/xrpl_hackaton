import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { spacing, borderRadius } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
}) => {
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <QRCode
        value={value}
        size={size}
        color={colors.textPrimary}
        backgroundColor={colors.textWhite}
      />
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.textWhite,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
    },
  });

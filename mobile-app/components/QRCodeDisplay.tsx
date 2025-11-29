import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius } from '../theme';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
}) => {
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textWhite,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
});

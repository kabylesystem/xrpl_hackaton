import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface WalletCardProps {
  usdcBalance: string;
  ngnEquivalent: string;
  rate: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  usdcBalance,
  ngnEquivalent,
  rate,
}) => {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.content}>
        <Text style={styles.label}>Total Balance</Text>

        <Text style={styles.usdcBalance}>{usdcBalance} USDC</Text>

        <View style={styles.ngnRow}>
          <Text style={styles.ngnEquivalent}>≈ {ngnEquivalent} NGN</Text>
        </View>

        <View style={styles.rateRow}>
          <Ionicons name="trending-up" size={14} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.rateText}>Rate: {rate}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    zIndex: 10,
  },
  label: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  usdcBalance: {
    ...typography.h1,
    color: colors.textWhite,
    marginTop: spacing.sm,
  },
  ngnRow: {
    marginTop: spacing.xs,
  },
  ngnEquivalent: {
    ...typography.h2,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  rateText: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { QRCodeDisplay } from '../components';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

type PaymentRequestScreenProps = StackScreenProps<any, 'PaymentRequest'>;

export const PaymentRequestScreen: React.FC<PaymentRequestScreenProps> = ({ navigation, route }) => {
  const { amount = '0', amountUSDC = '0.00', address = 'wallet-not-set' } = route.params || {};
  const qrValue = JSON.stringify({ address, amount, amountUSDC });
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment request</Text>
      </View>

      <View style={styles.card}>
        <QRCodeDisplay value={qrValue} size={220} />
        <View style={styles.meta}>
          <Text style={styles.amount}>{amount || '0'} NGN</Text>
          <Text style={styles.helper}>≈ {amountUSDC} USDC</Text>
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xxl,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      ...shadows.md,
    },
    meta: {
      marginTop: spacing.lg,
      alignItems: 'center',
      gap: spacing.xs,
    },
    amount: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    address: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

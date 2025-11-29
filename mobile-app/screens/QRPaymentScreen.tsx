import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

interface QRPaymentScreenProps {
  navigation: any;
  route: {
    params?: {
      amount?: string;
      amountUSDC?: string;
    };
  };
}

export const QRPaymentScreen: React.FC<QRPaymentScreenProps> = ({ navigation, route }) => {
  const [scanned, setScanned] = useState(false);
  const amount = route.params?.amount || '0';
  const amountUSDC = route.params?.amountUSDC || '0.00';
  const destination = 'rQrcodeMerchantAddress';
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>QR payment</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={96} color={colors.primary} />
          </View>
          <Text style={styles.helper}>
            Point the camera at a merchant QR. We will read the destination address and amount.
          </Text>

          {scanned ? (
            <View style={styles.meta}>
              <Text style={styles.amount}>{amount || '0'} NGN</Text>
              <Text style={styles.helper}>≈ {amountUSDC} USDC</Text>
              <Text style={styles.address} numberOfLines={1}>
                {destination}
              </Text>
              <Button title="Confirm payment" onPress={() => navigation.navigate('Home')} />
            </View>
          ) : (
            <Button title="Simulate scan" onPress={() => setScanned(true)} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    content: {
      paddingVertical: spacing.lg,
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
      padding: spacing.lg,
      ...shadows.md,
      gap: spacing.md,
      alignItems: 'center',
    },
    qrPlaceholder: {
      width: 240,
      height: 240,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    meta: {
      width: '100%',
      alignItems: 'center',
      gap: spacing.xs,
    },
    amount: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    address: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });

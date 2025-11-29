import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, NFCAnimation } from '../components';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useWallet } from '../context/WalletContext';

interface NFCPaymentScreenProps {
  navigation: any;
  route: {
    params?: {
      amount?: string;
      amountUSDC?: string;
    };
  };
}

type Stage = 'scanning' | 'confirm' | 'success';

export const NFCPaymentScreen: React.FC<NFCPaymentScreenProps> = ({ navigation, route }) => {
  const [stage, setStage] = useState<Stage>('scanning');
  const { wallet } = useWallet();
  const amount = route.params?.amount || '0';
  const amountUSDC = route.params?.amountUSDC || '0.00';
  const merchant = { name: 'Café MamaKoko', address: 'rNxxx...7y9z' };

  useEffect(() => {
    if (stage === 'scanning') {
      const timer = setTimeout(() => setStage('confirm'), 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const content = () => {
    if (stage === 'scanning') {
      return (
        <View style={styles.centerContent}>
          <NFCAnimation isActive size={160} />
          <Text style={styles.title}>Hold near merchant</Text>
          <Text style={styles.helper}>Waiting for NFC connection...</Text>
        </View>
      );
    }

    if (stage === 'confirm') {
      return (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="storefront-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{merchant.name}</Text>
              <Text style={styles.helper}>{merchant.address}</Text>
            </View>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amount}>{amount || '0'} NGN</Text>
            <Text style={styles.converted}>≈ {amountUSDC} USDC</Text>
          </View>

          <View style={styles.meta}>
            <Text style={styles.helper}>Network fee: ~0.00001 XRP</Text>
            <Text style={styles.helper}>Est. time: ~4 seconds</Text>
          </View>

          <Button title="Confirm payment" onPress={() => setStage('success')} />
          <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      );
    }

    return (
      <View style={styles.centerContent}>
        <Ionicons name="checkmark-circle" size={96} color={colors.secondary} />
        <Text style={[styles.title, { color: colors.secondary }]}>Payment sent</Text>
        <Text style={styles.helper}>
          {amount || '0'} NGN sent from {wallet?.address?.slice(0, 12) ?? 'wallet'}...
        </Text>
        <Button title="Back home" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.lg }} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>NFC payment</Text>
      </View>
      {content()}
    </View>
  );
};

const styles = StyleSheet.create({
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
  screenTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  amountBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    gap: spacing.xs,
  },
  amount: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  converted: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  meta: {
    gap: 4,
  },
});

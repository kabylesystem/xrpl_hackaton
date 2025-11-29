import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button } from '../components';
import { useWallet } from '../context/WalletContext';

interface WalletSetupScreenProps {
  navigation: any;
}

export const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({ navigation }) => {
  const { connected, wallet, balance, statusMessage, loading, connect, setupWallet, refreshBalance } =
    useWallet();

  const canContinue = connected && !!wallet;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>Step 1 · XRPL</Text>
          <Text style={styles.title}>Create your wallet</Text>
          <Text style={styles.subtitle}>We will connect to XRPL testnet and fund a fresh wallet.</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('Home')} disabled={!canContinue}>
          <Text style={[styles.skip, !canContinue && styles.skipDisabled]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons
              name={connected ? 'checkmark-circle' : 'link-outline'}
              size={28}
              color={colors.primary}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.cardTitle}>Connect to XRPL Testnet</Text>
            <Text style={styles.cardSubtitle}>
              Secure connection to s.altnet.rippletest.net:51233
            </Text>
          </View>
          <TouchableOpacity onPress={connect} disabled={loading || connected}>
            {loading && !connected ? (
              <ActivityIndicator />
            ) : (
              <Ionicons
                name="refresh"
                size={22}
                color={connected ? colors.secondary : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.iconCircle, { backgroundColor: `${colors.secondary}15` }]}>
            <Ionicons
              name={wallet ? 'wallet' : 'shield-checkmark-outline'}
              size={28}
              color={colors.secondary}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.cardTitle}>{wallet ? 'Wallet ready' : 'Create + fund wallet'}</Text>
            <Text style={styles.cardSubtitle}>
              Auto-fund with faucet and fetch your first balance.
            </Text>
          </View>
          <TouchableOpacity onPress={setupWallet} disabled={loading || !connected || !!wallet}>
            {loading && !wallet ? (
              <ActivityIndicator />
            ) : (
              <Ionicons
                name="sparkles-outline"
                size={22}
                color={wallet ? colors.secondary : colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>

        {wallet && (
          <View style={styles.walletBox}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletValue} numberOfLines={1}>
              {wallet.address}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceChip}>
                <Ionicons name="flash-outline" size={14} color={colors.secondary} />
                <Text style={styles.balanceChipText}>{balance} XRP</Text>
              </View>
              <TouchableOpacity onPress={refreshBalance}>
                <Text style={styles.refresh}>Refresh balance</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}
      </View>

      <Button
        title={canContinue ? 'Go to dashboard' : 'Connect & create wallet'}
        onPress={() => {
          if (canContinue) {
            navigation.replace('Home');
          } else if (!connected) {
            connect();
          } else {
            setupWallet();
          }
        }}
        loading={loading}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  skip: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  skipDisabled: {
    color: colors.textTertiary,
  },
  card: {
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
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  walletBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  walletLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  walletValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.secondary}15`,
  },
  balanceChipText: {
    ...typography.caption,
    color: colors.secondary,
  },
  refresh: {
    ...typography.caption,
    color: colors.primary,
  },
  status: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

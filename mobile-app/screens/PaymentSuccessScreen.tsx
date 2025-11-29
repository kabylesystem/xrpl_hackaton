import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { Button } from '../components';
import { useThemedColors } from '../context/ThemeContext';

interface PaymentSuccessScreenProps {
  navigation: any;
  route: {
    params: {
      hash: string;
    };
  };
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
  const { hash } = route.params;
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleCopyHash = async () => {
    await Clipboard.setStringAsync(hash);
  };

  const handleViewExplorer = () => {
    const url = `https://testnet.xrpl.org/transactions/${hash}`;
    Linking.openURL(url);
  };

  const handleCopyUrl = async () => {
    const url = `https://testnet.xrpl.org/transactions/${hash}`;
    await Clipboard.setStringAsync(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color={colors.textWhite} />
          </View>
          <Text style={styles.title}>Payment Sent!</Text>
          <Text style={styles.subtitle}>Your transaction has been successfully submitted to the XRPL Testnet.</Text>
        </View>

        <View style={styles.hashCard}>
          <Text style={styles.hashLabel}>Transaction Hash</Text>
          <TouchableOpacity style={styles.hashRow} onPress={handleCopyHash}>
            <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
              {hash}
            </Text>
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.hashCard}>
            <Text style={styles.hashLabel}>Explorer URL</Text>
            <TouchableOpacity style={styles.hashRow} onPress={handleCopyUrl}>
                <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                {`https://testnet.xrpl.org/transactions/${hash}`}
                </Text>
                <Ionicons name="copy-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button
            title="View on Explorer"
            variant="outline"
            onPress={handleViewExplorer}
            icon={<Ionicons name="globe-outline" size={20} color={colors.primary} />}
          />
          <Button
            title="Return to Home"
            onPress={() => navigation.navigate('Home')}
          />
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
    },
    content: {
      padding: spacing.lg,
      gap: spacing.xl,
      flexGrow: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
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
    successContainer: {
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.success, // Assuming success color exists, otherwise green
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.md,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: '80%',
    },
    hashCard: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.xl,
      ...shadows.sm,
      gap: spacing.sm,
    },
    hashLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    hashRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    hashValue: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
    },
    actions: {
      gap: spacing.md,
      marginTop: 'auto',
    },
  });


import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { Button } from '../components';
import { useThemedColors } from '../context/ThemeContext';

interface SMSPaymentScreenProps {
  navigation: any;
  route: {
    params?: {
      amount?: string;
    };
  };
}

export const SMSPaymentScreen: React.FC<SMSPaymentScreenProps> = ({ navigation, route }) => {
  const amount = route.params?.amount || '0';
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const smsText = `PAY ${amount || '1200'}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>SMS payment</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.helper}>Offline flow</Text>
          <Text style={styles.description}>
            Send the SMS below to trigger a backend payment even without internet access.
          </Text>

          <View style={styles.smsBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
            <Text style={styles.smsText}>{smsText}</Text>
          </View>

          <View style={styles.steps}>
            <Text style={styles.helper}>How it works</Text>
            <Text style={styles.step}>1. Copy the SMS text and send to our gateway number.</Text>
            <Text style={styles.step}>2. We convert NGN → USDC using the oracle.</Text>
            <Text style={styles.step}>3. XRPL transaction is signed & broadcasted server-side.</Text>
            <Text style={styles.step}>4. You receive a confirmation SMS.</Text>
          </View>
        </View>

        <Button title="Back to home" variant="outline" onPress={() => navigation.navigate('Home')} />
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
      gap: spacing.lg,
      paddingVertical: spacing.lg,
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
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xxl,
      padding: spacing.lg,
      ...shadows.md,
      gap: spacing.md,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    description: {
      ...typography.body,
      color: colors.textPrimary,
    },
    smsBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: `${colors.primary}12`,
    },
    smsText: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },
    steps: {
      gap: spacing.xs,
    },
    step: {
      ...typography.caption,
      color: colors.textPrimary,
    },
  });

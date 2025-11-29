import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionListItem } from '../components';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useThemedColors } from '../context/ThemeContext';

interface HistoryScreenProps {
  navigation: any;
}

const historyItems = [
  { type: 'sent', amount: '1200', currency: 'NGN', description: 'Café MamaKoko', date: 'Today' },
  { type: 'received', amount: '50', currency: 'USDC', description: 'Merchant payout', date: 'Today' },
  { type: 'sent', amount: '0.75', currency: 'USDC', description: 'NFC Payment', date: 'Yesterday' },
  { type: 'sent', amount: '900', currency: 'NGN', description: 'SMS payment', date: 'Nov 28' },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
      </View>

      <View style={styles.card}>
        {historyItems.map((item, index) => (
          <TransactionListItem
            key={`${item.description}-${index}`}
            type={item.type as 'sent' | 'received'}
            amount={item.amount}
            currency={item.currency}
            description={item.description}
            date={item.date}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof useThemedColors>) =>
  StyleSheet.create({
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
      padding: spacing.md,
      ...shadows.md,
      gap: spacing.sm,
    },
  });

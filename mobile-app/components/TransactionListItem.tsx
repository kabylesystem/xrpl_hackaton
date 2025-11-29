import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface TransactionListItemProps {
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  description: string;
  date: string;
  onPress?: () => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  type,
  amount,
  currency,
  description,
  date,
  onPress,
}) => {
  const iconName = type === 'sent' ? 'arrow-up-circle' : 'arrow-down-circle';
  const iconColor = type === 'sent' ? colors.primary : colors.secondary;
  const amountPrefix = type === 'sent' ? '-' : '+';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: iconColor }]}>
          {amountPrefix}{amount}
        </Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  currency: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { Button, Keypad } from '../components';
import { useThemedColors } from '../context/ThemeContext';

interface PayScreenProps {
  navigation: any;
}

export const PayScreen: React.FC<PayScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const rate = 1600;
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const amountNGN = Number.parseFloat(amount) || 0;
  const amountUSDC = useMemo(() => (amountNGN / rate).toFixed(2), [amountNGN, rate]);

  const onNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const onDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Pay</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.helper}>Amount in NGN</Text>
          <Text style={styles.amount}>
            {amount || '0'} <Text style={styles.amountSuffix}>NGN</Text>
          </Text>
          <Text style={styles.converted}>≈ {amountUSDC} USDC</Text>
        </View>

        <Keypad onNumberPress={onNumberPress} onDelete={onDelete} />

        <View style={styles.actions}>
        <Button
          title="Send via Bluetooth"
          onPress={() => navigation.navigate('NFCPayment', { amount, amountUSDC })}
          disabled={amountNGN === 0}
          icon={<Ionicons name="bluetooth" size={20} color={colors.textWhite} />}
        />
          <Button
            title="Pay via QR Scan"
            variant="outline"
            onPress={() => navigation.navigate('QRPayment', { amount, amountUSDC })}
            disabled={amountNGN === 0}
            icon={<Ionicons name="qr-code-outline" size={20} color={colors.primary} />}
          />
          <Button
            title="Pay via SMS (offline)"
            variant="secondary"
            onPress={() => navigation.navigate('SMSPayment', { amount })}
            disabled={amountNGN === 0}
            icon={<Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textWhite} />}
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
    amountBox: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    amount: {
      ...typography.h1,
      color: colors.textPrimary,
    },
    amountSuffix: {
      ...typography.h3,
      color: colors.textSecondary,
    },
    converted: {
      ...typography.h3,
      color: colors.primary,
    },
    actions: {
      gap: spacing.md,
    },
  });

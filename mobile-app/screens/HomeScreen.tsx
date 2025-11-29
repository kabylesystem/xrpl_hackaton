import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useWallet } from "../context/WalletContext";
import { WalletCard, TransactionListItem } from "../components";
import { typography, spacing, borderRadius, shadows } from "../theme";
import { useThemedColors } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";

interface HomeScreenProps {
  navigation: any;
}

const sampleTransactions = [
  {
    type: "sent",
    amount: "1200",
    currency: "NGN",
    description: "Café MamaKoko",
    date: "Today",
  },
  {
    type: "received",
    amount: "0.5",
    currency: "XRP",
    description: "Testnet faucet",
    date: "Yesterday",
  },
  {
    type: "sent",
    amount: "800",
    currency: "NGN",
    description: "SMS payment",
    date: "Nov 28",
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { wallet, balance, rate, connected, statusMessage, refreshBalance } =
    useWallet();
  const { settings } = useSettings();
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const quickActions = [
    {
      label: "Pay",
      helper: "Send money",
      icon: "send",
      color: colors.primary,
      target: "Pay",
    },
    {
      label: "Receive",
      helper: "Get paid",
      icon: "download",
      color: colors.secondary,
      target: "Receive",
    },
    {
      label: "SMS",
      helper: "Offline mode",
      icon: "chatbubbles",
      color: colors.secondary,
      target: "SMSPayment",
    },
    {
      label: "History",
      helper: "Transactions",
      icon: "time",
      color: colors.primary,
      target: "History",
    },
  ];

  const numericBalance = Number.parseFloat(balance) || 0;
  const converted = (numericBalance * rate).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

  const displayName = settings.displayName || "User";
  const transactions = sampleTransactions.map((tx) => ({
    ...tx,
    description:
      tx.description === "Café MamaKoko"
        ? displayName
        : tx.description.replace("SMS payment", `Payment from ${displayName}`),
  }));

  const handleCopyAddress = async () => {
    if (wallet?.address) {
      await Clipboard.setStringAsync(wallet.address);
      Alert.alert("Success", "Address copied to clipboard");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>
              {connected ? "Connected" : "Offline"}
            </Text>
            <Text style={styles.title}>Hi, {displayName}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              NGN ↔ USDC bridge on XRPL testnet.{" "}
              {wallet ? "Wallet ready." : "Create your wallet."}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.85}
          >
            <Ionicons name="menu" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <WalletCard
          balance={numericBalance.toFixed(2)}
          convertedAmount={converted}
          rate={`1 USD ≈ ${rate} NGN`}
          currencyLabel="XRP"
          convertedLabel="NGN"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickCard}
                onPress={() => navigation.navigate(action.target)}
              >
                <View
                  style={[
                    styles.quickIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
                <Text style={styles.quickHelper}>{action.helper}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Live oracle</Text>
              <Text style={styles.helper}>
                1 USD ≈ {rate} NGN (refreshed locally)
              </Text>
            </View>
            <TouchableOpacity onPress={() => refreshBalance()}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>XRPL wallet</Text>
              <Text style={styles.infoValue}>
                {wallet ? "Active" : "Missing"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Balance</Text>
              <Text style={styles.infoValue}>
                {numericBalance.toFixed(2)} XRP
              </Text>
            </View>
            {wallet && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <Text
                    style={[
                      styles.infoValue,
                      styles.address,
                      { flexShrink: 1 },
                    ]}
                    numberOfLines={1}
                  >
                    {wallet.address}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyAddress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {statusMessage && (
              <Text style={styles.helper}>{statusMessage}</Text>
            )}
          </View>
        </View>

        <View style={[styles.section, { paddingBottom: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate("History")}>
              <Text style={styles.link}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listStack}>
            {transactions.map((tx, index) => (
              <TransactionListItem
                key={`${tx.description}-${index}`}
                type={tx.type as "sent" | "received"}
                amount={tx.amount}
                currency={tx.currency}
                description={tx.description}
                date={tx.date}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      zIndex: 10,
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
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.sm,
    },
    section: {
      gap: spacing.sm,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    quickCard: {
      width: "47%",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      ...shadows.sm,
    },
    quickIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    quickLabel: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },
    quickHelper: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      ...shadows.sm,
      gap: spacing.sm,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    infoLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    infoValue: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: "right",
    },
    address: {
      fontSize: 12,
    },
    link: {
      ...typography.caption,
      color: colors.primary,
    },
    listStack: {
      gap: spacing.sm,
    },
  });

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking, Alert, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { typography, spacing, borderRadius, shadows } from "../theme";
import { Button } from "../components";
import { useThemedColors } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";

interface PayScreenProps {
  navigation: any;
}

interface PaymentQRData {
  walletAddress: string;
  amountOfToken: string;
  tokenSymbol: string;
  tokenAddress: string;
}

const SMS_GATEWAY_NUMBER = "+1 2232997953";

export const PayScreen: React.FC<PayScreenProps> = ({ navigation }) => {
  const { submitPayment, getSignedPayment, loading: walletLoading } = useWallet();
  const [scannedData, setScannedData] = useState<PaymentQRData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedData) return;

    try {
      // Try parsing as JSON first (hackathon format)
      const parsed = JSON.parse(data);
      if (parsed.walletAddress) {
        setScannedData({
          walletAddress: parsed.walletAddress,
          amountOfToken: parsed.amountOfToken || "0",
          tokenSymbol: parsed.tokenSymbol || "XRP",
          tokenAddress: parsed.tokenAddress || "",
        });
        return;
      }
    } catch (e) {
      // Not JSON, try other formats
    }

    // Fallback: Check if it's a simple wallet address
    if (data.startsWith("r") && data.length >= 25 && data.length <= 35) {
      setScannedData({
        walletAddress: data,
        amountOfToken: "0",
        tokenSymbol: "XRP",
        tokenAddress: "",
      });
      return;
    }

    // Fallback: XRPL URI (simple parser)
    if (data.startsWith("xrpl:") || data.startsWith("ripple:")) {
      // simplistic parsing logic could go here, but for now ignoring to avoid complexity
    }
  };

  const handleSimulateScan = () => {
    // Mock data based on mobile-app/utils/exampleQrCodeData.json
    // using valid testnet address for testing flow if needed, but keeping structure
    setScannedData({
      walletAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", // Example destination
      amountOfToken: "0.1",
      tokenSymbol: "XRP",
      tokenAddress: "", // Example issuer
    });
  };

  const isNativeXRP = useMemo(() => {
    if (!scannedData) return false;
    const { tokenSymbol, tokenAddress } = scannedData;
    return tokenSymbol === "XRPL" || tokenSymbol === "XRP" || !tokenSymbol || !tokenAddress;
  }, [scannedData]);

  const handlePayInternet = async () => {
    if (!scannedData) return;

    setProcessing(true);
    try {
      const currency = isNativeXRP ? "XRP" : scannedData.tokenSymbol;
      const issuer = isNativeXRP ? undefined : scannedData.tokenAddress;

      const hash = await submitPayment(scannedData.walletAddress, scannedData.amountOfToken, currency, issuer);

      navigation.navigate("PaymentSuccess", { hash });
      setScannedData(null); // Reset scan data after successful navigation
    } catch (error: any) {
      Alert.alert("Error", error.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaySMS = async () => {
    if (!scannedData) return;

    setProcessing(true);
    try {
      const currency = isNativeXRP ? "XRP" : scannedData.tokenSymbol;
      const issuer = isNativeXRP ? undefined : scannedData.tokenAddress;

      const signedBlob = await getSignedPayment(scannedData.walletAddress, scannedData.amountOfToken, currency, issuer);

      const smsUrl = `sms:${SMS_GATEWAY_NUMBER}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(signedBlob)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        // We can't track SMS success easily, so we just reset and go back
        Alert.alert("SMS Opened", "Please send the SMS to complete the transaction.", [
          {
            text: "Done",
            onPress: () => {
              setScannedData(null);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Cannot open SMS app");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to sign transaction: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetScan = () => {
    setScannedData(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan to Pay</Text>
        </View>

        {!scannedData ? (
          <View style={styles.scanContainer}>
            <View style={[styles.qrPlaceholder, { overflow: "hidden" }]}>
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={96} color={colors.primary} />
                  <Button title="Allow Camera" onPress={requestPermission} variant="outline" style={{ marginTop: spacing.md }} />
                </>
              )}
            </View>
            <Text style={styles.helper}>Point camera at a QR code to pay.</Text>
            <Button title="Simulate Scan" onPress={handleSimulateScan} style={styles.simulateButton} />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Paying to:</Text>
              <Text style={styles.value}>{scannedData.walletAddress}</Text>

              <View style={styles.divider} />

              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.amount}>
                {scannedData.amountOfToken} <Text style={styles.symbol}>{isNativeXRP ? "XRP" : scannedData.tokenSymbol}</Text>
              </Text>

              {!isNativeXRP && <Text style={styles.issuer}>Issuer: {scannedData.tokenAddress}</Text>}
            </View>

            <View style={styles.actions}>
              <Button
                title="Pay via Internet (XRPL)"
                onPress={handlePayInternet}
                disabled={processing || walletLoading}
                loading={processing}
                icon={<Ionicons name="globe-outline" size={20} color={colors.textWhite} />}
              />
              <Button
                title="Pay via SMS"
                variant="secondary"
                onPress={handlePaySMS}
                disabled={processing || walletLoading}
                icon={<Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textWhite} />}
              />
              <Button title="Cancel / Rescan" variant="outline" onPress={resetScan} disabled={processing} />
            </View>
          </View>
        )}
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
      flexGrow: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.sm,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    scanContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xl,
      minHeight: 400,
    },
    qrPlaceholder: {
      width: 240,
      height: 240,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderStyle: "dashed",
    },
    helper: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
    simulateButton: {
      marginTop: spacing.lg,
    },
    resultContainer: {
      gap: spacing.xl,
    },
    infoCard: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: borderRadius.xl,
      ...shadows.md,
      gap: spacing.sm,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    value: {
      ...typography.body,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    amount: {
      ...typography.h1,
      color: colors.primary,
    },
    symbol: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    issuer: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 10,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    actions: {
      gap: spacing.md,
    },
  });

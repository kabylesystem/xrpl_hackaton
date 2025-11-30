import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components";
import { typography, spacing, borderRadius, shadows } from "../theme";
import { useThemedColors } from "../context/ThemeContext";

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
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<{ address: string; amount?: string } | null>(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    let address = "";
    let amount = "";

    try {
      const parsed = JSON.parse(data);
      if (parsed.walletAddress) {
        address = parsed.walletAddress;
        amount = parsed.amountOfToken;
      }
    } catch (e) {
      // Not JSON
    }

    if (!address && data.startsWith("r")) {
      address = data;
    }

    if (address) {
      setScannedData({ address, amount });
      setScanned(true);
    }
  };

  const amount = scannedData?.amount || route.params?.amount || "0";
  const amountUSDC = route.params?.amountUSDC || "0.00";
  const destination = scannedData?.address || "rQrcodeMerchantAddress";
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
          <View style={[styles.qrPlaceholder, { overflow: "hidden" }]}>
            {!scanned && permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
            ) : (
              <>
                <Ionicons name={scanned ? "checkmark-circle" : "qr-code-outline"} size={96} color={colors.primary} />
                {!scanned && !permission?.granted && (
                  <Button
                    title="Allow Camera"
                    onPress={requestPermission}
                    variant="outline"
                    style={{ marginTop: 10, height: 40, paddingVertical: 0 }}
                  />
                )}
              </>
            )}
          </View>
          <Text style={styles.helper}>Point the camera at a merchant QR. We will read the destination address and amount.</Text>

          {scanned && (
            <View style={styles.meta}>
              <Text style={styles.amount}>{amount || "0"} NGN</Text>
              <Text style={styles.helper}>≈ {amountUSDC} USDC</Text>
              <Text style={styles.address} numberOfLines={1}>
                {destination}
              </Text>
              <Button title="Confirm payment" onPress={() => navigation.navigate("Home")} />
            </View>
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
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xxl,
      padding: spacing.lg,
      ...shadows.md,
      gap: spacing.md,
      alignItems: "center",
    },
    qrPlaceholder: {
      width: 240,
      height: 240,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    helper: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
    meta: {
      width: "100%",
      alignItems: "center",
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

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components';
import { typography, spacing, borderRadius, shadows } from '../theme';
import { useWallet } from '../context/WalletContext';
import { useThemedColors } from '../context/ThemeContext';
import { sendPayloadOverBle, BLE_SERVICE_UUID, scanForBlePeers, BlePeer } from '../utils/bluetooth';
import { useSettings } from '../context/SettingsContext';

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
  const [nfcPayload, setNfcPayload] = useState<Record<string, any> | null>(null);
  const [transferStatus, setTransferStatus] = useState<string>('Waiting to send via Bluetooth…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [peers, setPeers] = useState<BlePeer[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<BlePeer | null>(null);
  const { wallet } = useWallet();
  const { settings } = useSettings();
  const amount = route.params?.amount || '0';
  const amountUSDC = route.params?.amountUSDC || '0.00';
  const merchant = { name: settings.displayName || 'Merchant', address: 'xrpl-address' };
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (stage === 'scanning') {
      const timer = setTimeout(() => setStage('confirm'), 1200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const startScan = () => {
    setPeers([]);
    setIsScanning(true);
    const stop = scanForBlePeers(
      (peer) => setPeers((prev) => (prev.find((p) => p.id === peer.id) ? prev : [...prev, peer])),
      setTransferStatus
    );
    // Stop scan after 10s
    setTimeout(() => {
      stop();
      setIsScanning(false);
    }, 10000);
  };

  const content = () => {
    if (stage === 'scanning') {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Prepare Bluetooth transfer</Text>
          <Text style={styles.helper}>Choose a nearby device to send the payload.</Text>
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

          <Button
            title={selectedPeer ? `Device: ${selectedPeer.name}` : 'Select Bluetooth device'}
            onPress={() => {
              setDeviceModalVisible(true);
              startScan();
            }}
          />
          <Button
            title="Send via Bluetooth"
            onPress={async () => {
              const payload = {
                type: 'ble_payment_intent',
                amountNGN: amount || '0',
                amountUSDC,
                merchant,
                fromAddress: wallet?.address ?? 'unknown',
                createdAt: new Date().toISOString(),
              };
              setTransferStatus(
                selectedPeer
                  ? `Connecting to ${selectedPeer.name} (${selectedPeer.id})`
                  : 'Scanning for peer with service ' + BLE_SERVICE_UUID
              );
              setErrorMessage(null);
              try {
                await sendPayloadOverBle(payload, setTransferStatus, selectedPeer?.id);
                setNfcPayload(payload);
                setStage('success');
              } catch (err) {
                setErrorMessage((err as Error)?.message ?? 'Bluetooth transfer failed');
              }
            }}
          />
          <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      );
    }

    return (
      <View style={styles.centerContent}>
        <Ionicons name="checkmark-circle" size={96} color={colors.secondary} />
        <Text style={[styles.title, { color: colors.secondary }]}>Payload sent over Bluetooth</Text>
        <Text style={styles.helper}>
          {amount || '0'} NGN sent from {wallet?.address?.slice(0, 12) ?? 'wallet'}...
        </Text>
        <Text style={styles.helper}>{transferStatus}</Text>
        {errorMessage && <Text style={[styles.helper, { color: colors.error }]}>{errorMessage}</Text>}
        {nfcPayload && (
          <View style={styles.payloadCard}>
            <Text style={styles.payloadTitle}>Bluetooth payload (JSON)</Text>
            <Text style={styles.payloadText}>{JSON.stringify(nfcPayload, null, 2)}</Text>
          </View>
        )}
        <Button title="Back home" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.lg }} />
        {!nfcPayload && errorMessage?.toLowerCase().includes('not available') && (
          <Text style={[styles.helper, { color: colors.error, marginTop: spacing.sm }]}>
            BLE not available in Expo Go. Build a dev client or custom native app to enable this feature.
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Bluetooth</Text>
        </View>
        {content()}
      </ScrollView>

      <Modal visible={deviceModalVisible} transparent animationType="slide" onRequestClose={() => setDeviceModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a device</Text>
            <Text style={styles.helper}>{transferStatus}</Text>
            {isScanning && <ActivityIndicator style={{ marginVertical: spacing.sm }} color={colors.primary} />}
            <ScrollView style={{ maxHeight: 240, width: '100%' }}>
              {peers.map((peer) => (
                <TouchableOpacity
                  key={peer.id}
                  style={[
                    styles.deviceRow,
                    selectedPeer?.id === peer.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                  ]}
                  onPress={() => setSelectedPeer(peer)}
                >
                  <Text style={styles.deviceName}>{peer.name}</Text>
                  <Text style={styles.deviceId}>{peer.id}</Text>
                </TouchableOpacity>
              ))}
              {peers.length === 0 && !isScanning && (
                <Text style={[styles.helper, { marginTop: spacing.sm }]}>No devices found yet</Text>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Button title="Rescan" variant="outline" onPress={startScan} />
              <Button title="Close" onPress={() => setDeviceModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
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
      padding: spacing.lg,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
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
    payloadCard: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    payloadTitle: {
      ...typography.bodyBold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    payloadText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: 'Courier',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.md,
      gap: spacing.sm,
      alignItems: 'center',
    },
    modalTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    deviceRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    deviceName: {
      ...typography.bodyBold,
      color: colors.textPrimary,
    },
    deviceId: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });

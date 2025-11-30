import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Wallet, AccountDelete } from "xrpl";

import { useWallet } from "../context/WalletContext";
import { prepareAccountDelete, prepareAccountDeleteOffline, signTransaction } from "../utils/xrpl";
import { decrypt } from "../utils/encryption";
import { parseBlockchainParams, BlockchainParams } from "../utils/smsParser";
import { SMS_GATEWAY_NUMBER } from "../constants";

interface ClaimPaymentScreenProps {
  navigation: any;
}

export default function ClaimPaymentScreen({ navigation }: ClaimPaymentScreenProps) {
  const { client, wallet, isOfflineMode } = useWallet();
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [parsedData, setParsedData] = useState<{ encryptedSeed: string; signedTx: string; amount?: string; hint?: string } | null>(null);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");

  // Offline Flow
  const [offlineParams, setOfflineParams] = useState<BlockchainParams | null>(null);
  const [paramsInput, setParamsInput] = useState<string>("");
  const [showParamsSection, setShowParamsSection] = useState(false);

  const handleParseSMS = (text: string) => {
    try {
      // Expected format from SendPaymentScreen:
      // ...
      // Encrypted Key:
      // {encryptedSeed}
      //
      // Hint: {hint}
      //
      // Transaction Data:
      // {blob}

      const seedMatch = text.match(/Encrypted Key:\s*([A-Za-z0-9+/=:]+)/); // Base64 and colons
      const txMatch = text.match(/Transaction Data:\s*([A-Fa-f0-9]+)/);
      const amountMatch = text.match(/Here is ([0-9.]+) XRP/);
      const hintMatch = text.match(/Hint:\s*(.+)/);

      if (seedMatch && txMatch) {
        const data = {
          encryptedSeed: seedMatch[1].trim(),
          signedTx: txMatch[1].trim(),
          amount: amountMatch ? amountMatch[1] : undefined,
          hint: hintMatch ? hintMatch[1].trim() : undefined,
        };
        setParsedData(data);
        return true;
      }
      setParsedData(null);
      return false;
    } catch (e) {
      setParsedData(null);
      return false;
    }
  };

  const handleParamsCheck = (text: string) => {
    setParamsInput(text);
    const params = parseBlockchainParams(text);
    if (params) {
      setOfflineParams(params);
    } else {
      setOfflineParams(null);
    }
  };

  const handleRequestParams = async () => {
    if (!wallet) {
      Alert.alert("Error", "Please connect or import your main wallet first.");
      return;
    }
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync([SMS_GATEWAY_NUMBER], `PARAMS ${wallet.address}`);
    } else {
      Alert.alert("Error", "SMS is not available on this device");
    }
  };

  const initiateClaim = () => {
    if (!parsedData) return;

    // Check if we need offline params (Offline Mode ON OR No Connection)
    // If connected AND offline mode is OFF, we skip params and go online
    const requiresOfflineParams = isOfflineMode || !client;

    if (requiresOfflineParams && !offlineParams) {
      setShowParamsSection(true);
      Alert.alert("Offline Mode", "Please request and enter network parameters to claim this offline.");
      return;
    }

    setPassword("");
    setPasswordModalVisible(true);
  };

  const handleDecryptAndClaim = async () => {
    if (!parsedData || !wallet) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter the password");
      return;
    }

    const requiresOfflineParams = isOfflineMode || !client;

    if (requiresOfflineParams && !offlineParams) {
      setPasswordModalVisible(false);
      Alert.alert("Error", "Missing network parameters. Please request them via SMS.");
      return;
    }

    setLoading(true);
    try {
      // 1. Decrypt the seed
      let decryptedSeed = "";
      try {
        // decryptedSeed = decrypt(parsedData.encryptedSeed, password);
        decryptedSeed = parsedData.encryptedSeed; // NOT USING DECRYPTION
        if (!decryptedSeed || !decryptedSeed.startsWith("s")) {
          throw new Error("Invalid password or corrupted key");
        }
      } catch (e) {
        setLoading(false);
        Alert.alert("Error", "Incorrect password. Please try again.");
        return;
      }

      setPasswordModalVisible(false);

      // 2. Reconstruct temp wallet from seed
      const tempWallet = Wallet.fromSeed(decryptedSeed);

      // 3. Prepare AccountDelete transaction from temp wallet to user wallet
      let signedDeleteTx;
      try {
        if (requiresOfflineParams && offlineParams) {
          // Always use offline construction with provided params
          // We use Sequence: 1 for the new temp wallet as it's the first transaction
          const deleteTxJson = prepareAccountDeleteOffline(
            tempWallet,
            wallet.address,
            1, // Sequence 1
            offlineParams.ledgerIndex,
            offlineParams.fee
          );

          const signed = signTransaction(tempWallet, deleteTxJson);
          signedDeleteTx = signed.tx_blob;
        } else if (client) {
          // Online fallback if available and not forced offline
          // We cannot use prepareAccountDelete with autofill because the tempWallet account
          // does not exist on the ledger yet (it will be created by the first transaction).
          // So we manually fetch params and construct the transaction with Sequence 1.

          const ledgerIndex = await client.getLedgerIndex();

          // Get current fee
          const feeResponse = await client.request({ command: "fee" });
          const fee = feeResponse.result.drops.base_fee;

          const deleteTxJson = prepareAccountDeleteOffline(
            tempWallet,
            wallet.address,
            1, // Sequence 1 (first tx for new account)
            ledgerIndex,
            fee
          );

          const signed = signTransaction(tempWallet, deleteTxJson);
          signedDeleteTx = signed.tx_blob;
        } else {
          throw new Error("No connection and no params");
        }
      } catch (err) {
        console.error("Failed to sign delete tx", err);
        throw new Error("Failed to sign transaction");
      }

      // 4. Send SMS to gateway
      const gatewayMessage = `${parsedData.signedTx}|${signedDeleteTx}`;

      const smsUrl = `sms:${SMS_GATEWAY_NUMBER}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(gatewayMessage)}`;

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        Alert.alert("SMS Opened", "Please send the SMS to complete the claim.", [
          {
            text: "Done",
            onPress: () => navigation.navigate("Home"),
          },
        ]);
      } else {
        Alert.alert("Error", "Cannot open SMS app");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to process claim: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onPasteCheck = () => {
    if (handleParseSMS(manualInput)) {
      Alert.alert("Success", "Valid secured payment found! Proceed to claim.");
    } else {
      Alert.alert("Error", "Could not find valid payment data. Please copy the full SMS content.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#23292E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>Copy the full SMS text you received and paste it below to claim your payment.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Paste SMS content here..."
            value={manualInput}
            onChangeText={(text) => {
              setManualInput(text);
              handleParseSMS(text);
            }}
            textAlignVertical="top"
          />
        </View>

        {parsedData ? (
          <View style={styles.successCard}>
            <Ionicons name="lock-closed" size={40} color="#27ae60" />
            <Text style={styles.successText}>Secured Payment Found</Text>
            <Text style={styles.subText}>{parsedData.amount ? `${parsedData.amount} XRP` : "Valid Transaction Data"}</Text>
            {parsedData.hint && <Text style={styles.hintText}>Hint: {parsedData.hint}</Text>}
          </View>
        ) : (
          <TouchableOpacity style={styles.pasteButton} onPress={onPasteCheck}>
            <Text style={styles.pasteButtonText}>Check Content</Text>
          </TouchableOpacity>
        )}

        {showParamsSection && (
          <View style={styles.paramsContainer}>
            <Text style={styles.paramsTitle}>Offline Claim Requirements</Text>
            <Text style={styles.instruction}>To claim this offline, we need current network parameters.</Text>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestParams}>
              <Text style={styles.secondaryButtonText}>1. Request Params (SMS)</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="2. Paste SMS Reply (SEQ:...)"
              value={paramsInput}
              onChangeText={handleParamsCheck}
              multiline
            />

            {offlineParams && (
              <View style={styles.validParams}>
                <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                <Text style={styles.validParamsText}>Params Valid</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.claimButton, (!parsedData || (showParamsSection && !offlineParams)) && styles.disabledButton]}
          onPress={initiateClaim}
          disabled={!parsedData || (showParamsSection && !offlineParams)}
        >
          <Text style={styles.claimButtonText}>{showParamsSection ? "Unlock & Claim" : "Continue to Claim"}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={passwordModalVisible} transparent={true} animationType="fade" onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Password</Text>
            <Text style={styles.modalSubtitle}>This payment is encrypted.</Text>
            {parsedData?.hint && <Text style={styles.modalHint}>Hint: {parsedData.hint}</Text>}

            <TextInput style={styles.modalInput} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} autoFocus />

            {loading ? (
              <ActivityIndicator size="large" color="#27ae60" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setPasswordModalVisible(false)}>
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleDecryptAndClaim}>
                  <Text style={styles.modalButtonTextConfirm}>Claim</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#23292E",
  },
  content: {
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    height: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  pasteButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  pasteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successCard: {
    backgroundColor: "#e8f8f5",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginTop: 10,
  },
  subText: {
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  hintText: {
    marginTop: 10,
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  claimButton: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
  claimButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#23292E",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#666",
    marginBottom: 8,
  },
  modalHint: {
    color: "#27ae60",
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#27ae60",
    alignItems: "center",
  },
  modalButtonTextCancel: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonTextConfirm: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  paramsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paramsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#23292E",
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  validParams: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#e8f8f5",
    borderRadius: 8,
  },
  validParamsText: {
    marginLeft: 8,
    color: "#27ae60",
    fontWeight: "bold",
  },
});

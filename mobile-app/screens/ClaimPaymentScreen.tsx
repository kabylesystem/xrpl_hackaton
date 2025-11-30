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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { Wallet, AccountDelete } from "xrpl";

import { useWallet } from "../context/WalletContext";
import { prepareAccountDelete, signTransaction } from "../utils/xrpl";

interface ClaimPaymentScreenProps {
  navigation: any;
}

const SMS_GATEWAY_NUMBER = "123456"; // Mock gateway number

export default function ClaimPaymentScreen({ navigation }: ClaimPaymentScreenProps) {
  const { client, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [parsedData, setParsedData] = useState<{ seed: string; signedTx: string; amount?: string } | null>(null);

  const handleParseSMS = (text: string) => {
    try {
      // Expected format from SendPaymentScreen:
      // ...
      // Private Key:
      // {seed}
      //
      // Transaction Data:
      // {blob}

      const seedMatch = text.match(/Private Key:\s*([s][a-zA-Z0-9]+)/);
      const txMatch = text.match(/Transaction Data:\s*([A-Fa-f0-9]+)/);
      const amountMatch = text.match(/Here is ([0-9.]+) XRP/);

      if (seedMatch && txMatch) {
        const data = {
          seed: seedMatch[1].trim(),
          signedTx: txMatch[1].trim(),
          amount: amountMatch ? amountMatch[1] : undefined,
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

  const handleProcessClaim = async () => {
    if (!parsedData || !wallet || !client) {
      Alert.alert("Error", "Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      // 1. Reconstruct temp wallet from seed
      const tempWallet = Wallet.fromSeed(parsedData.seed);

      // 2. Prepare AccountDelete transaction from temp wallet to user wallet
      let signedDeleteTx;
      try {
        const preparedDelete = await prepareAccountDelete(client, tempWallet, wallet.address);
        const signed = signTransaction(tempWallet, preparedDelete);
        signedDeleteTx = signed.tx_blob;
      } catch (err) {
        console.log("Autofill failed, attempting manual construction assuming Sequence 1");

        const ledger = await client.request({ command: "ledger", ledger_index: "validated" });
        const fee = await client.request({ command: "fee" });

        const deleteTxJson: AccountDelete = {
          TransactionType: "AccountDelete",
          Account: tempWallet.address,
          Destination: wallet.address,
          Sequence: 1, // First transaction for this account
          Fee: fee.result.drops.base_fee,
          LastLedgerSequence: ledger.result.ledger_index + 200,
        };

        const signed = tempWallet.sign(deleteTxJson);
        signedDeleteTx = signed.tx_blob;
      }

      // 3. Send SMS to gateway
      const gatewayMessage = `${parsedData.signedTx}|${signedDeleteTx}`;

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync([SMS_GATEWAY_NUMBER], gatewayMessage);
        if (result === "sent" || result === "unknown") {
          Alert.alert("Success", "Claim request sent to gateway!", [{ text: "OK", onPress: () => navigation.navigate("Home") }]);
        }
      } else {
        Alert.alert("Error", "SMS is not available on this device");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to process claim: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onPasteCheck = () => {
    if (handleParseSMS(manualInput)) {
      Alert.alert("Success", "Valid payment data found! You can now claim it.");
    } else {
      Alert.alert("Error", "Could not find valid payment data in text. Please copy the full SMS content.");
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
            <Ionicons name="checkmark-circle" size={40} color="#27ae60" />
            <Text style={styles.successText}>Payment Found</Text>
            <Text style={styles.subText}>{parsedData.amount ? `${parsedData.amount} XRP` : "Valid Transaction Data"}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.pasteButton} onPress={onPasteCheck}>
            <Text style={styles.pasteButtonText}>Check Content</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#27ae60" />
        ) : (
          <TouchableOpacity style={[styles.claimButton, !parsedData && styles.disabledButton]} onPress={handleProcessClaim} disabled={!parsedData}>
            <Text style={styles.claimButtonText}>Send Claim SMS</Text>
          </TouchableOpacity>
        )}
      </View>
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
});

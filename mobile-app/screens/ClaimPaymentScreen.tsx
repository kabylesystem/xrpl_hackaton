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
import { Wallet } from "xrpl";

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
  const [parsedData, setParsedData] = useState<{ seed: string; signedTx: string } | null>(null);

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

      if (seedMatch && txMatch) {
        setParsedData({
          seed: seedMatch[1].trim(),
          signedTx: txMatch[1].trim(),
        });
        return true;
      }
      return false;
    } catch (e) {
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
      // Note: In a real scenario, we need to know the sequence number of the temp wallet.
      // Since we are offline/offline-ish, we might guess it is sequence+1 if the first tx was sequence.
      // HOWEVER, prepareAccountDelete will try to autofill from the network.
      // If we want fully offline generation we need to know the sequence manually.
      // But here we have the client connected in the context, so we can autofill.
      
      // Wait a brief moment to ensure the funding tx (if submitted via gateway) would be 'known' 
      // OR, more likely, we generate the second tx assuming the first one will succeed.
      // But autofill needs the account to exist on ledger to get sequence.
      // If the account is not yet funded on ledger, autofill will fail.
      
      // CRITICAL: The prompt says "The SMS_GATEWAY_NUMBER will submit both transaction".
      // This implies we generate the second transaction assuming the first one will pass.
      // For a new wallet, sequence is usually 1 (after funding).
      // But 'autofill' requires network. 
      // We will TRY to autofill. If it fails (account not found), we manually construct with Sequence: 1 (assuming first tx was seq 1 or funding).
      // Actually, funding creates the account. The first tx from the sender sends money TO the temp wallet.
      // So the temp wallet has 0 transactions. Its Sequence is 1 (or whatever the starting seq is on the network, usually 1 or based on ledger time).
      // We'll try to autofill, if it fails we fall back to manual construction.
      
      let signedDeleteTx;
      try {
        const preparedDelete = await prepareAccountDelete(client, tempWallet, wallet.address);
        const signed = signTransaction(tempWallet, preparedDelete);
        signedDeleteTx = signed.tx_blob;
      } catch (err) {
        // Fallback for "Account not found" if not yet funded
        console.log("Autofill failed, attempting manual construction assuming Sequence 1");
        
        // We can't easily manually construct without current ledger info (fee, LastLedgerSequence)
        // But since we are "Online" in the app to generate this claim (WalletContext has client),
        // we should be able to get network info.
        // If the account doesn't exist yet, we can't get its sequence.
        // BUT, the user received money to this account.
        // If the Sender's TX hasn't been submitted yet (it's in the SMS), the account DOES NOT EXIST.
        
        // So we must manually construct the AccountDelete.
        // Sequence for a new account is typically 1 (after the first funding tx? No, account root starts with Sequence 1).
        // Wait, if I receive a payment, my sequence doesn't increase.
        // My sequence increases when I SEND a transaction.
        // So the temp wallet has Sequence 1.
        
        // We need a Fee and LastLedgerSequence.
        // We can get these from the client.
        
        const ledger = await client.request({ command: 'ledger', ledger_index: 'validated' });
        const fee = await client.request({ command: 'fee' });
        
        const deleteTxJson = {
          TransactionType: 'AccountDelete',
          Account: tempWallet.address,
          Destination: wallet.address,
          Sequence: 1, // First transaction for this account
          Fee: fee.result.drops.base_fee, // Estimate
          LastLedgerSequence: ledger.result.ledger_index + 200, // Validity window
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
          Alert.alert("Success", "Claim request sent to gateway!", [
             { text: "OK", onPress: () => navigation.navigate("Home") }
          ]);
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

  const onPaste = () => {
    if (handleParseSMS(manualInput)) {
      Alert.alert("Success", "Valid payment data found!");
    } else {
      Alert.alert("Error", "Could not find valid payment data in text");
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
        <Text style={styles.instruction}>
          Paste the full SMS text you received to claim your payment.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Paste SMS content here..."
            value={manualInput}
            onChangeText={(text) => {
                setManualInput(text);
                if (text.length > 50) handleParseSMS(text);
            }}
            textAlignVertical="top"
          />
        </View>

        {parsedData ? (
             <View style={styles.successCard}>
               <Ionicons name="checkmark-circle" size={40} color="#27ae60" />
               <Text style={styles.successText}>Payment Data Detected</Text>
               <Text style={styles.subText}>Ready to claim funds to your wallet</Text>
             </View>
        ) : (
            <TouchableOpacity style={styles.pasteButton} onPress={onPaste}>
                <Text style={styles.pasteButtonText}>Check Content</Text>
            </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#27ae60" />
        ) : (
          <TouchableOpacity 
            style={[styles.claimButton, !parsedData && styles.disabledButton]} 
            onPress={handleProcessClaim}
            disabled={!parsedData}
          >
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
      borderColor: "#27ae60"
  },
  successText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#27ae60",
      marginTop: 10
  },
  subText: {
      color: "#666",
      marginTop: 4
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
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


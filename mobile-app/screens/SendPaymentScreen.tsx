import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Wallet } from "xrpl";
import * as SMS from "expo-sms";

import { useWallet } from "../context/WalletContext";
import { encrypt } from "../utils/encryption";
import { parseBlockchainParams, BlockchainParams } from "../utils/smsParser";
import { SMS_GATEWAY_NUMBER } from "../constants";

interface SendPaymentScreenProps {
  navigation: any;
}

type Step = "amount" | "security" | "params" | "confirm";

export default function SendPaymentScreen({ navigation }: SendPaymentScreenProps) {
  const { getSignedPayment, getSignedPaymentOffline, connected, wallet } = useWallet();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [offlineParams, setOfflineParams] = useState<BlockchainParams | null>(null);
  const [paramsInput, setParamsInput] = useState<string>("");

  const handleNextToSecurity = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setStep("security");
  };

  const handleNextToConfirm = () => {
    if (!password || password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters");
      return;
    }
    if (!hint) {
      Alert.alert("Error", "Please provide a hint for the recipient");
      return;
    }

    // Always use offline flow (params step) regardless of connection status
    setStep("params");
  };

  const handleRequestParams = async () => {
    if (!wallet) return;
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      // Send "PARAMS <address>" to gateway
      await SMS.sendSMSAsync([SMS_GATEWAY_NUMBER], `PARAMS ${wallet.address}`);
    } else {
      Alert.alert("Error", "SMS not available");
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

  const handleShare = async () => {
    setLoading(true);
    try {
      // 1. Generate a temporary wallet for the contact
      const tempWallet = Wallet.generate();

      // 2. Encrypt the private key (seed) with the user's password
      const encryptedSeed = encrypt(tempWallet.seed!, password);

      // 3. Generate the signed tx to send the money but not submiting it yet
      // We are sending TO the temp wallet address
      let signedTxBlob;
      if (offlineParams) {
        signedTxBlob = await getSignedPaymentOffline(
          tempWallet.address,
          amount,
          offlineParams.sequence,
          offlineParams.ledgerIndex,
          offlineParams.fee
        );
      } else {
        signedTxBlob = await getSignedPayment(tempWallet.address, amount);
      }

      // 4. Send the encrypted key along with the signed tx to the contact
      const message = `Here is ${amount} XRP.
      
To claim it:
1. Download the XRPL Hackathon App
2. Go to "Receive" > "Claim SMS Payment"
3. Enter these details:

Encrypted Key:
${encryptedSeed}

Hint: ${hint}

Transaction Data:
${signedTxBlob}`;

      const result = await Share.share({
        message: message,
        title: `Send ${amount} XRP`,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert("Success", "Payment info shared!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>How much to send?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (XRP)</Text>
        <TextInput style={styles.input} placeholder="10.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" autoFocus />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNextToSecurity}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSecurityStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Secure Payment</Text>
      <Text style={styles.subtitle}>Set a password to encrypt the private key. Share the hint so the recipient can guess it.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Secret Password" value={password} onChangeText={setPassword} secureTextEntry autoFocus />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hint for Recipient</Text>
        <TextInput style={styles.input} placeholder="e.g. Your first pet's name" value={hint} onChangeText={setHint} />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNextToConfirm}>
        <Text style={styles.primaryButtonText}>Review</Text>
      </TouchableOpacity>
    </View>
  );

  const renderParamsStep = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.title}>Offline Mode</Text>
      <Text style={styles.subtitle}>We need the latest blockchain sequence and ledger index to sign the transaction.</Text>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestParams}>
        <Text style={styles.secondaryButtonText}>1. Request Params (SMS)</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>2. Paste Reply SMS</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Paste SMS here (e.g. SEQ: 123...)"
          value={paramsInput}
          onChangeText={handleParamsCheck}
          multiline
        />
      </View>

      {offlineParams && (
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={32} color="#27ae60" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.successText}>Valid Parameters Found</Text>
            <Text style={styles.subText}>
              Seq: {offlineParams.sequence} • Ledger: {offlineParams.ledgerIndex}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, !offlineParams && styles.disabledButton]}
        onPress={() => setStep("confirm")}
        disabled={!offlineParams}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Confirm Payment</Text>

      <View style={styles.confirmCard}>
        <Text style={styles.confirmLabel}>Amount to Send:</Text>
        <Text style={styles.confirmAmount}>{amount} XRP</Text>

        <View style={styles.divider} />

        <Text style={styles.confirmLabel}>Security:</Text>
        <Text style={styles.confirmValue}>Password Protected</Text>
        <Text style={styles.confirmSubValue}>Hint: "{hint}"</Text>

        <View style={styles.divider} />

        <Text style={styles.confirmLabel}>Mode:</Text>
        <Text style={styles.confirmValue}>{offlineParams ? "Offline (SMS)" : "Online (XRPL)"}</Text>

        <View style={styles.divider} />

        <Text style={styles.confirmLabel}>Note:</Text>
        <Text style={styles.messagePreview}>
          This will generate a temporary wallet with an encrypted key. The recipient will need the password to claim the funds.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
          <Text style={styles.primaryButtonText}>Generate & Share</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === "confirm") {
              // Always go back to params since we always force offline flow
              setStep("params");
            } else if (step === "params") setStep("security");
            else if (step === "security") setStep("amount");
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#23292E" />
        </TouchableOpacity>
      </View>

      {step === "amount" && renderAmountStep()}
      {step === "security" && renderSecurityStep()}
      {step === "params" && renderParamsStep()}
      {step === "confirm" && renderConfirmStep()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#23292E",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  confirmCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  confirmLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 10,
  },
  confirmValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#23292E",
  },
  confirmSubValue: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 16,
  },
  messagePreview: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    lineHeight: 20,
  },
  secondaryButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f8f5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27ae60",
    marginVertical: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27ae60",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
});

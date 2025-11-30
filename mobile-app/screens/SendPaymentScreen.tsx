import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Share, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Wallet } from "xrpl";

import { useWallet } from "../context/WalletContext";

interface SendPaymentScreenProps {
  navigation: any;
}

type Step = "amount" | "confirm";

export default function SendPaymentScreen({ navigation }: SendPaymentScreenProps) {
  const { getSignedPayment } = useWallet();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleNextToConfirm = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setStep("confirm");
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      // 1. Generate a temporary wallet for the contact
      const tempWallet = Wallet.generate();

      // 2. Generate the signed tx to send the money but not submiting it yet
      // We are sending TO the temp wallet address
      const signedTxBlob = await getSignedPayment(tempWallet.address, amount);

      // 3. Send the private key along with the signed tx to the contact
      const message = `Here is ${amount} XRP.
      
To claim it:
1. Download the XRPL Hackathon App
2. Go to "Receive" > "Claim SMS Payment"
3. Enter these details:

Private Key:
${tempWallet.seed}

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

      <TouchableOpacity style={styles.primaryButton} onPress={handleNextToConfirm}>
        <Text style={styles.primaryButtonText}>Review</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Confirm Payment</Text>

      <View style={styles.confirmCard}>
        <Text style={styles.confirmLabel}>Amount to Send:</Text>
        <Text style={styles.confirmAmount}>{amount} XRP</Text>

        <View style={styles.divider} />

        <Text style={styles.confirmLabel}>Note:</Text>
        <Text style={styles.messagePreview}>
          This will generate a temporary wallet and a signed transaction. Share the generated key and data with the recipient to let them claim the
          funds.
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
            if (step === "confirm") setStep("amount");
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#23292E" />
        </TouchableOpacity>
      </View>

      {step === "amount" && renderAmountStep()}
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
    marginBottom: 30,
    textAlign: "center",
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
    fontSize: 24,
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
});

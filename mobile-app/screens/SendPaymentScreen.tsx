import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";

import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import { Ionicons } from "@expo/vector-icons";

import { useWallet } from "../context/WalletContext";

interface SendPaymentScreenProps {
  navigation: any;
}

type Step = "amount" | "contacts" | "confirm";

export default function SendPaymentScreen({ navigation }: SendPaymentScreenProps) {
  const { wallet } = useWallet();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contacts.Contact | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
      }
    })();
  }, []);

  const handleFetchContacts = async () => {
    if (!permissionGranted) {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need access to your contacts to send payments.");
        return;
      }
      setPermissionGranted(true);
    }

    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        // Filter contacts with phone numbers
        const contactsWithPhones = data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0);
        setContacts(contactsWithPhones);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleNextToContacts = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setStep("contacts");
    handleFetchContacts();
  };

  const handleSelectContact = (contact: Contacts.Contact) => {
    setSelectedContact(contact);
    setStep("confirm");
  };

  const handleSendSMS = async () => {
    if (!selectedContact || !selectedContact.phoneNumbers || selectedContact.phoneNumbers.length === 0) {
      Alert.alert("Error", "Selected contact has no phone number");
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const phoneNumber = selectedContact.phoneNumbers[0].number;
      // Constructing the message
      const message = `Here is ${amount} XRP. Redeem it at: https://xrpl-hackathon.com/redeem?amount=${amount}`; // Placeholder link

      const { result } = await SMS.sendSMSAsync([phoneNumber!], message);

      if (result === "sent" || result === "unknown") {
        Alert.alert("Success", "SMS sent!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } else {
      Alert.alert("Error", "SMS is not available on this device");
    }
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>How much to send?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (XRP)</Text>
        <TextInput style={styles.input} placeholder="10.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" autoFocus />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleNextToContacts}>
        <Text style={styles.primaryButtonText}>Select Contact</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContactsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Select a Contact</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item, index) => (item as any).id || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.contactItem} onPress={() => handleSelectContact(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : "?"}</Text>
              </View>
              <View>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.phoneNumbers && item.phoneNumbers.length > 0 && <Text style={styles.contactPhone}>{item.phoneNumbers[0].number}</Text>}
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Confirm Payment</Text>

      <View style={styles.confirmCard}>
        <Text style={styles.confirmLabel}>To:</Text>
        <Text style={styles.confirmValue}>{selectedContact?.name}</Text>
        <Text style={styles.confirmSubValue}>{selectedContact?.phoneNumbers?.[0]?.number}</Text>

        <View style={styles.divider} />

        <Text style={styles.confirmLabel}>Amount:</Text>
        <Text style={styles.confirmAmount}>{amount} XRP</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSendSMS}>
        <Text style={styles.primaryButtonText}>Send SMS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === "contacts") setStep("amount");
            else if (step === "confirm") setStep("contacts");
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#23292E" />
        </TouchableOpacity>
      </View>

      {step === "amount" && renderAmountStep()}
      {step === "contacts" && renderContactsStep()}
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
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#23292E",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
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
  confirmValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#23292E",
  },
  confirmSubValue: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#27ae60",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 16,
  },
});

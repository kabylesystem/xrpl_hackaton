import React, { useState } from 'react';
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
} from 'react-native';
import { sendPayment, getBalance } from '../utils/xrpl';

export default function SendPaymentScreen({ route, navigation }) {
  const { wallet, client } = route.params;
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendPayment = async () => {
    if (!destination || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPayment(client, wallet, destination, amount);

      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        Alert.alert(
          'Success!',
          `Payment of ${amount} XRP sent successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setDestination('');
                setAmount('');
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Transaction failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send payment');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Send Payment</Text>

        <View style={styles.fromCard}>
          <Text style={styles.fromLabel}>From:</Text>
          <Text style={styles.fromAddress} numberOfLines={1}>
            {wallet.address}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination Address</Text>
          <TextInput
            style={styles.input}
            placeholder="rN7n7otQDd6FczFgLdlqtyMVrn3yQBXaL..."
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (XRP)</Text>
          <TextInput
            style={styles.input}
            placeholder="10.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.disabledButton]}
          onPress={handleSendPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send Payment</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#23292E',
    marginBottom: 30,
    marginTop: 20,
    textAlign: 'center',
  },
  fromCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  fromLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  fromAddress: {
    fontSize: 14,
    color: '#23292E',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: '600',
  },
});

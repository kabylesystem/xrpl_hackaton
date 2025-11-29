import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import { Client, Wallet } from "xrpl";
import {
  connectToXRPL,
  createWallet,
  getBalance,
  disconnectFromXRPL,
} from "../utils/xrpl";
import { useSettings } from "../context/SettingsContext";

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  // Get settings from context
  const { getMaxBalance } = useSettings();

  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (client) {
        disconnectFromXRPL(client);
      }
    };
  }, [client]);

  // Animate progress bar when balance changes
  useEffect(() => {
    const balanceNum = Number.parseFloat(balance) || 0;
    const maxBalance = getMaxBalance(balanceNum);
    const progress = Math.min(balanceNum / maxBalance, 1);

    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [balance, getMaxBalance]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const xrplClient = await connectToXRPL();
      setClient(xrplClient);
      setConnected(true);
      Alert.alert("Success", "Connected to XRPL Testnet");
    } catch (error) {
      Alert.alert("Error", "Failed to connect to XRPL");
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreateWallet = async () => {
    if (!client) {
      Alert.alert("Error", "Please connect to XRPL first");
      return;
    }

    setLoading(true);
    try {
      const newWallet = await createWallet(client);
      setWallet(newWallet);

      // Wait a bit for funding to complete
      setTimeout(async () => {
        const bal = await getBalance(client, newWallet.address);
        setBalance(bal);
        Alert.alert(
          "Wallet Created!",
          `Address: ${newWallet.address.substring(0, 20)}...`
        );
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Failed to create wallet");
      console.error(error);
    }
    setLoading(false);
  };

  const handleRefreshBalance = async () => {
    if (!wallet || !client) return;

    setLoading(true);
    try {
      const bal = await getBalance(client, wallet.address);
      setBalance(bal);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh balance");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>XRPL Wallet</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusText, connected && styles.connected]}>
          {connected ? "Connected to Testnet" : "Disconnected"}
        </Text>
      </View>

      {!connected ? (
        <TouchableOpacity
          style={styles.button}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connect to XRPL</Text>
          )}
        </TouchableOpacity>
      ) : (
        <>
          {!wallet ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateWallet}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create New Wallet</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.walletContainer}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceAmount}>{balance} XRP</Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Number.parseFloat(balance) > 0
                      ? `${(
                          (Number.parseFloat(balance) /
                            getMaxBalance(Number.parseFloat(balance))) *
                          100
                        ).toFixed(1)}% of ${getMaxBalance(
                          Number.parseFloat(balance)
                        )} XRP goal`
                      : "Start your journey!"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{wallet.address}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Public Key:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {wallet.publicKey}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshBalance}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#23292E" />
                ) : (
                  <Text style={styles.refreshButtonText}>Refresh Balance</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() =>
                  navigation.navigate("SendPayment", { wallet, client })
                }
              >
                <Text style={styles.buttonText}>Send Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
              >
                <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#23292E",
    marginBottom: 30,
    marginTop: 20,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  statusLabel: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "600",
  },
  connected: {
    color: "#27ae60",
  },
  button: {
    backgroundColor: "#23292E",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  walletContainer: {
    width: "100%",
  },
  balanceCard: {
    backgroundColor: "#23292E",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#23292E",
    fontWeight: "500",
  },
  refreshButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#23292E",
  },
  refreshButtonText: {
    color: "#23292E",
    fontSize: 18,
    fontWeight: "600",
  },
  sendButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  progressContainer: {
    width: "100%",
    marginTop: 20,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#27ae60",
    borderRadius: 4,
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  settingsButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#9b59b6",
  },
  settingsButtonText: {
    color: "#9b59b6",
    fontSize: 18,
    fontWeight: "600",
  },
});

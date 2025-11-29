import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Wallet } from 'xrpl';
import {
  connectToXRPL,
  createWallet as createXRPLWallet,
  disconnectFromXRPL,
  getBalance,
  sendPayment,
} from '../utils/xrpl';

interface WalletContextValue {
  client: Client | null;
  wallet: Wallet | null;
  connected: boolean;
  balance: string;
  rate: number;
  statusMessage: string | null;
  loading: boolean;
  connect: () => Promise<void>;
  setupWallet: () => Promise<void>;
  refreshBalance: (targetWallet?: Wallet) => Promise<void>;
  submitPayment: (destination: string, amount: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);
const WALLET_STORAGE_KEY = '@xrpl_wallet_data';

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState('0');
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Temporary static oracle rate for NGN/USD conversion
  const [rate] = useState(1600);

  useEffect(() => {
    return () => {
      if (client) {
        disconnectFromXRPL(client);
      }
    };
  }, [client]);

  useEffect(() => {
    // Attempt to restore a previously saved wallet on mount
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { seed: string };
          if (parsed?.seed) {
            const restoredWallet = Wallet.fromSeed(parsed.seed);
            setWallet(restoredWallet);
            setStatusMessage('Restored wallet from device storage');
            await connect();
            await refreshBalance(restoredWallet);
          }
        }
      } catch (error) {
        console.error('Failed to restore wallet', error);
      }
    })();
  }, []);

  const connect = async () => {
    if (loading || connected) return;

    setLoading(true);
    try {
      const xrplClient = await connectToXRPL();
      setClient(xrplClient);
      setConnected(true);
      setStatusMessage('Connected to XRPL Testnet');
    } catch (error) {
      console.error('Failed to connect to XRPL', error);
      setStatusMessage('Failed to connect to XRPL');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setupWallet = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (!client || !connected) {
        await connect();
      }

      const created = await createXRPLWallet(client as Client);
      setWallet(created);
      await AsyncStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify({ seed: created.seed })
      );
      setStatusMessage('Wallet ready and funded');

      // Give faucet a moment to settle before reading balance
      setTimeout(async () => {
        await refreshBalance();
      }, 1500);
    } catch (error) {
      console.error('Failed to create wallet', error);
      setStatusMessage('Failed to create wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async (targetWallet?: Wallet) => {
    const selectedWallet = targetWallet ?? wallet;
    if (!client || !selectedWallet) return;

    try {
      const bal = await getBalance(client, selectedWallet.address);
      setBalance(bal);
      setStatusMessage(`Balance updated • ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Failed to refresh balance', error);
      setStatusMessage('Failed to refresh balance');
    }
  };

  const submitPayment = async (destination: string, amount: string) => {
    if (!client || !wallet) {
      throw new Error('Connect and create a wallet first');
    }

    setLoading(true);
    try {
      const result = await sendPayment(client, wallet, destination, amount);
      await refreshBalance();
      return result?.result?.hash ?? 'unknown-hash';
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      client,
      wallet,
      connected,
      balance,
      rate,
      statusMessage,
      loading,
      connect,
      setupWallet,
      refreshBalance,
      submitPayment,
    }),
    [client, wallet, connected, balance, rate, statusMessage, loading]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside WalletProvider');
  }
  return ctx;
};

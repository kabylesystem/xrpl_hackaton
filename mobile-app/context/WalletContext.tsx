import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Wallet } from 'xrpl';
import {
  connectToXRPL,
  createWallet as createXRPLWallet,
  disconnectFromXRPL,
  getBalance,
  sendPayment,
  preparePayment,
  preparePaymentOffline,
  signTransaction,
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
  submitPayment: (destination: string, amount: string, currency?: string, issuer?: string) => Promise<string>;
  getSignedPayment: (destination: string, amount: string, currency?: string, issuer?: string) => Promise<string>;
  getSignedPaymentOffline: (destination: string, amount: string, sequence: number, ledgerIndex: number, fee: string, currency?: string, issuer?: string) => Promise<string>;
  importWallet: (seed: string) => Promise<void>;
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
      setLoading(true);
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
      } finally {
        setLoading(false);
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

  const submitPayment = async (destination: string, amount: string, currency: string = 'XRP', issuer?: string) => {
    if (!client || !wallet) {
      throw new Error('Connect and create a wallet first');
    }

    setLoading(true);
    try {
      const result = await sendPayment(client, wallet, destination, amount, currency, issuer);
      await refreshBalance();
      return result?.result?.hash ?? 'unknown-hash';
    } finally {
      setLoading(false);
    }
  };

  const getSignedPayment = async (destination: string, amount: string, currency: string = 'XRP', issuer?: string) => {
    if (!client || !wallet) {
      throw new Error('Connect and create a wallet first');
    }

    setLoading(true);
    try {
      const prepared = await preparePayment(client, wallet, destination, amount, currency, issuer);
      const signed = signTransaction(wallet, prepared);
      return signed.tx_blob;
    } finally {
      setLoading(false);
    }
  };

  const getSignedPaymentOffline = async (
    destination: string,
    amount: string,
    sequence: number,
    ledgerIndex: number,
    fee: string,
    currency: string = 'XRP',
    issuer?: string
  ) => {
    if (!wallet) {
      throw new Error('Create or import a wallet first');
    }

    setLoading(true);
    try {
      const prepared = preparePaymentOffline(wallet, destination, amount, sequence, ledgerIndex, fee, currency, issuer);
      const signed = signTransaction(wallet, prepared);
      return signed.tx_blob;
    } finally {
      setLoading(false);
    }
  };

  const importWallet = async (seed: string) => {
    if (loading) return;

    setLoading(true);
    try {
      if (!client || !connected) {
        await connect();
      }

      const imported = Wallet.fromSeed(seed);
      setWallet(imported);
      await AsyncStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify({ seed: imported.seed })
      );
      setStatusMessage('Wallet imported successfully');

      await refreshBalance(imported);
    } catch (error) {
      console.error('Failed to import wallet', error);
      setStatusMessage('Failed to import wallet: Invalid seed');
      throw error;
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
      getSignedPayment,
      getSignedPaymentOffline,
      importWallet,
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

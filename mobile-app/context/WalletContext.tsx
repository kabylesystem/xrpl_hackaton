import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  refreshBalance: () => Promise<void>;
  submitPayment: (destination: string, amount: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

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

  const refreshBalance = async () => {
    if (!client || !wallet) return;

    try {
      const bal = await getBalance(client, wallet.address);
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

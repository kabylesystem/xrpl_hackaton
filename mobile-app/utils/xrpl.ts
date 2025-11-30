import { Client, Wallet, xrpToDrops, dropsToXrp, Payment, AccountDelete } from "xrpl";

const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";

export const connectToXRPL = async (): Promise<Client> => {
  const client = new Client(TESTNET_URL);
  await client.connect();
  return client;
};

export const createWallet = async (client: Client): Promise<Wallet> => {
  const wallet = Wallet.generate();

  // Fund wallet on testnet
  try {
    await client.fundWallet(wallet);
  } catch (error) {
    console.error("Error funding wallet:", error);
  }

  return wallet;
};

export const getBalance = async (client: Client, address: string): Promise<string> => {
  try {
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    return String(dropsToXrp(response.result.account_data.Balance));
  } catch (error) {
    console.error("Error getting balance:", error);
    return "0";
  }
};

export const sendPayment = async (
  client: Client,
  wallet: Wallet,
  destination: string,
  amount: string,
  currency: string = "XRP",
  issuer?: string
): Promise<any> => {
  let paymentAmount: any;

  if (currency === "XRP") {
    paymentAmount = xrpToDrops(amount);
  } else {
    paymentAmount = {
      currency,
      value: amount,
      issuer,
    };
  }

  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: paymentAmount,
  };

  try {
    const prepared = await client.autofill(payment);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    return result;
  } catch (error) {
    console.error("Error sending payment:", error);
    throw error;
  }
};

export const preparePayment = async (
  client: Client,
  wallet: Wallet,
  destination: string,
  amount: string,
  currency: string = "XRP",
  issuer?: string
): Promise<Payment> => {
  let paymentAmount: any;

  if (currency === "XRP") {
    paymentAmount = xrpToDrops(amount);
  } else {
    paymentAmount = {
      currency,
      value: amount,
      issuer,
    };
  }

  const payment: Payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: paymentAmount,
  };

  return await client.autofill(payment);
};

export const prepareAccountDelete = async (client: Client, wallet: Wallet, destination: string): Promise<AccountDelete> => {
  const transaction: AccountDelete = {
    TransactionType: "AccountDelete",
    Account: wallet.address,
    Destination: destination,
  };

  return await client.autofill(transaction);
};

export const signTransaction = (wallet: Wallet, transaction: any): { tx_blob: string; hash: string } => {
  return wallet.sign(transaction);
};

export const disconnectFromXRPL = async (client: Client | null): Promise<void> => {
  if (client && client.isConnected()) {
    await client.disconnect();
  }
};

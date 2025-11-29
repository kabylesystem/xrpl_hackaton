import { useState } from 'react';
import { TransactionSetup } from './components/TransactionSetup';
import { NFCScanning } from './components/NFCScanning';
import { PaymentConfirmation } from './components/PaymentConfirmation';

type FlowPhase = 'setup' | 'scanning' | 'confirmation';

interface MerchantData {
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
}

interface TransactionData {
  amount: string;
  merchantData: MerchantData | null;
  transactionId: string;
  timestamp: string;
  success: boolean;
}

export default function App() {
  const [phase, setPhase] = useState<FlowPhase>('setup');
  const [amount, setAmount] = useState<string>('');
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);

  const handleAmountConfirm = (confirmedAmount: string) => {
    setAmount(confirmedAmount);
    setPhase('scanning');
  };

  const handleNFCSuccess = (merchantData: MerchantData) => {
    // Simulate payment execution (Steps 3.0-3.2)
    const transaction: TransactionData = {
      amount,
      merchantData,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      success: Math.random() > 0.1, // 90% success rate for demo
    };
    
    setTransactionData(transaction);
    setPhase('confirmation');
  };

  const handleReset = () => {
    setPhase('setup');
    setAmount('');
    setTransactionData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {phase === 'setup' && (
          <TransactionSetup onConfirm={handleAmountConfirm} />
        )}
        
        {phase === 'scanning' && (
          <NFCScanning 
            amount={amount} 
            onSuccess={handleNFCSuccess}
            onCancel={handleReset}
          />
        )}
        
        {phase === 'confirmation' && transactionData && (
          <PaymentConfirmation 
            transaction={transactionData}
            onNewPayment={handleReset}
          />
        )}
      </div>
    </div>
  );
}

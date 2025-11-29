import { useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';

interface TransactionSetupProps {
  onConfirm: (amount: string) => void;
}

export function TransactionSetup({ onConfirm }: TransactionSetupProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setAmount(value);
      setError('');
    }
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > 10000) {
      setError('Amount exceeds maximum limit');
      return;
    }

    onConfirm(amount);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toFixed(2));
    setError('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-indigo-100 p-4 rounded-full">
          <CreditCard className="w-12 h-12 text-indigo-600" />
        </div>
      </div>

      <h1 className="text-center mb-2">NFC Payment</h1>
      <p className="text-center text-gray-500 mb-8">Enter the amount to pay</p>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Payment Amount</label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-3">Quick amounts:</p>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 20, 50].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => handleQuickAmount(quickAmount)}
              className="py-3 px-2 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
            >
              ${quickAmount}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!amount}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Tap to Pay
      </button>
    </div>
  );
}

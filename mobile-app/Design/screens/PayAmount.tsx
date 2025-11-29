import React, { useState } from 'react';
import { ArrowLeft, Smartphone, QrCode, MessageSquare } from 'lucide-react';
import { Keypad } from '../components/Keypad';
import { Button } from '../components/Button';

interface PayAmountProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export const PayAmount: React.FC<PayAmountProps> = ({ onNavigate, onBack }) => {
  const [amount, setAmount] = useState('');
  const exchangeRate = 1600;

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    setAmount(amount.slice(0, -1));
  };

  const amountNGN = parseFloat(amount) || 0;
  const amountUSDC = (amountNGN / exchangeRate).toFixed(2);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                     flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={20} className="text-[#1A1A1A] dark-mode:text-white" />
        </button>
        <h2 className="text-[#1A1A1A] dark-mode:text-white">Pay</h2>
      </div>

      {/* Amount Display */}
      <div className="flex-1 px-6 py-12">
        <div className="text-center mb-8">
          <small className="text-[#6B6B6B]">Amount in NGN</small>
          <div className="mt-4">
            <h1 className="text-[#1A1A1A] dark-mode:text-white text-5xl mb-2">
              {amount || '0'} <span className="text-3xl">NGN</span>
            </h1>
            <h2 className="text-[#2F80ED]">≈ {amountUSDC} USDC</h2>
          </div>
        </div>

        {/* Keypad */}
        <Keypad onNumberPress={handleNumberPress} onDelete={handleDelete} />
      </div>

      {/* Payment Methods */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={() => onNavigate('nfc')}
          disabled={amountNGN === 0}
          icon={<Smartphone size={20} />}
        >
          Pay via NFC
        </Button>
        
        <Button
          onClick={() => onNavigate('qr')}
          disabled={amountNGN === 0}
          variant="outline"
          icon={<QrCode size={20} />}
        >
          Pay via QR Scan
        </Button>

        <Button
          onClick={() => onNavigate('sms')}
          disabled={amountNGN === 0}
          variant="secondary"
          icon={<MessageSquare size={20} />}
        >
          Pay via SMS (offline)
        </Button>
      </div>
    </div>
  );
};

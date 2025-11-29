import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ScanLine } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';

interface QRPaymentProps {
  onBack: () => void;
  onComplete: () => void;
}

export const QRPayment: React.FC<QRPaymentProps> = ({ onBack, onComplete }) => {
  const [stage, setStage] = useState<'scanning' | 'confirmation' | 'success'>('scanning');
  const [merchantInfo] = useState({
    name: 'Grocery Store Lagos',
    address: 'rMxxx...4k2p',
    amountNGN: '3500',
    amountUSDC: '2.19'
  });

  useEffect(() => {
    if (stage === 'scanning') {
      const timer = setTimeout(() => {
        setStage('confirmation');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleConfirmPayment = () => {
    setStage('success');
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (stage === 'scanning') {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col">
        <div className="px-6 pt-12 pb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 
                       flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h2 className="text-white">Scan QR Code</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Camera preview simulation */}
          <div className="w-full max-w-sm aspect-square rounded-3xl bg-black/50 relative overflow-hidden">
            {/* Scanning overlay */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 border-2 border-white/30 rounded-3xl m-12" />
              
              {/* Scanning line */}
              <motion.div
                className="absolute left-12 right-12 h-0.5 bg-[#2F80ED]"
                animate={{
                  top: ['15%', '85%', '15%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Corner markers */}
              <div className="absolute top-12 left-12 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-12 right-12 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-12 left-12 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-12 right-12 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-white/90">
              Align the QR code within the frame
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'confirmation') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col">
        <div className="px-6 pt-12 pb-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                       flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-[#1A1A1A] dark-mode:text-white" />
          </button>
          <h2 className="text-[#1A1A1A] dark-mode:text-white">Confirm Payment</h2>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <small className="text-[#6B6B6B]">Merchant</small>
              <p className="text-[#1A1A1A] dark-mode:text-white mt-1">{merchantInfo.name}</p>
              <small className="text-[#6B6B6B]">{merchantInfo.address}</small>
            </div>

            <div className="border-t border-gray-200 dark-mode:border-gray-700 pt-6">
              <small className="text-[#6B6B6B]">Amount</small>
              <h1 className="text-[#1A1A1A] dark-mode:text-white mt-2">
                {merchantInfo.amountNGN} NGN
              </h1>
              <h2 className="text-[#2F80ED] mt-1">
                ≈ {merchantInfo.amountUSDC} USDC
              </h2>
            </div>

            <div className="bg-[#F8F9FB] dark-mode:bg-[#2A2A2A] rounded-2xl p-4">
              <div className="flex justify-between mb-2">
                <small className="text-[#6B6B6B]">Network Fee</small>
                <small className="text-[#1A1A1A] dark-mode:text-white">0.00001 XRP</small>
              </div>
              <div className="flex justify-between">
                <small className="text-[#6B6B6B]">Estimated Time</small>
                <small className="text-[#1A1A1A] dark-mode:text-white">~4 seconds</small>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-3">
          <Button onClick={handleConfirmPayment}>
            Confirm Payment
          </Button>
          <Button onClick={onBack} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <CheckCircle2 size={96} className="text-[#27AE60]" />
      </motion.div>

      <div className="text-center mt-8">
        <h1 className="text-[#27AE60] mb-2">Payment Successful!</h1>
        <p className="text-[#6B6B6B]">
          {merchantInfo.amountNGN} NGN sent to {merchantInfo.name}
        </p>
      </div>

      <div className="mt-12 w-full max-w-sm">
        <Button onClick={onComplete}>
          Done
        </Button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare, Copy } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'motion/react';

interface SMSPaymentProps {
  onBack: () => void;
  onComplete: () => void;
}

export const SMSPayment: React.FC<SMSPaymentProps> = ({ onBack, onComplete }) => {
  const [stage, setStage] = useState<'explainer' | 'waiting' | 'success'>('explainer');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stage === 'waiting') {
      const timer = setTimeout(() => {
        setStage('success');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const smsMessage = "PAY 1200 rMxxx...4k2p";

  const handleCopy = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stage === 'explainer') {
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
          <h2 className="text-[#1A1A1A] dark-mode:text-white">SMS Payment</h2>
        </div>

        <div className="flex-1 px-6 py-8 flex flex-col">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-[#27AE60]/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-[#27AE60]" />
            </div>
            
            <h2 className="text-[#1A1A1A] dark-mode:text-white text-center mb-3">
              No Internet needed
            </h2>
            <p className="text-[#6B6B6B] text-center">
              Send this message via SMS to complete your payment. Works even without data connection.
            </p>
          </div>

          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <small className="text-[#6B6B6B]">Send SMS to</small>
              <p className="text-[#1A1A1A] dark-mode:text-white mt-1 text-xl">+234 900 000 0000</p>
            </div>

            <div className="border-t border-gray-200 dark-mode:border-gray-700 pt-6">
              <small className="text-[#6B6B6B]">Message</small>
              <div className="mt-2 bg-[#F8F9FB] dark-mode:bg-[#2A2A2A] rounded-2xl p-4 relative">
                <p className="text-[#1A1A1A] dark-mode:text-white font-mono">
                  {smsMessage}
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 text-[#2F80ED] hover:text-[#2570D8]"
                >
                  <Copy size={20} />
                </button>
              </div>
              {copied && (
                <small className="text-[#27AE60] mt-2 block">Copied to clipboard!</small>
              )}
            </div>

            <div className="bg-[#2F80ED]/10 rounded-2xl p-4">
              <small className="text-[#2F80ED]">
                💡 This message contains: Amount (1200 NGN) and merchant address. 
                Your wallet will process it automatically.
              </small>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <Button onClick={() => setStage('waiting')} variant="secondary">
            I've sent the SMS
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'waiting') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col items-center justify-center px-6">
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#27AE60]/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#27AE60] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare size={32} className="text-[#27AE60]" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-[#1A1A1A] dark-mode:text-white mb-2">
            Waiting for confirmation...
          </h2>
          <p className="text-[#6B6B6B]">
            Processing your SMS payment
          </p>
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
          1200 NGN sent via SMS
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

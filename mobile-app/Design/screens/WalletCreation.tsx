import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface WalletCreationProps {
  onComplete: () => void;
}

export const WalletCreation: React.FC<WalletCreationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 2000);
    const timer2 = setTimeout(() => setStep(3), 4000);
    const timer3 = setTimeout(() => onComplete(), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-[#2F80ED]">TundePay</h1>
        </div>

        {/* Animation container */}
        <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-8">
            {/* Loading animation */}
            <div className="relative w-24 h-24">
              {step < 3 ? (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#2F80ED]/20"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#2F80ED] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 size={96} className="text-[#27AE60]" />
                </motion.div>
              )}
            </div>

            {/* Status text */}
            <div className="text-center space-y-2">
              {step === 1 && (
                <>
                  <h2 className="text-[#1A1A1A] dark-mode:text-white">Creating your XRPL wallet...</h2>
                  <p className="text-[#6B6B6B]">Setting up your secure account</p>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="text-[#1A1A1A] dark-mode:text-white">Funding your account...</h2>
                  <p className="text-[#6B6B6B]">Adding testnet USDC</p>
                </>
              )}
              {step === 3 && (
                <>
                  <h2 className="text-[#27AE60]">Success!</h2>
                  <p className="text-[#6B6B6B]">Your wallet is ready</p>
                </>
              )}
            </div>

            {/* Progress steps */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-[#27AE60]' : 'bg-gray-200'
                }`}>
                  {step >= 2 && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <small className={step >= 1 ? 'text-[#1A1A1A] dark-mode:text-white' : 'text-[#6B6B6B]'}>
                  Generate seed & keys
                </small>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-[#27AE60]' : 'bg-gray-200'
                }`}>
                  {step >= 3 && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <small className={step >= 2 ? 'text-[#1A1A1A] dark-mode:text-white' : 'text-[#6B6B6B]'}>
                  Fund with testnet USDC
                </small>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-[#27AE60]' : 'bg-gray-200'
                }`}>
                  {step >= 3 && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <small className={step >= 3 ? 'text-[#1A1A1A] dark-mode:text-white' : 'text-[#6B6B6B]'}>
                  Activate account
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

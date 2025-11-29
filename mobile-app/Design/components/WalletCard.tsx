import React from 'react';
import { TrendingUp } from 'lucide-react';

interface WalletCardProps {
  usdcBalance: string;
  ngnEquivalent: string;
  rate: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ 
  usdcBalance, 
  ngnEquivalent, 
  rate 
}) => {
  return (
    <div className="bg-gradient-to-br from-[#2F80ED] to-[#1E5BB8] 
                    rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <small className="text-white/80">Total Balance</small>
        
        <div className="mt-2">
          <h1 className="text-white">{usdcBalance} USDC</h1>
        </div>
        
        <div className="mt-1 flex items-center gap-2">
          <h2 className="text-white/90">≈ {ngnEquivalent} NGN</h2>
        </div>
        
        <div className="mt-4 flex items-center gap-1 text-white/70">
          <TrendingUp size={14} />
          <small>Rate: {rate}</small>
        </div>
      </div>
    </div>
  );
};

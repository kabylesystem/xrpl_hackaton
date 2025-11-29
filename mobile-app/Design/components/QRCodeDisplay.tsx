import React from 'react';

interface QRCodeDisplayProps {
  address: string;
  amountUSDC: string;
  amountNGN: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  address, 
  amountUSDC, 
  amountNGN 
}) => {
  return (
    <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-3xl p-8 shadow-xl">
      {/* QR Code placeholder - in real app would generate actual QR */}
      <div className="aspect-square bg-[#F8F9FB] dark-mode:bg-[#2A2A2A] rounded-2xl 
                      flex items-center justify-center mb-6 relative overflow-hidden">
        {/* Simple QR pattern simulation */}
        <div className="grid grid-cols-8 gap-1 w-3/4 h-3/4">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`${Math.random() > 0.5 ? 'bg-[#1A1A1A]' : 'bg-transparent'} rounded-sm`}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <small className="text-[#6B6B6B]">Amount</small>
          <p className="text-[#1A1A1A] dark-mode:text-white mt-1">{amountUSDC} USDC</p>
          <p className="text-[#6B6B6B]">≈ {amountNGN} NGN</p>
        </div>
        
        <div className="pt-3 border-t border-gray-200 dark-mode:border-gray-700">
          <small className="text-[#6B6B6B] break-all">{address}</small>
        </div>
      </div>
    </div>
  );
};

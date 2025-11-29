import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Button } from '../components/Button';

interface PaymentRequestProps {
  onBack: () => void;
}

export const PaymentRequest: React.FC<PaymentRequestProps> = ({ onBack }) => {
  const paymentInfo = {
    address: 'rNxxxxxxxxxxxxxxxxxxxxx7y9z',
    amountUSDC: '0.75',
    amountNGN: '1,200'
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                       flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-[#1A1A1A] dark-mode:text-white" />
          </button>
          <h2 className="text-[#1A1A1A] dark-mode:text-white">Payment Request</h2>
        </div>
        <button className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                           flex items-center justify-center shadow-sm">
          <Share2 size={20} className="text-[#2F80ED]" />
        </button>
      </div>

      {/* QR Code */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-[#1A1A1A] dark-mode:text-white mb-2">
              Scan to Pay
            </h2>
            <p className="text-[#6B6B6B]">
              Customer scans this code to complete payment
            </p>
          </div>

          <QRCodeDisplay
            address={paymentInfo.address}
            amountUSDC={paymentInfo.amountUSDC}
            amountNGN={paymentInfo.amountNGN}
          />

          <div className="mt-6 bg-gradient-to-r from-[#2F80ED]/10 to-[#27AE60]/10 
                          rounded-2xl p-4 border border-[#2F80ED]/20">
            <small className="text-[#6B6B6B] block text-center">
              💡 This QR code is valid for 10 minutes
            </small>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-8 space-y-3">
        <Button variant="outline">
          Share QR Code
        </Button>
      </div>
    </div>
  );
};

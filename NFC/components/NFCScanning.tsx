import { useEffect, useState } from 'react';
import { Smartphone, Waves, X } from 'lucide-react';

interface MerchantData {
  merchantId: string;
  merchantName: string;
  merchantAddress: string;
}

interface NFCScanningProps {
  amount: string;
  onSuccess: (merchantData: MerchantData) => void;
  onCancel: () => void;
}

// Mock merchant data
const MOCK_MERCHANTS: MerchantData[] = [
  {
    merchantId: 'MCH-001-CAFE',
    merchantName: 'Downtown Coffee & Co.',
    merchantAddress: '123 Main Street, Suite 100',
  },
  {
    merchantId: 'MCH-002-STORE',
    merchantName: 'Tech Haven Electronics',
    merchantAddress: '456 Tech Boulevard, Floor 2',
  },
  {
    merchantId: 'MCH-003-RESTO',
    merchantName: 'The Garden Bistro',
    merchantAddress: '789 Park Avenue',
  },
];

export function NFCScanning({ amount, onSuccess, onCancel }: NFCScanningProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(0);

  useEffect(() => {
    // Start scanning animation
    setIsScanning(true);
    
    // Pulse animation interval
    const pulseInterval = setInterval(() => {
      setPulseAnimation(prev => (prev + 1) % 3);
    }, 600);

    // Simulate NFC detection after 2-3 seconds
    const scanTimeout = setTimeout(() => {
      // Mock: Randomly select a merchant
      const randomMerchant = MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];
      
      setIsScanning(false);
      onSuccess(randomMerchant);
    }, 2000 + Math.random() * 1000);

    return () => {
      clearTimeout(scanTimeout);
      clearInterval(pulseInterval);
    };
  }, [onSuccess]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 relative">
      <button
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-6 h-6 text-gray-500" />
      </button>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-8">
          {/* Animated pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`absolute w-32 h-32 border-4 border-indigo-400 rounded-full ${
                  pulseAnimation === index ? 'animate-ping' : 'opacity-0'
                }`}
                style={{
                  animationDuration: '1.8s',
                }}
              />
            ))}
          </div>

          {/* Phone icon */}
          <div className="relative bg-indigo-600 p-8 rounded-full">
            <Smartphone className="w-16 h-16 text-white" />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2">
              <Waves className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <h2 className="text-center mb-3">Hold Phone Near Terminal</h2>
        <p className="text-gray-500 text-center mb-8">
          Scanning for NFC payment terminal...
        </p>

        <div className="w-full bg-gray-100 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Payment Amount</span>
            <span className="text-indigo-600">${parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Scanning
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

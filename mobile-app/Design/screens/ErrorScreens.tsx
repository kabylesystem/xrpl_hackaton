import React from 'react';
import { AlertCircle, WifiOff, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '../components/Button';

interface ErrorScreenProps {
  type: 'connection' | 'oracle' | 'insufficient' | 'sms';
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ type, onRetry, onBack }) => {
  const errorContent = {
    connection: {
      icon: <WifiOff size={64} className="text-[#EB5757]" />,
      title: "XRPL Connection Delayed",
      description: "We're having trouble connecting to the XRPL network. This might take a moment.",
      suggestion: "Try again in a few seconds or switch to SMS mode for offline payments.",
      color: "#EB5757"
    },
    oracle: {
      icon: <TrendingDown size={64} className="text-[#F39C12]" />,
      title: "Oracle Price Unavailable",
      description: "Unable to fetch current exchange rates. Using last known rate.",
      suggestion: "The app will update automatically when the oracle service is restored.",
      color: "#F39C12"
    },
    insufficient: {
      icon: <Wallet size={64} className="text-[#EB5757]" />,
      title: "Insufficient USDC Balance",
      description: "You don't have enough USDC to complete this transaction.",
      suggestion: "Please add funds to your wallet or try a smaller amount.",
      color: "#EB5757"
    },
    sms: {
      icon: <AlertCircle size={64} className="text-[#EB5757]" />,
      title: "SMS Not Sent",
      description: "There was a problem sending your SMS payment request.",
      suggestion: "Check your SMS service and try again, or use NFC/QR payment instead.",
      color: "#EB5757"
    }
  };

  const content = errorContent[type];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {content.icon}
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-[#1A1A1A] dark-mode:text-white">
            {content.title}
          </h1>
          <p className="text-[#6B6B6B]">
            {content.description}
          </p>
        </div>

        {/* Info Box */}
        <div 
          className="rounded-2xl p-4 mb-8"
          style={{ backgroundColor: `${content.color}15` }}
        >
          <small style={{ color: content.color }}>
            💡 {content.suggestion}
          </small>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          )}
        </div>

        {/* Additional Help */}
        {type === 'connection' && (
          <div className="mt-8 text-center">
            <small className="text-[#6B6B6B]">
              Network Status: Connecting...
            </small>
            <div className="flex justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-[#EB5757] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#EB5757] animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-[#EB5757] animate-pulse delay-150" />
            </div>
          </div>
        )}

        {type === 'insufficient' && (
          <div className="mt-8 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <small className="text-[#6B6B6B]">Current Balance</small>
              <div className="text-right">
                <p className="text-[#1A1A1A] dark-mode:text-white">2.5 USDC</p>
                <small className="text-[#6B6B6B]">≈ 4,000 NGN</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo component showing all error states
export const ErrorScreensDemo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedError, setSelectedError] = React.useState<'connection' | 'oracle' | 'insufficient' | 'sms' | null>(null);

  if (selectedError) {
    return (
      <ErrorScreen
        type={selectedError}
        onRetry={() => setSelectedError(null)}
        onBack={() => setSelectedError(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212]">
      <div className="px-6 pt-12 pb-6">
        <h2 className="text-[#1A1A1A] dark-mode:text-white">Error States</h2>
        <p className="text-[#6B6B6B] mt-2">Select an error to preview</p>
      </div>

      <div className="px-6 space-y-3">
        <button
          onClick={() => setSelectedError('connection')}
          className="w-full p-4 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl 
                     shadow-sm hover:shadow-md transition-all text-left"
        >
          <p className="text-[#1A1A1A] dark-mode:text-white">XRPL Connection Delayed</p>
          <small className="text-[#6B6B6B]">Network connectivity issue</small>
        </button>

        <button
          onClick={() => setSelectedError('oracle')}
          className="w-full p-4 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl 
                     shadow-sm hover:shadow-md transition-all text-left"
        >
          <p className="text-[#1A1A1A] dark-mode:text-white">Oracle Price Unavailable</p>
          <small className="text-[#6B6B6B]">Exchange rate service issue</small>
        </button>

        <button
          onClick={() => setSelectedError('insufficient')}
          className="w-full p-4 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl 
                     shadow-sm hover:shadow-md transition-all text-left"
        >
          <p className="text-[#1A1A1A] dark-mode:text-white">Insufficient Balance</p>
          <small className="text-[#6B6B6B]">Not enough USDC</small>
        </button>

        <button
          onClick={() => setSelectedError('sms')}
          className="w-full p-4 bg-white dark-mode:bg-[#1E1E1E] rounded-2xl 
                     shadow-sm hover:shadow-md transition-all text-left"
        >
          <p className="text-[#1A1A1A] dark-mode:text-white">SMS Not Sent</p>
          <small className="text-[#6B6B6B]">SMS service error</small>
        </button>

        <div className="pt-4">
          <Button onClick={onBack} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

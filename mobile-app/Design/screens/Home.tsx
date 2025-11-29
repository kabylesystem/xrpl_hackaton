import React from 'react';
import { Send, Download, History, MessageSquare, Menu } from 'lucide-react';
import { WalletCard } from '../components/WalletCard';
import { Button } from '../components/Button';

interface HomeProps {
  onNavigate: (screen: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, darkMode, onToggleDarkMode }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] pb-6">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <small className="text-[#6B6B6B]">Welcome back</small>
          <h2 className="text-[#1A1A1A] dark-mode:text-white mt-1">TundePay</h2>
        </div>
        <button 
          onClick={() => onNavigate('settings')}
          className="w-12 h-12 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                     flex items-center justify-center shadow-sm"
        >
          <Menu size={24} className="text-[#1A1A1A] dark-mode:text-white" />
        </button>
      </div>

      {/* Wallet Card */}
      <div className="px-6 mb-8">
        <WalletCard
          usdcBalance="12.5"
          ngnEquivalent="20,000"
          rate="1 USD = 1,600 NGN (live oracle)"
        />
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-[#1A1A1A] dark-mode:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('pay')}
            className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm 
                       hover:shadow-md transition-all active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#2F80ED]/10 flex items-center justify-center mb-3">
              <Send size={24} className="text-[#2F80ED]" />
            </div>
            <p className="text-[#1A1A1A] dark-mode:text-white">Pay</p>
            <small className="text-[#6B6B6B]">Send money</small>
          </button>

          <button
            onClick={() => onNavigate('receive')}
            className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm 
                       hover:shadow-md transition-all active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#27AE60]/10 flex items-center justify-center mb-3">
              <Download size={24} className="text-[#27AE60]" />
            </div>
            <p className="text-[#1A1A1A] dark-mode:text-white">Receive</p>
            <small className="text-[#6B6B6B]">Get paid</small>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm 
                       hover:shadow-md transition-all active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#2F80ED]/10 flex items-center justify-center mb-3">
              <History size={24} className="text-[#2F80ED]" />
            </div>
            <p className="text-[#1A1A1A] dark-mode:text-white">History</p>
            <small className="text-[#6B6B6B]">View transactions</small>
          </button>

          <button
            onClick={() => onNavigate('sms')}
            className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl p-6 shadow-sm 
                       hover:shadow-md transition-all active:scale-95 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-[#27AE60]/10 flex items-center justify-center mb-3">
              <MessageSquare size={24} className="text-[#27AE60]" />
            </div>
            <p className="text-[#1A1A1A] dark-mode:text-white">SMS Mode</p>
            <small className="text-[#6B6B6B]">Pay offline</small>
          </button>
        </div>
      </div>

      {/* Rate Info */}
      <div className="px-6">
        <div className="bg-gradient-to-r from-[#2F80ED]/10 to-[#27AE60]/10 
                        rounded-2xl p-4 border border-[#2F80ED]/20">
          <div className="flex items-center justify-between">
            <div>
              <small className="text-[#6B6B6B]">Live Exchange Rate</small>
              <p className="text-[#1A1A1A] dark-mode:text-white mt-1">1 USD = 1,600 NGN</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

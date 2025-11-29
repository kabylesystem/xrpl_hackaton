import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Copy, 
  Globe, 
  Info, 
  MessageSquare, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '../components/Button';

interface SettingsProps {
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, darkMode, onToggleDarkMode }) => {
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const seedPhrase = "abandon ability able about above absent absorb abstract absurd abuse access accident";

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white dark-mode:bg-[#1E1E1E] 
                     flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={20} className="text-[#1A1A1A] dark-mode:text-white" />
        </button>
        <h2 className="text-[#1A1A1A] dark-mode:text-white">Settings</h2>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Security Section */}
        <div>
          <small className="text-[#6B6B6B] block mb-3">Security</small>
          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark-mode:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#1A1A1A] dark-mode:text-white">Backup Seed Phrase</p>
                <button
                  onClick={() => setShowSeed(!showSeed)}
                  className="text-[#2F80ED]"
                >
                  {showSeed ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {showSeed && (
                <div className="bg-[#F8F9FB] dark-mode:bg-[#2A2A2A] rounded-xl p-4 relative">
                  <p className="text-[#1A1A1A] dark-mode:text-white text-sm font-mono leading-relaxed">
                    {seedPhrase}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 text-[#2F80ED] hover:text-[#2570D8]"
                  >
                    <Copy size={18} />
                  </button>
                  {copied && (
                    <small className="text-[#27AE60] mt-2 block">Copied!</small>
                  )}
                </div>
              )}
              
              {!showSeed && (
                <small className="text-[#6B6B6B]">
                  Tap the eye icon to reveal your recovery phrase
                </small>
              )}
            </div>

            <div className="bg-[#EB5757]/10 p-4">
              <small className="text-[#EB5757]">
                ⚠️ Never share your seed phrase. Store it safely offline.
              </small>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <small className="text-[#6B6B6B] block mb-3">Appearance</small>
          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl shadow-sm">
            <button
              onClick={onToggleDarkMode}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 
                         dark-mode:hover:bg-[#2A2A2A] transition-all"
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon size={20} className="text-[#2F80ED]" />
                ) : (
                  <Sun size={20} className="text-[#F39C12]" />
                )}
                <p className="text-[#1A1A1A] dark-mode:text-white">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${
                darkMode ? 'bg-[#2F80ED]' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white m-0.5 transition-all ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <small className="text-[#6B6B6B] block mb-3">Preferences</small>
          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center gap-3 border-b border-gray-100 
                               dark-mode:border-gray-800 hover:bg-gray-50 
                               dark-mode:hover:bg-[#2A2A2A] transition-all text-left">
              <Globe size={20} className="text-[#2F80ED]" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] dark-mode:text-white">Currency Display</p>
                <small className="text-[#6B6B6B]">NGN (Nigerian Naira)</small>
              </div>
            </button>
          </div>
        </div>

        {/* Information */}
        <div>
          <small className="text-[#6B6B6B] block mb-3">Information</small>
          <div className="bg-white dark-mode:bg-[#1E1E1E] rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center gap-3 border-b border-gray-100 
                               dark-mode:border-gray-800 hover:bg-gray-50 
                               dark-mode:hover:bg-[#2A2A2A] transition-all text-left">
              <Info size={20} className="text-[#2F80ED]" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] dark-mode:text-white">About XRPL</p>
                <small className="text-[#6B6B6B]">Learn about the XRP Ledger</small>
              </div>
            </button>

            <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 
                               dark-mode:hover:bg-[#2A2A2A] transition-all text-left">
              <MessageSquare size={20} className="text-[#27AE60]" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] dark-mode:text-white">About SMS Mode</p>
                <small className="text-[#6B6B6B]">How offline payments work</small>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center">
          <small className="text-[#6B6B6B]">TundePay v1.0.0</small>
          <br />
          <small className="text-[#6B6B6B]">Built on XRPL</small>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <Button variant="outline" icon={<LogOut size={20} />}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

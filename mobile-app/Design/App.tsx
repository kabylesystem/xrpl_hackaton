import React, { useState, useEffect } from 'react';
import { Onboarding } from './screens/Onboarding';
import { WalletCreation } from './screens/WalletCreation';
import { Home } from './screens/Home';
import { PayAmount } from './screens/PayAmount';
import { NFCPayment } from './screens/NFCPayment';
import { QRPayment } from './screens/QRPayment';
import { SMSPayment } from './screens/SMSPayment';
import { Receive } from './screens/Receive';
import { PaymentRequest } from './screens/PaymentRequest';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { ErrorScreensDemo } from './screens/ErrorScreens';

type Screen = 
  | 'onboarding'
  | 'wallet-creation'
  | 'home'
  | 'pay'
  | 'nfc'
  | 'qr'
  | 'sms'
  | 'receive'
  | 'payment-request'
  | 'history'
  | 'settings'
  | 'errors';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const navigate = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    // Determine appropriate back navigation
    const backMap: Record<Screen, Screen> = {
      'onboarding': 'onboarding',
      'wallet-creation': 'onboarding',
      'home': 'home',
      'pay': 'home',
      'nfc': 'pay',
      'qr': 'pay',
      'sms': 'home',
      'receive': 'home',
      'payment-request': 'receive',
      'history': 'home',
      'settings': 'home',
      'errors': 'home'
    };
    
    setCurrentScreen(backMap[currentScreen]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Main app container - mobile-first design
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FB] dark-mode:bg-[#121212] relative">
      {/* Onboarding */}
      {currentScreen === 'onboarding' && (
        <Onboarding
          currentSlide={onboardingSlide}
          onNext={() => setOnboardingSlide(onboardingSlide + 1)}
          onComplete={() => setCurrentScreen('wallet-creation')}
        />
      )}

      {/* Wallet Creation */}
      {currentScreen === 'wallet-creation' && (
        <WalletCreation onComplete={() => setCurrentScreen('home')} />
      )}

      {/* Home Screen */}
      {currentScreen === 'home' && (
        <Home 
          onNavigate={navigate}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}

      {/* Pay Amount Entry */}
      {currentScreen === 'pay' && (
        <PayAmount
          onNavigate={navigate}
          onBack={goBack}
        />
      )}

      {/* NFC Payment */}
      {currentScreen === 'nfc' && (
        <NFCPayment
          onBack={goBack}
          onComplete={() => setCurrentScreen('home')}
        />
      )}

      {/* QR Payment */}
      {currentScreen === 'qr' && (
        <QRPayment
          onBack={goBack}
          onComplete={() => setCurrentScreen('home')}
        />
      )}

      {/* SMS Payment */}
      {currentScreen === 'sms' && (
        <SMSPayment
          onBack={goBack}
          onComplete={() => setCurrentScreen('home')}
        />
      )}

      {/* Receive Payment */}
      {currentScreen === 'receive' && (
        <Receive
          onNavigate={navigate}
          onBack={goBack}
        />
      )}

      {/* Payment Request QR */}
      {currentScreen === 'payment-request' && (
        <PaymentRequest onBack={goBack} />
      )}

      {/* Transaction History */}
      {currentScreen === 'history' && (
        <History onBack={goBack} />
      )}

      {/* Settings */}
      {currentScreen === 'settings' && (
        <Settings 
          onBack={goBack}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}

      {/* Error Screens Demo */}
      {currentScreen === 'errors' && (
        <ErrorScreensDemo onBack={() => setCurrentScreen('home')} />
      )}

      {/* Quick Navigation Menu (Dev Only) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative group">
          <button
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#27AE60] 
                       shadow-lg flex items-center justify-center text-white text-2xl
                       hover:scale-110 transition-transform"
          >
            ⚡
          </button>
          
          {/* Quick menu */}
          <div className="absolute bottom-16 right-0 bg-white dark-mode:bg-[#1E1E1E] 
                          rounded-2xl shadow-2xl p-2 min-w-[200px] opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible transition-all">
            <button
              onClick={() => setCurrentScreen('onboarding')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Onboarding</small>
            </button>
            <button
              onClick={() => setCurrentScreen('wallet-creation')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Wallet Creation</small>
            </button>
            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Home</small>
            </button>
            <button
              onClick={() => setCurrentScreen('pay')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Pay</small>
            </button>
            <button
              onClick={() => setCurrentScreen('receive')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Receive</small>
            </button>
            <button
              onClick={() => setCurrentScreen('history')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">History</small>
            </button>
            <button
              onClick={() => setCurrentScreen('settings')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Settings</small>
            </button>
            <button
              onClick={() => setCurrentScreen('errors')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">Error States</small>
            </button>
            <div className="border-t border-gray-200 dark-mode:border-gray-700 my-2" />
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark-mode:hover:bg-[#2A2A2A] 
                         rounded-xl transition-all"
            >
              <small className="text-[#1A1A1A] dark-mode:text-white">
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </small>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

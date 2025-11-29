# XRPL Wallet App

A React Native mobile application for interacting with the XRP Ledger, built for the XRPL Hackathon.

## Features

- Connect to XRPL Testnet
- Create new wallets (automatically funded on testnet)
- View wallet balance and information
- Send XRP payments
- Modern, user-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

## Installation

All dependencies are already installed. To reinstall if needed:

```bash
npm install
```

## Running the App

1. Start the Expo development server:
```bash
npm start
```

2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

3. Or run on specific platforms:
```bash
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
npm run web      # Web browser
```

## How to Use

1. **Connect to XRPL**: Tap "Connect to XRPL" to connect to the testnet
2. **Create Wallet**: Tap "Create New Wallet" to generate a new wallet (automatically funded with testnet XRP)
3. **View Balance**: See your XRP balance and wallet information
4. **Send Payment**: Tap "Send Payment" to transfer XRP to another address
5. **Refresh Balance**: Update your balance after transactions

## Project Structure

```
.
├── App.js                    # Main navigation setup
├── screens/
│   ├── HomeScreen.js         # Wallet dashboard
│   └── SendPaymentScreen.js  # Payment interface
├── utils/
│   └── xrpl.js              # XRPL SDK functions
├── components/              # Reusable components
├── assets/                  # Images and icons
└── package.json             # Dependencies
```

## Technologies Used

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **XRPL SDK**: XRP Ledger JavaScript library
- **React Navigation**: Screen navigation
- **XRPL Testnet**: Testing environment

## Important Notes

- This app connects to the XRPL **Testnet** for development
- Testnet XRP has no real value
- For production, change the network URL in `utils/xrpl.js`

## License

MIT

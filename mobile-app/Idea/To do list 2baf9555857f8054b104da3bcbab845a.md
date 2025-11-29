# To do list

## UI / UX

- [ ]  Create an app with React Native
- [ ]  Display the money the user have on his wallet
- [ ]  Gérer les demandes de paiement

## Blockchain

- [ ]  Create a wallet and fund it (testnet)
- [ ]  Send a transaction in USDC to a wallet
- [ ]  NFC to wallet
- [ ]  Mobile server

- to-go global
    
    # 🟥 **A — Preparation (vision + pitch)**
    
    - [x]  Write the final storytelling (Tunde + OPay freeze 2024).
    - [x]  Write the 45-second pitch.
    - [x]  Define the 6 MVP features.
    - [ ]  Draw the architecture (React Native App + Backend + XRPL).
    
    ---
    
    ---
    
    # **🟩 C — NGN/USD Oracle**
    
    - [ ]  Code a script that returns an NGN/USD price (mock or API).
    - [ ]  Endpoint XRPL **`/price`** → **`{ "rate": 1600 }`**.
    - [ ]  Refresh price every 60 sec.
    - [ ]  (Optional) Publish this price on XRPL in a Memo.
    
    ---
    
    # **🟨 D — Wallet + USDC Testnet**
    
    - [ ]  Generate an XRPL wallet (backend or app).
    - [ ]  Call XRPL **`faucet`** testnet to activate the account.
    - [ ]  Create a token “USDC” on testnet (simple IOU) OR use existing USDC testnet.
    - [ ]  Endpoint **`/fund`** → credit the wallet in USDC for the MVP.
    
    ---
    
    # **🟪 E — SMS (offline mode)**
    
    - [ ]  Create endpoint **`/sms`**.
    - [ ]  Parse message: ex. “PAY 1200”.
    - [ ]  Convert NGN → USDC via **`/price`**.
    - [ ]  Build the XRPL transaction.
    - [ ]  Sign + send the XRPL transaction on the backend side.
    - [ ]  Return “PAYMENT CONFIRMED”.
    
    ---
    
    # **🟫 F — React Native App (the core of the MVP)**
    
    ### **🟫 F1 — Setup & structure**
    
    - [ ]  Create React Native project.
    - [ ]  Create 3 screens: Home / Pay / Receive.
    - [ ]  Install XRPL client + Axios.
    
    ### **🟫 F2 — Home screen**
    
    - [ ]  Call **`/fund`** on account creation.
    - [ ]  Read USDC balance of the wallet.
    - [ ]  Call **`/price`** → display NGN equivalent.
        
        → “12 USDC ≈ 19 200 NGN”.
        
    
    ### **🟫 F3 — Classic payment**
    
    - [ ]  Input “Amount NGN”.
    - [ ]  Call **`/price`**.
    - [ ]  Convert NGN → USDC.
    - [ ]  Build XRPL TX.
    - [ ]  Send the transaction.
    - [ ]  Display success.
    
    ### **🟫 F4 — NFC Payment (mock)**
    
    - [ ]  Implement address exchange through NFC (or fake NFC).
    - [ ]  Add “Scan NFC” button.
    - [ ]  Retrieve merchant address.
    - [ ]  Execute payment flow (28–33).
    
    ### **🟫 F5 — QR Payment**
    
    - [ ]  Generate QR with merchant XRPL address.
    - [ ]  Scan → destination found.
    - [ ]  Payment (28–33).
    
    ### **🟫 F6 — SMS Payment (offline)**
    
    - [ ]  Button “Pay via SMS”.
    - [ ]  App shows the text: “PAY 1200”.
    - [ ]  User sends the SMS.
    - [ ]  Backend executes the transaction.
    - [ ]  Confirmation displayed.
    
    ---
    
    # **🟥 G — Merchant mode**
    
    - [ ]  Screen “Receive payment”.
    - [ ]  Field: amount in NGN.
    - [ ]  Generate QR (address + amount).
    - [ ]  Or display “Press NFC”.
    - [ ]  Display “Payment received: X NGN”.
    
    ---
    
    # **🟦 H — History**
    
    - [ ]  Store a small history (backend or local).
    - [ ]  Display:
        - “1200 NGN — Café MamaKoko”
        - “500 NGN — SMS payment”
    
    ---
    
    # **🟧 I — Final tests**
    
    - [ ]  Test Tunde → merchant → NFC (online).
    - [ ]  Test SMS “PAY 900” (offline).
    - [ ]  Test oracle: change price, verify conversion.
    - [ ]  Verify app displays correctly in NGN.
    - [ ]  Verify everything works on XRPL testnet.
    
    ---
    
    # **🟩 J — Pitch & Demo**
    
    - [ ]  Storytelling slide (Tunde).
    - [ ]  Problem slide (Freeze, centralization).
    - [ ]  Solution slide (XRPL app + offline + NFC).
    - [ ]  Features slide (6 points).
    - [ ]  Live demo:
        - NFC payment
        - SMS payment (no internet)
    - [ ]  Conclusion slide (resilience, social impact, XRPL).
- Todo-Gemini
    
    This is a robust and innovative feature set that bridges the gap between modern blockchain technology (XRPL) and real-world accessibility constraints (SMS/Offline).
    
    Here is a comprehensive technical To-Do List to build your React Native application, organized by architectural layer and feature logic.
    
    ### 🏗️ Phase 1: Project Architecture & Environment
    
    Before building features, set up the foundation.
    
    - [ ]  **Initialize React Native Project:**
        - Setup with TypeScript (recommended for financial apps).
        - Install core dependencies: `xrpl` (XRPL.js), `react-native-get-random-values`, `buffer` (for polyfills).
    - [ ]  **Backend Setup (Node.js/Express):**
        - *Note: Required for the SMS gateway and the Oracle script.*
        - Initialize a secure Node.js server.
        - Set up a database (PostgreSQL or MongoDB) to map Phone Numbers $\leftrightarrow$ Wallet Addresses.
    - [ ]  **XRPL Testnet Connection:**
        - Configure the `xrpl.Client` to connect to `wss://s.altnet.rippletest.net:51233`.
    
    ---
    
    ### 💼 Phase 2: Wallet Creation (Feature 1)
    
    *Goal: One-click onboarding with auto-funding.*
    
    - [ ]  **Generate Wallet:**
        - Implement `xrpl.Wallet.generate()` to create a keypair.
        - Secure storage: Use `react-native-keychain` to store the Seed/Private Key encrypted on the device.
    - [ ]  **Auto-Fund XRP (Gas):**
        - Create a backend endpoint that calls the XRPL Testnet Faucet to fund the new wallet with initial XRP (needed for fees/reserves).
    - [ ]  **Establish USDC Trust Line:**
        - Identify the issuer address for your Testnet USDC.
        - Submit a `TrustSet` transaction from the user's wallet to enable holding USDC.
    - [ ]  **Credit Testnet USDC:**
        - Create a backend script that sends e.g., 50 USDC from your "Bank/Issuer" wallet to the new user immediately after the Trust Line is confirmed.
    
    ---
    
    ### 💱 Phase 3: The Price Oracle (Feature 2 & 5)
    
    *Goal: "Think in NGN, Pay in USDC".*
    
    - [ ]  **External Data Source:**
        - Select an API (e.g., CoinGecko or a Forex API) to fetch real-time NGN/USD rates.
    - [ ]  **On-Chain Oracle Script (Feature 5):**
        - Set up a dedicated "Oracle XRPL Account".
        - Write a Cron job (Node.js) that runs every 5 minutes.
        - The job fetches the rate and publishes it to the Oracle Account (using the `Domain` field or a specific `Memo` in a self-transaction) so it is publicly verifiable.
    - [ ]  **App Display Logic (Feature 2):**
        - Fetch user's USDC balance via `account_lines`.
        - Fetch the latest rate from the Oracle Account (or your API for speed).
        - Calculate: `Display NGN = USDC Balance * Oracle Rate`.
    
    ---
    
    ### 📲 Phase 4: NFC & QR Payments (Feature 3 & 6)
    
    *Goal: Merchant inputs NGN, app handles the conversion and transfer.*
    
    - [ ]  **Merchant Input UI:**
        - Create a keypad for entering amounts in NGN.
        - Real-time conversion display: "1200 NGN ($\approx$ 0.75 USDC)".
    - [ ]  **NFC Implementation (Sender & Receiver):**
        - Install `react-native-nfc-manager`.
        - **Merchant (Sender):** Write an NDEF message containing a JSON payload: `{ "address": "rMerchant...", "amountUSDC": "0.75", "currency": "USDC" }`.
        - **Customer (Receiver):** Listen for NFC tags, parse the JSON, and trigger the "Confirm Payment" modal.
    - [ ]  **QR Code Fallback:**
        - Use `react-native-qrcode-svg` to generate the payment request QR.
        - Use `react-native-vision-camera` to scan the merchant's QR.
    - [ ]  **Transaction Execution:**
        - Construct the `Payment` transaction in `xrpl.js`.
        - User signs with biometrics (FaceID/TouchID).
        - Submit to Ledger.
    
    ---
    
    ### 📩 Phase 5: SMS Payments (Feature 4)
    
    *Goal: Offline transactions via text message.*
    
    - [ ]  **SMS Gateway Integration:**
        - Set up an account with Twilio, Vonage, or a local Nigerian SMS gateway.
        - Configure a Webhook to receive incoming SMS to your Node.js backend.
    - [ ]  **Message Parser:**
        - Write logic to parse strings like "PAY 750" or "PAY 750 [MerchantID]".
    - [ ]  **Custodial/Delegated Security Logic:**
        - *Critical Decision:* Since the user has no internet to sign the transaction, the server must sign it.
        - **Option A (Custodial):** The server holds an encrypted copy of the user's key (easiest for UX, lower security).
        - **Option B (Pre-Signed):** The app generates "Pre-signed Checks" when online and uploads them to the server to be triggered by SMS later (Higher security, complex implementation).
    - [ ]  **Transaction Trigger:**
        - Server identifies the user by phone number.
        - Server converts 750 NGN to USDC using the Oracle.
        - Server constructs and signs the XRPL transaction.
        - Server sends an SMS reply: "Payment Successful: 0.75 USDC sent."
    
    ---
    
    ### 🧪 Phase 6: Testing & Validation
    
    - [ ]  **Unit Testing:** Jest tests for the currency conversion logic.
    - [ ]  **Integration Testing:** Test the SMS webhook with tools like Postman.
    - [ ]  **Field Test:** Test NFC transfer speed between two actual Android/iOS devices.
    
    ---
    
    ### 🚀 Next Step
    
    This is a complex architecture involving both blockchain and traditional telecom gateways.
    
    **Would you like me to generate the code for the `Wallet Creation + Trust Line` setup (Phase 2), or would you prefer the logic for the `SMS Parser & Transaction Trigger` (Phase 5)?**
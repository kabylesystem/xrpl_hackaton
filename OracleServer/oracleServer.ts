import { Client, Wallet, convertStringToHex, OracleSet } from "xrpl";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

export async function setBtcUsdPrice() {
  const nodeUrl = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233";
  const seed = process.env.XRPL_SEED;

  if (!seed) {
    console.error("❌ XRPL_SEED not found in .env file. Please run 'npm run create-wallet' or set it manually.");
    return;
  }

  // 1. Connect to the XRPL
  const client = new Client(nodeUrl);
  await client.connect();

  try {
    // 2. Initialize your Wallet
    const wallet = Wallet.fromSeed(seed);
    console.log(`Using wallet: ${wallet.address}`);

    // 3. Define Oracle Data
    const providerName = "MyCryptoOracle";
    const assetClass = "currency";
    const oracleDocumentId = 1; // Unique ID for this specific Oracle object

    // Price Data: BTC/USD = $96,520.50
    const realPrice = 95520.5;
    const scale = 2; // We want 2 decimal places
    const scaledPrice = Math.round(realPrice * 10 ** scale).toString(); // "9652050"

    // 4. Construct the OracleSet Transaction
    const oracleSetTx: OracleSet = {
      TransactionType: "OracleSet",
      Account: wallet.address,
      OracleDocumentID: oracleDocumentId,
      Provider: convertStringToHex(providerName), // Must be Hex encoded
      AssetClass: convertStringToHex(assetClass), // Must be Hex encoded
      LastUpdateTime: Math.floor(Date.now() / 1000), // Current Unix Timestamp
      PriceDataSeries: [
        {
          PriceData: {
            BaseAsset: "BTC",
            QuoteAsset: "USD",
            AssetPrice: scaledPrice, // Integer as string: "9652050"
            Scale: scale, // Precision: 2
          },
        },
      ],
    };

    console.log("Preparing transaction...");

    // 5. Autofill, Sign, and Submit
    const prepared = await client.autofill(oracleSetTx);
    const signed = wallet.sign(prepared);

    console.log("Submitting transaction...");
    const result = await client.submitAndWait(signed.tx_blob);

    // 6. Check Results
    if (result.result.meta && typeof result.result.meta !== "string") {
      const resultArgs = result.result.meta.TransactionResult;
      if (resultArgs === "tesSUCCESS") {
        console.log(`\n✅ Oracle Successfully Set!`);
        console.log(`Transaction Hash: ${result.result.hash}`);
        console.log(`Price Published: ${realPrice} BTC/USD`);
      } else {
        console.error(`❌ Transaction Failed: ${resultArgs}`);
      }
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
  } finally {
    await client.disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  setBtcUsdPrice();
}

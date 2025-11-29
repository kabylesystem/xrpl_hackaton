import { Client, Wallet, convertStringToHex, OracleSet } from "xrpl";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

interface FloatRatesResponse {
  usd: {
    code: string;
    alphaCode: string;
    numericCode: string;
    name: string;
    rate: number;
    date: string;
    inverseRate: number;
  };
  [key: string]: any;
}

export async function updateOraclePrice() {
  const nodeUrl = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233";
  const seed = process.env.XRPL_SEED;

  if (!seed) {
    console.error("❌ XRPL_SEED not found in .env file. Please run 'npm run create-wallet' or set it manually.");
    return;
  }

  // 1. Fetch Price Data
  console.log("Fetching price data from floatrates.com...");
  let realPrice: number;
  try {
    const response = await fetch("https://www.floatrates.com/daily/ngn.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as FloatRatesResponse;
    realPrice = data.usd.rate;
    console.log(`Fetched NGN/USD Rate: ${realPrice}`);
  } catch (error) {
    console.error("Error fetching price data:", error);
    return;
  }

  // 2. Connect to the XRPL
  const client = new Client(nodeUrl);
  await client.connect();

  try {
    // 3. Initialize your Wallet
    const wallet = Wallet.fromSeed(seed);
    console.log(`Using wallet: ${wallet.address}`);

    // 4. Define Oracle Data
    const providerName = "FloatRatesOracle";
    const assetClass = "currency";
    const oracleDocumentId = 1; // Unique ID for this specific Oracle object

    // Price Data Handling
    // We need to convert the float price to an integer with a scale
    // Example: 0.0006925... -> with scale 15 -> 692568754036
    const scale = 15;
    const scaledPrice = Math.round(realPrice * 10 ** scale).toString();

    // 5. Construct the OracleSet Transaction
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
            BaseAsset: "NGN",
            QuoteAsset: "USD",
            AssetPrice: scaledPrice,
            Scale: scale,
          },
        },
      ],
    };

    console.log("Preparing transaction...");

    // 6. Autofill, Sign, and Submit
    const prepared = await client.autofill(oracleSetTx);
    const signed = wallet.sign(prepared);

    console.log("Submitting transaction...");
    const result = await client.submitAndWait(signed.tx_blob);

    // 7. Check Results
    if (result.result.meta && typeof result.result.meta !== "string") {
      const resultArgs = result.result.meta.TransactionResult;
      if (resultArgs === "tesSUCCESS") {
        console.log(`\n✅ Oracle Successfully Set!`);
        console.log(`Transaction Hash: ${result.result.hash}`);
        console.log(`Price Published: ${realPrice} NGN/USD`);
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
  updateOraclePrice();
}

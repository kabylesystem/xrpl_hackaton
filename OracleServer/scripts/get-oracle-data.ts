import { Client, Wallet, convertHexToString } from "xrpl";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

async function getOracleData() {
  const nodeUrl = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233";
  const seed = process.env.XRPL_SEED;

  if (!seed) {
    console.error("❌ XRPL_SEED not found in .env file.");
    return;
  }

  const client = new Client(nodeUrl);
  await client.connect();

  try {
    const wallet = Wallet.fromSeed(seed);
    console.log(`Looking up Oracle data for account: ${wallet.address}`);

    const oracleDocumentId = 1; // Must match the ID used in setBtcUsdPrice

    // Query the ledger for the Oracle object
    const response = await client.request({
      command: "ledger_entry",
      oracle: {
        account: wallet.address,
        oracle_document_id: oracleDocumentId,
      },
    });

    if (response.result.node) {
      console.log("\n✅ Oracle Data Found:");
      const node = response.result.node as any; // Type assertion as specific Oracle LedgerEntry type might not be fully exported or requires casting

      // Display raw node data
      // console.log(JSON.stringify(node, null, 2));

      console.log(`Provider: ${convertHexToString(node.Provider)}`);
      console.log(`Asset Class: ${convertHexToString(node.AssetClass)}`);
      console.log(`Last Update Time: ${new Date((node.LastUpdateTime + 946684800) * 1000).toISOString()}`); // XRPL Epoch (2000-01-01)

      if (node.PriceDataSeries) {
        console.log("\nPrices:");
        node.PriceDataSeries.forEach((entry: any) => {
          const priceData = entry.PriceData;
          const base = priceData.BaseAsset;
          const quote = priceData.QuoteAsset;
          const price = priceData.AssetPrice;
          const scale = priceData.Scale;

          // Calculate human readable price
          const humanPrice = parseInt(price) / 10 ** scale;

          console.log(`- ${base}/${quote}: ${humanPrice} (Raw: ${price}, Scale: ${scale})`);
        });
      }
    } else {
      console.log("Oracle data not found.");
    }
  } catch (error: any) {
    if (error.data?.error === "entryNotFound") {
      console.log("\n❌ Oracle Entry Not Found. Make sure you have run 'npm run oracle-server' to set the data first.");
    } else {
      console.error("Error fetching oracle data:", error);
    }
  } finally {
    await client.disconnect();
  }
}

getOracleData();

import { Client, Wallet } from "xrpl";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load existing env if present
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

async function createWallet() {
  const nodeUrl = process.env.XRPL_NODE || "wss://s.altnet.rippletest.net:51233";
  console.log(`Connecting to ${nodeUrl}...`);

  const client = new Client(nodeUrl);
  await client.connect();

  try {
    console.log("Funding new wallet...");
    const { wallet, balance } = await client.fundWallet();

    console.log("\n✅ Wallet Created and Funded!");
    console.log(`Address: ${wallet.address}`);
    console.log(`Seed: ${wallet.seed}`);
    console.log(`Balance: ${balance} XRP`);

    // Append to .env
    const envContent = `\nXRPL_SEED=${wallet.seed}\n`;

    if (fs.existsSync(envPath)) {
      const currentEnv = fs.readFileSync(envPath, "utf8");
      if (!currentEnv.includes("XRPL_SEED")) {
        fs.appendFileSync(envPath, envContent);
        console.log(`\nSaved XRPL_SEED to ${envPath}`);
      } else {
        console.log(`\n⚠️  .env already contains XRPL_SEED. Please update it manually if you want to use this new wallet.`);
      }
    } else {
      fs.writeFileSync(envPath, `XRPL_NODE=${nodeUrl}${envContent}`);
      console.log(`\nCreated ${envPath} with XRPL_SEED`);
    }
  } catch (error) {
    console.error("Error creating wallet:", error);
  } finally {
    await client.disconnect();
  }
}

createWallet();

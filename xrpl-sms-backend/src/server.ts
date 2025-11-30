import dotenv from "dotenv";
import express, { Request, Response } from "express";
import twilio from "twilio";
import * as xrpl from "xrpl";

// Load .env
dotenv.config({ path: __dirname + "/../.env" });

console.log("=== ENV LOADED ===");
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "OK" : "MISSING");
console.log("PHONE:", process.env.TWILIO_PHONE_NUMBER);
console.log("==================\n");

// Express
const app = express();
app.use(express.urlencoded({ extended: false }));

// Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

// Types
interface User {
  xrpl_address: string;
}
interface UserDatabase {
  [phone: string]: User;
}

// Fake DB
const users: UserDatabase = {
  "+33759687877": {
    xrpl_address: "rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J",
  },
};

// FX Rate
function getNGNRate(): number {
  return 1600;
}

// -------------------------------
// 🔥 MAIN SMS ENTRY POINT
// -------------------------------
app.post("/sms/receive", async (req: Request, res: Response): Promise<void> => {
  const from = req.body.From;
  const body = req.body.Body;

  console.log(`📨 SMS received from ${from}: "${body.slice(0, 50)}..."`);

  try {
    // Detect Transaction Type
    // 1. Claim: Contains a pipe "|" separator for two transactions
    const isClaim = body.includes("|");

    // 2. Signed Single TX: Long hex string or JSON with tx_blob
    const hexMatch = body.match(/[0-9A-Fa-f]{100,}/);
    const isJsonTx = body.trim().startsWith("{") || body.includes("tx_blob");

    if (isClaim) {
      await handleClaimTransaction(from, body);
    } else if (hexMatch || isJsonTx) {
      await handleSignedTransaction(from, body);
    } else {
      await handleSimplePayment(from, body);
    }

    res.type("text/xml");
    res.send("<Response></Response>");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ ERROR:", msg);

    try {
      // ✅ Short error message
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: from,
        body: `Action failed: ${msg.slice(0, 100)}`,
      });
      console.log("📨 Error SMS sent");
    } catch (smsErr) {
      console.error("❌ SMS SENDING ERROR:", smsErr);
    }

    res.type("text/xml");
    res.send("<Response></Response>");
  }
});

// -------------------------------
// 🔐 Signed Single Transaction Handler
// -------------------------------
async function handleSignedTransaction(from: string, body: string) {
  console.log("🔐 Single signed transaction detected");

  const signedTxBlob = extractTxBlob(body);

  // Connect to XRPL
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  try {
    console.log("📤 Broadcasting transaction...");
    const result = await client.submit(signedTxBlob);

    if (result.result.engine_result === "tesSUCCESS" || result.result.engine_result === "terQUEUED") {
      const hash = result.result.tx_json.hash || "N/A";
      console.log("✅ Transaction successfully broadcast!");

      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: from,
        body: `Payment confirmed! View on Explorer: https://testnet.xrpl.org/transactions/${hash}`,
      });
    } else {
      throw new Error(`Broadcast failed: ${result.result.engine_result}`);
    }
  } finally {
    await client.disconnect();
  }
}

// -------------------------------
// 🎁 Claim Transaction Handler (2 TXs)
// -------------------------------
async function handleClaimTransaction(from: string, body: string) {
  console.log("🎁 Claim transaction detected (Double TX)");

  const parts = body.split("|");
  if (parts.length !== 2) {
    throw new Error("Invalid claim format. Expected 'TX1|TX2'");
  }

  const tx1Blob = parts[0].trim();
  const tx2Blob = parts[1].trim();

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  try {
    // Submit 1st Transaction (Funding/Payment to Temp Wallet)
    console.log("📤 Submitting TX 1 (Funding)...");
    const result1 = await client.submitAndWait(tx1Blob);

    const result1Code =
      typeof result1.result.meta === "object" && result1.result.meta !== null
        ? result1.result.meta.TransactionResult
        : (result1.result as any).engine_result; // fallback

    if (result1Code !== "tesSUCCESS" && result1Code !== "terQUEUED") {
      throw new Error(`TX1 failed: ${result1Code}`);
    }
    console.log("✅ TX 1 Confirmed");

    // Submit 2nd Transaction (AccountDelete/Sweep to User Wallet)
    console.log("📤 Submitting TX 2 (Claim/Sweep)...");
    const result2 = await client.submitAndWait(tx2Blob);

    const result2Code =
      typeof result2.result.meta === "object" && result2.result.meta !== null
        ? result2.result.meta.TransactionResult
        : (result2.result as any).engine_result;

    if (result2Code !== "tesSUCCESS" && result2Code !== "terQUEUED") {
      throw new Error(`TX2 failed: ${result2Code}`);
    }
    console.log("✅ TX 2 Confirmed");

    const hash1 = result1.result.hash;
    const hash2 = result2.result.hash;

    // Success Message
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
      body: `Claim Successful! Funds swept to your wallet.\n\nTX1: ${hash1}\nLink: https://testnet.xrpl.org/transactions/${hash1}\n\nTX2: ${hash2}\nLink: https://testnet.xrpl.org/transactions/${hash2}`,
    });
  } finally {
    await client.disconnect();
  }
}

// -------------------------------
// 🛠 Helper: Extract Blob
// -------------------------------
function extractTxBlob(body: string): string {
  try {
    if (body.includes("tx_blob")) {
      const parsed = JSON.parse(body);
      return parsed.tx_blob;
    }
    const hexMatch = body.match(/[0-9A-Fa-f]{100,}/);
    return hexMatch ? hexMatch[0] : body.trim();
  } catch {
    return body.trim();
  }
}

// -------------------------------
// 💸 Simple PAY (for testing)
// -------------------------------
async function handleSimplePayment(from: string, body: string) {
  const match = body.match(/PAY\s+(\d+)/i);
  if (!match) {
    throw new Error("Invalid format. Send a signed XRPL transaction or use: PAY [amount]");
  }
  throw new Error("Simple PAY mode requires the app to sign the transaction. Send a tx_blob.");
}

// -------------------------------
// 📊 GET PRICE (for the app)
// -------------------------------
app.get("/price", (req, res) => {
  const rate = getNGNRate();
  res.json({
    rate: rate,
    timestamp: new Date().toISOString(),
    pair: "NGN/USD",
  });
});

// -------------------------------
// 🌍 TEST PAGE
// -------------------------------
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>XRPL SMS Backend</title>
      <style>
        body { 
          font-family: monospace; 
          padding: 40px;
          background: #1a1a1a;
          color: #0f0;
        }
        h1 { color: #0f0; }
        .info { margin: 10px 0; }
        .endpoint { 
          background: #2a2a2a; 
          padding: 10px; 
          margin: 10px 0;
          border-left: 4px solid #0f0;
        }
      </style>
    </head>
    <body>
      <h1>🚀 XRPL SMS Server Operational!</h1>
      
      <div class="info">
        <strong>📱 Twilio Number:</strong> ${process.env.TWILIO_PHONE_NUMBER}
      </div>
      
      <h2>📡 Available Endpoints:</h2>
      
      <div class="endpoint">
        <strong>POST /sms/receive</strong><br>
        Twilio webhook to receive SMS<br>
        Supports: Single Signed TX (hex/json) OR Claim TX (TX1|TX2)
      </div>
      
      <h2>📊 Recent Status:</h2>
      <p>Server running since: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// -------------------------------
// 🚀 LAUNCH SERVER
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server started on http://localhost:${PORT}`);
  console.log(`📱 Twilio Number: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`\n💡 Ready to receive signed transactions via SMS!\n`);
});

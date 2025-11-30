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
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

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
    xrpl_address: "rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J"
  }
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
    // Detect if it's a signed transaction (JSON or raw hexa)
    const isHexTx = body.trim().match(/^[0-9A-Fa-f]{100,}$/);
    const isJsonTx = body.trim().startsWith("{") || body.includes("tx_blob");
    
    if (isHexTx || isJsonTx) {
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
        body: `Payment failed: ${msg.slice(0, 100)}`
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
// 🔐 Signed transaction handler
// -------------------------------
async function handleSignedTransaction(from: string, body: string) {
  console.log("🔐 Signed transaction detected");

  let signedTxBlob: string;

  try {
    if (body.includes("tx_blob")) {
      const parsed = JSON.parse(body);
      signedTxBlob = parsed.tx_blob;
    } else {
      signedTxBlob = body.trim();
    }
  } catch {
    signedTxBlob = body.trim();
  }

  console.log("📦 tx_blob:", signedTxBlob.slice(0, 50), "...");

  // Connect to XRPL
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL testnet");

  // Broadcast transaction
  console.log("📤 Broadcasting transaction...");
  const result = await client.submit(signedTxBlob);
  await client.disconnect();

  console.log("📊 Result:", result.result.engine_result);

  if (
    result.result.engine_result === "tesSUCCESS" ||
    result.result.engine_result === "terQUEUED"
  ) {
    const hash = result.result.tx_json.hash || "N/A";
    console.log("✅ Transaction successfully broadcast!");
    console.log("🔗 Hash:", hash);

    // ✅ SHORT confirmation SMS (under 160 chars)
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
      body: `Payment confirmed! TX: ${hash.slice(0, 12)}`
    });

    console.log("📨 Confirmation SMS sent");

  } else {
    throw new Error(`Broadcast failed: ${result.result.engine_result}`);
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

  // For now, we only handle signed transactions
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
    pair: "NGN/USD"
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
      
      <div class="info">
        <strong>👤 Configured User:</strong> +33759687877
      </div>
      
      <div class="info">
        <strong>💳 Wallet:</strong> rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J
      </div>
      
      <h2>📡 Available Endpoints:</h2>
      
      <div class="endpoint">
        <strong>GET /price</strong><br>
        Returns NGN/USD conversion rate
      </div>
      
      <div class="endpoint">
        <strong>POST /sms/receive</strong><br>
        Twilio webhook to receive SMS<br>
        (configured automatically)
      </div>
      
      <h2>💡 To test:</h2>
      <p>Send an SMS to <strong>${process.env.TWILIO_PHONE_NUMBER}</strong></p>
      <p>Format: A signed XRPL transaction (tx_blob)</p>
      
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
  console.log(`👤 Configured User: +33759687877`);
  console.log(`💳 Wallet: rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J`);
  console.log(`\n💡 Ready to receive signed transactions via SMS!\n`);
});

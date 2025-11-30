import * as xrpl from "xrpl";

// ---------------------------------------------------------
// 📝 Replace this string with your actual signed transaction blob (hex)
// ---------------------------------------------------------
const SIGNED_TX_BLOB =
  "12000022000000002400C2F920201B00C3457E6140000000002DC6C068400000000000000C7321ED425294A1D110D59CEAC368DC07A01B6C99FA339884483A8EE4BF19317128C8ED744026143A144547ACD07E0E60E066AE799D5245F2CD8903D55B78D0F6CA08B8FB87BFAA6C2C08D39ACD33E5DB4A425DB20F24BF242A0075DD6E5D452C3D5468300F81144ADBB43B1D50FE6E2CDB3BE9B140B3A2597D079083147F8F88F94328DC66F2821DA56763096EA8A1F34A|1200152400000001201B00C3463A68400000000000000A7321ED227DEA27DA4F8338CB283D9D2CE93F2864B3B3A209B721A2165EF7E2F30ACBF3744013316203620E5CE3214D214A52F80F7D25AC8E4998ABA325FED622F1EABC41788CA181EB13B3B23D170CBF2C53F2A9C2D7DE45998B9930823BC3DEE74B01830C81147F8F88F94328DC66F2821DA56763096EA8A1F34A83144ADBB43B1D50FE6E2CDB3BE9B140B3A2597D0790";

async function main() {
  console.log("🚀 Connecting to XRPL Testnet...");

  // Connect to same testnet as server.ts
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  try {
    if (SIGNED_TX_BLOB.includes("|")) {
      console.log("🎁 Claim transaction detected (Double TX)");
      const parts = SIGNED_TX_BLOB.split("|");
      const tx1Blob = parts[0].trim();
      const tx2Blob = parts[1].trim();

      // Submit 1st Transaction
      console.log("\n1️⃣ Submitting TX 1 (Funding)...");
      const result1 = await client.submitAndWait(tx1Blob);
      printResult(result1, "TX1");

      // Submit 2nd Transaction
      console.log("\n2️⃣ Submitting TX 2 (Claim/Sweep)...");
      const result2 = await client.submitAndWait(tx2Blob);
      printResult(result2, "TX2");
    } else {
      // Single Signed TX
      console.log("📤 Submitting transaction...");
      const result = await client.submitAndWait(SIGNED_TX_BLOB);
      printResult(result, "TX");
    }
  } catch (error) {
    console.error("❌ Error submitting transaction:", error);
  } finally {
    await client.disconnect();
    console.log("\n👋 Disconnected.");
  }
}

function printResult(result: any, label: string) {
  const engineResult = (result.result.meta as any)?.TransactionResult || (result.result as any).engine_result;
  const hash = result.result.hash;

  if (engineResult === "tesSUCCESS") {
    console.log(`✅ [${label}] Success! Hash: ${hash}`);
    console.log(`   Explorer: https://testnet.xrpl.org/transactions/${hash}`);
  } else {
    console.error(`❌ [${label}] Failed with code: ${engineResult}`);
    console.log("   Full Result:", JSON.stringify(result.result, null, 2));
  }
}

main();

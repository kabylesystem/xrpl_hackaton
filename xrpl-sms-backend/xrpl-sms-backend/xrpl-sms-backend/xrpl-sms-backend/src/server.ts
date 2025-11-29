import express, { Request, Response } from 'express';
import twilio from 'twilio';
import * as xrpl from 'xrpl';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));

// Types
interface User {
  xrpl_address: string;
}

interface UserDatabase {
  [phone: string]: User;
}

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Base de données utilisateurs
// ⚠️ On stocke SEULEMENT l'adresse (pas la seed, c'est l'app qui signe)
const users: UserDatabase = {
  '+33759687877': {
    xrpl_address: 'rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J'
  }
};

// Oracle NGN/USD (simulé)
function getNGNRate(): number {
  return 1600; // 1 USD = 1600 NGN
}

// 🎯 ENDPOINT 1 : Paiement classique (serveur signe)
// Pour les cas où l'utilisateur a Internet et veut que le serveur gère tout
app.post('/sms/receive', async (req: Request, res: Response): Promise<void> => {
  const from: string = req.body.From;
  const body: string = req.body.Body;

  console.log(`\n📨 SMS reçu de ${from}: "${body}"`);

  try {
    // Détecte si c'est une transaction signée ou un montant simple
    if (body.trim().startsWith('{') || body.includes('tx_blob')) {
      // C'est une transaction signée → on la diffuse
      await handleSignedTransaction(from, body);
    } else {
      // C'est un montant simple → on traite normalement
      await handleSimplePayment(from, body);
    }

    res.send('<Response></Response>');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ ERREUR:', errorMessage);

    try {
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: from,
        body: `❌ Paiement échoué:\n${errorMessage.slice(0, 100)}`
      });
    } catch (smsError) {
      console.error('❌ Impossible d\'envoyer le SMS d\'erreur:', smsError);
    }

    res.send('<Response></Response>');
  }
});

// 🔥 FONCTION : Diffuser une transaction déjà signée (envoyée par l'app)
async function handleSignedTransaction(from: string, body: string): Promise<void> {
  console.log('🔐 Transaction signée détectée');

  // Parse le tx_blob depuis le SMS
  let signedTxBlob: string;
  
  try {
    // Format attendu: soit JSON, soit juste le tx_blob
    if (body.includes('tx_blob')) {
      const parsed = JSON.parse(body);
      signedTxBlob = parsed.tx_blob;
    } else {
      signedTxBlob = body.trim();
    }
  } catch {
    signedTxBlob = body.trim();
  }

  console.log('📦 tx_blob:', signedTxBlob.slice(0, 50) + '...');

  // Connexion au testnet
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log('✅ Connecté au testnet');

  // DIFFUSION de la transaction (sans re-signer)
  console.log('📤 Diffusion de la transaction...');
  const result = await client.submit(signedTxBlob);

  await client.disconnect();

  if (result.result.engine_result === 'tesSUCCESS' || 
      result.result.engine_result === 'terQUEUED') {
    
    const hash = result.result.tx_json.hash || 'N/A';
    console.log(`✅ Transaction diffusée! Hash: ${hash}`);

    // Confirmation SMS
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: from,
      body: `✅ Paiement diffusé avec succès!\nTX: ${hash.slice(0, 12)}...`
    });

    console.log('📨 SMS de confirmation envoyé');
  } else {
    throw new Error(`Diffusion échouée: ${result.result.engine_result}`);
  }
}

// 🔥 FONCTION : Paiement simple (le serveur gère tout)
async function handleSimplePayment(from: string, body: string): Promise<void> {
  // Parse le montant
  const match = body.match(/PAY\s+(\d+)/i);
  if (!match) {
    throw new Error('Format invalide. Utilise: PAY [montant]');
  }
  const amountNGN: number = parseInt(match[1]);

  console.log(`💰 Montant demandé: ${amountNGN} NGN`);

  // Conversion NGN → XRP
  const rate: number = getNGNRate();
  const amountXRP: string = (amountNGN / rate / 100).toFixed(6);
  
  console.log(`💱 Conversion: ${amountNGN} NGN = ${amountXRP} XRP (taux: ${rate})`);

  // Récupération utilisateur
  const user = users[from];
  if (!user) {
    throw new Error(`Utilisateur non enregistré. Numéro: ${from}`);
  }

  console.log(`👤 Wallet: ${user.xrpl_address}`);

  // ⚠️ PROBLÈME : On n'a pas la seed ici !
  // Cette fonction ne marchera que si tu stockes aussi les seeds
  // OU si tu utilises un wallet "serveur" qui envoie l'argent
  
  throw new Error('Mode "PAY simple" nécessite que l\'app signe la transaction');
}

// Route de test
app.get('/', (req: Request, res: Response) => {
  res.send(`
    🚀 Serveur SMS XRPL opérationnel!
    
    📱 Numéro configuré: ${process.env.TWILIO_PHONE_NUMBER}
    
    💡 Formats acceptés:
    - Transaction signée (JSON avec tx_blob)
    - Transaction signée (tx_blob brut)
    
    ⚠️ Le mode "PAY 1200" simple nécessite que l'app signe
  `);
});

// 🆕 ENDPOINT : Obtenir le taux de conversion (pour l'app)
app.get('/price', (req: Request, res: Response) => {
  const rate = getNGNRate();
  res.json({
    rate: rate,
    timestamp: new Date().toISOString(),
    pair: 'NGN/USD'
  });
});

// Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🌍 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📱 Numéro Twilio: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`👤 Utilisateur configuré: +33759687888`);
  console.log(`💳 Wallet: rsGQHatLEmGzgjvYksFEyV3UkEi61Low5J`);
  console.log(`\n💡 Prêt à recevoir des transactions signées par SMS!\n`);
});

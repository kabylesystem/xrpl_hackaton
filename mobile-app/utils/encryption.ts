import CryptoJS from "crypto-js";

// AES parameters
const IV_LENGTH = 16; // AES block size is 128 bits (16 bytes)
const SALT_LENGTH = 16; // For PBKDF2 salt

// Utility: encode as base64 (for WordArray)
function toBase64WA(wordArray: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(wordArray);
}
// Utility: decode base64 to WordArray
function fromBase64WA(b64: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Base64.parse(b64);
}

// Utility: generate random WordArray
function randomWordArray(nBytes: number): CryptoJS.lib.WordArray {
  return CryptoJS.lib.WordArray.random(nBytes);
}

/**
 * Derive a key from password and salt using PBKDF2.
 */
function deriveKey(password: string, salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 100000, hasher: CryptoJS.algo.SHA256 });
}

/**
 * Format: base64(salt):base64(iv):base64(ciphertext)
 * (GCM is not officially supported in crypto-js; AES in CBC mode is used here as fallback)
 */
export const encrypt = (text: string, password: string): string => {
  const salt = randomWordArray(SALT_LENGTH);
  const iv = randomWordArray(IV_LENGTH);

  const key = deriveKey(password, salt);

  // AES encrypt (CBC mode by default), using key and IV
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  // outputs: salt:iv:ciphertext (all base64)
  return [toBase64WA(salt), toBase64WA(iv), encrypted.ciphertext.toString(CryptoJS.enc.Base64)].join(":");
};

export const decrypt = (data: string, password: string): string => {
  const [saltB64, ivB64, cipherB64] = data.split(":");
  if (!saltB64 || !ivB64 || !cipherB64) throw new Error("Invalid cipher format");

  const salt = fromBase64WA(saltB64);
  const iv = fromBase64WA(ivB64);
  const ciphertext = fromBase64WA(cipherB64);

  const key = deriveKey(password, salt);

  // Recreate CipherParams object
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext,
  });

  // AES decrypt (CBC mode by default), using key and IV
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

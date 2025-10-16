/* GhostVault cryptography utilities using Web Crypto API (AES-GCM + PBKDF2)
   All operations are performed locally in the browser.
*/

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export type VaultPayload = {
  v: 1;
  salt: string; // base64
  iv: string; // base64
  cipher: string; // base64
  ts: number; // timestamp (ms)
};

// Robust base64 helpers (avoid spreading large arrays)
function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    let chunkStr = "";
    for (let j = 0; j < chunk.length; j++)
      chunkStr += String.fromCharCode(chunk[j]);
    binary += chunkStr;
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export function generatePassphrase(length = 20): string {
  const charset =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+"; // no visually ambiguous chars
  const rnd = new Uint32Array(length);
  crypto.getRandomValues(rnd);
  let out = "";
  for (let i = 0; i < length; i++) out += charset[rnd[i] % charset.length];
  return out;
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  try {
    const passBytes = textEncoder.encode(passphrase);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );
    const derived = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt.buffer ?? salt,
        iterations: 250_000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    return derived;
  } catch (err) {
    console.error("deriveKey failed:", err);
    throw new Error("Key derivation failed");
  }
}

export async function encryptText(
  plaintext: string,
  passphrase: string,
): Promise<VaultPayload> {
  try {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    console.log("encryptText: deriving key...");
    const key = await deriveKey(passphrase, salt);
    const data = textEncoder.encode(plaintext);
    console.log(
      "encryptText: encrypting, iv length",
      iv.length,
      "data len",
      data.length,
    );
    const cipherBuf = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer ?? iv },
      key,
      data,
    );
    console.log(
      "encryptText: encryption completed, cipher size",
      (cipherBuf as ArrayBuffer).byteLength,
    );

    const payload: VaultPayload = {
      v: 1,
      salt: toBase64(salt),
      iv: toBase64(iv),
      cipher: toBase64(cipherBuf),
      ts: Date.now(),
    };
    return payload;
  } catch (err) {
    console.error("encryptText failed:", err);
    throw new Error("Encryption failed");
  }
}

export async function decryptToText(
  payload: VaultPayload,
  passphrase: string,
): Promise<string> {
  try {
    const salt = fromBase64(payload.salt);
    const iv = fromBase64(payload.iv);
    console.log("decryptToText: deriving key with salt len", salt.length);
    const key = await deriveKey(passphrase, salt);
    const cipherBytes = fromBase64(payload.cipher);
    console.log(
      "decryptToText: decrypting, iv len",
      iv.length,
      "cipher len",
      cipherBytes.length,
    );
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer ?? iv },
      key,
      cipherBytes.buffer ?? cipherBytes,
    );
    const decoded = textDecoder.decode(plainBuf as ArrayBuffer);
    return decoded;
  } catch (err) {
    // Normalize Web Crypto errors to a consistent message
    console.error("Decrypt operation failed:", err);
    throw new Error("Invalid passphrase or corrupted data.");
  }
}

export const VAULT_KEY = "vaultData";

export function loadVault(): VaultPayload | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultPayload;
    if (parsed && parsed.v === 1 && parsed.cipher && parsed.iv && parsed.salt)
      return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveVault(payload: VaultPayload) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(payload));
}

export function clearVault() {
  localStorage.removeItem(VAULT_KEY);
}

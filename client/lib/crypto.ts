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
    for (let j = 0; j < chunk.length; j++) chunkStr += String.fromCharCode(chunk[j]);
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

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const passBytes = textEncoder.encode(passphrase);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(plaintext: string, passphrase: string): Promise<VaultPayload> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await deriveKey(passphrase, salt);
  const data = textEncoder.encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  return {
    v: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipher: toBase64(cipherBuf),
    ts: Date.now(),
  };
}

export async function decryptToText(payload: VaultPayload, passphrase: string): Promise<string> {
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const key = await deriveKey(passphrase, salt);
  const cipherBytes = fromBase64(payload.cipher);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return textDecoder.decode(plainBuf);
}

export const VAULT_KEY = "vaultData";

export function loadVault(): VaultPayload | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultPayload;
    if (parsed && parsed.v === 1 && parsed.cipher && parsed.iv && parsed.salt) return parsed;
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

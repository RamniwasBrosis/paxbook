import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Reversible AES-256-GCM encryption for tenant-supplied third-party secrets
 * (Razorpay key secret, Twilio auth token) — these must be decryptable to make
 * live API calls, unlike passwords (bcrypt, one-way, see password.ts). Keyed by
 * INTEGRATION_ENCRYPTION_KEY; the key is stretched with scrypt so any string
 * length works as input, not just a raw 32-byte value.
 */
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, "paxbook-integration-secrets", 32);
}

export function encryptSecret(plaintext: string, encryptionKey: string): string {
  const key = deriveKey(encryptionKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(ciphertext: string, encryptionKey: string): string {
  const key = deriveKey(encryptionKey);
  const raw = Buffer.from(ciphertext, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = raw.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

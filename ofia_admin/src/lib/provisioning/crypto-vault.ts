import crypto from "crypto";

// 32-byte secret key derivation for AES-256-GCM encryption at rest
const VAULT_SECRET =
  process.env.PROVISIONING_ENCRYPTION_SECRET ||
  process.env.DATABASE_URL ||
  "ofia-secure-infrastructure-vault-default-key-32b";

function getCipherKey(): Buffer {
  return crypto.createHash("sha256").update(VAULT_SECRET).digest();
}

/**
 * Encrypts a sensitive string (e.g. database connection string, Cloudinary API secret)
 * using AES-256-GCM with authentication tag.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", getCipherKey(), iv);
  
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Output format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a previously encrypted secret string.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) {
      // If payload is not in encrypted format (e.g. legacy plain text), return as-is
      return encryptedPayload;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getCipherKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err: any) {
    console.warn("[CryptoVault] Decryption failed:", err.message);
    return encryptedPayload;
  }
}

import "server-only";

import crypto from "crypto";

const IV_LENGTH = 16;

const getEncryptionCreds = () => {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is not defined");

  // Decode from Base64
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, "base64");
  if (keyBuffer.length !== 32)
    throw new Error("ENCRYPTION_KEY must be 32 bytes after Base64 decoding");
  const iv = crypto.randomBytes(IV_LENGTH);

  return {
    keyBuffer,
    iv,
  };
};

export function encryptApiKey(apiKey: string): string {
  const { keyBuffer, iv } = getEncryptionCreds();

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(apiKey, "utf8", "base64");
  encrypted += cipher.final("base64");

  return iv.toString("base64") + ":" + encrypted;
}

export function decryptApiKey(encryptedData: string): string {
  const [ivBase64, encrypted] = encryptedData.split(":");
  if (!ivBase64 || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }

  const { keyBuffer } = getEncryptionCreds();

  if (keyBuffer.length !== 32)
    throw new Error("ENCRYPTION_KEY must be 32 bytes after Base64 decoding");

  const iv = Buffer.from(ivBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

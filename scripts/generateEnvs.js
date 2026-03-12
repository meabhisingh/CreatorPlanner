import crypto from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export const generateEncryptionKey = () => {
  // Generate 32 random bytes
  const keyBuffer = crypto.randomBytes(32);

  // Return Base64-encoded string (safe to store in .env)
  return keyBuffer.toString("base64");
};

const writeEnv = () => {
  const envPath = resolve(process.cwd(), ".env");

  // Generate new AES-256 key
  const newKey = generateEncryptionKey();

  let envContent = "";
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf8");

    // If ENCRYPTION_KEY exists, replace it
    if (/^ENCRYPTION_KEY=.*$/m.test(envContent)) {
      envContent = envContent.replace(
        /^ENCRYPTION_KEY=.*$/m,
        `ENCRYPTION_KEY=${newKey}`,
      );
    } else {
      // Add ENCRYPTION_KEY at the end
      envContent += `\nENCRYPTION_KEY=${newKey}\n`;
    }
  } else {
    // .env doesn't exist → create it with ENCRYPTION_KEY
    envContent = `ENCRYPTION_KEY=${newKey}\n`;
  }

  writeFileSync(envPath, envContent, "utf8");
  console.log(`ENCRYPTION_KEY written to ${envPath}`);
};

writeEnv();

import crypto from "crypto";

const TOKEN_BYTES = 32;
const PREFIX_LENGTH = 6;

function getEncryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Missing TOKEN_ENCRYPTION_KEY env var.");
  }
  const buffer = Buffer.from(key, "base64");
  if (buffer.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes base64.");
  }
  return buffer;
}

export function generatePlainToken() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  return token;
}

export function getTokenPrefix(token: string) {
  return token.slice(0, PREFIX_LENGTH);
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptToken(data: {
  encrypted: string;
  iv: string;
  tag: string;
}) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(data.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(data.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

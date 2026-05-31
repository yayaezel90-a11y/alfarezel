import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function key() {
  return createHash("sha256")
    .update(process.env.JWT_SECRET ?? "development-only-change-me")
    .digest();
}

export function encryptSecret(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(payload: string) {
  const [iv, tag, encrypted] = payload.split(":").map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function maskSecret(value?: string | null) {
  if (!value) return null;
  return "Data akun tersimpan aman dan hanya bisa dibuka sesuai status transaksi.";
}

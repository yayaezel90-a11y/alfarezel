import bcrypt from "bcryptjs";

const MIN_PASSWORD_LENGTH = 8;

export function assertStrongPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("Password minimal 8 karakter.");
  }
}

export async function hashPassword(password: string) {
  assertStrongPassword(password);
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

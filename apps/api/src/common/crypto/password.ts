import * as bcrypt from "bcryptjs";

/**
 * bcrypt, not argon2 — argon2 requires a native compiler toolchain (node-gyp +
 * gcc/Python) that isn't available on typical shared cPanel hosting (CageFS
 * strips compilers for security). bcryptjs is pure JS, so it runs unmodified
 * on any host. Cost factor 12 matches current OWASP guidance.
 */
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

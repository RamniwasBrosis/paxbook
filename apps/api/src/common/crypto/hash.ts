import { createHash } from "node:crypto";

/**
 * Fast SHA-256 for lookup tokens (refresh tokens) — these are already
 * high-entropy random values, not low-entropy secrets, so a slow KDF like
 * bcrypt (reserved for passwords, see password.ts) would be unnecessary overhead on every
 * silent-refresh call.
 */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

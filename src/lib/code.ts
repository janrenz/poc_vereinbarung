import crypto from "crypto";

/**
 * Generate a cryptographically secure access code
 * Uses crypto.randomBytes instead of Math.random for security
 */
export function generateAccessCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }

  return result;
}

/**
 * Hash an access code for storage
 * Use SHA-256 with a pepper for secure storage
 */
export function hashAccessCode(code: string): string {
  const pepper = process.env.ACCESS_CODE_PEPPER || "default-pepper-change-this";
  return crypto
    .createHash("sha256")
    .update(code.toUpperCase() + pepper)
    .digest("hex");
}

/**
 * Verify an access code against a hash
 */
export function verifyAccessCode(code: string, hash: string): boolean {
  return hashAccessCode(code) === hash;
}



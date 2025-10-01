import { prisma } from "./prisma";
import crypto from "crypto";

// Generate a secure random token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create a password reset token
export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify a reset token
export async function verifyResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return null; // Token not found
  }

  if (resetToken.usedAt) {
    return null; // Token already used
  }

  if (resetToken.expiresAt < new Date()) {
    return null; // Token expired
  }

  return resetToken.email;
}

// Mark token as used
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

// Clean up expired tokens (can be called periodically)
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } },
      ],
    },
  });
  return result.count;
}




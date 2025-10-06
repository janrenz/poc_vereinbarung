#!/usr/bin/env tsx
/**
 * Test script for password reset functionality
 * Usage: tsx scripts/test-password-reset.ts <email>
 */

import { prisma } from "../src/lib/prisma";

async function testPasswordReset(email: string) {
  console.log("🔍 Testing password reset for:", email);
  console.log("");

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    console.log("❌ User not found");
    return;
  }

  console.log("✅ User found:");
  console.log("   - ID:", user.id);
  console.log("   - Email:", user.email);
  console.log("   - Name:", user.name || "(not set)");
  console.log("   - Active:", user.active);
  console.log("   - Email Verified:", user.emailVerified);
  console.log("");

  // Check for existing reset tokens
  const tokens = await prisma.passwordResetToken.findMany({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
  });

  if (tokens.length === 0) {
    console.log("ℹ️  No password reset tokens found");
  } else {
    console.log(`📧 Found ${tokens.length} password reset token(s):`);
    tokens.forEach((token, i) => {
      console.log(`   ${i + 1}. Created: ${token.createdAt.toISOString()}`);
      console.log(`      Expires: ${token.expiresAt.toISOString()}`);
      console.log(`      Used: ${token.usedAt ? token.usedAt.toISOString() : "No"}`);
      console.log(`      Token: ${token.token.substring(0, 10)}...`);
      const isExpired = token.expiresAt < new Date();
      const isUsed = !!token.usedAt;
      console.log(`      Status: ${isUsed ? "USED" : isExpired ? "EXPIRED" : "VALID"}`);
    });
  }
  console.log("");

  // Check environment variables
  console.log("🔧 Environment configuration:");
  console.log("   - RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Not set");
  console.log("   - FROM_EMAIL:", process.env.FROM_EMAIL || "(using default: onboarding@resend.dev)");
  console.log("   - NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  console.log("");

  if (!user.active) {
    console.log("⚠️  WARNING: User is not active - password reset will not be sent");
  }

  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️  WARNING: RESEND_API_KEY not set - emails will only be logged to console");
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: tsx scripts/test-password-reset.ts <email>");
  process.exit(1);
}

testPasswordReset(email)
  .then(() => {
    console.log("✅ Test complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

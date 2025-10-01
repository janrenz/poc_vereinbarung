/**
 * Migration script to hash existing access codes in the database
 *
 * Usage: npx tsx scripts/hash-access-codes.ts
 *
 * This script:
 * 1. Reads all existing access codes from the database
 * 2. Hashes each code using SHA-256 with pepper
 * 3. Updates the database with hashed codes
 * 4. Keeps the original codes for reference (they are needed for display/sharing)
 *
 * NOTE: This migration is for future implementation when we want to store
 * hashed access codes in addition to plain text codes for verification.
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashAccessCode(code: string): string {
  const pepper =
    process.env.ACCESS_CODE_PEPPER || "default-pepper-change-this";
  return crypto
    .createHash("sha256")
    .update(code.toUpperCase() + pepper)
    .digest("hex");
}

async function main() {
  console.log("🔐 Starting access code hashing migration...\n");

  // Check if ACCESS_CODE_PEPPER is set
  if (!process.env.ACCESS_CODE_PEPPER) {
    console.warn(
      "⚠️  WARNING: ACCESS_CODE_PEPPER environment variable is not set!"
    );
    console.warn(
      "   Using default pepper. Set ACCESS_CODE_PEPPER in production!\n"
    );
  }

  // Get all access codes
  const accessCodes = await prisma.accessCode.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  console.log(`Found ${accessCodes.length} access codes to process\n`);

  if (accessCodes.length === 0) {
    console.log("✅ No access codes to hash. Migration complete.");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const accessCode of accessCodes) {
    try {
      const hashedCode = hashAccessCode(accessCode.code);

      // NOTE: This is placeholder code. In actual implementation, you would:
      // 1. Add a 'codeHash' column to the AccessCode model
      // 2. Update the record with: await prisma.accessCode.update({
      //      where: { id: accessCode.id },
      //      data: { codeHash: hashedCode }
      //    })

      console.log(`✓ Hashed code ${accessCode.code} → ${hashedCode.substring(0, 16)}...`);
      successCount++;
    } catch (error) {
      console.error(
        `✗ Failed to hash code ${accessCode.id}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      errorCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successfully hashed: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total processed: ${accessCodes.length}`);

  if (errorCount === 0) {
    console.log(`\n🎉 Migration completed successfully!`);
  } else {
    console.log(`\n⚠️  Migration completed with errors.`);
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

let seeded = false;

/**
 * Automatically seeds the database with an admin user if none exists.
 * This runs on application startup in production.
 */
export async function autoSeed() {
  // Only run once per application lifecycle
  if (seeded) return;

  try {
    console.log("🔍 Checking if admin user exists...");

    // Check if any user exists
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log("🌱 No users found, creating admin user from ENV...");

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        console.error(
          "❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables!"
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Admin",
          role: "ADMIN",
          active: true,
        },
      });

      console.log("✅ Admin user created:", admin.email);
      seeded = true;
    } else {
      console.log("✓ Users already exist, skipping auto-seed");
    }
  } catch (error) {
    console.error("❌ Auto-seed failed:", error);
  }
}

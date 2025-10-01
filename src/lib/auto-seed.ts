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
      const adminRole = process.env.ADMIN_ROLE || "ADMIN"; // Default to ADMIN, can be set to SUPERADMIN

      if (!adminEmail || !adminPassword) {
        console.error(
          "❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables!"
        );
        return;
      }

      // Validate role
      if (adminRole !== "ADMIN" && adminRole !== "SUPERADMIN") {
        console.error(
          "❌ ADMIN_ROLE must be either ADMIN or SUPERADMIN (got: " +
            adminRole +
            ")"
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminRole === "SUPERADMIN" ? "Super Admin" : "Admin",
          role: adminRole as "ADMIN" | "SUPERADMIN",
          active: true,
        },
      });

      console.log(`✅ ${adminRole} user created:`, admin.email);
      seeded = true;
    } else {
      console.log("✓ Users already exist, skipping auto-seed");
    }
  } catch (error) {
    console.error("❌ Auto-seed failed:", error);
  }
}

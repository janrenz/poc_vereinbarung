import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// SECURITY: Add a secret token to prevent unauthorized access
const SEED_SECRET = process.env.SEED_SECRET || "your-secret-token-here";

export async function POST(request: Request) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${SEED_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🌱 Starting seed via API...");

    // Create admin user from ENV variables
    const adminEmail = process.env.ADMIN_EMAIL || "admin@schulamt.nrw";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedAdminPassword, // Update password if user exists
      },
      create: {
        email: adminEmail,
        password: hashedAdminPassword,
        name: "Admin",
        role: "ADMIN",
        active: true,
      },
    });

    console.log("✓ Admin created/updated:", admin.email);

    return NextResponse.json({
      success: true,
      message: "Seed completed successfully",
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Seed failed:", error);
    return NextResponse.json(
      {
        error: "Seed failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

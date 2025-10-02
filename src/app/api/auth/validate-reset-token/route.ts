import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return NextResponse.json({ error: "Token expired" }, { status: 410 });
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 410 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[VALIDATE_RESET_TOKEN] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

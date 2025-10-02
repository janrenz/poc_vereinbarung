import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token ist erforderlich" },
      { status: 400 }
    );
  }

  try {
    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Ungültiger Token" },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Token abgelaufen" },
        { status: 410 }
      );
    }

    // Check if token was already used
    if (verificationToken.usedAt) {
      return NextResponse.json(
        { error: "Token bereits verwendet" },
        { status: 410 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Update user: verify email and activate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        active: true,
      },
    });

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    // Audit log
    await logAudit({
      action: "USER_UPDATED",
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      success: true,
      metadata: {
        emailVerified: true,
        accountActivated: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "E-Mail erfolgreich bestätigt",
    });
  } catch (error) {
    console.error("[VERIFY_EMAIL] Error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

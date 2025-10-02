import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { ResetPasswordSchema, formatZodErrors } from "@/lib/validation";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(req, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Validate input
    const validation = ResetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      await logAudit({
        action: "PASSWORD_RESET_FAILED",
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: false,
        errorMessage: "Invalid token",
      });

      return NextResponse.json(
        { error: "Ungültiger oder abgelaufener Token." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      await logAudit({
        action: "PASSWORD_RESET_FAILED",
        userEmail: resetToken.email,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: false,
        errorMessage: "Token expired",
      });

      return NextResponse.json(
        { error: "Der Token ist abgelaufen. Bitte fordern Sie einen neuen an." },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      await logAudit({
        action: "PASSWORD_RESET_FAILED",
        userEmail: resetToken.email,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: false,
        errorMessage: "Token already used",
      });

      return NextResponse.json(
        { error: "Dieser Token wurde bereits verwendet." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user || !user.active) {
      await logAudit({
        action: "PASSWORD_RESET_FAILED",
        userEmail: resetToken.email,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: false,
        errorMessage: "User not found or inactive",
      });

      return NextResponse.json(
        { error: "Benutzer nicht gefunden." },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    // Delete all sessions for this user (force re-login)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Audit log
    await logAudit({
      action: "PASSWORD_RESET_SUCCESS",
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: "Passwort erfolgreich geändert.",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD] Error:", error);

    await logAudit({
      action: "PASSWORD_RESET_FAILED",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }
}

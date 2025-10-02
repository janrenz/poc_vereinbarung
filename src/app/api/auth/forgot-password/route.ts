import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, getPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { logAudit } from "@/lib/audit";
import { ForgotPasswordSchema, formatZodErrors } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(req, {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
    message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Validate input
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Always return success to prevent user enumeration
    // But only send email if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.active) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: user.email },
      });

      // Create new token
      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expiresAt,
        },
      });

      // Send email
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${APP_URL}/reset-password?token=${token}`;
      const emailContent = getPasswordResetEmail(resetUrl, user.name || undefined);

      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      // Audit log
      await logAudit({
        action: "PASSWORD_RESET_REQUESTED",
        userId: user.id,
        userEmail: user.email,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: true,
      });
    }

    // Always return success (security: don't reveal if user exists)
    return NextResponse.json({
      success: true,
      message: "Falls ein Konto mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD] Error:", error);

    await logAudit({
      action: "PASSWORD_RESET_REQUESTED",
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

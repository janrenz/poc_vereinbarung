import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, getEmailVerificationEmail } from "@/lib/email";
import { RegisterSchema, formatZodErrors } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(req, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Zu viele Registrierungen. Bitte versuchen Sie es später erneut.",
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Validate input
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { name, schulamtName, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (not yet verified)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        schulamtName,
        role: "ADMIN",
        active: false, // Not active until email verified
        emailVerified: false,
      },
    });

    // Generate email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send verification email
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
    const emailContent = getEmailVerificationEmail(verificationUrl, user.name || undefined, user.schulamtName || undefined);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Audit log
    await logAudit({
      action: "USER_CREATED",
      userId: user.id,
      userEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      success: true,
      metadata: {
        schulamtName,
        emailVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse.",
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    console.error("[REGISTER] Error stack:", error instanceof Error ? error.stack : "No stack");

    await logAudit({
      action: "USER_CREATED",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.", debug: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

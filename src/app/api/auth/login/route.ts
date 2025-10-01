import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { logAudit, getRequestInfo } from "@/lib/audit";
import { LoginSchema, formatZodErrors } from "@/lib/validation";

// Dummy hash for timing attack prevention
const DUMMY_HASH = "$2a$12$" + "x".repeat(53);

export async function POST(req: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(req);

  try {
    // Rate limiting - 5 attempts per 15 minutes
    const rateLimitResponse = rateLimit(req, RateLimits.LOGIN);
    if (rateLimitResponse) {
      await logAudit({
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Rate limit exceeded",
      });
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: formatZodErrors(validation.error),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        active: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    // Always hash password to prevent timing attacks
    const passwordHash = user?.password || DUMMY_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordHash);

    // Check if account is locked
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Account locked",
      });
      return NextResponse.json(
        { error: `Account locked. Try again in ${minutesLeft} minutes.` },
        { status: 403 }
      );
    }

    // Check credentials
    if (!user || !user.active || !isValidPassword) {
      // Increment failed attempts if user exists
      if (user) {
        const failedAttempts = user.failedLoginAttempts + 1;
        const shouldLock = failedAttempts >= 5;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: shouldLock
              ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
              : null,
          },
        });

        await logAudit({
          userId: user.id,
          userEmail: user.email,
          action: "LOGIN_FAILED",
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "Invalid credentials",
          metadata: {
            failedAttempts,
            locked: shouldLock,
          },
        });
      } else {
        await logAudit({
          userEmail: email,
          action: "LOGIN_FAILED",
          ipAddress,
          userAgent,
          success: false,
          errorMessage: "User not found",
        });
      }

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Create secure session
    await createSession(user.id, ipAddress, userAgent);

    // Log successful login
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: "LOGIN",
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    // Log error without exposing details
    console.error("[AUTH] Login error:", error);

    await logAudit({
      action: "LOGIN_FAILED",
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Internal server error",
    });

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


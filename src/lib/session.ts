import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      lastActivityAt: new Date(),
    },
  });

  // Store session token in secure cookie
  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // "lax" allows cookies on top-level navigation (login redirects)
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return token;
}

/**
 * Get current session and validate it
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token");

  if (!sessionToken?.value) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken.value },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          lockedUntil: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if session expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    await clearSessionCookie();
    return null;
  }

  // Check if user account is locked
  if (session.user.lockedUntil && session.user.lockedUntil > new Date()) {
    return null;
  }

  // Check if user is inactive
  if (!session.user.active) {
    return null;
  }

  // Check activity timeout (30 minutes of inactivity)
  const inactiveFor = Date.now() - session.lastActivityAt.getTime();
  if (inactiveFor > ACTIVITY_TIMEOUT) {
    await prisma.session.delete({ where: { id: session.id } });
    await clearSessionCookie();
    return null;
  }

  // Update last activity time
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  });

  return session;
}

/**
 * Delete a session
 */
export async function deleteSession(token: string) {
  await prisma.session.deleteMany({
    where: { token },
  });
  await clearSessionCookie();
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session-token");
  // Also delete old cookies for backwards compatibility
  cookieStore.delete("auth-token");
  cookieStore.delete("user-id");
}

/**
 * Cleanup expired sessions (call from a cron job)
 */
export async function cleanupExpiredSessions() {
  const deleted = await prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          lastActivityAt: {
            lt: new Date(Date.now() - ACTIVITY_TIMEOUT),
          },
        },
      ],
    },
  });
  return deleted.count;
}

import { prisma } from "./prisma";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "FORM_CREATED"
  | "FORM_CREATE_FAILED"
  | "FORM_UPDATED"
  | "FORM_APPROVED"
  | "FORM_APPROVE_FAILED"
  | "FORM_RETURNED"
  | "FORM_RETURN_FAILED"
  | "FORM_EXPORTED"
  | "FORM_EXPORT_FAILED"
  | "FORM_DELETED"
  | "ENTRY_CREATED"
  | "ENTRY_CREATE_FAILED"
  | "ENTRY_UPDATED"
  | "ENTRY_UPDATE_FAILED"
  | "ENTRY_DELETED"
  | "ENTRY_DELETE_FAILED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ACCESS_CODE_USED"
  | "SCHOOL_SEARCH"
  | "SCHOOL_SEARCH_FAILED"
  | "UNAUTHORIZED_ACCESS";

/**
 * Log an audit event
 */
export async function logAudit({
  userId,
  userEmail,
  action,
  resourceType,
  resourceId,
  ipAddress,
  userAgent,
  metadata,
  success = true,
  errorMessage,
}: {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail: userEmail ? sanitizeEmail(userEmail) : undefined,
        action,
        resourceType,
        resourceId,
        ipAddress: ipAddress ? sanitizeIp(ipAddress) : undefined,
        userAgent: userAgent ? sanitizeUserAgent(userAgent) : undefined,
        metadata: metadata ? (JSON.parse(JSON.stringify(sanitizeMetadata(metadata))) as Prisma.InputJsonValue) : undefined,
        success,
        errorMessage,
      },
    });
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error("[AUDIT] Failed to log audit event:", error);
  }
}

/**
 * Extract IP and User-Agent from Next.js request
 */
export function getRequestInfo(req: NextRequest | Request) {
  // Get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  // Extract first IP from x-forwarded-for (can be comma-separated)
  const ipAddress = forwarded?.split(",")[0].trim() || realIp || "unknown";
  const userAgent = req.headers.get("user-agent");

  return {
    ipAddress,
    userAgent: userAgent || "unknown",
  };
}

/**
 * Sanitize email for logging (keep domain, mask local part)
 */
function sanitizeEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const local = parts[0];
  const domain = parts[1];
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}

/**
 * Sanitize IP address (keep first 2 octets for IPv4, first 4 groups for IPv6)
 */
function sanitizeIp(ip: string): string {
  if (ip.includes(":")) {
    // IPv6
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":***";
  } else {
    // IPv4
    const parts = ip.split(".");
    return parts.slice(0, 2).join(".") + ".***";
  }
}

/**
 * Sanitize User-Agent (remove version numbers)
 */
function sanitizeUserAgent(ua: string): string {
  return ua.substring(0, 200); // Truncate to 200 chars
}

/**
 * Sanitize metadata to remove sensitive data
 */
function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = { ...metadata };

  // Remove sensitive keys
  const sensitiveKeys = [
    "password",
    "token",
    "accessCode",
    "secret",
    "apiKey",
    "authorization",
  ];

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = "***REDACTED***";
    }
  }

  return sanitized;
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50,
  offset = 0
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

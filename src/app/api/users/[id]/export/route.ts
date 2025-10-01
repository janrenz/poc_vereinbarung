import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { logAudit, getRequestInfo } from "@/lib/audit";

/**
 * GDPR Data Export Endpoint
 * Allows users to export all their personal data
 * Requires authentication and authorization
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const { id } = await context.params;

  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    await logAudit({
      action: "UNAUTHORIZED_ACCESS",
      resourceType: "User",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Unauthorized data export attempt",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResponse = rateLimit(req, RateLimits.EXPORT);
  if (rateLimitResponse) {
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "UNAUTHORIZED_ACCESS",
      resourceType: "User",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Rate limit exceeded",
    });
    return rateLimitResponse;
  }

  // Authorization: User can only export their own data, unless they're a superadmin
  const isSuperAdminUser = await isSuperAdmin();
  if (currentUser.id !== id && !isSuperAdminUser) {
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "UNAUTHORIZED_ACCESS",
      resourceType: "User",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Attempted to export another user's data",
    });
    return NextResponse.json(
      { error: "Forbidden: You can only export your own data" },
      { status: 403 }
    );
  }

  try {
    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        forms: {
          include: {
            school: true,
            entries: true,
            comments: true,
            accessCode: true,
          },
        },
        sessions: {
          select: {
            id: true,
            createdAt: true,
            lastActivityAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
      },
    });

    if (!user) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "UNAUTHORIZED_ACCESS",
        resourceType: "User",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "User not found",
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get audit logs for the user
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to last 1000 logs
    });

    // Prepare export data (exclude sensitive fields)
    const exportData = {
      exportDate: new Date().toISOString(),
      exportRequestedBy: currentUser.email,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
      forms: user.forms.map((form) => ({
        id: form.id,
        title: form.title,
        status: form.status,
        schoolName: form.school.name,
        schoolAddress: form.school.address,
        schoolCity: form.school.city,
        date: form.date,
        createdAt: form.createdAt,
        submittedAt: form.submittedAt,
        approvedAt: form.approvedAt,
        accessCode: form.accessCode?.code,
        entriesCount: form.entries.length,
        entries: form.entries.map((entry) => ({
          id: entry.id,
          title: entry.title,
          zielsetzungenText: entry.zielsetzungenText,
          zielbereich1: entry.zielbereich1,
          zielbereich2: entry.zielbereich2,
          zielbereich3: entry.zielbereich3,
          datengrundlage: entry.datengrundlage,
          datengrundlageAndere: entry.datengrundlageAndere,
          zielgruppe: entry.zielgruppe,
          zielgruppeSusDetail: entry.zielgruppeSusDetail,
          massnahmen: entry.massnahmen,
          indikatoren: entry.indikatoren,
          verantwortlich: entry.verantwortlich,
          beteiligt: entry.beteiligt,
          beginnSchuljahr: entry.beginnSchuljahr,
          beginnHalbjahr: entry.beginnHalbjahr,
          endeSchuljahr: entry.endeSchuljahr,
          endeHalbjahr: entry.endeHalbjahr,
          fortbildungJa: entry.fortbildungJa,
          fortbildungThemen: entry.fortbildungThemen,
          fortbildungZielgruppe: entry.fortbildungZielgruppe,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })),
        comments: form.comments.map((comment) => ({
          id: comment.id,
          message: comment.message,
          authorRole: comment.authorRole,
          authorName: comment.authorName,
          createdAt: comment.createdAt,
        })),
      })),
      sessions: user.sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })),
      auditLogs: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        createdAt: log.createdAt,
        success: log.success,
        errorMessage: log.errorMessage,
        metadata: log.metadata,
      })),
      statistics: {
        totalForms: user.forms.length,
        draftForms: user.forms.filter((f) => f.status === "DRAFT").length,
        submittedForms: user.forms.filter((f) => f.status === "SUBMITTED").length,
        approvedForms: user.forms.filter((f) => f.status === "APPROVED").length,
        returnedForms: user.forms.filter((f) => f.status === "RETURNED").length,
        totalEntries: user.forms.reduce((sum, f) => sum + f.entries.length, 0),
        activeSessions: user.sessions.length,
        auditLogCount: auditLogs.length,
      },
    };

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "USER_UPDATED",
      resourceType: "User",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        action: "data_export",
        dataSize: JSON.stringify(exportData).length,
      },
    });

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=user-data-export-${id}-${new Date().toISOString().split("T")[0]}.json`,
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "UNAUTHORIZED_ACCESS",
      resourceType: "User",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
}

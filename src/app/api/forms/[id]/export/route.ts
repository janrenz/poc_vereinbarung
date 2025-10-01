import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { logAudit, getRequestInfo } from "@/lib/audit";

function toCsv(rows: Array<Record<string, string | number | boolean>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number | boolean) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

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
      action: "FORM_EXPORT_FAILED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Unauthorized",
    });
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Rate limiting
  const rateLimitResponse = rateLimit(req, RateLimits.FORM_ADMIN_ACTION);
  if (rateLimitResponse) {
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_EXPORT_FAILED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Rate limit exceeded",
    });
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "json").toLowerCase();

    // Input validation
    if (!["json", "csv"].includes(format)) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_EXPORT_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Invalid format parameter",
      });
      return NextResponse.json(
        { error: "Invalid format. Use 'json' or 'csv'" },
        { status: 400 }
      );
    }

    const form = await prisma.form.findUnique({
      where: { id },
      include: { school: true, comments: true, accessCode: true, entries: true },
    });

    if (!form) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_EXPORT_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Form not found",
      });
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check authorization: user must be the creator of the form
    if (form.createdById !== currentUser.id) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_EXPORT_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Forbidden: not form creator",
      });
      return NextResponse.json(
        { error: "Forbidden: You can only export forms you created" },
        { status: 403 }
      );
    }

    const flat = {
      id: form.id,
      status: form.status,
      schoolName: form.school.name,
      schoolCity: form.school.city ?? "",
      date: form.date?.toISOString() ?? "",
      submittedAt: form.submittedAt?.toISOString() ?? "",
      approvedAt: form.approvedAt?.toISOString() ?? "",
      entriesCount: form.entries.length.toString(),
    };

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_EXPORTED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        format,
        schoolId: form.schoolId,
        schoolName: form.school.name,
        entriesCount: form.entries.length,
      },
    });

    if (format === "csv") {
      const csv = toCsv([flat]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=form_${form.id}.csv`,
        },
      });
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error exporting form:", error);
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_EXPORT_FAILED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to export form" },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { logAudit, getRequestInfo } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const { id } = await context.params;

  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    await logAudit({
      action: "FORM_APPROVE_FAILED",
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
      action: "FORM_APPROVE_FAILED",
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
    // Check authorization: user must be the creator of the form
    const form = await prisma.form.findUnique({
      where: { id },
      include: { school: true },
    });

    if (!form) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_APPROVE_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Form not found",
      });
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    if (form.createdById !== currentUser.id) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_APPROVE_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Forbidden: not form creator",
      });
      return NextResponse.json(
        { error: "Forbidden: You can only approve forms you created" },
        { status: 403 }
      );
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date() },
      include: { school: true },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_APPROVED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        schoolId: form.schoolId,
        schoolName: form.school.name,
      },
    });

    return NextResponse.json({ form: updatedForm });
  } catch (error) {
    console.error("Error approving form:", error);
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_APPROVE_FAILED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to approve form" },
      { status: 500 }
    );
  }
}



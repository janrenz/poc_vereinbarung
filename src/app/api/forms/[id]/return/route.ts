import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { FormReturnSchema } from "@/lib/validation";
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
      action: "FORM_RETURN_FAILED",
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
      action: "FORM_RETURN_FAILED",
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
    const body = await req.json();

    // Zod validation for message
    const validation = FormReturnSchema.safeParse(body);
    if (!validation.success) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_RETURN_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Validation failed",
        metadata: { errors: validation.error.format() },
      });
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { message } = validation.data;

    // Check authorization: user must be the creator of the form
    const form = await prisma.form.findUnique({
      where: { id },
      include: { school: true },
    });

    if (!form) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_RETURN_FAILED",
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
        action: "FORM_RETURN_FAILED",
        resourceType: "Form",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Forbidden: not form creator",
      });
      return NextResponse.json(
        { error: "Forbidden: You can only return forms you created" },
        { status: 403 }
      );
    }

    const updatedForm = await prisma.form.update({
      where: { id },
      data: { status: "RETURNED" },
      include: { school: true },
    });

    await prisma.comment.create({
      data: {
        formId: id,
        authorRole: "SCHULAMT",
        authorName: "Schulamt",
        message,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_RETURNED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        schoolId: form.schoolId,
        schoolName: form.school.name,
        commentLength: message.length,
      },
    });

    return NextResponse.json({ form: updatedForm });
  } catch (error) {
    console.error("Error returning form:", error);
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_RETURN_FAILED",
      resourceType: "Form",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to return form" },
      { status: 500 }
    );
  }
}



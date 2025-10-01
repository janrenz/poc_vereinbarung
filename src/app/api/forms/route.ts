import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessCode } from "@/lib/code";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { CreateFormSchema } from "@/lib/validation";
import { logAudit, getRequestInfo } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(req);

  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    await logAudit({
      action: "FORM_CREATE_FAILED",
      resourceType: "Form",
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
      action: "FORM_CREATE_FAILED",
      resourceType: "Form",
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Rate limit exceeded",
    });
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Zod validation
    const validation = CreateFormSchema.safeParse(body);
    if (!validation.success) {
      await logAudit({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "FORM_CREATE_FAILED",
        resourceType: "Form",
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

    const { school, title } = validation.data;

    const dbSchool = await prisma.school.upsert({
      where: { externalId: school.externalId },
      update: {
        schoolNumber: school.schoolNumber ?? null,
        name: school.name,
        address: school.address ?? null,
        city: school.city ?? null,
        state: school.state ?? null,
      },
      create: {
        externalId: school.externalId,
        schoolNumber: school.schoolNumber ?? null,
        name: school.name,
        address: school.address ?? null,
        city: school.city ?? null,
        state: school.state ?? null,
      },
    });

    // Generate a unique access code
    let code = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateAccessCode(8);
      const exists = await prisma.accessCode.findUnique({ where: { code: candidate } });
      if (!exists) {
        code = candidate;
        break;
      }
    }
    if (!code) code = generateAccessCode(10);

    const form = await prisma.form.create({
      data: {
        schoolId: dbSchool.id,
        createdById: currentUser.id,
        title: title ?? null,
        date: new Date(),
        accessCode: { create: { code } },
      },
      include: { accessCode: true, school: true },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_CREATED",
      resourceType: "Form",
      resourceId: form.id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        schoolId: dbSchool.id,
        schoolName: dbSchool.name,
        accessCode: code,
      },
    });

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error creating form:", error);
    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "FORM_CREATE_FAILED",
      resourceType: "Form",
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}



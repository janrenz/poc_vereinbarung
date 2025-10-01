import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { CreateEntrySchema } from "@/lib/validation";
import { logAudit, getRequestInfo } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(req);

  // Rate limiting
  const rateLimitResponse = rateLimit(req, RateLimits.ENTRY_SAVE);
  if (rateLimitResponse) {
    await logAudit({
      action: "ENTRY_CREATE_FAILED",
      resourceType: "Entry",
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Rate limit exceeded",
    });
    return rateLimitResponse;
  }

  try {
    // Get access code from header
    const accessCode = req.headers.get('x-access-code');

    if (!accessCode) {
      await logAudit({
        action: "ENTRY_CREATE_FAILED",
        resourceType: "Entry",
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Missing access code",
      });
      return NextResponse.json(
        { error: "Access code required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Zod validation
    const validation = CreateEntrySchema.safeParse(body);
    if (!validation.success) {
      await logAudit({
        action: "ENTRY_CREATE_FAILED",
        resourceType: "Entry",
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

    const { formId, ...entryData } = validation.data;

    // Verify form exists AND user has access via access code
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        accessCode: true,
      },
    });

    if (!form) {
      await logAudit({
        action: "ENTRY_CREATE_FAILED",
        resourceType: "Entry",
        resourceId: formId,
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

    // Verify access code matches
    if (form.accessCode?.code !== accessCode.toUpperCase()) {
      await logAudit({
        action: "ENTRY_CREATE_FAILED",
        resourceType: "Entry",
        resourceId: formId,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Invalid access code",
      });
      return NextResponse.json(
        { error: "Invalid access code for this form" },
        { status: 403 }
      );
    }

    // Verify form is not already submitted/approved (read-only)
    if (form.status !== "DRAFT") {
      await logAudit({
        action: "ENTRY_CREATE_FAILED",
        resourceType: "Entry",
        resourceId: formId,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Form not in draft status",
      });
      return NextResponse.json(
        { error: "Cannot add entries to submitted or approved forms" },
        { status: 403 }
      );
    }

    // Create entry with validated data
    const entry = await prisma.entry.create({
      data: {
        formId,
        title: entryData.title || "",
        zielsetzungenText: entryData.zielsetzungenText || null,
        zielbereich1: entryData.zielbereich1 || [],
        zielbereich2: entryData.zielbereich2 || [],
        zielbereich3: entryData.zielbereich3 || [],
        datengrundlage: entryData.datengrundlage || [],
        datengrundlageAndere: entryData.datengrundlageAndere || null,
        zielgruppe: entryData.zielgruppe || [],
        zielgruppeSusDetail: entryData.zielgruppeSusDetail || null,
        massnahmen: entryData.massnahmen || null,
        indikatoren: entryData.indikatoren || null,
        verantwortlich: entryData.verantwortlich || null,
        beteiligt: entryData.beteiligt || null,
        beginnSchuljahr: entryData.beginnSchuljahr || null,
        beginnHalbjahr: entryData.beginnHalbjahr || null,
        endeSchuljahr: entryData.endeSchuljahr || null,
        endeHalbjahr: entryData.endeHalbjahr || null,
        fortbildungJa: entryData.fortbildungJa || false,
        fortbildungThemen: entryData.fortbildungThemen || null,
        fortbildungZielgruppe: entryData.fortbildungZielgruppe || null,
      },
    });

    await logAudit({
      action: "ENTRY_CREATED",
      resourceType: "Entry",
      resourceId: entry.id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        formId,
        title: entry.title,
      },
    });

    return NextResponse.json({ entry, success: true });
  } catch (error) {
    console.error("Error creating entry:", error);
    await logAudit({
      action: "ENTRY_CREATE_FAILED",
      resourceType: "Entry",
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}




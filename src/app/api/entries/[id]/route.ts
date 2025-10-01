import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import { UpdateEntrySchema } from "@/lib/validation";
import { logAudit, getRequestInfo } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const { id } = await context.params;

  // Rate limiting
  const rateLimitResponse = rateLimit(req, RateLimits.ENTRY_SAVE);
  if (rateLimitResponse) {
    await logAudit({
      action: "ENTRY_UPDATE_FAILED",
      resourceType: "Entry",
      resourceId: id,
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
        action: "ENTRY_UPDATE_FAILED",
        resourceType: "Entry",
        resourceId: id,
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
    const validation = UpdateEntrySchema.safeParse(body);
    if (!validation.success) {
      await logAudit({
        action: "ENTRY_UPDATE_FAILED",
        resourceType: "Entry",
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

    // Verify entry exists AND user has access via access code
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
      include: {
        form: {
          include: {
            accessCode: true,
          },
        },
      },
    });

    if (!existingEntry) {
      await logAudit({
        action: "ENTRY_UPDATE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Entry not found",
      });
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    // Verify access code matches
    if (existingEntry.form.accessCode?.code !== accessCode.toUpperCase()) {
      await logAudit({
        action: "ENTRY_UPDATE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Invalid access code",
      });
      return NextResponse.json(
        { error: "Invalid access code for this entry" },
        { status: 403 }
      );
    }

    // Verify form is not already submitted/approved (read-only)
    if (existingEntry.form.status !== "DRAFT") {
      await logAudit({
        action: "ENTRY_UPDATE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Form not in draft status",
      });
      return NextResponse.json(
        { error: "Cannot modify entries in submitted or approved forms" },
        { status: 403 }
      );
    }

    // Update entry with validated data
    const entry = await prisma.entry.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existingEntry.title,
        zielsetzungenText: body.zielsetzungenText !== undefined ? body.zielsetzungenText : existingEntry.zielsetzungenText,
        zielbereich1: body.zielbereich1 !== undefined ? body.zielbereich1 : existingEntry.zielbereich1,
        zielbereich2: body.zielbereich2 !== undefined ? body.zielbereich2 : existingEntry.zielbereich2,
        zielbereich3: body.zielbereich3 !== undefined ? body.zielbereich3 : existingEntry.zielbereich3,
        datengrundlage: body.datengrundlage !== undefined ? body.datengrundlage : existingEntry.datengrundlage,
        datengrundlageAndere: body.datengrundlageAndere !== undefined ? body.datengrundlageAndere : existingEntry.datengrundlageAndere,
        zielgruppe: body.zielgruppe !== undefined ? body.zielgruppe : existingEntry.zielgruppe,
        zielgruppeSusDetail: body.zielgruppeSusDetail !== undefined ? body.zielgruppeSusDetail : existingEntry.zielgruppeSusDetail,
        massnahmen: body.massnahmen !== undefined ? body.massnahmen : existingEntry.massnahmen,
        indikatoren: body.indikatoren !== undefined ? body.indikatoren : existingEntry.indikatoren,
        verantwortlich: body.verantwortlich !== undefined ? body.verantwortlich : existingEntry.verantwortlich,
        beteiligt: body.beteiligt !== undefined ? body.beteiligt : existingEntry.beteiligt,
        beginnSchuljahr: body.beginnSchuljahr !== undefined ? body.beginnSchuljahr : existingEntry.beginnSchuljahr,
        beginnHalbjahr: body.beginnHalbjahr !== undefined ? body.beginnHalbjahr : existingEntry.beginnHalbjahr,
        endeSchuljahr: body.endeSchuljahr !== undefined ? body.endeSchuljahr : existingEntry.endeSchuljahr,
        endeHalbjahr: body.endeHalbjahr !== undefined ? body.endeHalbjahr : existingEntry.endeHalbjahr,
        fortbildungJa: body.fortbildungJa !== undefined ? body.fortbildungJa : existingEntry.fortbildungJa,
        fortbildungThemen: body.fortbildungThemen !== undefined ? body.fortbildungThemen : existingEntry.fortbildungThemen,
        fortbildungZielgruppe: body.fortbildungZielgruppe !== undefined ? body.fortbildungZielgruppe : existingEntry.fortbildungZielgruppe,
      },
    });

    await logAudit({
      action: "ENTRY_UPDATED",
      resourceType: "Entry",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        formId: existingEntry.formId,
        title: entry.title,
      },
    });

    return NextResponse.json({ entry, success: true });
  } catch (error) {
    console.error("Error updating entry:", error);
    await logAudit({
      action: "ENTRY_UPDATE_FAILED",
      resourceType: "Entry",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const { id } = await context.params;

  // Rate limiting
  const rateLimitResponse = rateLimit(req, RateLimits.ENTRY_SAVE);
  if (rateLimitResponse) {
    await logAudit({
      action: "ENTRY_DELETE_FAILED",
      resourceType: "Entry",
      resourceId: id,
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
        action: "ENTRY_DELETE_FAILED",
        resourceType: "Entry",
        resourceId: id,
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

    // Verify entry exists AND user has access via access code
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
      include: {
        form: {
          include: {
            accessCode: true,
          },
        },
      },
    });

    if (!existingEntry) {
      await logAudit({
        action: "ENTRY_DELETE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Entry not found",
      });
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    // Verify access code matches
    if (existingEntry.form.accessCode?.code !== accessCode.toUpperCase()) {
      await logAudit({
        action: "ENTRY_DELETE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Invalid access code",
      });
      return NextResponse.json(
        { error: "Invalid access code for this entry" },
        { status: 403 }
      );
    }

    // Verify form is not already submitted/approved (read-only)
    if (existingEntry.form.status !== "DRAFT") {
      await logAudit({
        action: "ENTRY_DELETE_FAILED",
        resourceType: "Entry",
        resourceId: id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: "Form not in draft status",
      });
      return NextResponse.json(
        { error: "Cannot delete entries in submitted or approved forms" },
        { status: 403 }
      );
    }

    await prisma.entry.delete({
      where: { id },
    });

    await logAudit({
      action: "ENTRY_DELETED",
      resourceType: "Entry",
      resourceId: id,
      ipAddress,
      userAgent,
      success: true,
      metadata: {
        formId: existingEntry.formId,
        title: existingEntry.title,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    await logAudit({
      action: "ENTRY_DELETE_FAILED",
      resourceType: "Entry",
      resourceId: id,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}




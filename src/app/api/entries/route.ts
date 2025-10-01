import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formId, ...entryData } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "formId is required" },
        { status: 400 }
      );
    }

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Create entry with autosave data
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

    console.log(`Entry created: ${entry.id} for form ${formId}`);
    return NextResponse.json({ entry, success: true });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}




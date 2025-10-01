import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // Verify entry exists
    const existingEntry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    // Update entry with provided data
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

    console.log(`Entry autosaved: ${id}`);
    return NextResponse.json({ entry, success: true });
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.entry.delete({
      where: { id },
    });

    console.log(`Entry deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}




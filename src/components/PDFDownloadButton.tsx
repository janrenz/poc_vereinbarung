"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { downloadFormAsPDF } from "@/lib/pdf-generator";

type Entry = {
  id: string;
  title: string;
  zielsetzungenText: string | null;
  zielbereich1: unknown;
  zielbereich2: unknown;
  zielbereich3: unknown;
  datengrundlage: unknown;
  datengrundlageAndere: string | null;
  zielgruppe: unknown;
  zielgruppeSusDetail: string | null;
  massnahmen: string | null;
  indikatoren: string | null;
  verantwortlich: string | null;
  beteiligt: string | null;
  beginnSchuljahr: string | null;
  beginnHalbjahr: string | number | null;
  endeSchuljahr: string | null;
  endeHalbjahr: string | number | null;
  fortbildungJa: boolean;
  fortbildungThemen: string | null;
  fortbildungZielgruppe: string | null;
};

type PDFDownloadButtonProps = {
  schoolName: string;
  accessCode: string;
  date: Date | null;
  status: string;
  entries: Entry[];
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  label?: string;
  className?: string;
};

export function PDFDownloadButton({
  schoolName,
  accessCode,
  date,
  status,
  entries,
  submittedAt,
  approvedAt,
  label = "Als PDF herunterladen",
  className,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));

      downloadFormAsPDF({
        schoolName,
        accessCode,
        date,
        status,
        entries,
        submittedAt,
        approvedAt,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Fehler beim Erstellen der PDF-Datei. Bitte versuchen Sie es erneut.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={
        className ||
        "flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-2 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
      }
      aria-label={label}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          PDF wird erstellt...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}


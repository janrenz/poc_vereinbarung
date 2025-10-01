import { jsPDF } from "jspdf";
import { getStatusLabel } from "./status-labels";
import {
  ZIELBEREICH_1_LABELS,
  ZIELBEREICH_2_LABELS,
  ZIELBEREICH_3_LABELS,
  DATENGRUNDLAGE_LABELS,
  ZIELGRUPPE_LABELS,
  arrayToLabels,
} from "./form-labels";

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

type FormData = {
  schoolName: string;
  accessCode: string;
  date: Date | null;
  status: string;
  entries: Entry[];
  submittedAt?: Date | null;
  approvedAt?: Date | null;
};

// Helper to convert array to comma-separated string
function arrayToString(arr: unknown): string {
  if (!arr) return "-";
  if (Array.isArray(arr)) {
    return arr.length > 0 ? arr.join(", ") : "-";
  }
  return String(arr);
}

// Helper to format date
function formatDate(date: Date | null): string {
  if (!date) return "Nicht gesetzt";
  return new Date(date).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Helper to format time period
function formatPeriod(
  startYear: string | null,
  startHalf: string | number | null,
  endYear: string | null,
  endHalf: string | number | null
): string {
  if (!startYear && !endYear) return "-";
  const start = startYear && startHalf ? `${startYear}/${startHalf}. HJ` : "";
  const end = endYear && endHalf ? `${endYear}/${endHalf}. HJ` : "";
  return `${start}${start && end ? " - " : ""}${end}`;
}

export function generateFormPDF(formData: FormData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Define colors (NRW Blue)
  const primaryColor = { r: 0, g: 90, b: 169 }; // #005AA9
  const lightGray = { r: 245, g: 245, b: 245 };
  const darkGray = { r: 100, g: 100, b: 100 };

  let yPos = 20;

  // Header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Zielvereinbarung Digital", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(formData.schoolName, 105, 23, { align: "center" });

  yPos = 40;

  // Metadata section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const metadata = [
    ["Zugangscode:", formData.accessCode],
    ["Datum:", formatDate(formData.date)],
    ["Status:", getStatusLabel(formData.status)],
    ["Anzahl Einträge:", String(formData.entries.length)],
  ];

  // Add submitted/approved timestamps if available
  if (formData.submittedAt) {
    metadata.push([
      "Versendet am:",
      new Date(formData.submittedAt).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " Uhr",
    ]);
  }

  if (formData.approvedAt) {
    metadata.push([
      "Angenommen am:",
      new Date(formData.approvedAt).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " Uhr",
    ]);
  }

  metadata.push([
    "PDF erstellt am:",
    new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  ]);

  metadata.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 70, yPos);
    yPos += 7;
  });

  yPos += 5;

  // Entries
  if (formData.entries.length === 0) {
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
    doc.text("Keine Einträge vorhanden.", 20, yPos);
  } else {
    formData.entries.forEach((entry, index) => {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Entry header with title
      doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
      doc.rect(15, yPos - 6, 180, 12, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      const entryTitle = entry.title || entry.zielsetzungenText || `Eintrag ${index + 1}`;
      doc.text(entryTitle, 20, yPos);
      yPos += 14;

      // Entry details
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      // Build entry data, only include non-empty fields
      const entryData: [string, string][] = [];

      // Zielsetzungen
      if (entry.zielsetzungenText) {
        entryData.push(["Zielsetzungen:", entry.zielsetzungenText]);
      }

      // Zielbereich 1
      const zb1 = arrayToLabels(entry.zielbereich1, ZIELBEREICH_1_LABELS);
      if (zb1 !== "-") {
        entryData.push(["Zielbereich 1 (Schulkompass NRW 2030):", zb1]);
      }

      // Zielbereich 2
      const zb2 = arrayToLabels(entry.zielbereich2, ZIELBEREICH_2_LABELS);
      if (zb2 !== "-") {
        entryData.push(["Zielbereich 2 (Startchancenprogramm):", zb2]);
      }

      // Zielbereich 3
      const zb3 = arrayToLabels(entry.zielbereich3, ZIELBEREICH_3_LABELS);
      if (zb3 !== "-") {
        entryData.push(["Zielbereich 3 (RRSQ):", zb3]);
      }

      // Datengrundlage
      const dg = arrayToLabels(entry.datengrundlage, DATENGRUNDLAGE_LABELS);
      if (dg !== "-" || entry.datengrundlageAndere) {
        const dgText = entry.datengrundlageAndere 
          ? `${dg !== "-" ? dg + ", " : ""}Andere: ${entry.datengrundlageAndere}`
          : dg;
        entryData.push(["Datengrundlage:", dgText]);
      }

      // Zielgruppe
      const zg = arrayToLabels(entry.zielgruppe, ZIELGRUPPE_LABELS);
      if (zg !== "-" || entry.zielgruppeSusDetail) {
        const zgText = entry.zielgruppeSusDetail 
          ? `${zg !== "-" ? zg + ", " : ""}Teilgruppe SuS: ${entry.zielgruppeSusDetail}`
          : zg;
        entryData.push(["Zielgruppe:", zgText]);
      }

      // Maßnahmen
      if (entry.massnahmen) {
        entryData.push(["Maßnahmen:", entry.massnahmen]);
      }

      // Indikatoren
      if (entry.indikatoren) {
        entryData.push(["Indikatoren:", entry.indikatoren]);
      }

      // Verantwortlich
      if (entry.verantwortlich) {
        entryData.push(["Verantwortlich:", entry.verantwortlich]);
      }

      // Beteiligt
      if (entry.beteiligt) {
        entryData.push(["Beteiligt:", entry.beteiligt]);
      }

      // Zeitraum
      const period = formatPeriod(
        entry.beginnSchuljahr,
        entry.beginnHalbjahr,
        entry.endeSchuljahr,
        entry.endeHalbjahr
      );
      if (period !== "-") {
        entryData.push(["Zeitraum:", period]);
      }

      // Fortbildung
      if (entry.fortbildungJa && (entry.fortbildungThemen || entry.fortbildungZielgruppe)) {
        const fbParts = [];
        if (entry.fortbildungThemen) fbParts.push(`Themen: ${entry.fortbildungThemen}`);
        if (entry.fortbildungZielgruppe) fbParts.push(`Zielgruppe: ${entry.fortbildungZielgruppe}`);
        entryData.push(["Fortbildung:", fbParts.join(", ")]);
      }

      entryData.forEach(([label, value]) => {
        // Check page break
        if (yPos > 265) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(label, 20, yPos);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        // Increased width to prevent overlap: 130 -> 165 (from position 60 to page edge ~190)
        const lines = doc.splitTextToSize(value, 165);
        doc.text(lines, 20, yPos + 5); // Start text below label with more space

        yPos += Math.max(10, lines.length * 5 + 4); // More vertical spacing
      });

      yPos += 12; // More space between entries
    });
  }

  // Add Gantt chart if there are entries with timeframes
  const entriesWithTimeframes = formData.entries.filter(
    (e) => e.beginnSchuljahr || e.endeSchuljahr
  );

  if (entriesWithTimeframes.length > 0) {
    // Check if we need a new page for Gantt
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Gantt chart header
    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
    doc.rect(15, yPos - 5, 180, 10, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text("Zeitplan der Maßnahmen", 20, yPos);
    yPos += 12;

    // Get year range
    const years = new Set<string>();
    entriesWithTimeframes.forEach((entry) => {
      if (entry.beginnSchuljahr) years.add(entry.beginnSchuljahr);
      if (entry.endeSchuljahr) years.add(entry.endeSchuljahr);
    });
      const sortedYears = Array.from(years).sort();
      
      if (sortedYears.length > 0) {
      
      // Calculate Gantt dimensions with space for labels on the left
      // A4 page is 210mm wide, with margins we have ~195mm usable
      const labelWidth = 55; // Width reserved for entry labels
      const ganttStartX = 20 + labelWidth; // Start chart after label space (75mm)
      const ganttWidth = 110; // Width to keep within page margins (ends at 185mm, 10mm margin right)
      const rowHeight = 8;
      const yearWidth = ganttWidth / sortedYears.length;

      // Draw year headers
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      
      sortedYears.forEach((year, idx) => {
        const x = ganttStartX + idx * yearWidth;
        doc.text(year, x + yearWidth / 2, yPos, { align: "center" });
      });
      
      yPos += 4;

      // Draw grid lines
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      sortedYears.forEach((year, idx) => {
        const x = ganttStartX + idx * yearWidth;
        doc.line(x, yPos, x, yPos + entriesWithTimeframes.length * rowHeight);
      });
      doc.line(ganttStartX + ganttWidth, yPos, ganttStartX + ganttWidth, yPos + entriesWithTimeframes.length * rowHeight);

      // Draw entries
      doc.setFont("helvetica", "normal");
      entriesWithTimeframes.forEach((entry, idx) => {
        const rowY = yPos + idx * rowHeight;
        
        // Entry label - use title or fallback to number
        const label = entry.title || entry.zielsetzungenText || `Eintrag ${formData.entries.indexOf(entry) + 1}`;
        doc.setFontSize(7);
        const maxLabelWidth = labelWidth - 2; // Leave minimal margin
        const lines = doc.splitTextToSize(label, maxLabelWidth);
        // Show only first line, truncate if too long
        const displayText = lines.length > 0 ? lines[0] : label;
        doc.text(displayText, 20, rowY + 5, { maxWidth: maxLabelWidth }); // Left-aligned from margin

        // Draw timeline bar
        if (entry.beginnSchuljahr && entry.endeSchuljahr) {
          const startIdx = sortedYears.indexOf(entry.beginnSchuljahr);
          const endIdx = sortedYears.indexOf(entry.endeSchuljahr);
          
          if (startIdx !== -1 && endIdx !== -1) {
            const barStartX = ganttStartX + startIdx * yearWidth;
            const barWidth = (endIdx - startIdx + 1) * yearWidth;
            
            // Draw bar with primary color
            doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
            doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
            doc.roundedRect(barStartX + 2, rowY + 1, barWidth - 4, rowHeight - 2, 1, 1, "FD");
            
            // Add semester indicators
            doc.setFontSize(6);
            doc.setTextColor(255, 255, 255);
            const text = `${entry.beginnHalbjahr || ""}. HJ - ${entry.endeHalbjahr || ""}. HJ`;
            doc.text(text, barStartX + barWidth / 2, rowY + 5, { align: "center" });
          }
        }

        doc.setTextColor(0, 0, 0);
      });

      yPos += entriesWithTimeframes.length * rowHeight + 10;
    }
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
    doc.text(
      `Seite ${i} von ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
    doc.text(
      "© Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen",
      105,
      295,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadFormAsPDF(formData: FormData, filename?: string) {
  const doc = generateFormPDF(formData);
  const name =
    filename ||
    `Zielvereinbarung_${formData.schoolName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(name);
}


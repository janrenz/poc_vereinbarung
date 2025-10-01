"use client";

import { useMemo } from "react";
import { Calendar, Download } from "lucide-react";

type Entry = {
  id: string;
  zielsetzungenText: string | null;
  beginnSchuljahr: string | null;
  beginnHalbjahr: number | null;
  endeSchuljahr: string | null;
  endeHalbjahr: number | null;
};

type GanttChartProps = {
  entries: Entry[];
  schoolName: string;
};

// Convert school year string like "2024/25" to a sortable number
function parseSchuljahr(jahr: string | null): number {
  if (!jahr) return 0;
  const parts = jahr.split("/");
  return parseInt(parts[0]) || 0;
}

// Calculate position for timeline
function calculatePosition(
  beginnJahr: string | null,
  beginnHalb: number | null,
  endeJahr: string | null,
  endeHalb: number | null,
  minYear: number,
  maxYear: number
): { left: number; width: number } {
  if (!beginnJahr || !endeJahr) {
    return { left: 0, width: 0 };
  }

  const startYear = parseSchuljahr(beginnJahr);
  const endYear = parseSchuljahr(endeJahr);
  
  // Calculate position as fraction (0 = first half, 0.5 = second half)
  const start = (startYear - minYear) + (beginnHalb === 2 ? 0.5 : 0);
  const end = (endYear - minYear) + (endeHalb === 2 ? 0.5 : 0.5);
  
  const totalSpan = (maxYear - minYear + 1);
  const left = (start / totalSpan) * 100;
  const width = ((end - start) / totalSpan) * 100;
  
  return { left, width: Math.max(width, 2) }; // Minimum 2% width for visibility
}

export function GanttChart({ entries, schoolName }: GanttChartProps) {
  const { validEntries, minYear, maxYear, years } = useMemo(() => {
    const valid = entries.filter(
      (e) => e.beginnSchuljahr && e.endeSchuljahr && e.zielsetzungenText
    );
    
    if (valid.length === 0) {
      return { validEntries: [], minYear: 0, maxYear: 0, years: [] };
    }
    
    const allYears = valid.flatMap((e) => [
      parseSchuljahr(e.beginnSchuljahr),
      parseSchuljahr(e.endeSchuljahr),
    ]);
    
    const min = Math.min(...allYears);
    const max = Math.max(...allYears);
    
    const yearList = [];
    for (let y = min; y <= max; y++) {
      yearList.push(y);
    }
    
    return { validEntries: valid, minYear: min, maxYear: max, years: yearList };
  }, [entries]);

  const handleDownload = () => {
    // Create SVG content
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `gantt-${schoolName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSVG = (): string => {
    const width = 1200;
    const height = 80 + validEntries.length * 60;
    const leftMargin = 300;
    const chartWidth = width - leftMargin - 40;
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="font-family: system-ui, sans-serif;">
  <style>
    .title { font-size: 18px; font-weight: bold; fill: #1e293b; }
    .subtitle { font-size: 12px; fill: #64748b; }
    .label { font-size: 14px; fill: #334155; }
    .year { font-size: 12px; fill: #64748b; text-anchor: middle; }
    .timeline { fill: #0061A4; opacity: 0.8; }
    .grid { stroke: #e2e8f0; stroke-width: 1; }
  </style>
  
  <!-- Title -->
  <text x="20" y="30" class="title">Gantt-Diagramm: ${escapeXml(schoolName)}</text>
  <text x="20" y="50" class="subtitle">Zielvereinbarungen Zeitplan</text>
  
  <!-- Year headers -->
  ${years.map((year, i) => {
    const x = leftMargin + (i / years.length) * chartWidth + (chartWidth / years.length / 2);
    return `<text x="${x}" y="75" class="year">${year}/${(year + 1).toString().slice(-2)}</text>`;
  }).join("\n  ")}
  
  <!-- Grid lines -->
  ${years.map((_, i) => {
    const x = leftMargin + (i / years.length) * chartWidth;
    return `<line x1="${x}" y1="85" x2="${x}" y2="${height - 10}" class="grid"/>`;
  }).join("\n  ")}
  
  <!-- Entries -->
  ${validEntries.map((entry, i) => {
    const y = 100 + i * 60;
    const { left, width } = calculatePosition(
      entry.beginnSchuljahr,
      entry.beginnHalbjahr,
      entry.endeSchuljahr,
      entry.endeHalbjahr,
      minYear,
      maxYear
    );
    const barX = leftMargin + (left / 100) * chartWidth;
    const barWidth = (width / 100) * chartWidth;
    
    return `
  <text x="20" y="${y + 15}" class="label">${escapeXml(entry.zielsetzungenText?.substring(0, 40) || "Ohne Titel")}${(entry.zielsetzungenText?.length || 0) > 40 ? "..." : ""}</text>
  <rect x="${barX}" y="${y}" width="${barWidth}" height="30" class="timeline" rx="4"/>
  <text x="${barX + 5}" y="${y + 20}" style="font-size: 11px; fill: white;">${entry.beginnSchuljahr}/${entry.beginnHalbjahr} - ${entry.endeSchuljahr}/${entry.endeHalbjahr}</text>`;
  }).join("\n")}
</svg>`;
    
    return svg;
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
  };

  if (validEntries.length === 0) {
    return (
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 text-center md-elevation-1">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--md-sys-color-on-surface-variant)] opacity-50" />
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
          Keine Zeitdaten verfügbar
        </h3>
        <p className="text-[var(--md-sys-color-on-surface-variant)]">
          Fügen Sie Einträge mit Schuljahr-Angaben hinzu, um das Gantt-Diagramm anzuzeigen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gantt Chart */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Gantt-Diagramm: Zeitplan der Maßnahmen
        </h3>

        <div className="min-w-[800px]">
          {/* Year Headers */}
          <div className="flex mb-4 pl-[300px]">
            {years.map((year) => (
              <div key={year} className="flex-1 text-center">
                <div className="text-sm font-semibold text-[var(--md-sys-color-primary)]">
                  {year}/{(year + 1).toString().slice(-2)}
                </div>
                <div className="flex mt-1">
                  <div className="flex-1 text-xs text-[var(--md-sys-color-on-surface-variant)] border-r border-[var(--md-sys-color-outline-variant)]">
                    1. HJ
                  </div>
                  <div className="flex-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    2. HJ
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Rows */}
          <div className="space-y-3">
            {validEntries.map((entry) => {
              const { left, width } = calculatePosition(
                entry.beginnSchuljahr,
                entry.beginnHalbjahr,
                entry.endeSchuljahr,
                entry.endeHalbjahr,
                minYear,
                maxYear
              );

              return (
                <div key={entry.id} className="flex items-center gap-4">
                  {/* Entry Label */}
                  <div className="w-[280px] flex-shrink-0">
                    <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate pr-2">
                      {entry.zielsetzungenText || "Ohne Titel"}
                    </div>
                    <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      {entry.beginnSchuljahr}/{entry.beginnHalbjahr} - {entry.endeSchuljahr}/
                      {entry.endeHalbjahr}
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-10 bg-[var(--md-sys-color-surface-variant)]/30 rounded-[var(--md-sys-shape-corner-small)]">
                    {/* Grid lines for semesters */}
                    {years.map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-full border-l border-[var(--md-sys-color-outline-variant)]"
                        style={{ left: `${(i / years.length) * 100}%` }}
                      />
                    ))}
                    
                    {/* Progress Bar */}
                    <div
                      className="absolute h-full bg-[var(--md-sys-color-primary)] rounded-[var(--md-sys-shape-corner-small)] flex items-center justify-center text-xs text-white font-medium transition-all hover:shadow-lg"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    >
                      {width > 15 && (
                        <span className="px-2 truncate">
                          {entry.beginnSchuljahr}/{entry.beginnHalbjahr} - {entry.endeSchuljahr}/
                          {entry.endeHalbjahr}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download Button - Below the chart */}
        <div className="mt-4 flex justify-end print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Als SVG herunterladen
          </button>
        </div>
      </div>

    </div>
  );
}


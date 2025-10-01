"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EntrySortControls, type SortConfig } from "./EntrySortControls";

type Entry = {
  id: string;
  title: string;
  zielsetzungenText: string | null;
  massnahmen: string | null;
  beginnSchuljahr: string | null;
  beginnHalbjahr: number | null;
  endeSchuljahr: string | null;
  endeHalbjahr: number | null;
  createdAt: Date;
};

type Props = {
  entries: Entry[];
  code: string;
};

function parseSchuljahr(jahr: string | null): number {
  if (!jahr) return 0;
  const parts = jahr.split("/");
  return parseInt(parts[0]) || 0;
}

function getTimelineValue(entry: Entry): number {
  if (!entry.beginnSchuljahr) return 999999; // Put entries without timeline at the end
  const year = parseSchuljahr(entry.beginnSchuljahr);
  const semester = entry.beginnHalbjahr === 2 ? 0.5 : 0;
  return year + semester;
}

export function EntryListClient({ entries, code }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "created",
    direction: "asc",
  });

  const sortedEntries = useMemo(() => {
    const sorted = [...entries];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "created":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;

        case "title":
          const titleA = (a.zielsetzungenText || "").toLowerCase();
          const titleB = (b.zielsetzungenText || "").toLowerCase();
          comparison = titleA.localeCompare(titleB, "de");
          break;

        case "timeline":
          comparison = getTimelineValue(a) - getTimelineValue(b);
          break;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [entries, sortConfig]);

  return (
    <div className="space-y-4">
      <EntrySortControls onSortChange={setSortConfig} />

      {sortedEntries.length === 0 ? (
        <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
          <p className="text-lg mb-2">Noch keine Einträge vorhanden</p>
          <p className="text-sm">
            Klicken Sie auf &quot;Neuer Eintrag&quot;, um eine Zielvereinbarung hinzuzufügen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-medium)] p-4 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
            >
              <h3 className="font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
                {entry.title || "Ohne Titel"}
              </h3>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] space-y-1">
                {entry.massnahmen && (
                  <p>
                    <span className="font-medium">Maßnahmen:</span> {entry.massnahmen}
                  </p>
                )}
                {entry.beginnSchuljahr && (
                  <p>
                    <span className="font-medium">Zeitraum:</span> {entry.beginnSchuljahr}/
                    {entry.beginnHalbjahr} bis {entry.endeSchuljahr}/{entry.endeHalbjahr}
                  </p>
                )}
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                  Erstellt: {new Date(entry.createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/formular/${code}/entry/${entry.id}`}
                  className="text-sm px-3 py-1 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-secondary)] hover:text-[var(--md-sys-color-on-secondary)] transition-colors"
                >
                  Bearbeiten
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


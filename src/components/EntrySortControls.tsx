"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortField = "created" | "title" | "timeline";
type SortDirection = "asc" | "desc";

export type SortConfig = {
  field: SortField;
  direction: SortDirection;
};

type Props = {
  onSortChange: (config: SortConfig) => void;
};

export function EntrySortControls({ onSortChange }: Props) {
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc";
    
    if (field === sortField) {
      // Toggle direction if clicking the same field
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    onSortChange({ field, direction: newDirection });
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const getButtonClass = (field: SortField) => {
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-[var(--md-sys-shape-corner-small)] text-sm font-medium transition-colors touch-manipulation";
    
    if (field === sortField) {
      return `${baseClass} bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]`;
    }
    
    return `${baseClass} bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-secondary-container)]`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[var(--md-sys-color-on-surface-variant)] mr-2">
        Sortieren nach:
      </span>
      
      <button
        onClick={() => handleSort("created")}
        className={getButtonClass("created")}
        aria-label="Nach Erstellungsdatum sortieren"
      >
        Erstellungsdatum
        {getSortIcon("created")}
      </button>
      
      <button
        onClick={() => handleSort("title")}
        className={getButtonClass("title")}
        aria-label="Nach Titel sortieren"
      >
        Titel
        {getSortIcon("title")}
      </button>
      
      <button
        onClick={() => handleSort("timeline")}
        className={getButtonClass("timeline")}
        aria-label="Nach Zeitplan sortieren"
      >
        Zeitplan
        {getSortIcon("timeline")}
      </button>
    </div>
  );
}




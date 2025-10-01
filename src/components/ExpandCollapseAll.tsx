"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  detailsSelector?: string;
};

export function ExpandCollapseAll({ detailsSelector = "details" }: Props) {
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleAll = () => {
    const detailsElements = document.querySelectorAll(detailsSelector);
    detailsElements.forEach((details) => {
      const detailsEl = details as HTMLDetailsElement;
      detailsEl.open = !allExpanded;
    });
    setAllExpanded(!allExpanded);
  };

  // Check initial state
  useEffect(() => {
    const checkState = () => {
      const detailsElements = document.querySelectorAll(detailsSelector);
      if (detailsElements.length === 0) return;
      
      const openCount = Array.from(detailsElements).filter(
        (d) => (d as HTMLDetailsElement).open
      ).length;
      
      setAllExpanded(openCount === detailsElements.length);
    };

    checkState();

    // Listen for toggle events on details elements
    const detailsElements = document.querySelectorAll(detailsSelector);
    detailsElements.forEach((details) => {
      details.addEventListener("toggle", checkState);
    });

    return () => {
      detailsElements.forEach((details) => {
        details.removeEventListener("toggle", checkState);
      });
    };
  }, [detailsSelector]);

  return (
    <button
      type="button"
      onClick={toggleAll}
      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] rounded px-2 py-1"
      aria-label={allExpanded ? "Alle Einträge einklappen" : "Alle Einträge ausklappen"}
    >
      {allExpanded ? (
        <>
          <ChevronUp className="w-4 h-4" />
          Alle einklappen
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />
          Alle ausklappen
        </>
      )}
    </button>
  );
}




"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ToggleAllDetailsProps {
  containerId?: string;
  className?: string;
}

export function ToggleAllDetails({ containerId, className = "" }: ToggleAllDetailsProps) {
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    // Check initial state
    const container = containerId ? document.getElementById(containerId) : document;
    const details = container?.querySelectorAll("details") || [];
    const openCount = Array.from(details).filter((d) => d.open).length;
    setAllExpanded(openCount === details.length && details.length > 0);
  }, [containerId]);

  const toggleAll = () => {
    const container = containerId ? document.getElementById(containerId) : document;
    const details = container?.querySelectorAll("details") || [];
    
    if (details.length === 0) return;

    const shouldExpand = !allExpanded;
    details.forEach((detail) => {
      detail.open = shouldExpand;
    });
    
    setAllExpanded(shouldExpand);
  };

  return (
    <button
      onClick={toggleAll}
      className={`inline-flex items-center gap-2 text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline transition-colors ${className}`}
      type="button"
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




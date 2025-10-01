"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type CopyableCodeProps = {
  code: string;
  label?: string;
};

export function CopyableCode({ code, label = "Zugangscode" }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
        {label}:
      </span>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-[var(--md-sys-shape-corner-small)] font-mono font-semibold text-sm hover:bg-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-on-primary)] transition-all md-elevation-1 hover:md-elevation-2 touch-manipulation"
        title="Zum Kopieren klicken"
        aria-label={`${label} ${code} kopieren`}
      >
        {code}
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 opacity-70" />
        )}
      </button>
      {copied && (
        <span className="text-xs text-green-600 font-medium animate-pulse">
          Kopiert!
        </span>
      )}
    </div>
  );
}




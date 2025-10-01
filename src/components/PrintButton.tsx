"use client";

import { Printer } from "lucide-react";

type PrintButtonProps = {
  label?: string;
  className?: string;
};

export function PrintButton({ label = "Drucken", className }: PrintButtonProps) {
  const handlePrint = () => {
    // Set print date as data attribute for CSS to use
    const main = document.querySelector("main");
    if (main) {
      const now = new Date().toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      main.setAttribute("data-print-date", now);
    }

    // Trigger print dialog
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className={
        className ||
        "flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] px-4 py-2 font-medium hover:bg-[var(--md-sys-color-primary-container)] transition-colors print:hidden"
      }
      aria-label={`Seite ${label.toLowerCase()}`}
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}




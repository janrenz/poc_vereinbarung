"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Section {
  id: string;
  title: string;
  number?: string;
}

const sections: Section[] = [
  { id: "title", title: "Titel", number: "" },
  { id: "section-1", title: "Zielsetzungen", number: "1" },
  { id: "section-2", title: "Datengrundlage", number: "2" },
  { id: "section-3", title: "Zielgruppe", number: "3" },
  { id: "section-4", title: "Maßnahmen", number: "4" },
  { id: "section-5", title: "Indikatoren", number: "5" },
  { id: "section-6", title: "Verantwortliche", number: "6" },
  { id: "section-7", title: "Zeitraum", number: "7" },
  { id: "section-8", title: "Fortbildung", number: "8" },
];

interface EntryFormStickyNavProps {
  filledSections?: Set<string>;
}

export function EntryFormStickyNav({ filledSections = new Set() }: EntryFormStickyNavProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      // Find the section closest to the top of the viewport
      let currentSection = "";
      let minDistance = Infinity;

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - 100); // 100px offset for sticky header

          if (distance < minDistance && rect.top < window.innerHeight / 2) {
            minDistance = distance;
            currentSection = section.id;
          }
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll(); // Initial check
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80; // 80px offset
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-6 md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md-elevation-1">
      <h3 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-3">
        Formular-Navigation
      </h3>
      <nav className="space-y-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isFilled = filledSections.has(section.id);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-[var(--md-sys-shape-corner-small)] transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-medium"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]"
              }`}
            >
              {isFilled ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[var(--md-sys-color-primary)]" />
              ) : (
                <Circle className="w-4 h-4 flex-shrink-0 opacity-40" />
              )}
              <span className="text-sm flex-1">
                {section.number && (
                  <span className="font-medium">{section.number}. </span>
                )}
                {section.title}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
            <span>Ausgefüllt</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 opacity-40" />
            <span>Noch offen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

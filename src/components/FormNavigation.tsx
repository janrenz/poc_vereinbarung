"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Plus, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Entry = {
  title?: string;
  id: string;
  zielsetzungenText?: string | null;
  beginnSchuljahr?: string | null;
  endeSchuljahr?: string | null;
};

type FormNavigationProps = {
  code: string;
  schoolName: string;
  entries: Entry[];
  currentEntryId?: string;
};

export function FormNavigation({ code, schoolName, entries, currentEntryId }: FormNavigationProps) {
  const pathname = usePathname();
  const [showEntries, setShowEntries] = useState(true);
  
  const isFormOverview = pathname === `/formular/${code}`;
  const isNewEntry = pathname.includes("/entry/new");
  const isEditEntry = currentEntryId && !isNewEntry;

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md-elevation-1">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          <li className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 touch-manipulation p-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Start</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--md-sys-color-outline)]" />
          </li>
          <li className="flex items-center gap-2">
            <Link 
              href={`/formular/${code}`}
              className={`hover:underline touch-manipulation p-2 ${
                isFormOverview 
                  ? "font-semibold text-[var(--md-sys-color-on-surface)]" 
                  : "text-[var(--md-sys-color-primary)]"
              }`}
            >
              {schoolName}
            </Link>
            {!isFormOverview && <ChevronRight className="w-4 h-4 text-[var(--md-sys-color-outline)]" />}
          </li>
          {isNewEntry && (
            <li className="font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2 p-2">
              <Plus className="w-4 h-4" />
              Neuer Eintrag
            </li>
          )}
          {isEditEntry && (
            <li className="font-semibold text-[var(--md-sys-color-on-surface)] p-2">
              Eintrag bearbeiten
            </li>
          )}
        </ol>
      </nav>

      {/* Entry List Navigation */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] md-elevation-1 overflow-hidden">
        <button
          onClick={() => setShowEntries(!showEntries)}
          className="w-full flex items-center justify-between p-4 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            <h3 className="font-semibold text-[var(--md-sys-color-on-surface)]">
              Einträge ({entries.length})
            </h3>
          </div>
          <motion.div
            animate={{ rotate: showEntries ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-[var(--md-sys-color-outline)]" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {showEntries && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--md-sys-color-outline-variant)]">
                {entries.length === 0 ? (
                  <div className="p-6 text-center text-[var(--md-sys-color-on-surface-variant)]">
                    <p className="mb-4">Noch keine Einträge vorhanden</p>
                    <Link
                      href={`/formular/${code}/entry/new`}
                      className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all touch-manipulation"
                    >
                      <Plus className="w-5 h-5" />
                      Ersten Eintrag erstellen
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                    {entries.map((entry, index) => {
                      const isActive = entry.id === currentEntryId;
                      const entryTitle = entry.title || entry.zielsetzungenText || `Eintrag ${index + 1}`;
                      const timeframe = [entry.beginnSchuljahr, entry.endeSchuljahr]
                        .filter(Boolean)
                        .join(" - ") || "Zeitraum nicht festgelegt";

                      return (
                        <li key={entry.id}>
                          <Link
                            href={`/formular/${code}/entry/${entry.id}`}
                            className={`block p-4 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors touch-manipulation ${
                              isActive ? "bg-[var(--md-sys-color-primary-container)]" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isActive 
                                      ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                                      : "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                                  }`}>
                                    #{index + 1}
                                  </span>
                                  {isActive && (
                                    <span className="text-xs font-medium text-[var(--md-sys-color-primary)]">
                                      Aktuell
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm font-medium truncate mb-1 ${
                                  isActive 
                                    ? "text-[var(--md-sys-color-on-primary-container)]"
                                    : "text-[var(--md-sys-color-on-surface)]"
                                }`}>
                                  {entryTitle}
                                </p>
                                <p className={`text-xs ${
                                  isActive
                                    ? "text-[var(--md-sys-color-on-primary-container)]/70"
                                    : "text-[var(--md-sys-color-on-surface-variant)]"
                                }`}>
                                  {timeframe}
                                </p>
                              </div>
                              <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                                isActive
                                  ? "text-[var(--md-sys-color-on-primary-container)]"
                                  : "text-[var(--md-sys-color-outline)]"
                              }`} />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {entries.length > 0 && (
                  <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Link
                      href={`/formular/${code}/entry/new`}
                      className={`flex items-center justify-center gap-2 w-full rounded-[var(--md-sys-shape-corner-full)] border-2 border-dashed px-6 py-3 font-medium transition-colors touch-manipulation ${
                        isNewEntry
                          ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                          : "border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-variant)]"
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      Neuer Eintrag
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      {!isFormOverview && (
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md-elevation-1">
          <Link
            href={`/formular/${code}`}
            className="flex items-center justify-center gap-2 w-full rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-6 py-3 font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors touch-manipulation"
          >
            <FileText className="w-5 h-5" />
            Zur Übersicht
          </Link>
        </div>
      )}
    </div>
  );
}




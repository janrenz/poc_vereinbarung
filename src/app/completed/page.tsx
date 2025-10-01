"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CompletedFormsPage() {
  const [schoolNumber, setSchoolNumber] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const trimmedNumber = schoolNumber.trim();
    const trimmedCode = accessCode.trim().toUpperCase();
    
    if (!trimmedNumber) {
      setError("Bitte geben Sie eine Schulnummer ein.");
      return;
    }
    
    if (!trimmedCode) {
      setError("Bitte geben Sie einen Zugangscode ein.");
      return;
    }

    setIsSearching(true);

    try {
      // Redirect to view page with school number and access code
      window.location.href = `/completed/view?schoolNumber=${encodeURIComponent(trimmedNumber)}&code=${encodeURIComponent(trimmedCode)}`;
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="md-surface rounded-[var(--md-sys-shape-corner-extra-large)] p-8 md-elevation-2">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] mb-4">
              <FileCheck className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
              Abgeschlossene Zielvereinbarungen
            </h1>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              Geben Sie Ihre Schulnummer und den Zugangscode ein, um Ihre abgeschlossenen Zielvereinbarungen einzusehen und herunterzuladen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="schoolNumber"
                className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
              >
                Schulnummer *
              </label>
              <input
                type="text"
                id="schoolNumber"
                value={schoolNumber}
                onChange={(e) => setSchoolNumber(e.target.value)}
                placeholder="z.B. 123456"
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent"
                disabled={isSearching}
              />
            </div>

            <div>
              <label
                htmlFor="accessCode"
                className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
              >
                Zugangscode *
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="z.B. ABC12345"
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent uppercase"
                disabled={isSearching}
              />
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2">
                Den Zugangscode haben Sie vom Schulamt erhalten.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suche...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Zielvereinbarungen anzeigen
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--md-sys-color-outline-variant)] text-center">
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-3">
              Sie möchten eine neue Zielvereinbarung bearbeiten?
            </p>
            <Link
              href="/formular"
              className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] font-medium hover:underline"
            >
              Zum Formular mit Zugangscode →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { SchoolSearch } from "./SchoolSearch";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type School = {
  externalId: string;
  name: string;
  city: string;
  state: string;
  address: string;
};

export function SchoolSearchCreateClient() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Force re-render on reset
  const router = useRouter();

  const handleCreateForm = async () => {
    if (!selectedSchool) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school: selectedSchool,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Formulars");
      }

      const data = await response.json();
      
      // Refresh the page to show the new form
      router.refresh();
      
      // Reset selection
      setSelectedSchool(null);
      setKey((k) => k + 1); // Force reset
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setError(null);
  };

  return (
    <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1 space-y-6">
      <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
        Neues Formular erstellen
      </h2>

      <SchoolSearch 
        key={key}
        onSchoolSelect={handleSchoolSelect}
        selectedSchool={selectedSchool}
      />

      {error && (
        <div 
          className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
          data-testid="create-form-error"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateForm}
        disabled={!selectedSchool || loading}
        data-testid="create-form-button"
        className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Formular wird erstellt...</span>
          </>
        ) : (
          <span>Formular anlegen</span>
        )}
      </button>
    </div>
  );
}


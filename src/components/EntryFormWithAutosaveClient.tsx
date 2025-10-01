"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EntryFormFields } from "./EntryFormFields";
import { AutosaveIndicator } from "./AutosaveIndicator";

type EntryData = {
  title?: string;
  zielsetzungenText?: string | null;
  zielbereich1?: unknown;
  zielbereich2?: unknown;
  zielbereich3?: unknown;
  datengrundlage?: unknown;
  datengrundlageAndere?: string | null;
  zielgruppe?: unknown;
  zielgruppeSusDetail?: string | null;
  massnahmen?: string | null;
  indikatoren?: string | null;
  verantwortlich?: string | null;
  beteiligt?: string | null;
  beginnSchuljahr?: string | null;
  beginnHalbjahr?: number | null;
  endeSchuljahr?: string | null;
  endeHalbjahr?: number | null;
  fortbildungJa?: boolean;
  fortbildungThemen?: string | null;
  fortbildungZielgruppe?: string | null;
};

type Props = {
  entryId?: string;
  formId: string;
  code: string;
  initialData?: EntryData;
};

export function EntryFormWithAutosaveClient({ entryId: initialEntryId, formId, code, initialData }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  // Track the entry ID - starts with initialEntryId, gets set after first save for new entries
  const [currentEntryId, setCurrentEntryId] = useState<string | undefined>(initialEntryId);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSavingAndNavigating, setIsSavingAndNavigating] = useState(false);
  const saveCallbackRef = useRef<(() => Promise<boolean>) | null>(null);

  const handleDelete = async () => {
    if (!currentEntryId) return;
    
    if (!confirm("Möchten Sie diesen Eintrag wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/entries/${currentEntryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/formular/${code}`);
      } else {
        alert("Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Fehler beim Löschen des Eintrags");
    }
  };

  const handleSaveAndBack = async () => {
    // Validate required fields before saving
    if (!formRef.current) {
      router.push(`/formular/${code}`);
      return;
    }

    // Check HTML5 validation
    if (!formRef.current.checkValidity()) {
      // Trigger native validation UI
      formRef.current.reportValidity();
      return;
    }

    // Check if title is filled (our main required field)
    const formData = new FormData(formRef.current);
    const title = formData.get('title') as string;
    
    if (!title || title.trim() === '') {
      alert('Bitte füllen Sie das Pflichtfeld "Titel der Maßnahme" aus.');
      // Focus the title field
      const titleInput = formRef.current.querySelector('input[name="title"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!saveCallbackRef.current) {
      // No save function available, just navigate
      router.push(`/formular/${code}`);
      return;
    }

    setIsSavingAndNavigating(true);
    try {
      const success = await saveCallbackRef.current();
      if (success) {
        // Wait a moment to show the "saved" status
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(`/formular/${code}`);
      } else {
        alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
        setIsSavingAndNavigating(false);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
      setIsSavingAndNavigating(false);
    }
  };

  return (
    <div className="space-y-4">
      <AutosaveIndicator
        formRef={formRef}
        saveEndpoint={currentEntryId ? `/api/entries/${currentEntryId}` : `/api/entries`}
        entryId={currentEntryId}
        formId={formId}
        onEntryCreated={setCurrentEntryId}
        onStatusChange={setSaveStatus}
        saveCallbackRef={saveCallbackRef}
      />

      <form ref={formRef} className="space-y-6">
        <EntryFormFields initialData={initialData} />
      </form>

      <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-8 pb-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          {currentEntryId && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] px-8 py-4 font-medium hover:bg-[var(--md-sys-color-error-container)] transition-all touch-manipulation"
            >
              Löschen
            </button>
          )}
          <div className="flex flex-col sm:flex-row gap-3 ml-auto">
            <button
              type="button"
              onClick={handleSaveAndBack}
              disabled={isSavingAndNavigating}
              className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-8 py-4 font-medium hover:md-elevation-2 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed md-elevation-1"
            >
              {isSavingAndNavigating ? "Speichert..." : "Speichern & Zurück zur Übersicht"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Check, AlertCircle } from "lucide-react";

type AutosaveIndicatorProps = {
  formRef: React.RefObject<HTMLFormElement | null>;
  saveEndpoint: string;
  entryId?: string;
  formId: string;
  onEntryCreated?: (entryId: string) => void;
  onStatusChange?: (status: "idle" | "saving" | "saved" | "error") => void;
  saveCallbackRef?: React.MutableRefObject<(() => Promise<boolean>) | null>;
};

export function AutosaveIndicator({ formRef, saveEndpoint, entryId, formId, onEntryCreated, onStatusChange, saveCallbackRef }: AutosaveIndicatorProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCreatedEntry = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(saveStatus);
    }
  }, [saveStatus, onStatusChange]);

  // Add beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving" || hasUnsavedChanges) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus, hasUnsavedChanges]);

  const performAutosave = async (): Promise<boolean> => {
    const form = formRef.current;
    if (!form) return false;

    setSaveStatus("saving");

    try {
      const formData = new FormData(form);
      const data: Record<string, unknown> = {};

      // Extract all form data
      formData.forEach((value, key) => {
        if (key.startsWith("zielbereich") || key === "datengrundlage" || key === "zielgruppe") {
          try {
            data[key] = JSON.parse(value as string);
          } catch {
            data[key] = [];
          }
        } else if (key === "beginnHalbjahr" || key === "endeHalbjahr") {
          data[key] = value ? parseInt(value as string) : null;
        } else if (key === "fortbildungJa") {
          data[key] = value === "true";
        } else {
          data[key] = value || null;
        }
      });

      data.formId = formId;

      const response = await fetch(saveEndpoint, {
        method: entryId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const result = await response.json();

      // If this was a POST (new entry) and we got an entry ID back, notify parent
      if (!entryId && result.entry?.id && !hasCreatedEntry.current && onEntryCreated) {
        hasCreatedEntry.current = true;
        onEntryCreated(result.entry.id);
        // Update the URL without navigation
        window.history.replaceState(null, "", window.location.pathname.replace('/new', `/${result.entry.id}`));
      }

      setSaveStatus("saved");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      setTimeout(() => {
        setSaveStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
      
      return true;
    } catch (error) {
      console.error("Autosave error:", error);
      setSaveStatus("error");
      return false;
    }
  };

  // Expose save function to parent via ref
  useEffect(() => {
    if (saveCallbackRef) {
      saveCallbackRef.current = performAutosave;
    }
  }, [saveCallbackRef, saveEndpoint, entryId, formId]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleInput = () => {
      setHasUnsavedChanges(true);
      setSaveStatus("idle");
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        await performAutosave();
      }, 2000);
    };

    // Add input event listeners
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleInput);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleInput);
      });
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formRef, saveEndpoint, entryId, formId]);

  const statusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-primary)]">
            <Save className="w-4 h-4 animate-pulse" />
            <span>Speichert...</span>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-primary)]">
            <Check className="w-4 h-4" />
            <span>
              Gespeichert {lastSaved && `um ${lastSaved.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`}
            </span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-error)]">
            <AlertCircle className="w-4 h-4" />
            <span>Fehler beim Speichern</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
            <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" 
                 style={{ animationDuration: "3s" }} />
            <span>Automatisches Speichern aktiviert</span>
          </div>
        );
    }
  };

  return (
    <div 
      className="md-surface rounded-[var(--md-sys-shape-corner-medium)] p-3 md-elevation-1"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {statusIndicator()}
    </div>
  );
}


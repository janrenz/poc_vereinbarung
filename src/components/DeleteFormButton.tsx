"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  schoolName: string;
};

export function DeleteFormButton({ schoolName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showConfirm) {
      e.preventDefault();
      setShowConfirm(true);
    }
    // If showConfirm is true, the form will submit normally
  };

  if (showConfirm) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-[var(--md-sys-color-surface)] rounded-[var(--md-sys-shape-corner-large)] p-6 max-w-md w-full md-elevation-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-error-container)] flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-[var(--md-sys-color-on-error-container)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
                Formular löschen
              </h2>
            </div>
            
            <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
              Möchten Sie das Formular für <strong>{schoolName}</strong> wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-6 py-2 font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] px-6 py-2 font-medium md-elevation-1 hover:md-elevation-2 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConfirm}
      className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] px-4 py-2 font-medium hover:bg-[var(--md-sys-color-error-container)] transition-colors flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Formular löschen
    </button>
  );
}


"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";

type Props = {
  disabled: boolean;
};

export function ReturnFormButton({ disabled }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className="w-full rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] px-6 py-3 font-medium hover:bg-[var(--md-sys-color-error-container)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <XCircle className="w-5 h-5" />
        Zur Überarbeitung zurückgeben
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-[var(--md-sys-color-surface)] rounded-[var(--md-sys-shape-corner-large)] p-6 max-w-2xl w-full md-elevation-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-error-container)] flex items-center justify-center">
                <XCircle className="w-6 h-6 text-[var(--md-sys-color-on-error-container)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
                Zielvereinbarung zur Überarbeitung zurückgeben
              </h2>
            </div>

            <p className="text-[var(--md-sys-color-on-surface-variant)] mb-4">
              Bitte geben Sie eine Begründung für die Rückgabe an. Die Schule wird diese Nachricht sehen und kann das Formular entsprechend überarbeiten.
            </p>

            <div className="mb-6">
                <label 
                  htmlFor="feedback-message" 
                  className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
                >
                  Rückmeldung an die Schule
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="Beschreiben Sie, welche Änderungen vorgenommen werden müssen..."
                  className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-error)] focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2">
                  Mindestens eine kurze Begründung ist erforderlich.
                </p>
              </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-6 py-2 font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!message.trim()}
                onClick={() => {
                  if (message.trim()) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'message';
                    input.value = message;
                    const form = document.querySelector('form[data-return-form]') as HTMLFormElement;
                    if (form) {
                      form.appendChild(input);
                      form.requestSubmit();
                    }
                  }
                }}
                className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] px-6 py-2 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Zurückgeben
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


"use client";

import { useState } from "react";
import Link from "@/components/Link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
            E-Mail gesendet!
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-2">
            Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.
          </p>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Bitte überprüfen Sie Ihr E-Mail-Postfach. Der Link ist 1 Stunde lang gültig.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Anmeldung
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
              Passwort vergessen?
            </h1>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Kein Problem, wir senden Ihnen einen Reset-Link
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
            >
              E-Mail-Adresse
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ihre.email@schulaufsicht.nrw.de"
              className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent"
            />
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Geben Sie die E-Mail-Adresse Ihres schulaufsicht-Kontos ein.
            </p>
          </div>

          <div className="rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] p-4">
            <p className="text-sm">
              <strong>💡 Hinweis für Schulen:</strong> Diese Funktion ist nur für schulaufsicht-Mitarbeiter.
              Als Schule benötigen Sie keinen Account – verwenden Sie einfach den Zugangscode, den Sie von Ihrem Schulaufsicht erhalten haben.
            </p>
          </div>

          {error && (
            <div className="rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Wird gesendet..." : "Reset-Link anfordern"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] text-center">
            Sie erinnern sich wieder an Ihr Passwort?{" "}
            <Link href="/login" className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
        <p>
          💡 <strong>Tipp:</strong> Überprüfen Sie auch Ihren Spam-Ordner, falls Sie keine E-Mail erhalten.
        </p>
      </div>
    </div>
  );
}




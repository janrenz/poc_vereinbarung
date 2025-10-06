"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Validate token on mount
    if (!token) {
      setIsValidToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        setIsValidToken(res.ok);
      } catch {
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 12) {
      setError("Das Passwort muss mindestens 12 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <p className="text-[var(--md-sys-color-on-surface-variant)]">
            Token wird überprüft...
          </p>
        </div>
      </div>
    );
  }

  if (!token || isValidToken === false) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <div className="w-16 h-16 bg-[var(--md-sys-color-error-container)] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[var(--md-sys-color-error)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
            Ungültiger oder abgelaufener Link
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Dieser Link zum Zurücksetzen des Passworts ist ungültig oder bereits abgelaufen.
            Bitte fordern Sie einen neuen Link an.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
          >
            Neuen Link anfordern
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
            Passwort erfolgreich geändert!
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
          </p>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Sie werden automatisch zur Anmeldeseite weitergeleitet...
          </p>
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
            <Lock className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
              Neues Passwort erstellen
            </h1>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Mindestens 12 Zeichen
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
            >
              Neues Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              placeholder="Mindestens 12 Zeichen"
              className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2"
            >
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={12}
              placeholder="Passwort wiederholen"
              className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent"
            />
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
            {isSubmitting ? "Wird gespeichert..." : "Passwort ändern"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            <strong>Sichere Passwörter:</strong>
          </p>
          <ul className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2 space-y-1 list-disc list-inside">
            <li>Mindestens 12 Zeichen</li>
            <li>Kombination aus Buchstaben, Zahlen und Sonderzeichen</li>
            <li>Nicht in anderen Diensten verwendet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <p className="text-[var(--md-sys-color-on-surface-variant)]">Lädt...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Kein Verifizierungs-Token gefunden.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          if (response.status === 410) {
            setErrorMessage("Der Verifizierungs-Link ist abgelaufen oder wurde bereits verwendet.");
          } else {
            setErrorMessage(data.error || "E-Mail-Verifizierung fehlgeschlagen.");
          }
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    };

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-[var(--md-sys-color-primary)] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
            E-Mail wird verifiziert...
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)]">
            Bitte warten Sie einen Moment.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
            E-Mail erfolgreich bestätigt!
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Ihr Account wurde aktiviert. Sie können sich jetzt anmelden.
          </p>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Sie werden automatisch zur Anmeldeseite weitergeleitet...
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
            >
              Jetzt anmelden
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
        <div className="w-16 h-16 bg-[var(--md-sys-color-error-container)] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[var(--md-sys-color-error)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
          Verifizierung fehlgeschlagen
        </h1>
        <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
          {errorMessage}
        </p>
        <div className="space-y-2">
          <Link
            href="/register"
            className="block rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
          >
            Erneut registrieren
          </Link>
          <Link
            href="/login"
            className="block text-[var(--md-sys-color-primary)] hover:underline text-sm"
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-16">
        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
          <p className="text-[var(--md-sys-color-on-surface-variant)]">Lädt...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    schulamtName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein");
      return;
    }

    if (formData.password.length < 12) {
      setError("Das Passwort muss mindestens 12 Zeichen lang sein");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          schulamtName: formData.schulamtName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1 text-center">
            <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
              Registrierung erfolgreich!
            </h1>
            <p className="text-[var(--md-sys-color-on-surface-variant)] mb-2">
              Wir haben Ihnen eine E-Mail zur Bestätigung Ihrer E-Mail-Adresse gesendet.
            </p>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-6">
              Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Zur Anmeldung
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] mb-4"
          >
            <UserPlus className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-primary-container)]">
            Schulamt Registrierung
          </h1>
          <p className="mt-2 text-[var(--md-sys-color-on-primary-container)] opacity-90">
            Erstellen Sie ein Konto für Ihre Schulamts-Verwaltung
          </p>
          <p className="mt-3 text-sm text-[var(--md-sys-color-on-primary-container)] opacity-75">
            💡 Als Schule benötigen Sie keinen Account – nutzen Sie Ihren Zugangscode
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-3 space-y-5"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </Link>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)] p-4"
            >
              <p className="text-sm text-[var(--md-sys-color-on-error-container)]">{error}</p>
            </motion.div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Ihr Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
              placeholder="Max Mustermann"
            />
          </div>

          <div>
            <label htmlFor="schulamtName" className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Name des Schulamts
            </label>
            <input
              id="schulamtName"
              name="schulamtName"
              type="text"
              required
              value={formData.schulamtName}
              onChange={(e) => setFormData({ ...formData, schulamtName: e.target.value })}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
              placeholder="Schulamt Musterstadt"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
              placeholder="ihre.email@schulamt.nrw.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
              placeholder="Mindestens 12 Zeichen"
            />
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Mindestens 12 Zeichen, mit Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
              placeholder="Passwort wiederholen"
            />
          </div>

          <div className="rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-variant)] p-4">
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihrer E-Mail-Adresse.
              Erst nach der Bestätigung können Sie sich anmelden.
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Wird registriert..." : "Jetzt registrieren"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}

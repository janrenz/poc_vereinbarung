"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Ungültige Anmeldedaten");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 px-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] mb-4"
          >
            <LogIn className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-primary-container)]">
            Schulamt Login
          </h1>
          <p className="mt-2 text-[var(--md-sys-color-on-primary-container)] opacity-90">
            Melden Sie sich an, um auf den Admin-Bereich zuzugreifen
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-3"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)] p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[var(--md-sys-color-error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--md-sys-color-on-error-container)]">
                {error}
              </p>
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
                placeholder="schulamt@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]"
              >
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </motion.button>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-[var(--md-sys-color-primary)] hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--md-sys-color-outline-variant)] text-center">
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Noch kein Konto?{" "}
              <Link
                href="/register"
                className="text-[var(--md-sys-color-primary)] hover:underline font-medium"
              >
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

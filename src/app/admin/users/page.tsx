import { prisma } from "@/lib/prisma";
import { isSuperAdmin, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "@/components/Link";
import { ArrowLeft, UserPlus, Shield, User, Mail, Calendar, CheckCircle, XCircle, FileText } from "lucide-react";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const superAdmin = await isSuperAdmin();
  const currentUser = await getCurrentUser();
  
  if (!superAdmin) {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function createUser(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const role = String(formData.get("role") || "ADMIN");

    if (!email || !password) {
      return;
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role as "SUPERADMIN" | "ADMIN",
        active: true,
      },
    });

    redirect("/admin/users");
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: { active: !currentStatus },
    });
    redirect("/admin/users");
  }

  async function deleteUser(userId: string) {
    "use server";
    await prisma.user.delete({
      where: { id: userId },
    });
    redirect("/admin/users");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
            <div>
              <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">
                Benutzerverwaltung
              </h1>
              <p className="text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Schulamt-Logins verwalten · Eingeloggt als: {currentUser?.email}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)]/20 border border-[var(--md-sys-color-primary)]">
          <p className="text-sm text-[var(--md-sys-color-on-surface)]">
            ℹ️ <strong>Hinweis:</strong> Als Superadmin haben Sie nur Zugriff auf die Benutzerverwaltung. Für die Verwaltung von Formularen benötigen Sie einen Admin-Account.
          </p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Neuen Benutzer anlegen
        </h2>
        <form action={createUser} className="space-y-4 max-w-2xl">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                placeholder="user@schulamt.de"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name (optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                placeholder="Max Mustermann"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Passwort *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={8}
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Rolle
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
              >
                <option value="ADMIN">Admin (Standard)</option>
                <option value="SUPERADMIN">Superadmin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Benutzer anlegen
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
          Benutzer ({users.length})
        </h2>

        {users.length === 0 ? (
          <p className="text-center py-8 text-[var(--md-sys-color-on-surface-variant)]">
            Noch keine Benutzer angelegt
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`border-2 rounded-[var(--md-sys-shape-corner-large)] p-4 transition-all ${
                  user.active
                    ? "border-[var(--md-sys-color-outline-variant)]"
                    : "border-[var(--md-sys-color-error)] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === "SUPERADMIN"
                            ? "bg-[var(--md-sys-color-tertiary-container)]"
                            : "bg-[var(--md-sys-color-primary-container)]"
                        }`}
                      >
                        {user.role === "SUPERADMIN" ? (
                          <Shield className="w-5 h-5 text-[var(--md-sys-color-on-tertiary-container)]" />
                        ) : (
                          <User className="w-5 h-5 text-[var(--md-sys-color-on-primary-container)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--md-sys-color-on-surface)]">
                            {user.name || user.email}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "SUPERADMIN"
                                ? "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]"
                                : "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                            }`}
                          >
                            {user.role}
                          </span>
                          {user.active ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-3 h-3" />
                              Deaktiviert
                            </span>
                          )}
                        </div>
                        {user.name && (
                          <div className="flex items-center gap-1 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Erstellt: {new Date(user.createdAt).toLocaleDateString("de-DE")}
                          </span>
                          {user.lastLoginAt && (
                            <span>
                              Letzter Login:{" "}
                              {new Date(user.lastLoginAt).toLocaleString("de-DE")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form action={toggleUserStatus.bind(null, user.id, user.active)}>
                      <button
                        type="submit"
                        className={`rounded-[var(--md-sys-shape-corner-full)] px-4 py-2 text-sm font-medium transition-all ${
                          user.active
                            ? "border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)]"
                            : "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:md-elevation-2"
                        }`}
                      >
                        {user.active ? "Deaktivieren" : "Aktivieren"}
                      </button>
                    </form>
                    <form action={deleteUser.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] px-4 py-2 text-sm font-medium hover:bg-[var(--md-sys-color-error-container)] transition-all"
                        onClick={(e) => {
                          if (!confirm(`Benutzer "${user.email}" wirklich löschen?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Löschen
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1 bg-[var(--md-sys-color-tertiary-container)]/30">
        <h3 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">
          ℹ️ Hinweise zur Benutzerverwaltung
        </h3>
        <ul className="text-sm text-[var(--md-sys-color-on-surface-variant)] space-y-1">
          <li>
            <strong>Admin:</strong> Kann Formulare verwalten, genehmigen und Benachrichtigungen
            sehen
          </li>
          <li>
            <strong>Superadmin:</strong> Kann zusätzlich Benutzer anlegen und verwalten
          </li>
          <li>
            <strong>Deaktivierte Benutzer</strong> können sich nicht mehr einloggen
          </li>
          <li>
            <strong>Passwörter</strong> werden sicher mit Bcrypt (12 Rounds) gehasht
          </li>
          <li>
            <strong>Löschen:</strong> Entfernt den Benutzer permanent aus der Datenbank
          </li>
        </ul>
      </div>
    </div>
  );
}


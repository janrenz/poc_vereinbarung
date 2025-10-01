import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, BellOff, Check, ArrowLeft, Clock, FileText } from "lucide-react";
import { getStatusLabel, getStatusColor } from "@/lib/status-labels";
import { markAsRead, markAllAsRead } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  // Superadmin hat keinen Zugriff auf Benachrichtigungen
  const { isSuperAdmin } = await import("@/lib/auth");
  const superAdmin = await isSuperAdmin();
  if (superAdmin) {
    redirect("/admin/users");
  }

  const notifications = await prisma.notification.findMany({
    where: {
      targetRole: "SCHULAMT",
    },
    include: {
      form: {
        include: {
          school: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Last 50 notifications
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsReadAction(notificationId: string) {
    "use server";
    await markAsRead(notificationId);
    redirect("/admin/notifications");
  }

  async function markAllAsReadAction() {
    "use server";
    await markAllAsRead("SCHULAMT");
    redirect("/admin/notifications");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
              <div>
                <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">
                  Benachrichtigungen
                </h1>
                <p className="text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  {unreadCount > 0 ? (
                    <span>
                      {unreadCount} ungelesen{unreadCount === 1 ? "e" : ""} Benachrichtigung
                      {unreadCount === 1 ? "" : "en"}
                    </span>
                  ) : (
                    "Alle Benachrichtigungen gelesen"
                  )}
                </p>
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <form action={markAllAsReadAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
              >
                <Check className="w-4 h-4" />
                Alle als gelesen markieren
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-12 md-elevation-1 text-center">
            <BellOff className="w-16 h-16 text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
              Keine Benachrichtigungen
            </h2>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              Sie haben noch keine Benachrichtigungen erhalten.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md-elevation-1 transition-all ${
                !notification.read
                  ? "border-l-4 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/10"
                  : "opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === "FORM_SUBMITTED"
                          ? "bg-[var(--md-sys-color-primary-container)]"
                          : notification.type === "FORM_APPROVED"
                          ? "bg-[var(--md-sys-color-tertiary-container)]"
                          : "bg-[var(--md-sys-color-secondary-container)]"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          notification.type === "FORM_SUBMITTED"
                            ? "text-[var(--md-sys-color-on-primary-container)]"
                            : notification.type === "FORM_APPROVED"
                            ? "text-[var(--md-sys-color-on-tertiary-container)]"
                            : "text-[var(--md-sys-color-on-secondary-container)]"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.createdAt).toLocaleString("de-DE", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            notification.form.status
                          )}`}
                        >
                          {getStatusLabel(notification.form.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/forms/${notification.formId}`}
                    className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-4 py-2 text-sm font-medium hover:md-elevation-2 transition-all"
                  >
                    Details ansehen
                  </Link>
                  {!notification.read && (
                    <form action={markAsReadAction.bind(null, notification.id)}>
                      <button
                        type="submit"
                        className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
                        aria-label="Als gelesen markieren"
                        title="Als gelesen markieren"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


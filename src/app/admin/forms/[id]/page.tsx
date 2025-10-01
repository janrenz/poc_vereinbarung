import { prisma } from "@/lib/prisma";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, School as SchoolIcon, CheckCircle2, XCircle, MessageSquare, FileText, Clock } from "lucide-react";
import { GanttChart } from "@/components/GanttChart";
import { CopyableCode } from "@/components/CopyableCode";
import { CopyableLink } from "@/components/CopyableLink";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";
import { DeleteFormButton } from "@/components/DeleteFormButton";
import { ReturnFormButton } from "@/components/ReturnFormButton";
import { ToggleAllDetails } from "@/components/ToggleAllDetails";
import { getStatusLabel, getStatusColor } from "@/lib/status-labels";
import { createNotification } from "@/lib/notifications";
import { sendEmail, getFormApprovedEmail, getFormReturnedEmail } from "@/lib/email";
import {
  ZIELBEREICH_1_LABELS,
  ZIELBEREICH_2_LABELS,
  ZIELBEREICH_3_LABELS,
  DATENGRUNDLAGE_LABELS,
  ZIELGRUPPE_LABELS,
  arrayToLabels,
} from "@/lib/form-labels";

export const dynamic = "force-dynamic";

export default async function AdminFormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  // Superadmin hat keinen Zugriff auf Formulare
  const { isSuperAdmin: checkSuperAdmin } = await import("@/lib/auth");
  const superAdmin = await checkSuperAdmin();
  if (superAdmin) {
    redirect("/admin/users");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      school: true,
      accessCode: true,
      entries: {
        orderBy: { createdAt: 'asc' }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!form) {
    redirect("/admin");
  }

  // Authorization: Only allow access if user created this form
  if (form.createdById !== currentUser.id) {
    redirect("/admin");
  }

  // Mark all unread notifications for this form as read
  const { markFormNotificationsAsRead } = await import("@/lib/notifications");
  await markFormNotificationsAsRead(id, "SCHULAMT");

  async function approveForm() {
    "use server";
    const updatedForm = await prisma.form.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date() },
      include: { school: true },
    });

    // Create notification for school
    await createNotification(
      id,
      "FORM_APPROVED",
      `Ihre Zielvereinbarung wurde angenommen`,
      "SCHULE"
    );

    // Send email to school (if email is available)
    const schoolEmail = updatedForm.school.address; // TODO: Add email field to School model
    if (schoolEmail && schoolEmail.includes("@")) {
      const accessCode = await prisma.accessCode.findUnique({ where: { formId: id } });
      if (accessCode) {
        const emailContent = getFormApprovedEmail(
          updatedForm.school.name,
          accessCode.code
        );
        await sendEmail({
          to: schoolEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    }

    redirect("/admin");
  }

  async function returnForm(formData: FormData) {
    "use server";
    const message = String(formData.get("message") || "").trim();
    const updatedForm = await prisma.form.update({
      where: { id },
      data: { status: "RETURNED" },
      include: { school: true },
    });
    if (message) {
      await prisma.comment.create({
        data: {
          formId: id,
          authorRole: "SCHULAMT",
          authorName: "Schulamt",
          message,
        },
      });

      // Create notification for school
      await createNotification(
        id,
        "FORM_RETURNED",
        `Ihre Zielvereinbarung wurde zur Überarbeitung zurückgegeben`,
        "SCHULE"
      );

      // Send email to school (if email is available)
      const schoolEmail = updatedForm.school.address; // TODO: Add email field to School model
      if (schoolEmail && schoolEmail.includes("@")) {
        const accessCode = await prisma.accessCode.findUnique({ where: { formId: id } });
        if (accessCode) {
          const emailContent = getFormReturnedEmail(
            updatedForm.school.name,
            accessCode.code,
            message
          );
          await sendEmail({
            to: schoolEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        }
      }
    }
    redirect("/admin");
  }

  async function addComment(formData: FormData) {
    "use server";
    const message = String(formData.get("comment") || "").trim();
    if (message) {
      await prisma.comment.create({
        data: {
          formId: id,
          authorRole: "SCHULAMT",
          authorName: "Schulamt",
          message,
        },
      });
    }
    redirect(`/admin/forms/${id}`);
  }

  async function deleteForm() {
    "use server";
    await prisma.form.delete({
      where: { id },
    });
    redirect("/admin");
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
            <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
              Formular-Details
            </h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(form.status)}`}>
            {getStatusLabel(form.status)}
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
              <SchoolIcon className="w-5 h-5 text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Schule</div>
              <div className="font-semibold">{form.school.name}</div>
            </div>
          </div>

          {form.accessCode && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--md-sys-color-on-secondary-container)]" />
              </div>
              <div className="flex flex-col gap-2">
                <CopyableCode code={form.accessCode.code} />
                <CopyableLink code={form.accessCode.code} />
              </div>
            </div>
          )}

          {form.date && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-tertiary-container)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--md-sys-color-on-tertiary-container)]" />
              </div>
              <div>
                <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Datum</div>
                <div className="font-semibold">
                  {new Date(form.date).toLocaleDateString("de-DE")}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Einträge</div>
              <div className="font-semibold">{form.entries.length}</div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        {(form.submittedAt || form.approvedAt) && (
          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex flex-wrap gap-6">
            {form.submittedAt && (
              <div>
                <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Versendet am</div>
                <div className="font-semibold text-[var(--md-sys-color-on-surface)]">
                  {new Date(form.submittedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} Uhr
                </div>
              </div>
            )}
            {form.approvedAt && (
              <div>
                <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Angenommen am</div>
                <div className="font-semibold text-[var(--md-sys-color-primary)]">
                  {new Date(form.approvedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} Uhr
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1" id="entries-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
            Zielvereinbarungs-Einträge
          </h2>
          {form.entries.length > 0 && (
            <ToggleAllDetails containerId="entries-container" />
          )}
        </div>

        {form.entries.length === 0 ? (
          <div className="text-center py-12 text-[var(--md-sys-color-on-surface-variant)]">
            <p>Noch keine Einträge vorhanden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.entries.map((entry, index) => (
              <details
                key={entry.id}
                className="group border-2 border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-large)] overflow-hidden"
              >
                <summary className="cursor-pointer p-4 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors list-none">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                          Eintrag #{index + 1}
                        </span>
                        {entry.beginnSchuljahr && (
                          <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                            📅 {entry.beginnSchuljahr}/{entry.beginnHalbjahr} - {entry.endeSchuljahr}/{entry.endeHalbjahr}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[var(--md-sys-color-on-surface)]">
                        {"title" in entry && entry.title ? entry.title : entry.zielsetzungenText || "Ohne Titel"}
                      </h3>
                    </div>
                    <span className="text-[var(--md-sys-color-primary)] group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </div>
                </summary>

                <div className="p-6 bg-[var(--md-sys-color-surface-variant)]/30 space-y-4">
                  {/* Zielbereiche */}
                  {((entry.zielbereich1 && Array.isArray(entry.zielbereich1) && entry.zielbereich1.length > 0) ||
                    (entry.zielbereich2 && Array.isArray(entry.zielbereich2) && entry.zielbereich2.length > 0) ||
                    (entry.zielbereich3 && Array.isArray(entry.zielbereich3) && entry.zielbereich3.length > 0)) && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Zielbereiche</h4>
                      <div className="space-y-2">
                        {entry.zielbereich1 && Array.isArray(entry.zielbereich1) && entry.zielbereich1.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-[var(--md-sys-color-primary)]">Schulkompass NRW 2030:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(entry.zielbereich1 as string[]).map((item, i) => (
                                <span key={i} className="px-2 py-1 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded text-xs">
                                  {ZIELBEREICH_1_LABELS[item] || item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.zielbereich2 && Array.isArray(entry.zielbereich2) && entry.zielbereich2.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-[var(--md-sys-color-primary)]">Startchancenprogramm:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(entry.zielbereich2 as string[]).map((item, i) => (
                                <span key={i} className="px-2 py-1 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded text-xs">
                                  {ZIELBEREICH_2_LABELS[item] || item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.zielbereich3 && Array.isArray(entry.zielbereich3) && entry.zielbereich3.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-[var(--md-sys-color-primary)]">RRSQ:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(entry.zielbereich3 as string[]).map((item, i) => (
                                <span key={i} className="px-2 py-1 bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] rounded text-xs">
                                  {ZIELBEREICH_3_LABELS[item] || item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Maßnahmen */}
                  {entry.massnahmen && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Maßnahmen zur Zielerreichung</h4>
                      <p className="text-[var(--md-sys-color-on-surface-variant)]">{entry.massnahmen}</p>
                    </div>
                  )}

                  {/* Indikatoren */}
                  {entry.indikatoren && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Indikatoren</h4>
                      <p className="text-[var(--md-sys-color-on-surface-variant)]">{entry.indikatoren}</p>
                    </div>
                  )}

                  {/* Verantwortliche */}
                  {(entry.verantwortlich || entry.beteiligt) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {entry.verantwortlich && (
                        <div>
                          <h4 className="font-semibold mb-1 text-[var(--md-sys-color-on-surface)]">Verantwortlich</h4>
                          <p className="text-[var(--md-sys-color-on-surface-variant)]">{entry.verantwortlich}</p>
                        </div>
                      )}
                      {entry.beteiligt && (
                        <div>
                          <h4 className="font-semibold mb-1 text-[var(--md-sys-color-on-surface)]">Beteiligt</h4>
                          <p className="text-[var(--md-sys-color-on-surface-variant)]">{entry.beteiligt}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fortbildung */}
                  {entry.fortbildungJa && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Fortbildung</h4>
                      {entry.fortbildungThemen && (
                        <p className="text-sm mb-1">
                          <span className="font-medium">Themen:</span> {entry.fortbildungThemen}
                        </p>
                      )}
                      {entry.fortbildungZielgruppe && (
                        <p className="text-sm">
                          <span className="font-medium">Zielgruppe:</span> {entry.fortbildungZielgruppe}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Gantt Chart */}
      {form.entries.length > 0 && (
        <GanttChart entries={form.entries} schoolName={form.school.name} />
      )}

      {/* Comments Section */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Kommentare & Feedback
        </h2>

        {/* Add Comment Form */}
        <form action={addComment} className="mb-6">
          <textarea
            name="comment"
            rows={3}
            placeholder="Kommentar hinzufügen..."
            className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent"
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-2 font-medium hover:md-elevation-2 transition-all"
            >
              Kommentar hinzufügen
            </button>
          </div>
        </form>

        {/* Comments List */}
        {form.comments.length === 0 ? (
          <p className="text-center text-[var(--md-sys-color-on-surface-variant)] py-4">
            Noch keine Kommentare vorhanden
          </p>
        ) : (
          <div className="space-y-3">
            {form.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-variant)]/50 border border-[var(--md-sys-color-outline-variant)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                      {comment.authorName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                      {comment.authorRole}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    {new Date(comment.createdAt).toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">{comment.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
          Aktionen
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Approve Button */}
          <form action={approveForm} className="flex-1">
            <button
              type="submit"
              disabled={form.status === "APPROVED"}
              className="w-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Zielvereinbarung annehmen
            </button>
          </form>

          {/* Return Button with Modal */}
          <form action={returnForm} className="flex-1" data-return-form>
            <ReturnFormButton disabled={form.status === "APPROVED"} />
          </form>

          {/* Small JSON Export Button */}
          <Link
            href={`/api/forms/${id}/export?format=json`}
            className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            JSON
          </Link>
        </div>

        {/* Delete Form Section */}
        <div className="mt-6 pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--md-sys-color-error)] mb-1">
                Gefahrenzone
              </h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Das Löschen eines Formulars kann nicht rückgängig gemacht werden. Alle zugehörigen Einträge und Kommentare werden ebenfalls gelöscht.
              </p>
            </div>
            <form action={deleteForm}>
              <DeleteFormButton schoolName={form.school.name} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


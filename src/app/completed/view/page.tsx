import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "@/components/Link";
import { ArrowLeft, FileCheck, Download, Calendar, CheckCircle } from "lucide-react";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";
import { GanttChart } from "@/components/GanttChart";
import { ToggleAllDetails } from "@/components/ToggleAllDetails";
import { getStatusLabel, getStatusColor } from "@/lib/status-labels";
import {
  ZIELBEREICH_1_LABELS,
  ZIELBEREICH_2_LABELS,
  ZIELBEREICH_3_LABELS,
} from "@/lib/form-labels";

export const dynamic = "force-dynamic";

export default async function CompletedViewPage({
  searchParams,
}: {
  searchParams: Promise<{ schoolNumber?: string; code?: string }>;
}) {
  const params = await searchParams;
  const schoolNumber = params.schoolNumber?.trim();
  const accessCode = params.code?.trim().toUpperCase();

  if (!schoolNumber || !accessCode) {
    redirect("/completed");
  }

  // First, verify that the access code exists and matches the school
  const codeRecord = await prisma.accessCode.findUnique({
    where: { code: accessCode },
    include: {
      form: {
        include: {
          school: true,
        },
      },
    },
  });

  // Verify that the code belongs to a form for this school
  if (!codeRecord || codeRecord.form.school.schoolNumber !== schoolNumber) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-error-container)] mb-4">
            <FileCheck className="w-8 h-8 text-[var(--md-sys-color-on-error-container)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
            Zugriff verweigert
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Die Kombination aus Schulnummer und Zugangscode ist ungültig.
          </p>
          <Link
            href="/completed"
            className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Suche
          </Link>
        </div>
      </div>
    );
  }

  // Find school by school number with matching forms
  const school = await prisma.school.findFirst({
    where: { schoolNumber },
    include: {
      forms: {
        where: {
          status: {
            in: ["SUBMITTED", "APPROVED"],
          },
        },
        include: {
          accessCode: true,
          entries: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!school) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-error-container)] mb-4">
            <FileCheck className="w-8 h-8 text-[var(--md-sys-color-on-error-container)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
            Keine Schule gefunden
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Für die Schulnummer <strong>{schoolNumber}</strong> wurden keine Daten gefunden.
          </p>
          <Link
            href="/completed"
            className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Suche
          </Link>
        </div>
      </div>
    );
  }

  if (school.forms.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--md-sys-color-tertiary-container)] mb-4">
            <FileCheck className="w-8 h-8 text-[var(--md-sys-color-on-tertiary-container)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
            Keine abgeschlossenen Zielvereinbarungen
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)] mb-6">
            Für <strong>{school.name}</strong> liegen noch keine abgeschlossenen oder eingereichten Zielvereinbarungen vor.
          </p>
          <Link
            href="/completed"
            className="inline-flex items-center gap-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium hover:md-elevation-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zur Suche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <Link
          href="/completed"
          className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Suche
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
              {school.name}
            </h1>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              Schulnummer: {school.schoolNumber}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
            <CheckCircle className="w-5 h-5" />
            {school.forms.length} {school.forms.length === 1 ? "Zielvereinbarung" : "Zielvereinbarungen"}
          </div>
        </div>
      </div>

      {/* Forms List */}
      {school.forms.map((form) => (
        <div key={form.id} className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1 space-y-6">
          {/* Form Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(form.status)}`}>
                  {getStatusLabel(form.status)}
                </span>
                {form.date && (
                  <span className="text-sm text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(form.date).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
              {form.submittedAt && (
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Versendet am: {new Date(form.submittedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} Uhr
                </p>
              )}
              {form.approvedAt && (
                <p className="text-sm text-[var(--md-sys-color-primary)] font-medium">
                  Angenommen am: {new Date(form.approvedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} Uhr
                </p>
              )}
            </div>
            {form.accessCode && form.entries.length > 0 && (
              <PDFDownloadButton
                schoolName={school.name}
                accessCode={form.accessCode.code}
                date={form.date}
                status={form.status}
                entries={form.entries}
                submittedAt={form.submittedAt}
                approvedAt={form.approvedAt}
                label="Als PDF herunterladen"
                className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-2 font-medium hover:md-elevation-2 transition-all flex items-center gap-2"
              />
            )}
          </div>

          {/* Entries */}
          {form.entries.length === 0 ? (
            <p className="text-center text-[var(--md-sys-color-on-surface-variant)] py-8">
              Keine Einträge vorhanden
            </p>
          ) : (
            <>
              <div className="space-y-4" id={`entries-container-${form.id}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
                    Maßnahmen
                  </h2>
                  <ToggleAllDetails containerId={`entries-container-${form.id}`} />
                </div>
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
                              Maßnahme #{index + 1}
                            </span>
                            {entry.beginnSchuljahr && (
                              <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                                📅 {entry.beginnSchuljahr}/{entry.beginnHalbjahr} - {entry.endeSchuljahr}/{entry.endeHalbjahr}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-[var(--md-sys-color-on-surface)]">
                            {entry.title || entry.zielsetzungenText || "Ohne Titel"}
                          </h3>
                        </div>
                        <span className="text-[var(--md-sys-color-primary)] group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </div>
                    </summary>

                    <div className="p-6 bg-[var(--md-sys-color-surface-variant)]/30 space-y-4">
                      {/* Zielsetzungen */}
                      {entry.zielsetzungenText && (
                        <div>
                          <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Zielsetzungen</h4>
                          <p className="text-sm">{entry.zielsetzungenText}</p>
                        </div>
                      )}

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
                                <div className="flex-wrap gap-2 mt-1">
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
                          <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Maßnahme(n)</h4>
                          <p className="text-sm">{entry.massnahmen}</p>
                        </div>
                      )}

                      {/* Indikatoren */}
                      {entry.indikatoren && (
                        <div>
                          <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Indikatoren</h4>
                          <p className="text-sm">{entry.indikatoren}</p>
                        </div>
                      )}

                      {/* Verantwortliche */}
                      {(entry.verantwortlich || entry.beteiligt) && (
                        <div>
                          <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Verantwortliche / Beteiligte</h4>
                          {entry.verantwortlich && (
                            <p className="text-sm mb-1">
                              <span className="font-medium">Verantwortlich:</span> {entry.verantwortlich}
                            </p>
                          )}
                          {entry.beteiligt && (
                            <p className="text-sm">
                              <span className="font-medium">Beteiligt:</span> {entry.beteiligt}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Zeitraum */}
                      {(entry.beginnSchuljahr || entry.endeSchuljahr) && (
                        <div>
                          <h4 className="font-semibold mb-2 text-[var(--md-sys-color-on-surface)]">Zeitraum</h4>
                          <p className="text-sm">
                            {entry.beginnSchuljahr && entry.beginnHalbjahr && (
                              <span>
                                Beginn: {entry.beginnSchuljahr}/{entry.beginnHalbjahr}. Halbjahr
                              </span>
                            )}
                            {entry.endeSchuljahr && entry.endeHalbjahr && (
                              <span>
                                {" "}– Ende: {entry.endeSchuljahr}/{entry.endeHalbjahr}. Halbjahr
                              </span>
                            )}
                          </p>
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

              {/* Gantt Chart */}
              <GanttChart entries={form.entries} schoolName={school.name} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}


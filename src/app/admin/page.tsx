import { prisma } from "@/lib/prisma";
import { isAuthenticated, isSuperAdmin, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "@/components/Link";
import { SchoolSearchCreateClient } from "@/components/SchoolSearchCreateClient";
import { CopyableCode } from "@/components/CopyableCode";
import { CopyableLink } from "@/components/CopyableLink";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";
import { getStatusLabel, getStatusColor } from "@/lib/status-labels";
import { Users, Shield } from "lucide-react";
// Avoid importing Prisma types to keep build simple; use inferred type instead
type FormWithRelations = Awaited<ReturnType<typeof prisma.form.findFirst>> & { 
  accessCode: { code: string } | null; 
  school: { name: string };
  entries: Array<{
    id: string;
    title: string;
    zielsetzungenText: string | null;
    zielbereich1: unknown;
    zielbereich2: unknown;
    zielbereich3: unknown;
    datengrundlage: unknown;
    datengrundlageAndere: string | null;
    zielgruppe: unknown;
    zielgruppeSusDetail: string | null;
    massnahmen: string | null;
    indikatoren: string | null;
    verantwortlich: string | null;
    beteiligt: string | null;
    beginnSchuljahr: string | null;
    beginnHalbjahr: number | null;
    endeSchuljahr: string | null;
    endeHalbjahr: number | null;
    fortbildungJa: boolean;
    fortbildungThemen: string | null;
    fortbildungZielgruppe: string | null;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  const superAdmin = await isSuperAdmin();

  // Superadmin hat nur Zugriff auf Benutzerverwaltung, nicht auf Formulare
  if (superAdmin) {
    redirect("/admin/users");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  // Only show forms created by the current user
  const recent: FormWithRelations[] = await prisma.form.findMany({
    where: {
      createdById: currentUser.id,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { accessCode: true, school: true, entries: true },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Schulamt – Formulare</h1>
      </div>
      <SchoolSearchCreate />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Letzte Formulare</h2>
        <div className="grid gap-2">
          {recent.map((f: FormWithRelations) => (
            <AdminFormCard key={f.id} form={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminFormCard({ form }: { form: FormWithRelations }) {
  return (
    <div className="rounded-lg border-2 border-slate-200 p-4 bg-white hover:border-[var(--md-sys-color-primary)] hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="font-semibold text-lg mb-2">{form.school?.name}</div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={`px-2 py-1 rounded-full ${getStatusColor(form.status)}`}>
              {getStatusLabel(form.status)}
            </span>
            {form.accessCode?.code && (
              <>
                <CopyableCode code={form.accessCode.code} label="Code" />
                <CopyableLink code={form.accessCode.code} />
              </>
            )}
            {form.date && (
              <span className="text-slate-500">
                📅 {new Date(form.date).toLocaleDateString("de-DE")}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-3">
        <Link 
          href={`/admin/forms/${form.id}`}
          className="inline-flex items-center text-[var(--md-sys-color-primary)] text-sm font-medium hover:underline"
        >
          Details ansehen →
        </Link>
        {form.accessCode && form.entries && form.entries.length > 0 && (
          <PDFDownloadButton
            schoolName={form.school.name}
            accessCode={form.accessCode.code}
            date={form.date || null}
            status={form.status || "DRAFT"}
            entries={form.entries}
            submittedAt={form.submittedAt}
            approvedAt={form.approvedAt}
            label="PDF"
            className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors flex items-center gap-2"
          />
        )}
      </div>
    </div>
  );
}

function SchoolSearchCreate() {
  return <SchoolSearchCreateClient />;
}

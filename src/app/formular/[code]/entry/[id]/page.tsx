import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FormNavigation } from "@/components/FormNavigation";
import { EntryFormWithAutosaveClient } from "@/components/EntryFormWithAutosaveClient";
import { EntryFormStickyNav } from "@/components/EntryFormStickyNav";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ code: string; id: string }>;
}) {
  const { code: rawCode, id } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();

  const ac = await prisma.accessCode.findUnique({
    where: { code },
    include: { form: { include: { school: true, entries: true } } },
  });

  if (!ac || !ac.form) {
    redirect("/formular?invalid=1");
  }

  const entry = ac.form.entries.find((e) => e.id === id);
  if (!entry) {
    redirect(`/formular/${code}`);
  }

  // Check which sections are filled for the sticky nav
  const filledSections = new Set<string>();
  if (entry.title) filledSections.add("title");
  if (entry.zielsetzungenText || (Array.isArray(entry.zielbereich1) && entry.zielbereich1.length > 0)) {
    filledSections.add("section-1");
  }
  if (Array.isArray(entry.datengrundlage) && entry.datengrundlage.length > 0) {
    filledSections.add("section-2");
  }
  if (Array.isArray(entry.zielgruppe) && entry.zielgruppe.length > 0) {
    filledSections.add("section-3");
  }
  if (entry.massnahmen) filledSections.add("section-4");
  if (entry.indikatoren) filledSections.add("section-5");
  if (entry.verantwortlich || entry.beteiligt) filledSections.add("section-6");
  if (entry.beginnSchuljahr || entry.endeSchuljahr) filledSections.add("section-7");
  if (entry.fortbildungJa !== null) filledSections.add("section-8");

  return (
    <div className="grid lg:grid-cols-[280px_1fr_240px] gap-6">
      {/* Left Sidebar - Form Navigation */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-6">
          <FormNavigation
            code={code}
            schoolName={ac.form.school.name}
            entries={ac.form.entries}
            currentEntryId={id}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="space-y-6 min-w-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <FormNavigation
            code={code}
            schoolName={ac.form.school.name}
            entries={ac.form.entries}
            currentEntryId={id}
          />
        </div>

        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
            Eintrag bearbeiten
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)]">
            {ac.form.school.name}
          </p>
        </div>

        <EntryFormWithAutosaveClient
          entryId={id}
          formId={ac.form.id}
          code={code}
          initialData={entry}
        />
      </div>

      {/* Right Sidebar - Section Navigation */}
      <aside className="hidden xl:block">
        <EntryFormStickyNav filledSections={filledSections} />
      </aside>
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EntryFormWithAutosaveClient } from "@/components/EntryFormWithAutosaveClient";
import { FormNavigation } from "@/components/FormNavigation";

export default async function NewEntryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();
  
  const ac = await prisma.accessCode.findUnique({
    where: { code },
    include: { form: { include: { school: true, entries: true } } },
  });

  if (!ac || !ac.form) {
    redirect("/formular?invalid=1");
  }

  const form = ac.form;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-6">
          <FormNavigation
            code={code}
            schoolName={form.school.name}
            entries={form.entries}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <FormNavigation
            code={code}
            schoolName={form.school.name}
            entries={form.entries}
          />
        </div>

        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] mb-2">
            Neuer Eintrag
          </h1>
          <p className="text-[var(--md-sys-color-on-surface-variant)]">
            {form.school.name}
          </p>
        </div>

      <EntryFormWithAutosaveClient
        formId={form.id}
        code={code}
      />
      </div>
    </div>
  );
}


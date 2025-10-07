import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "@/components/Link";
import { FormNavigation } from "@/components/FormNavigation";
import { GanttChart } from "@/components/GanttChart";
import { EntryListClient } from "@/components/EntryListClient";
import { CopyableCode } from "@/components/CopyableCode";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";
import { getStatusLabel } from "@/lib/status-labels";
import { createNotification } from "@/lib/notifications";
import { sendEmail, getFormSubmittedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function FormByCodePage({ params }: { params: Promise<{ code: string }> }) {
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
  const school = form.school;

  // Redirect to completed view if form is submitted or approved
  if (form.status === "SUBMITTED" || form.status === "APPROVED") {
    if (school.schoolNumber && code) {
      redirect(`/completed/view?schoolNumber=${encodeURIComponent(school.schoolNumber)}&code=${encodeURIComponent(code)}`);
    } else {
      // Fallback if school has no school number
      redirect("/completed");
    }
  }

  async function submitForm() {
    "use server";
    const updatedForm = await prisma.form.update({
      where: { id: form.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date()
      },
      include: { school: true },
    });

    // Create notification for Schulaufsicht
    await createNotification(
      form.id,
      "FORM_SUBMITTED",
      `Neue Zielvereinbarung von ${updatedForm.school.name} eingereicht`,
      "SCHULAUFSICHT"
    );

    // Send email notification to Schulaufsicht
    const schulaufsichtEmail = process.env.SCHULAUFSICHT_EMAIL || "schulaufsicht@example.com";
    const emailContent = getFormSubmittedEmail(
      updatedForm.school.name,
      form.id,
      code
    );
    await sendEmail({
      to: schulaufsichtEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    redirect(`/formular/${code}`);
  }

  async function deleteEntry(entryId: string) {
    "use server";

    // Security: Only allow deletion if form is in DRAFT or RETURNED status
    if (form.status !== "DRAFT" && form.status !== "RETURNED") {
      throw new Error("Entries can only be deleted from draft or returned forms");
    }

    // Verify that the entry belongs to this form
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { formId: true },
    });

    if (!entry || entry.formId !== form.id) {
      throw new Error("Entry not found or access denied");
    }

    // Delete the entry
    await prisma.entry.delete({
      where: { id: entryId },
    });

    redirect(`/formular/${code}`);
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar Navigation - Hidden on mobile, visible on larger screens */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-6">
          <FormNavigation
            code={code}
            schoolName={school.name}
            entries={form.entries}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Mobile Navigation - Visible only on smaller screens */}
        <div className="lg:hidden">
          <FormNavigation
            code={code}
            schoolName={school.name}
            entries={form.entries}
          />
        </div>

        <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] mb-4">
          Zielvereinbarung für {school.name}
        </h1>
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <CopyableCode code={code} />
          <div className="text-[var(--md-sys-color-on-surface-variant)]">
            <span className="font-medium">Datum:</span>{" "}
            {form.date ? new Date(form.date).toLocaleDateString("de-DE") : "Nicht gesetzt"}
          </div>
          <div className="text-[var(--md-sys-color-on-surface-variant)]">
            <span className="font-medium">Status:</span> {getStatusLabel(form.status)}
          </div>
          {form.submittedAt && (
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              <span className="font-medium">Versendet am:</span>{" "}
              {new Date(form.submittedAt).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })} Uhr
            </div>
          )}
          {form.approvedAt && (
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              <span className="font-medium">Angenommen am:</span>{" "}
              {new Date(form.approvedAt).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              })} Uhr
            </div>
          )}
        </div>
      </div>

      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-6 md-elevation-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
            Einträge ({form.entries.length})
          </h2>
          <Link
            href={`/formular/${code}/entry/new`}
            className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-4 py-2 font-medium md-elevation-1 hover:md-elevation-2 transition-all"
          >
            + Neuer Eintrag
          </Link>
        </div>

        <EntryListClient
          entries={form.entries}
          code={code}
          deleteEntry={deleteEntry}
          canDelete={form.status === "DRAFT" || form.status === "RETURNED"}
        />
      </div>

      {/* Gantt Chart */}
      {form.entries.length > 0 && (
        <GanttChart entries={form.entries} schoolName={school.name} />
      )}

      {form.entries.length > 0 && (
        <div className="flex flex-wrap justify-end gap-3">
          <PDFDownloadButton
            schoolName={school.name}
            accessCode={code}
            date={form.date}
            status={form.status}
            entries={form.entries}
            submittedAt={form.submittedAt}
            approvedAt={form.approvedAt}
            className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] px-6 py-2 font-medium hover:bg-[var(--md-sys-color-surface-variant)] transition-colors flex items-center gap-2"
          />
          <form action={submitForm}>
            <button 
              type="submit"
              className="rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-2 font-medium md-elevation-1 hover:md-elevation-2 transition-all"
            >
              Absenden
            </button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}

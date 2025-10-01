import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function toCsv(rows: Array<Record<string, string | number | boolean>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number | boolean) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "json").toLowerCase();
  const { id } = await context.params;
  const form = await prisma.form.findUnique({
    where: { id },
    include: { school: true, comments: true, accessCode: true, entries: true },
  });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check authorization: user must be the creator of the form
  if (form.createdById !== currentUser.id) {
    return NextResponse.json(
      { error: "Forbidden: You can only export forms you created" },
      { status: 403 }
    );
  }

  const flat = {
    id: form.id,
    status: form.status,
    schoolName: form.school.name,
    schoolCity: form.school.city ?? "",
    date: form.date?.toISOString() ?? "",
    submittedAt: form.submittedAt?.toISOString() ?? "",
    approvedAt: form.approvedAt?.toISOString() ?? "",
    entriesCount: form.entries.length.toString(),
  };

  if (format === "csv") {
    const csv = toCsv([flat]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=form_${form.id}.csv`,
      },
    });
  }

  return NextResponse.json({ form });
}



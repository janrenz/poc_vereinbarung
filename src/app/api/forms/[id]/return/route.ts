import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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

  const body = await req.json().catch(() => ({}));
  const message = String(body?.message || "").trim();
  const { id } = await context.params;

  // Check authorization: user must be the creator of the form
  const form = await prisma.form.findUnique({
    where: { id },
    select: { createdById: true },
  });

  if (!form) {
    return NextResponse.json(
      { error: "Form not found" },
      { status: 404 }
    );
  }

  if (form.createdById !== currentUser.id) {
    return NextResponse.json(
      { error: "Forbidden: You can only return forms you created" },
      { status: 403 }
    );
  }

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
  }
  console.log(`Form returned for ${updatedForm.school.name} (id=${updatedForm.id}) by user ${currentUser.email}: ${message}`);
  return NextResponse.json({ form: updatedForm });
}



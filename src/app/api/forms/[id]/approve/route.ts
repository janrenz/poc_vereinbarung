import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: Request,
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
      { error: "Forbidden: You can only approve forms you created" },
      { status: 403 }
    );
  }

  const updatedForm = await prisma.form.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
    include: { school: true },
  });
  console.log(`Form approved for ${updatedForm.school.name} (id=${updatedForm.id}) by user ${currentUser.email}`);
  return NextResponse.json({ form: updatedForm });
}



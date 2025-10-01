import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessCode } from "@/lib/code";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  // Check authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const school = body?.school;

  if (!school?.externalId || !school?.name) {
    return NextResponse.json(
      { error: "Missing school.externalId or school.name" },
      { status: 400 }
    );
  }

  const dbSchool = await prisma.school.upsert({
    where: { externalId: String(school.externalId) },
    update: {
      name: String(school.name),
      address: school.address ?? null,
      city: school.city ?? null,
      state: school.state ?? null,
    },
    create: {
      externalId: String(school.externalId),
      name: String(school.name),
      address: school.address ?? null,
      city: school.city ?? null,
      state: school.state ?? null,
    },
  });

  // Generate a unique access code
  let code = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateAccessCode(8);
    const exists = await prisma.accessCode.findUnique({ where: { code: candidate } });
    if (!exists) {
      code = candidate;
      break;
    }
  }
  if (!code) code = generateAccessCode(10);

  const form = await prisma.form.create({
    data: {
      schoolId: dbSchool.id,
      createdById: currentUser.id,
      title: body?.title ?? null,
      date: new Date(),
      accessCode: { create: { code } },
    },
    include: { accessCode: true, school: true },
  });

  console.log(`Form created for ${dbSchool.name} with access code ${code} by user ${currentUser.email}`);
  return NextResponse.json({ form });
}



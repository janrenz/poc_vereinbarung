import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@schulamt.nrw";
  const password = "Change-Me-123!"; // WICHTIG: Passwort nach erstem Login ändern!
  const name = "Superadmin";

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log(`✓ Superadmin existiert bereits: ${email}`);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create superadmin
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "SUPERADMIN",
      active: true,
    },
  });

  console.log("✓ Superadmin erstellt!");
  console.log(`  E-Mail: ${email}`);
  console.log(`  Passwort: ${password}`);
  console.log(`  Rolle: ${user.role}`);
  console.log("");
  console.log("⚠️  WICHTIG: Bitte ändern Sie das Passwort nach dem ersten Login!");
  console.log(`  Login: http://localhost:3000/login`);
}

main()
  .catch((e) => {
    console.error("Fehler:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




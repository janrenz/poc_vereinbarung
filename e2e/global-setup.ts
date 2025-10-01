import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Global setup for Playwright E2E tests
 * Resets database to a clean state before test run
 */
async function globalSetup() {
  console.log('🧹 Resetting test database...');
  
  const prisma = new PrismaClient();

  try {
    // Clean existing data
    await prisma.notification.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.entry.deleteMany();
    await prisma.accessCode.deleteMany();
    await prisma.form.deleteMany();
    await prisma.school.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const demoAdminPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: 'admin@schulamt.nrw',
        password: demoAdminPassword,
        name: 'Demo Admin',
        role: 'ADMIN',
        active: true,
      },
    });

    const demoSuperadminPassword = await bcrypt.hash('superadmin123', 12);
    await prisma.user.create({
      data: {
        email: 'superadmin@schulamt.nrw',
        password: demoSuperadminPassword,
        name: 'Demo Superadmin',
        role: 'SUPERADMIN',
        active: true,
      },
    });

    const schulamtPassword = await bcrypt.hash('schulamt123', 12);
    await prisma.user.create({
      data: {
        email: 'schulamt@example.com',
        password: schulamtPassword,
        name: 'Schulamt Test User',
        role: 'ADMIN',
        active: true,
      },
    });

    // Create test schools
    const school1 = await prisma.school.create({
      data: {
        externalId: 'test-school-1',
        schoolNumber: '123456',
        name: 'Gesamtschule Musterstadt',
        address: 'Schulstraße 123',
        city: 'Musterstadt',
        state: 'Nordrhein-Westfalen',
      },
    });

    const school2 = await prisma.school.create({
      data: {
        externalId: 'test-school-2',
        schoolNumber: '654321',
        name: 'Gymnasium Beispielstadt',
        address: 'Bildungsweg 456',
        city: 'Beispielstadt',
        state: 'Nordrhein-Westfalen',
      },
    });

    const school3 = await prisma.school.create({
      data: {
        externalId: 'test-school-3',
        schoolNumber: '789012',
        name: 'Realschule am Park',
        address: 'Parkstraße 789',
        city: 'Teststadt',
        state: 'Nordrhein-Westfalen',
      },
    });

    // Create test forms - NOTE: Use DRAFT status for test forms to avoid redirects
    await prisma.form.create({
      data: {
        schoolId: school1.id,
        title: 'Test Zielvereinbarung 2024/2025',
        date: new Date('2024-08-01'),
        status: 'DRAFT',
        accessCode: {
          create: {
            code: 'TEST1234',
          },
        },
      },
    });

    await prisma.form.create({
      data: {
        schoolId: school2.id,
        title: 'Test Zielvereinbarung 2024/2025',
        date: new Date('2024-09-01'),
        status: 'DRAFT',
        accessCode: {
          create: {
            code: 'GYMN5678',
          },
        },
      },
    });

    // REAL9999 - Keep as DRAFT for most tests to avoid redirect issues
    await prisma.form.create({
      data: {
        schoolId: school3.id,
        title: 'Test Zielvereinbarung 2024/2025',
        date: new Date('2024-08-15'),
        status: 'DRAFT',
        accessCode: {
          create: {
            code: 'REAL9999',
          },
        },
        entries: {
          create: [
            {
              title: 'Existing Test Entry',
              zielsetzungenText: 'Existing entry for edit tests',
              massnahmen: 'Test Maßnahmen',
            },
          ],
        },
      },
    });

    console.log('✅ Test database reset complete');
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;


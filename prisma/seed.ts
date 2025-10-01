import { PrismaClient } from '@prisma/client';
import { generateAccessCode } from '../src/lib/code';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user from ENV variables (for production)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@schulamt.nrw';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      name: 'Admin',
      role: 'ADMIN',
      active: true,
    },
  });
  console.log('✓ Admin created:', admin.email);

  // Create demo superadmin (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const demoSuperadminPassword = await bcrypt.hash('superadmin123', 12);
    const demoSuperadmin = await prisma.user.upsert({
      where: { email: 'superadmin@schulamt.nrw' },
      update: {},
      create: {
        email: 'superadmin@schulamt.nrw',
        password: demoSuperadminPassword,
        name: 'Demo Superadmin',
        role: 'SUPERADMIN',
        active: true,
      },
    });
    console.log('✓ Demo Superadmin created:', demoSuperadmin.email);
  }

  // Skip demo data in production
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Production seed completed (admin user only)!');
    return;
  }

  // Create demo schools (development only)
  const school1 = await prisma.school.upsert({
    where: { externalId: 'test-school-1' },
    update: {},
    create: {
      externalId: 'test-school-1',
      schoolNumber: '123456', // Test-Schulnummer für Verifizierung
      name: 'Gesamtschule Musterstadt',
      address: 'Schulstraße 123',
      city: 'Musterstadt',
      state: 'Nordrhein-Westfalen',
    },
  });

  const school2 = await prisma.school.upsert({
    where: { externalId: 'test-school-2' },
    update: {},
    create: {
      externalId: 'test-school-2',
      schoolNumber: '654321', // Test-Schulnummer für Verifizierung
      name: 'Gymnasium Beispielstadt',
      address: 'Bildungsweg 456',
      city: 'Beispielstadt',
      state: 'Nordrhein-Westfalen',
    },
  });

  const school3 = await prisma.school.upsert({
    where: { externalId: 'test-school-3' },
    update: {},
    create: {
      externalId: 'test-school-3',
      schoolNumber: '789012', // Test-Schulnummer für Verifizierung
      name: 'Realschule am Park',
      address: 'Parkstraße 789',
      city: 'Teststadt',
      state: 'Nordrhein-Westfalen',
    },
  });

  console.log('✓ Schools created');

  // Create forms with access codes
  const form1 = await prisma.form.create({
    data: {
      schoolId: school1.id,
      title: 'Zielvereinbarung 2024/2025',
      date: new Date('2024-08-01'),
      status: 'DRAFT',
      accessCode: {
        create: {
          code: 'TEST1234',
        },
      },
      entries: {
        create: [
          {
            title: 'Leseförderung Klasse 5-7',
            zielsetzungenText: 'Verbesserung der Lesekompetenz in Klasse 5-7',
            zielbereich1: JSON.stringify(['mindeststandards']),
            zielbereich2: JSON.stringify(['basiskompetenzen_deutsch']),
            zielbereich3: JSON.stringify(['ib2_kompetenzorientierung', 'ib2_feedback_beratung']),
            datengrundlage: JSON.stringify(['vera', 'interne_eval']),
            zielgruppe: JSON.stringify(['teilgruppe_sus']),
            zielgruppeSusDetail: 'Klassen 5-7',
            massnahmen: 'Einführung einer täglichen Lesezeit von 15 Minuten, Aufbau einer Schulbibliothek, Lesepatenschaftsprogramm',
            indikatoren: 'Die Lesekompetenz verbessert sich um mindestens 10% in VERA-Tests. Mindestens 80% der SuS erreichen die Mindeststandards.',
            verantwortlich: 'Fr. Müller (Deutschfachschaft)',
            beteiligt: 'Deutschlehrkräfte, Schulbibliotheksteam',
            beginnSchuljahr: '2024/25',
            beginnHalbjahr: 1,
            endeSchuljahr: '2025/26',
            endeHalbjahr: 2,
            fortbildungJa: true,
            fortbildungThemen: 'Lesediagnostik, Leseförderung im Fachunterricht',
            fortbildungZielgruppe: 'Deutschfachschaft',
          },
          {
            title: 'Sozial-emotionale Kompetenzen',
            zielsetzungenText: 'Stärkung der sozial-emotionalen Kompetenzen',
            zielbereich1: JSON.stringify(['sozial_emotional']),
            zielbereich2: JSON.stringify(['sozial_emotionale_kompetenzen', 'gewaltpravention']),
            zielbereich3: JSON.stringify(['ib3_werte_normen', 'ib3_umgang_miteinander']),
            datengrundlage: JSON.stringify(['schuelerfeedback', 'interne_eval']),
            zielgruppe: JSON.stringify(['alle_sus', 'lehrkraefte']),
            massnahmen: 'Einführung von Klassenräten, Streitschlichter-Programm, soziales Lernen im Stundenplan',
            indikatoren: 'Konflikte werden von SuS selbstständig gelöst. Schülerfeedback zeigt Verbesserung des Klassenklimas um 20%.',
            verantwortlich: 'Hr. Schmidt (Sozialpädagoge)',
            beteiligt: 'Klassenlehrkräfte, Schulsozialarbeit',
            beginnSchuljahr: '2024/25',
            beginnHalbjahr: 2,
            endeSchuljahr: '2026/27',
            endeHalbjahr: 1,
            fortbildungJa: true,
            fortbildungThemen: 'Classroom Management, Konfliktlösung',
            fortbildungZielgruppe: 'gesamtes Kollegium',
          },
        ],
      },
    },
  });

  const form2 = await prisma.form.create({
    data: {
      schoolId: school2.id,
      title: 'Zielvereinbarung 2024/2025 - Digitalisierung',
      date: new Date('2024-09-01'),
      status: 'SUBMITTED',
      submittedAt: new Date('2024-09-15'),
      accessCode: {
        create: {
          code: 'GYMN5678',
        },
      },
      entries: {
        create: [
          {
            title: 'Digitalisierung im Unterricht',
            zielsetzungenText: 'Integration digitaler Medien in den Fachunterricht',
            zielbereich2: JSON.stringify(['basiskompetenzen_deutsch', 'basiskompetenzen_mathematik']),
            zielbereich3: JSON.stringify(['ib2_digitaler_wandel', 'ib4_lehrerbildung']),
            datengrundlage: JSON.stringify(['interne_eval', 'ext_audits']),
            zielgruppe: JSON.stringify(['alle_sus', 'lehrkraefte']),
            massnahmen: 'Ausstattung aller Klassenräume mit interaktiven Tafeln, Einführung von Lernplattform, 1:1 Tablet-Ausstattung ab Klasse 8',
            indikatoren: 'Alle Lehrkräfte nutzen digitale Medien regelmäßig. SuS zeigen verbesserte Medienkompetenz.',
            verantwortlich: 'Fr. Dr. Weber (Digitalisierungsbeauftragte)',
            beteiligt: 'Steuergruppe Digitalisierung, IT-Team',
            beginnSchuljahr: '2024/25',
            beginnHalbjahr: 1,
            endeSchuljahr: '2027/28',
            endeHalbjahr: 2,
            fortbildungJa: true,
            fortbildungThemen: 'Mediendidaktik, Datenschutz, App-Einsatz im Unterricht',
            fortbildungZielgruppe: 'gesamtes Kollegium',
          },
        ],
      },
    },
  });

  const form3 = await prisma.form.create({
    data: {
      schoolId: school3.id,
      title: 'Zielvereinbarung 2024/2025',
      date: new Date('2024-08-15'),
      status: 'APPROVED',
      submittedAt: new Date('2024-09-01'),
      approvedAt: new Date('2024-09-10'),
      accessCode: {
        create: {
          code: 'REAL9999',
        },
      },
      entries: {
        create: [
          {
            title: 'Mathe-Förderkonzept',
            zielsetzungenText: 'Verbesserung der Mathematikleistungen',
            zielbereich1: JSON.stringify(['mindeststandards', 'optimalstandards']),
            zielbereich2: JSON.stringify(['basiskompetenzen_mathematik']),
            zielbereich3: JSON.stringify(['ib2_kompetenzorientierung', 'ib2_kognitive_aktivierung']),
            datengrundlage: JSON.stringify(['vera', 'zp10', 'interne_audits']),
            zielgruppe: JSON.stringify(['teilgruppe_sus']),
            zielgruppeSusDetail: 'Klassen 8-10, insbesondere leistungsschwächere SuS',
            massnahmen: 'Förderunterricht Mathematik, Lernpatenschaften, Einsatz von digitalen Lernprogrammen zur individuellen Förderung',
            indikatoren: 'ZP10-Ergebnisse verbessern sich um 15%. Weniger als 10% der SuS verfehlen Mindeststandards.',
            verantwortlich: 'Fr. Klein (Fachvorsitz Mathematik)',
            beteiligt: 'Mathematikfachschaft, Förderlehrer',
            beginnSchuljahr: '2024/25',
            beginnHalbjahr: 1,
            endeSchuljahr: '2025/26',
            endeHalbjahr: 2,
            fortbildungJa: true,
            fortbildungThemen: 'Diagnose und Förderung, Umgang mit Heterogenität',
            fortbildungZielgruppe: 'Mathematikfachschaft',
          },
        ],
      },
    },
  });

  // Add some comments to demonstrate the workflow
  await prisma.comment.create({
    data: {
      formId: form2.id,
      authorRole: 'SCHULAMT',
      authorName: 'Hr. Meier (Schulamt)',
      message: 'Die Zielvereinbarung ist sehr gut strukturiert. Bitte ergänzen Sie noch konkrete Meilensteine für die Tablet-Einführung.',
      resolved: false,
    },
  });

  await prisma.comment.create({
    data: {
      formId: form3.id,
      authorRole: 'SCHULAMT',
      authorName: 'Fr. Fischer (Schulamt)',
      message: 'Zielvereinbarung genehmigt. Wir freuen uns auf die Umsetzung und sind gespannt auf die Ergebnisse!',
      resolved: true,
    },
  });

  console.log('✓ Forms and entries created');
  console.log('');
  console.log('📋 Seed Summary:');
  console.log('  Schools: 3');
  console.log('  Forms: 3');
  console.log('  Access Codes:');
  console.log('    - TEST1234 (Gesamtschule Musterstadt - DRAFT)');
  console.log('    - GYMN5678 (Gymnasium Beispielstadt - SUBMITTED)');
  console.log('    - REAL9999 (Realschule am Park - APPROVED)');
  console.log('');
  console.log('✅ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });


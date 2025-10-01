# Deployment auf Vercel mit PostgreSQL

Diese Anleitung erklärt, wie Sie die Zielvereinbarung Digital App auf Vercel mit Vercel Postgres deployen.

## Voraussetzungen

- Vercel Account (https://vercel.com)
- Git Repository (GitHub, GitLab, oder Bitbucket)

## Schritt-für-Schritt Anleitung

### 1. Repository zu Vercel hinzufügen

1. Pushen Sie Ihren Code zu GitHub/GitLab/Bitbucket
2. Gehen Sie zu https://vercel.com/new
3. Importieren Sie Ihr Repository

### 2. Vercel Postgres Datenbank erstellen

1. Gehen Sie zu Ihrem Vercel Dashboard
2. Wählen Sie Ihr Projekt aus
3. Klicken Sie auf den Tab "Storage"
4. Klicken Sie auf "Create Database"
5. Wählen Sie "Postgres" aus
6. Wählen Sie Ihre Region (empfohlen: **Frankfurt** für NRW, Deutschland)
7. Klicken Sie auf "Create"

### 3. Datenbank mit Projekt verbinden

1. Nach der Erstellung klicken Sie auf "Connect Project"
2. Wählen Sie Ihr Projekt aus
3. Vercel fügt automatisch die Environment Variables hinzu:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` (→ verwenden als `DATABASE_URL`)
   - `POSTGRES_URL_NON_POOLING` (→ verwenden als `DATABASE_URL_UNPOOLED`)

### 4. Environment Variables konfigurieren

Gehen Sie zu **Settings → Environment Variables** und fügen Sie hinzu:

```bash
# Database (bereits von Vercel gesetzt)
DATABASE_URL = ${POSTGRES_PRISMA_URL}
DATABASE_URL_UNPOOLED = ${POSTGRES_URL_NON_POOLING}

# Authentication Secret (WICHTIG: Ändern Sie dies!)
AUTH_SECRET = "generiere-einen-sicheren-random-string"

# Admin Credentials (WICHTIG: Ändern Sie dies!)
ADMIN_EMAIL = "ihr-email@schulamt.nrw"
ADMIN_PASSWORD = "ein-sicheres-passwort"

# Node Environment
NODE_ENV = "production"
```

**So generieren Sie ein sicheres AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Initiale Datenbank-Migration

Nach dem ersten Deployment müssen Sie die Datenbank initialisieren:

#### Option A: Über Vercel CLI (empfohlen)

1. Installieren Sie Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Verbinden Sie sich mit Ihrem Projekt:
   ```bash
   vercel link
   ```

3. Führen Sie die Migration aus:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

#### Option B: Manuell via Vercel Dashboard

1. Gehen Sie zu **Settings → Functions**
2. Erstellen Sie eine temporäre Function zum Ausführen der Migration
3. Oder nutzen Sie die Vercel CLI wie in Option A

### 6. Seed-Daten einfügen (Optional)

Wenn Sie Test-Daten einfügen möchten:

```bash
# Mit Vercel CLI
vercel env pull .env.production
npx prisma db seed
```

### 7. Domain konfigurieren (Optional)

1. Gehen Sie zu **Settings → Domains**
2. Fügen Sie Ihre Custom Domain hinzu
3. Folgen Sie den DNS-Anweisungen

## Lokale Entwicklung mit PostgreSQL

### Option 1: Docker (empfohlen)

```bash
# docker-compose.yml erstellen:
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: zielvereinbarung
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Starten
docker-compose up -d

# .env anpassen
DATABASE_URL="postgresql://user:password@localhost:5432/zielvereinbarung?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/zielvereinbarung?schema=public"
```

### Option 2: Lokale PostgreSQL Installation

1. Installieren Sie PostgreSQL: https://www.postgresql.org/download/
2. Erstellen Sie eine Datenbank:
   ```bash
   createdb zielvereinbarung
   ```
3. Aktualisieren Sie `.env` (siehe oben)

### Migrationen ausführen

```bash
# Neue Migration erstellen
npx prisma migrate dev --name beschreibung

# Migrationen auf Production anwenden (via Vercel CLI)
vercel env pull .env.production
npx prisma migrate deploy
```

## Wichtige Befehle

```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Schema visualisieren
npx prisma studio

# Migrations Status prüfen
npx prisma migrate status

# Datenbank zurücksetzen (NUR in Development!)
npx prisma migrate reset
```

## Troubleshooting

### Problem: "Migration failed"

**Lösung:** Stellen Sie sicher, dass `DATABASE_URL_UNPOOLED` gesetzt ist. Vercel Postgres benötigt sowohl pooled (DATABASE_URL) als auch direct (DATABASE_URL_UNPOOLED) Verbindungen.

### Problem: "PrismaClient is unable to run"

**Lösung:** Führen Sie `npx prisma generate` aus und deployen Sie erneut.

### Problem: "Cannot connect to database"

**Lösung:** Überprüfen Sie, ob die DATABASE_URL korrekt aus den Vercel Environment Variables geladen wird.

## Sicherheitshinweise

1. ✅ **Ändern Sie ALLE Standard-Passwörter** in Production
2. ✅ Verwenden Sie **starke AUTH_SECRET** Werte
3. ✅ Aktivieren Sie **Vercel Authentication** für zusätzlichen Schutz
4. ✅ Implementieren Sie **Rate Limiting** für API-Routes
5. ✅ Überprüfen Sie regelmäßig die **Vercel Logs**

## Support

Bei Fragen oder Problemen:
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Postgres Docs: https://vercel.com/docs/storage/vercel-postgres

## Nächste Schritte nach Deployment

- [ ] Admin-Account testen
- [ ] Schulsuche-API testen (JedeSchule.de)
- [ ] Test-Formular erstellen
- [ ] E2E-Tests gegen Production laufen lassen
- [ ] Backup-Strategie einrichten
- [ ] Monitoring einrichten (Vercel Analytics)




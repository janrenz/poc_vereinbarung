# Vercel Deployment Checklist

## Vor dem Deployment

- [x] Prisma Schema auf PostgreSQL umgestellt
- [x] `.env.example` erstellt
- [x] `vercel.json` konfiguriert
- [x] Code auf GitHub gepusht (https://github.com/janrenz/poc_vereinbarung)

## Vercel Setup

- [ ] Vercel Projekt erstellt
- [ ] Postgres Datenbank erstellt (Region: Frankfurt/fra1)
- [ ] Datenbank mit Projekt verbunden
- [ ] Environment Variables gesetzt:
  - [ ] `DATABASE_URL` = `${POSTGRES_PRISMA_URL}`
  - [ ] `DIRECT_URL` = `${POSTGRES_URL_NON_POOLING}`
  - [ ] `AUTH_SECRET` (neu generiert mit `openssl rand -base64 32`)
  - [ ] `ADMIN_EMAIL` (geändert)
  - [ ] `ADMIN_PASSWORD` (starkes Passwort)
  - [ ] `NODE_ENV` = `production`

## Deployment

- [ ] Erstes Deployment durchgeführt
- [ ] Build erfolgreich abgeschlossen
- [ ] Datenbank-Migration ausgeführt:
  ```bash
  vercel env pull .env.production
  npx prisma migrate deploy
  ```
- [ ] Seed-Daten eingefügt (optional):
  ```bash
  npx prisma db seed
  ```

## Post-Deployment Tests

- [ ] URL öffnet sich: https://[project-name].vercel.app
- [ ] Login funktioniert
- [ ] Admin-Dashboard erreichbar
- [ ] Formular erstellen funktioniert
- [ ] Schulsuche (JedeSchule API) funktioniert
- [ ] PDF-Export funktioniert
- [ ] E-Mail-Benachrichtigungen getestet (falls konfiguriert)

## Sicherheit

- [ ] Standard-Passwörter geändert
- [ ] AUTH_SECRET ist eindeutig und sicher
- [ ] HTTPS ist aktiv (automatisch bei Vercel)
- [ ] Cookies funktionieren (auth-token, user-id)
- [ ] Autorisierung getestet (nur eigene Formulare sichtbar)

## Optional

- [ ] Custom Domain konfiguriert
- [ ] Vercel Analytics aktiviert
- [ ] Backup-Strategie etabliert
- [ ] Monitoring eingerichtet
- [ ] E2E-Tests gegen Production laufen lassen

## Wichtige Befehle

```bash
# Vercel CLI Login
vercel login

# Projekt mit Vercel verbinden
vercel link

# Environment Variables holen
vercel env pull .env.production

# Datenbank-Migration
npx prisma migrate deploy

# Seed-Daten
npx prisma db seed

# Logs anzeigen
vercel logs

# Deployment rückgängig machen
vercel rollback
```

## Troubleshooting

### Problem: Build schlägt fehl
- Prüfe Vercel Build Logs
- Stelle sicher, dass `DATABASE_URL` und `DIRECT_URL` gesetzt sind

### Problem: "PrismaClient is unable to run"
```bash
npx prisma generate
git add .
git commit -m "Regenerate Prisma Client"
git push
```

### Problem: Migration schlägt fehl
- Stelle sicher, dass `DIRECT_URL` gesetzt ist
- Vercel Postgres benötigt sowohl pooled als auch direct connections

### Problem: "Cannot connect to database"
- Prüfe Environment Variables im Vercel Dashboard
- Stelle sicher, dass Datenbank mit Projekt verbunden ist

## Support Links

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Prisma Docs: https://www.prisma.io/docs
- Next.js Deployment: https://nextjs.org/docs/app/building-your-application/deploying

## Datenschutz & Compliance

- [ ] Datenschutzerklärung auf `/datenschutz` erreichbar
- [ ] Impressum vorhanden
- [ ] AVV mit Vercel abgeschlossen
- [ ] Datenbank in EU-Region (Frankfurt)
- [ ] Autorisierungskonzept aktiv (Row-Level Security)

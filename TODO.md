# TODO - Zielvereinbarung Digital

## 🔐 CRITICAL - Security (In Bearbeitung)

### Abgeschlossen (Parts 1, 2 & 3 - 152/228 Stunden)
- ✅ Sichere Session-Verwaltung mit crypto-tokens
- ✅ Audit-Logging-System für DSGVO
- ✅ Rate-Limiting-Infrastruktur
- ✅ Sicherheits-Headers (HSTS, CSP, etc.)
- ✅ Passwort-Komplexität (12+ Zeichen)
- ✅ Account-Sperre nach 5 Fehlversuchen
- ✅ Timing-Attack-Schutz im Login
- ✅ Zod Input-Validierung
- ✅ Secure Access-Code-Generierung (crypto.randomBytes)
- ✅ Rate-Limiting auf ALLE API-Endpunkte (7 Endpunkte)
- ✅ Input-Validierung in allen Endpunkten integriert
- ✅ Audit-Logging in allen Operationen integriert
- ✅ Build erfolgreich (alle TypeScript-Fehler behoben)

### Offen (Part 4 - 76 Stunden)
- [ ] **KRITISCH:** Datenbank-Migration ausführen (`npx prisma migrate deploy`)
- [ ] **KRITISCH:** `ACCESS_CODE_PEPPER` Environment Variable setzen (für Production)
- [ ] **KRITISCH:** `CRON_SECRET` Environment Variable setzen (für Audit-Log-Cleanup)
- [ ] Access-Code-Hashing in DB implementieren (codeHash Feld im Schema hinzufügen)
- [ ] E2E-Tests für neue Auth aktualisieren (UserMenu, Logout)
- [ ] Password-Reset-Flow absichern
- [ ] Penetration-Testing

### Abgeschlossen (Part 4 - Phase 1)
- ✅ Fehlermeldungen sanitieren (keine Stack-Traces in Production) - `/src/lib/error-handler.ts`
- ✅ Access-Code-Hashing Migration Script - `/scripts/hash-access-codes.ts`
- ✅ DSGVO Daten-Export-Endpunkt - `/api/users/[id]/export`
- ✅ Audit-Log-Cleanup nach 90 Tagen - `/src/lib/audit-cleanup.ts` + Vercel Cron

**Siehe:** `SECURITY_IMPLEMENTATION_STATUS.md` für Details

---

## Offene Aufgaben

### 1. Unterscheidung von Startchancen-Schulen
- [ ] Feld im Schema hinzufügen, um Startchancen-Schulen zu markieren
- [ ] UI anpassen, um Startchancen-Schulen visuell hervorzuheben
- [ ] Filterfunktion für Startchancen-Schulen im Admin-Bereich
- [ ] Spezielle Felder/Optionen nur für Startchancen-Schulen anzeigen (z.B. Zielbereich 2)

### 2. Benachrichtigungssystem für Schulamt
**Status:** Aktuell keine Benachrichtigungen implementiert (nur `console.log`)

#### In der Plattform:
- [ ] Badge mit Anzahl neuer Formulare im Admin-Header
- [ ] "Neu"-Marker bei kürzlich eingereichten Formularen
- [ ] Notifications-Panel im Admin-Bereich
- [ ] Markierung als "gelesen" Funktion

#### Per E-Mail:
- [ ] E-Mail-Service konfigurieren (z.B. Resend, SendGrid, oder Nodemailer)
- [ ] E-Mail-Template für neue Formulare erstellen
- [ ] E-Mail versenden bei Status-Änderung zu "SUBMITTED"
- [ ] E-Mail versenden bei neuen Kommentaren von Schulen
- [ ] Admin-Einstellungen für E-Mail-Benachrichtigungen

#### Technische Implementierung:
- [ ] `Notification` Model im Schema erstellen
- [ ] Server Action für Benachrichtigungen erstellen
- [ ] Webhook/Event-System für Status-Änderungen
- [ ] E-Mail-Konfiguration über Environment Variables
- [ ] Textfelder sollten sich in der Größe anpassen so das der gesamte text zu sehen ist

#### Bugs
- ✅ Gantt diagramm wird nicht angezeigt - Fixed: Filter jetzt auf title + zielsetzungenText
- ✅ Admin forms Detail Ansicht - Fixed: Datengrundlage & Zielgruppe Labels hinzugefügt
- ✅ Login-Status und Logout Button - Fixed: UserMenu-Component in Layout integriert

#### Datenschutz
- ✅ Auditlogs werden nach 90 Tagen gelöscht - Cron-Job implementiert 

#### Testing
- [ ] check e2e tests for covering all areas and make sure they all are successful
---

## In Bearbeitung
- Timestamps für "Versendet" und "Angenommen" Events (Web + PDF)

## Erledigt ✅

### Features
- ✅ Schuljahr-Auswahl auf 7 Jahre erweitert (2024/25 - 2030/31)
- ✅ Schulnummer-Feld hinzugefügt
- ✅ Seed-Daten mit Schulnummern aktualisiert
- ✅ PDF-Download-Funktionalität implementiert
- ✅ Gantt-Diagramm für Maßnahmen-Zeitplan
- ✅ Material Design 3 UI implementiert
- ✅ E2E-Tests mit Playwright
- ✅ Autosave-Funktionalität für Formulare
- ✅ Admin-Bereich mit Formular-Verwaltung
- ✅ Schul-Suche mit JedeSchule API
- ✅ Formular-Versioning
- ✅ Row-Level-Authorization (User sieht nur eigene Forms)
- ✅ Auto-Seed für Production-Deployment
- ✅ Login-Redirect wenn bereits eingeloggt

### Security Fixes (Oktober 2025)
- ✅ Kritische Autosave-Schwachstelle behoben (Access-Code-Prüfung)
- ✅ Lange Schulnamen in PDF-Header korrigiert
- ✅ Navigation zeigt User-Title statt "Eintrag 1"
- ✅ Comprehensive Security Audit durchgeführt
- ✅ Session-Management mit Crypto-Tokens
- ✅ Rate-Limiting auf Login
- ✅ Account-Lockout nach Fehlversuchen
- ✅ Passwort-Komplexität erzwungen
- ✅ Audit-Logging-System
- ✅ Security-Headers (HSTS, CSP, etc.)


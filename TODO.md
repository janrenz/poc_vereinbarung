# TODO - Zielvereinbarung Digital

## 🔐 CRITICAL - Security (In Bearbeitung)

### Abgeschlossen (Parts 1 & 2 - 70/228 Stunden)
- ✅ Sichere Session-Verwaltung mit crypto-tokens
- ✅ Audit-Logging-System für DSGVO
- ✅ Rate-Limiting-Infrastruktur
- ✅ Sicherheits-Headers (HSTS, CSP, etc.)
- ✅ Passwort-Komplexität (12+ Zeichen)
- ✅ Account-Sperre nach 5 Fehlversuchen
- ✅ Timing-Attack-Schutz im Login
- ✅ Zod Input-Validierung
- ✅ Secure Access-Code-Generierung (crypto.randomBytes)

### Abgeschlossen (Part 4 - 228/228 Stunden) ✅
- ✅ Passwort-Reset-Funktionalität mit E-Mail-Verifizierung
- ✅ Benutzer-Registrierung für Schulamt-Mitarbeiter
- ✅ E-Mail-Integration mit Resend API
- ✅ E-Mail-Verifizierung mit 24h-Tokens
- ✅ Rate-Limiting auf allen Auth-Endpunkten
- ✅ Zod-Validierung für alle Auth-Flows
- ✅ User-Enumeration-Schutz
- ✅ Umfassende E2E-Tests (40+ Tests für Auth-Flows)
- ✅ DSGVO-konforme Audit-Logs

### Offen (Part 5 - 82 Stunden)
- [ ] **KRITISCH:** Datenbank-Migration ausführen (`npx prisma migrate dev`)
  * Fügt `emailVerified` Boolean zu User hinzu
  * Fügt `schulamtName` String zu User hinzu
  * Erstellt `EmailVerificationToken` Tabelle
- [ ] Rate-Limiting auf REST API-Endpunkte anwenden (Forms, Entries, Schools)
- [ ] Input-Validierung in allen nicht-Auth Endpunkten
- [ ] Audit-Logging in allen API-Endpunkten integrieren
- [ ] Fehlermeldungen in allen Endpunkten sanitieren
- [ ] Access-Codes in DB hashen (aktuell plain text)
- [ ] DSGVO Daten-Export-Endpunkt für Benutzer
- [ ] E2E-Tests mit Datenbank ausführen (aktuell benötigt PostgreSQL)
- [ ] Penetration-Testing mit OWASP ZAP

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
- [ ] Gantt diagramm wird nicht angezeigt (keine Zeitdaten vorhanden) obwohl welche hinterlegt sind
- [ ] in der Admin forms Detail Ansicht sind immer noch keys statt den beschriebungen / Labels 
- [ ] es gibt keine anzeige vom Loginsttaus und kein Logout Button (bitte auhc e2e Tests hierfür)

#### Datenschutz
- [ ] Auditlogs should be deleted after 90 days 

#### Testing
- [ ] check e2e tests for covering all areas and make sure they all are successful

#### Other
- [ ] Remove linter warnings
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
- ✅ Passwort-Reset mit E-Mail-Verifizierung
- ✅ Benutzer-Registrierung mit E-Mail-Bestätigung
- ✅ User-Enumeration-Schutz (Forgot Password)
- ✅ Token-basierte E-Mail-Verifizierung
- ✅ 40+ E2E-Tests für Auth-Flows (Registrierung, Login, Password Reset)


# TODO - Zielvereinbarung Digital

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

---

## In Bearbeitung
- Timestamps für "Versendet" und "Angenommen" Events (Web + PDF)

## Erledigt ✅
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
- ✅ Cookie-basierte Authentifizierung
- ✅ Formular-Versioning


# Datenschutzkonzept - NRW Zielvereinbarung Digital

**Version:** 1.1
**Stand:** Oktober 2025
**Verantwortlich:** Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen

---

## 1. Übersicht

### 1.1 Zweck der Plattform
Die Plattform "NRW Zielvereinbarung Digital" dient der digitalen Erfassung, Verwaltung und Kommunikation von Zielvereinbarungen zwischen Schulaufsichtn und Schulen im Land Nordrhein-Westfalen.

### 1.2 Rechtsgrundlagen
- **DSGVO** (Datenschutz-Grundverordnung)
- **DSG NRW** (Datenschutzgesetz Nordrhein-Westfalen)
- **SchulG NRW** (Schulgesetz für das Land Nordrhein-Westfalen)

### 1.3 Verantwortliche Stelle
**Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen**  
Völklinger Straße 49  
40221 Düsseldorf

---

## 2. Verarbeitete Daten

### 2.1 Schuldaten
| Datenart | Zweck | Rechtsgrundlage |
|----------|-------|-----------------|
| Schulname | Identifikation | Art. 6 Abs. 1 lit. e DSGVO |
| Schulnummer | Authentifizierung | Art. 6 Abs. 1 lit. e DSGVO |
| Adresse | Kontakt (optional) | Art. 6 Abs. 1 lit. e DSGVO |
| Stadt/Bundesland | Verwaltung | Art. 6 Abs. 1 lit. e DSGVO |
| E-Mail (optional) | Benachrichtigungen | Art. 6 Abs. 1 lit. e DSGVO |

### 2.2 Formular-/Zielvereinbarungsdaten
| Datenart | Zweck | Rechtsgrundlage |
|----------|-------|-----------------|
| Zielformulierungen | Pädagogische Dokumentation | Art. 6 Abs. 1 lit. e DSGVO |
| Maßnahmen | Pädagogische Dokumentation | Art. 6 Abs. 1 lit. e DSGVO |
| Verantwortliche Personen (Namen) | Zuständigkeitsklärung | Art. 6 Abs. 1 lit. e DSGVO |
| Zeiträume | Planung | Art. 6 Abs. 1 lit. e DSGVO |
| Status (Entwurf/Eingereicht/Angenommen) | Workflow-Verwaltung | Art. 6 Abs. 1 lit. e DSGVO |
| Timestamps (Erstellt/Geändert/Versendet/Angenommen) | Nachvollziehbarkeit | Art. 6 Abs. 1 lit. e DSGVO |

### 2.3 Administratordaten (schulaufsicht)
| Datenart | Zweck | Rechtsgrundlage |
|----------|-------|-----------------|
| E-Mail-Adresse | Authentifizierung | Art. 6 Abs. 1 lit. e DSGVO |
| Passwort (gehasht) | Authentifizierung | Art. 6 Abs. 1 lit. e DSGVO |
| **Benutzer-ID** | **Formular-Zuordnung und Autorisierung** | **Art. 6 Abs. 1 lit. e DSGVO** |
| Login-Zeitstempel | Sicherheit | Art. 6 Abs. 1 lit. f DSGVO |
| Formular-Erstellungs-Logs | Nachvollziehbarkeit | Art. 6 Abs. 1 lit. e DSGVO |

### 2.4 Benachrichtigungsdaten
| Datenart | Zweck | Rechtsgrundlage |
|----------|-------|-----------------|
| In-App-Benachrichtigungen | Workflow-Kommunikation | Art. 6 Abs. 1 lit. e DSGVO |
| E-Mail-Benachrichtigungen | Workflow-Kommunikation | Art. 6 Abs. 1 lit. e DSGVO |
| Gelesen-Status | Kommunikationsverwaltung | Art. 6 Abs. 1 lit. e DSGVO |

### 2.5 KEINE Verarbeitung von
- ❌ Schüler-Personendaten
- ❌ Lehrer-Personaldaten (außer Namen bei Verantwortlichkeiten)
- ❌ Sensible Daten nach Art. 9 DSGVO
- ❌ Tracking/Analytics ohne Einwilligung

---

## 3. Rollen und Berechtigungen

### 3.1 Rollenübersicht

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  SUPERADMIN (System-Administrator)              │
│  - Alle Admin-Rechte                            │
│  - Benutzerverwaltung                           │
│  - Kann Admin-Accounts erstellen/deaktivieren   │
│                                                 │
└─────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  ADMIN (schulaufsicht-Mitarbeiter)                   │
│  - Zugriff nur auf EIGENE Formulare ⚠️         │
│  - Formular-Erstellung für Schulen              │
│  - Genehmigung/Rücksendung von Formularen       │
│  - Benachrichtigungsverwaltung                  │
│                                                 │
└─────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  SCHULEN (Formular-Zugriff)                     │
│  - Zugriff via Zugangscode                      │
│  - Bearbeitung eigener Formulare (Status: DRAFT/RETURNED) │
│  - Nur Lesezugriff bei Status: SUBMITTED/APPROVED │
│  - Einsicht via Schulnummer (abgeschlossene)    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 Detaillierte Berechtigungen

#### **3.2.1 Rolle: SUPERADMIN (System-Administrator)**

**Authentifizierung:**
- Login mit E-Mail und Passwort
- Cookie-basierte Session (7 Tage)
- Bcrypt-gehashtes Passwort (12 Rounds)

**Berechtigungen:**

| Aktion | Erlaubt | Einschränkung |
|--------|---------|---------------|
| **Alle Admin-Rechte** | ✅ Ja | Siehe Admin-Rolle |
| **Benutzer anlegen** | ✅ Ja | Admin und Superadmin |
| **Benutzer bearbeiten** | ✅ Ja | Aktivieren/Deaktivieren |
| **Benutzer löschen** | ✅ Ja | Permanent |
| **Rollen zuweisen** | ✅ Ja | ADMIN oder SUPERADMIN |
| **Benutzerliste einsehen** | ✅ Ja | Mit Login-Historie |

**Zugriffskontrolle:**
```typescript
// src/lib/auth.ts
export async function isSuperAdmin(): Promise<boolean>
```

**Datenzugriff:**
- Name (optional)
- E-Mail-Adresse
- Rolle (SUPERADMIN/ADMIN)
- Aktiv-Status
- Erstellungsdatum
- Letzter Login

#### **3.2.2 Rolle: ADMIN (schulaufsicht-Mitarbeiter)**

**Authentifizierung:**
- Login mit E-Mail und Passwort
- Cookie-basierte Session (7 Tage)
- Bcrypt-gehashtes Passwort (12 Rounds)

**Berechtigungen:**

| Aktion | Erlaubt | Einschränkung |
|--------|---------|---------------|
| Formular erstellen | ✅ Ja | Für jede Schule, wird mit Benutzer-ID verknüpft |
| Formular lesen | ⚠️ **Nur eigene** | **Nur von diesem Benutzer erstellte Formulare** |
| Formular bearbeiten | ❌ Nein | Nur Schule darf bearbeiten |
| Formular genehmigen | ⚠️ **Nur eigene** | **Status: SUBMITTED → APPROVED (nur eigene)** |
| Formular zurücksenden | ⚠️ **Nur eigene** | **Status: SUBMITTED → RETURNED (nur eigene)** |
| Formular löschen | ⚠️ **Nur eigene** | **Nur von diesem Benutzer erstellte Formulare** |
| Kommentare hinzufügen | ⚠️ **Nur eigene** | **Nur zu eigenen Formularen** |
| Benachrichtigungen lesen | ✅ Ja | Eigene Benachrichtigungen |
| PDF herunterladen | ⚠️ **Nur eigene** | **Nur von eigenen Formularen** |
| JSON/CSV Export | ⚠️ **Nur eigene** | **Nur von eigenen Formularen** |
| Zugangscodes einsehen | ⚠️ **Nur eigene** | **Nur Codes eigener Formulare** |
| Schulsuche | ✅ Ja | JedeSchule API |
| **Benutzerverwaltung** | ❌ Nein | Nur Superadmin |

**Zugriffskontrolle:**
```typescript
// src/lib/auth.ts
export async function isAdmin(): Promise<boolean>
export async function getCurrentUser()

// Row-Level Authorization (Datensatz-Ebene)
// Admin kann nur auf Formulare zugreifen, die er erstellt hat
const forms = await prisma.form.findMany({
  where: { createdById: currentUser.id }
});

// API-Ebene: Autorisierungsprüfung
if (form.createdById !== currentUser.id) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### **3.2.3 Rolle: SCHULE (Formular-Bearbeitung)**

**Authentifizierung:**
- Zugriff via **Zugangscode** (8-10 stellig, alphanumerisch)
- Keine persistente Session
- Code muss bei jedem Zugriff eingegeben werden

**Berechtigungen (während Bearbeitung):**

| Aktion | Erlaubt | Einschränkung |
|--------|---------|---------------|
| Formular lesen | ✅ Ja | Nur eigenes Formular |
| Formular bearbeiten | ✅ Ja | Nur Status: DRAFT oder RETURNED |
| Einträge erstellen | ✅ Ja | Nur für eigenes Formular |
| Einträge bearbeiten | ✅ Ja | Nur für eigenes Formular |
| Einträge löschen | ✅ Ja | Nur für eigenes Formular |
| Formular absenden | ✅ Ja | Status: DRAFT/RETURNED → SUBMITTED |
| PDF herunterladen | ✅ Ja | Nur eigenes Formular |
| Kommentare lesen | ✅ Ja | Nur zu eigenem Formular |
| Kommentare schreiben | ❌ Nein | Nur Schulaufsicht |
| Andere Formulare einsehen | ❌ Nein | - |
| Code teilen/weitergeben | ⚠️ Verantwortung | Schule ist verantwortlich |

**Zugriffskontrolle:**
```typescript
// Prüfung des Zugangscodes
const ac = await prisma.accessCode.findUnique({
  where: { code },
  include: { form: true }
});
```

**Automatische Zugriffsbeschränkung:**
```typescript
// Nach Absenden: Redirect zu Read-Only Ansicht
if (form.status === "SUBMITTED" || form.status === "APPROVED") {
  redirect(`/completed/view?schoolNumber=${school.schoolNumber}&code=${code}`);
}
```

#### **3.2.3 Rolle: SCHULE (Abgeschlossene Formulare)**

**Authentifizierung:**
- Zugriff via **Schulnummer UND Zugangscode** (Zwei-Faktor-Verifizierung)
- Keine persistente Session
- Beide Parameter müssen übereinstimmen

**Zugriffskontrolle:**
```typescript
// Prüfung ob Schulnummer UND Code zusammengehören
const codeRecord = await prisma.accessCode.findUnique({
  where: { code: accessCode },
  include: { form: { include: { school: true } } }
});

if (!codeRecord || codeRecord.form.school.schoolNumber !== schoolNumber) {
  // Zugriff verweigert
  return <AccessDenied />;
}
```

**Berechtigungen:**

| Aktion | Erlaubt | Einschränkung |
|--------|---------|---------------|
| Formular lesen | ✅ Ja | Nur eigene abgeschlossene (SUBMITTED/APPROVED) |
| Formular bearbeiten | ❌ Nein | Read-Only |
| PDF herunterladen | ✅ Ja | Nur eigene Formulare |
| Gantt-Diagramm ansehen | ✅ Ja | Nur eigene Formulare |
| Andere Schulen einsehen | ❌ Nein | - |

**Zugriffskontrolle:**
```typescript
// Prüfung der Schulnummer
const school = await prisma.school.findFirst({
  where: { schoolNumber },
  include: { forms: { where: { status: { in: ["SUBMITTED", "APPROVED"] } } } }
});
```

---

## 4. Technische Sicherheitsmaßnahmen

### 4.1 Zugriffssicherheit

#### **Session-Management**
- Cookie-basierte Authentifizierung für schulaufsicht
- HttpOnly Cookies (kein JavaScript-Zugriff)
- Secure Flag (nur HTTPS)
- SameSite=Strict (CSRF-Schutz)
- **Benutzer-ID Cookie für Autorisierung** ✨

```typescript
// src/lib/auth.ts
// Authentifizierungs-Cookie
cookies().set("auth-token", "authenticated", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24 * 7, // 7 Tage
});

// Benutzer-ID Cookie für Autorisierungsprüfungen
cookies().set("user-id", userId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24 * 7, // 7 Tage
});
```

#### **Passwort-Sicherheit**
- Bcrypt-Hashing (Rounds: 12)
- Keine Speicherung im Klartext
- Password-Reset mit zeitlich begrenzten Tokens

```typescript
// Passwort-Hashing
const hashedPassword = await bcrypt.hash(password, 12);
```

#### **Benutzerverwaltung (Superadmin)**
- Bcrypt 12 Rounds für alle User-Passwörter
- Session-Cookies (httpOnly, secure in Prod, 7 Tage Laufzeit)
- User-ID zusätzlich in Cookie für Rollenzuordnung
- Deaktivierte User können sich nicht einloggen

```typescript
// src/lib/auth.ts
export async function isSuperAdmin(): Promise<boolean>
export async function isAdmin(): Promise<boolean>
export async function getCurrentUser()
```

#### **Zugangscode-Sicherheit (Schulen)**
- Automatische Generierung (8-10 Zeichen)
- Alphanumerisch, keine Verwechslung (I/l, 0/O ausgeschlossen)
- Eindeutigkeit-Prüfung bei Erstellung
- Keine Passwort-Hashing (Codes sind temporär und nicht wiederverwendbar)

```typescript
// src/lib/code.ts
export function generateAccessCode(length: number): string
```

### 4.2 Datenübertragung
- ✅ **HTTPS/TLS 1.3** verpflichtend in Production
- ✅ **HSTS Header** (HTTP Strict Transport Security)
- ✅ Keine unverschlüsselte Datenübertragung

### 4.3 Datenbank-Sicherheit
- ✅ **Prisma ORM** (SQL-Injection-Schutz)
- ✅ Prepared Statements
- ✅ Keine Raw SQL Queries mit User-Input
- ✅ Environment Variables für Credentials

### 4.4 Logging und Monitoring
```typescript
// Nur technische Logs, keine personenbezogenen Daten
console.log(`Form created for ${schoolName}`); // OK
console.log(`User email: ${email}`); // VERMEIDEN in Production

// Autorisierungs-Logs (neu)
console.log(`Form created by user ${currentUser.email}`);
console.log(`Form approved by user ${currentUser.email}`);
console.log(`Unauthorized access attempt to form ${formId}`);
```

### 4.5 Autorisierung auf Datensatzebene ✨

**Implementierung:**
- Jedes Formular wird bei Erstellung mit `createdById` verknüpft
- Zugriff (Lesen, Genehmigen, Exportieren) nur für Ersteller
- Durchsetzung auf mehreren Ebenen:
  - **Datenbank-Ebene:** `where: { createdById: currentUser.id }`
  - **API-Ebene:** HTTP 403 bei unberechtigtem Zugriff
  - **UI-Ebene:** Formulare anderer Benutzer nicht sichtbar

**Vorteile:**
- ✅ Datenschutz durch Technikgestaltung (Privacy by Design)
- ✅ Minimierung von Zugriffsrisiken
- ✅ Nachvollziehbarkeit (Wer hat was erstellt)
- ✅ Compliance mit Prinzip der Datenminimierung

---

## 5. Datenspeicherung und -löschung

### 5.1 Speicherorte
- **Entwicklung:** SQLite (lokal)
- **Produktion:** PostgreSQL (Vercel/EU-Region empfohlen)
- **Backups:** Automatisch durch Hosting-Provider

### 5.2 Speicherdauer

| Datenart | Speicherdauer | Begründung |
|----------|---------------|------------|
| Zielvereinbarungen (aktiv) | Unbegrenzt | Pädagogische Dokumentation |
| Zielvereinbarungen (archiviert) | Nach Bedarf | Schulaufsicht entscheidet |
| **Benutzer-Formular-Zuordnungen** | **Solange Formular existiert** | **Autorisierung und Nachvollziehbarkeit** |
| Benachrichtigungen | 6 Monate | Workflow-Nachvollziehbarkeit |
| Session-Cookies (`auth-token`, `user-id`) | 7 Tage | Benutzerfreundlichkeit |
| Password-Reset-Tokens | 1 Stunde | Sicherheit |
| Gelöschte Formulare | Sofort | Cascade Delete |

### 5.3 Löschkonzept

#### **Manuelle Löschung**
```typescript
// Schulaufsicht kann Formulare löschen
async function deleteForm() {
  "use server";
  await prisma.form.delete({
    where: { id },
  });
  // Löscht automatisch (CASCADE):
  // - Alle Einträge
  // - Zugangscode
  // - Kommentare
  // - Benachrichtigungen
}
```

#### **Automatische Löschung**
- Password-Reset-Tokens nach Ablauf (Cron-Job erforderlich)
- Alte Benachrichtigungen (optional, nach 6 Monaten)

---

## 6. Betroffenenrechte (DSGVO)

### 6.1 Auskunftsrecht (Art. 15 DSGVO)
**Schulen können anfragen:**
- Welche Daten über ihre Schule gespeichert sind
- Zugangscodes zu ihren Formularen
- Status ihrer Zielvereinbarungen

**Kontakt:** über Schulaufsicht oder Ministerium

### 6.2 Berichtigungsrecht (Art. 16 DSGVO)
**Schulen können:**
- Formular-Inhalte jederzeit während Bearbeitung ändern
- Bei Status RETURNED: Überarbeitung möglich
- Bei Status SUBMITTED/APPROVED: Anfrage an schulaufsicht

### 6.3 Löschungsrecht (Art. 17 DSGVO)
**Einschränkungen:**
- Pädagogische Dokumentationspflicht
- Öffentliches Interesse (§ 3 DSG NRW)
- **Anfrage:** über schulaufsicht

### 6.4 Widerspruchsrecht (Art. 21 DSGVO)
**Eingeschränkt:**
- Verarbeitung erfolgt zur Wahrnehmung öffentlicher Aufgaben
- Rechtsgrundlage: Art. 6 Abs. 1 lit. e DSGVO

---

## 7. Datenschutz-Folgenabschätzung (DSFA)

### 7.1 Ist DSFA erforderlich?
**Prüfung nach Art. 35 DSGVO:**

| Kriterium | Zutreffend? | Bewertung |
|-----------|-------------|-----------|
| Systematische Bewertung persönlicher Aspekte | ❌ Nein | Keine Profilbildung |
| Verarbeitung sensibler Daten (Art. 9) | ❌ Nein | Nur Schuldaten |
| Systematische Überwachung öffentlich zugänglicher Bereiche | ❌ Nein | - |
| Umfangreiche Verarbeitung besonderer Kategorien | ❌ Nein | - |

**Ergebnis:** ❌ **KEINE DSFA erforderlich**

**Begründung:**
- Keine sensiblen personenbezogenen Daten
- Keine automatisierte Entscheidungsfindung
- Kein hohes Risiko für Betroffene
- Transparente Verarbeitung
- Klare Zweckbindung

---

## 8. Auftragsverarbeitung (Art. 28 DSGVO)

### 8.1 Hosting-Provider (z.B. Vercel)
**Verantwortlichkeit:** Auftragsverarbeiter

**Erforderlich:**
- ✅ Auftragsverarbeitungsvertrag (AVV)
- ✅ EU/EEA Datenspeicherung
- ✅ Technische und organisatorische Maßnahmen (TOMs)
- ✅ Vercel DPA: https://vercel.com/legal/dpa

### 8.2 E-Mail-Service (z.B. Resend)
**Verantwortlichkeit:** Auftragsverarbeiter

**Erforderlich:**
- ✅ Auftragsverarbeitungsvertrag (AVV)
- ✅ EU/EEA Server-Standort
- ✅ Resend DPA: https://resend.com/legal/dpa

### 8.3 Externe APIs

#### **JedeSchule API**
- **Zweck:** Schulsuche und -daten
- **Daten:** Öffentliche Schuldaten (kein AVV erforderlich)
- **Quelle:** https://jedeschule.de

#### **mehr-schulferien.de API (Fallback)**
- **Zweck:** Schulsuche (Fallback)
- **Daten:** Öffentliche Schuldaten (kein AVV erforderlich)

---

## 9. Datenschutz by Design & Default

### 9.1 Implementierte Prinzipien

#### **Datenminimierung**
- ✅ Nur notwendige Daten werden erhoben
- ✅ Keine Schüler-/Lehrerdaten (nur Namen bei Verantwortlichkeiten)
- ✅ E-Mail optional

#### **Zweckbindung**
- ✅ Daten nur für Zielvereinbarungen genutzt
- ✅ Kein Analytics ohne Einwilligung
- ✅ Kein Tracking

#### **Zugriffsschutz**
- ✅ Rollenbasierte Zugriffskontrolle (RBAC)
- ✅ **Autorisierung auf Datensatzebene (Row-Level Security)** ✨
- ✅ schulaufsicht-Mitarbeiter sehen nur eigene Formulare
- ✅ Schulen sehen nur eigene Daten
- ✅ Zugangscode erforderlich für Schulen

#### **Transparenz**
- ✅ Klare Datenschutzerklärung
- ✅ Impressum
- ✅ Dokumentiertes Berechtigungskonzept

#### **Integrität und Vertraulichkeit**
- ✅ HTTPS/TLS
- ✅ Passwort-Hashing
- ✅ HttpOnly Cookies
- ✅ CSRF-Schutz

---

## 10. Schulung und Sensibilisierung

### 10.1 Zielgruppen

#### **schulaufsicht-Mitarbeiter**
**Schulungsinhalte:**
- ✅ Bedienung der Plattform
- ✅ Datenschutzgrundsätze
- ✅ Verantwortungsvoller Umgang mit Zugangscodes
- ✅ Keine Weitergabe von Login-Daten

#### **Schulen**
**Informationen bereitstellen:**
- ✅ Zugangscode sicher aufbewahren
- ✅ Nicht per E-Mail oder unsicher teilen
- ✅ Schulnummer vertraulich behandeln
- ✅ Verantwortung für eingegebene Daten

---

## 11. Incident Response

### 11.1 Meldepflicht bei Datenpannen (Art. 33 DSGVO)

**Meldung an Aufsichtsbehörde:**
- ⏰ **Innerhalb 72 Stunden** nach Bekanntwerden
- 📧 **Kontakt:** Landesbeauftragte für Datenschutz und Informationsfreiheit NRW

**Benachrichtigung Betroffener (Art. 34 DSGVO):**
- Bei **hohem Risiko** für Rechte und Freiheiten
- Unverzüglich nach Bekanntwerden

### 11.2 Beispiel-Szenarien

| Szenario | Risiko | Meldepflicht | Maßnahmen |
|----------|--------|--------------|-----------|
| Zugangscode versehentlich geteilt | Niedrig | Nein | Code ändern/neu generieren |
| Passwort-Datenbank-Leak | Hoch | Ja | Alle Passwörter zurücksetzen, Benutzer informieren |
| Unbefugter Zugriff auf Admin-Panel | Hoch | Ja | Zugang sperren, Logs prüfen, Betroffene informieren |
| Server-Ausfall ohne Datenverlust | Niedrig | Nein | System wiederherstellen |

---

## 12. Checkliste für Deployment

### 12.1 Vor Go-Live

- [ ] **AVV mit Hosting-Provider** abgeschlossen
- [ ] **AVV mit E-Mail-Service** abgeschlossen (wenn verwendet)
- [ ] **Datenschutzerklärung** auf Website veröffentlicht
- [ ] **Impressum** auf Website veröffentlicht
- [ ] **HTTPS/TLS** aktiviert und getestet
- [ ] **Environment Variables** sicher konfiguriert
- [ ] **Starke Passwörter** für Admin-Accounts vergeben
- [ ] **Backup-Strategie** etabliert
- [ ] **Schulung** für schulaufsicht-Mitarbeiter durchgeführt
- [ ] **Informationsmaterial** für Schulen erstellt
- [ ] **Kontaktdaten** für Datenschutzanfragen hinterlegt

### 12.2 Regelmäßige Prüfungen

- [ ] **Quartalsweise:** Benachrichtigungen älter als 6 Monate löschen
- [ ] **Jährlich:** Datenschutzkonzept überprüfen und aktualisieren
- [ ] **Bei Änderungen:** DSFA neu bewerten
- [ ] **Kontinuierlich:** Sicherheitsupdates einspielen

---

## 13. Kontakt und Verantwortlichkeiten

### 13.1 Datenschutzbeauftragter
**MSB NRW - Datenschutzbeauftragter**  
Völklinger Straße 49  
40221 Düsseldorf  
E-Mail: datenschutz@msb.nrw.de

### 13.2 Aufsichtsbehörde
**Landesbeauftragte für Datenschutz und Informationsfreiheit NRW**  
Kavalleriestraße 2-4  
40213 Düsseldorf  
Telefon: 0211 38424-0  
E-Mail: poststelle@ldi.nrw.de  
Web: https://www.ldi.nrw.de

### 13.3 Technische Kontakte
**Entwicklung/Support:**  
(Kontaktdaten des technischen Teams eintragen)

---

## 14. Änderungshistorie

| Version | Datum | Änderung | Autor |
|---------|-------|----------|-------|
| 1.0 | 01.10.2024 | Erstfassung | - |
| **1.1** | **01.10.2025** | **Ergänzung: Autorisierung auf Datensatzebene (Row-Level Security), Benutzer-ID-Cookie, erweiterte Sicherheitsmaßnahmen, Audit-Logging** | **-** |

---

**Gültig ab:** 01.10.2025
**Nächste Überprüfung:** 01.10.2026

## 15. Zusammenfassung der Änderungen (Version 1.1)

### Neue Sicherheitsmaßnahmen (Oktober 2025)

**Autorisierung auf Datensatzebene:**
- Admin-Benutzer können nur auf selbst erstellte Formulare zugreifen
- Formular-Zuordnung via `createdById` in Datenbank
- Durchsetzung auf DB-, API- und UI-Ebene

**Erweiterte Cookies:**
- `auth-token`: Authentifizierungsstatus (bestehend)
- `user-id`: Benutzer-Identifikation für Autorisierung (neu)

**Audit-Logging:**
- Protokollierung von Formular-Erstellung mit Benutzer-ID
- Protokollierung von Zugriffs- und Änderungsversuchen
- Nachvollziehbarkeit von Aktionen

**Datenschutz-Vorteile:**
- ✅ Privacy by Design: Zugriffsbeschränkung technisch umgesetzt
- ✅ Datenminimierung: Benutzer sehen nur relevante Daten
- ✅ Transparenz: Nachvollziehbarkeit durch Audit-Logs
- ✅ Integrität: Schutz vor unberechtigtem Zugriff



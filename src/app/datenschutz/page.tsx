import Link from "@/components/Link";
import { ArrowLeft, Shield, Database, Lock, Eye, Mail } from "lucide-react";

export const metadata = {
  title: "Datenschutzerklärung - Zielvereinbarung Digital",
  description: "Datenschutzerklärung und Informationen zur Datenverarbeitung",
};

export default function DatenschutzPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--md-sys-color-primary)] hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Startseite
      </Link>

      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-8 md-elevation-1">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">
            Datenschutzerklärung
          </h1>
        </div>

        <div className="space-y-8 text-[var(--md-sys-color-on-surface)]">
          {/* Einleitung */}
          <section>
            <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen.
              Nachfolgend informieren wir Sie über die Verarbeitung personenbezogener
              Daten bei der Nutzung dieser Anwendung gemäß Art. 13 und 14 der
              EU-Datenschutz-Grundverordnung (DSGVO).
            </p>
          </section>

          {/* Verantwortliche Stelle */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-[var(--md-sys-color-primary)] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-semibold text-[var(--md-sys-color-primary)]">
                1. Verantwortliche Stelle
              </h2>
            </div>
            <div className="ml-9 space-y-2">
              <p className="font-semibold">
                Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen
              </p>
              <p>Völklinger Straße 49</p>
              <p>40221 Düsseldorf</p>
              <p className="mt-4">
                <strong>Telefon:</strong>{" "}
                <a href="tel:+492115837640" className="text-[var(--md-sys-color-primary)] hover:underline">
                  0211 5867-40
                </a>
              </p>
              <p>
                <strong>E-Mail:</strong>{" "}
                <a
                  href="mailto:poststelle@msb.nrw.de"
                  className="text-[var(--md-sys-color-primary)] hover:underline"
                >
                  poststelle@msb.nrw.de
                </a>
              </p>
            </div>
          </section>

          {/* Datenschutzbeauftragter */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-[var(--md-sys-color-primary)] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-semibold text-[var(--md-sys-color-primary)]">
                2. Datenschutzbeauftragter
              </h2>
            </div>
            <div className="ml-9 space-y-2">
              <p>Bei Fragen zum Datenschutz wenden Sie sich bitte an:</p>
              <p className="font-semibold">
                Datenschutzbeauftragter des Ministeriums für Schule und Bildung NRW
              </p>
              <p>Völklinger Straße 49</p>
              <p>40221 Düsseldorf</p>
              <p className="mt-4">
                <strong>E-Mail:</strong>{" "}
                <a
                  href="mailto:datenschutz@msb.nrw.de"
                  className="text-[var(--md-sys-color-primary)] hover:underline"
                >
                  datenschutz@msb.nrw.de
                </a>
              </p>
            </div>
          </section>

          {/* Zweck der Datenverarbeitung */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-[var(--md-sys-color-primary)] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-semibold text-[var(--md-sys-color-primary)]">
                3. Zweck der Datenverarbeitung
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Diese Anwendung dient der digitalen Erfassung und Verwaltung von
                Zielvereinbarungen zwischen Schulämtern und Schulen in Nordrhein-Westfalen.
              </p>
              <div>
                <h3 className="font-semibold mb-2">Verarbeitete Daten:</h3>
                <ul className="list-disc list-inside space-y-1 text-[var(--md-sys-color-on-surface-variant)]">
                  <li>Login-Daten der Schulamt-Mitarbeiter (E-Mail, Passwort)</li>
                  <li>Benutzer-ID zur Zuordnung erstellter Formulare</li>
                  <li>Schuldaten (Name, Adresse, Schulnummer)</li>
                  <li>Inhalte der Zielvereinbarungen</li>
                  <li>Zugangscodes für Schulen</li>
                  <li>Zeitstempel und Status-Informationen</li>
                  <li>Kommentare und Rückmeldungen</li>
                  <li>Protokollierung von Zugriff und Änderungen (Audit-Log)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Rechtsgrundlage */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-[var(--md-sys-color-primary)] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-semibold text-[var(--md-sys-color-primary)]">
                4. Rechtsgrundlage
              </h2>
            </div>
            <div className="ml-9 space-y-4">
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Die Verarbeitung erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--md-sys-color-on-surface-variant)]">
                <li>
                  <strong>Art. 6 Abs. 1 lit. e DSGVO</strong> in Verbindung mit{" "}
                  <strong>§ 3 Datenschutzgesetz NRW (DSG NRW)</strong> &ndash; Wahrnehmung
                  öffentlicher Aufgaben
                </li>
                <li>
                  <strong>Schulgesetz NRW (SchulG)</strong> &ndash; Schulaufsicht und
                  Qualitätssicherung
                </li>
              </ul>
            </div>
          </section>

          {/* Datenspeicherung */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              5. Speicherdauer
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>
                Die gespeicherten Daten werden nur so lange aufbewahrt, wie es für die
                Erfüllung des Zwecks erforderlich ist oder gesetzliche Aufbewahrungsfristen
                bestehen.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Zielvereinbarungen: Bis zur Archivierung oder Löschung durch das Schulamt</li>
                <li>Login-Daten: Solange das Konto aktiv ist</li>
                <li>Benutzer-Zuordnungen zu Formularen: Solange das Formular existiert</li>
                <li>Zugangscodes: Bis zum Ablauf oder nach Verwendung</li>
                <li>Zugriffsprotokolle: 90 Tage</li>
              </ul>
            </div>
          </section>

          {/* Empfänger der Daten */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              6. Empfänger der Daten
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>Ihre Daten werden ausschließlich weitergegeben an:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Berechtigte Mitarbeiter der Schulämter (jeweils nur eigene Formulare)</li>
                <li>Die jeweiligen Schulen (nur eigene Zielvereinbarungen)</li>
                <li>Technische Dienstleister (nur im erforderlichen Umfang)</li>
              </ul>
              <p className="mt-4">
                Eine Weitergabe an Dritte außerhalb der EU/EWR erfolgt nicht.
              </p>
              <div className="mt-4 p-4 bg-[var(--md-sys-color-tertiary-container)] rounded-[var(--md-sys-shape-corner-medium)]">
                <p className="font-semibold text-[var(--md-sys-color-on-tertiary-container)] mb-2">
                  Zugriffsbeschränkung
                </p>
                <p className="text-sm text-[var(--md-sys-color-on-tertiary-container)]">
                  Die Anwendung stellt sicher, dass Schulamt-Mitarbeiter ausschließlich auf
                  von ihnen selbst erstellte Formulare zugreifen können. Dies wird durch
                  technische und organisatorische Maßnahmen gewährleistet (rollenbasierte
                  Zugriffskontrolle auf Datensatzebene).
                </p>
              </div>
            </div>
          </section>

          {/* Ihre Rechte */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              7. Ihre Rechte
            </h2>
            <div className="space-y-4">
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Sie haben gegenüber dem Ministerium für Schule und Bildung folgende Rechte
                hinsichtlich der Sie betreffenden personenbezogenen Daten:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Auskunft</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 15 DSGVO
                  </p>
                </div>
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Berichtigung</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 16 DSGVO
                  </p>
                </div>
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Löschung</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 17 DSGVO
                  </p>
                </div>
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Einschränkung</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 18 DSGVO
                  </p>
                </div>
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Widerspruch</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 21 DSGVO
                  </p>
                </div>
                <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <h3 className="font-semibold mb-2">Recht auf Datenübertragbarkeit</h3>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    Art. 20 DSGVO
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Beschwerderecht */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              8. Beschwerderecht
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>
                Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn
                Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten
                gegen die DSGVO verstößt.
              </p>
              <div className="p-4 bg-[var(--md-sys-color-primary-container)] rounded-[var(--md-sys-shape-corner-medium)]">
                <p className="font-semibold text-[var(--md-sys-color-on-primary-container)]">
                  Landesbeauftragte für Datenschutz und Informationsfreiheit
                  Nordrhein-Westfalen
                </p>
                <p className="text-sm text-[var(--md-sys-color-on-primary-container)] mt-2">
                  Kavalleriestraße 2-4<br />
                  40213 Düsseldorf
                </p>
                <p className="text-sm text-[var(--md-sys-color-on-primary-container)] mt-2">
                  <strong>Telefon:</strong> 0211 38424-0<br />
                  <strong>E-Mail:</strong>{" "}
                  <a
                    href="mailto:poststelle@ldi.nrw.de"
                    className="underline"
                  >
                    poststelle@ldi.nrw.de
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Technische Sicherheit */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              9. Technische und organisatorische Maßnahmen
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>Zum Schutz Ihrer Daten setzen wir folgende Maßnahmen ein:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Technische Maßnahmen:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
                    <li>Verschlüsselte Passwort-Speicherung (Bcrypt)</li>
                    <li>Cookie-basierte Authentifizierung</li>
                    <li>Rollenbasierte Zugriffskontrolle (RBAC)</li>
                    <li>Autorisierung auf Datensatzebene</li>
                    <li>Regelmäßige Sicherheitsupdates</li>
                    <li>Backup-Systeme</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Organisatorische Maßnahmen:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Zugangskontrolle durch Benutzerverwaltung</li>
                    <li>Trennung von ADMIN und SUPERADMIN Rollen</li>
                    <li>Protokollierung von Formular-Erstellung und -Zugriff</li>
                    <li>Schulung der Schulamt-Mitarbeiter</li>
                    <li>Regelmäßige Sicherheitsaudits</li>
                    <li>Incident-Response-Prozesse</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-[var(--md-sys-color-secondary-container)] rounded-[var(--md-sys-shape-corner-medium)]">
                <p className="font-semibold text-[var(--md-sys-color-on-secondary-container)] mb-2">
                  Autorisierungskonzept
                </p>
                <p className="text-sm text-[var(--md-sys-color-on-secondary-container)]">
                  Jedes Formular wird bei Erstellung einem Benutzer zugeordnet. Der Zugriff
                  (Ansicht, Bearbeitung, Genehmigung, Export) ist ausschließlich dem
                  Ersteller des Formulars vorbehalten. Dies wird sowohl auf
                  Benutzeroberflächen-Ebene als auch auf API-Ebene durchgesetzt.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              10. Cookies und Tracking
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>
                Diese Anwendung verwendet ausschließlich technisch notwendige Cookies für
                die Authentifizierung und Autorisierung. Es erfolgt kein Tracking zu
                Marketing- oder Analysezwecken.
              </p>
              <div className="p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                <p className="font-semibold mb-2">Verwendete Cookies:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>auth-token</strong> – Authentifizierungsstatus</li>
                  <li><strong>user-id</strong> – Benutzer-Identifikation für Autorisierungsprüfungen</li>
                  <li>Gültigkeitsdauer: Bis zum Logout oder Ende der Session</li>
                  <li>Zweck: Authentifizierung und Zugriffskontrolle</li>
                  <li>Rechtsgrundlage: Art. 6 Abs. 1 lit. e DSGVO (technisch notwendig)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              11. Änderungen dieser Datenschutzerklärung
            </h2>
            <div className="space-y-4 text-[var(--md-sys-color-on-surface-variant)]">
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets
                den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer
                Leistungen in der Datenschutzerklärung umzusetzen.
              </p>
              <div className="mt-4 p-4 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-medium)]">
                <p className="font-semibold mb-2">Änderungshistorie:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Januar 2025:</strong> Initiale Version</li>
                  <li><strong>Oktober 2025:</strong> Ergänzung: Autorisierungskonzept auf Benutzerebene,
                  Benutzer-ID-Cookie, erweiterte Sicherheitsmaßnahmen</li>
                </ul>
              </div>
              <p className="text-sm mt-4">
                <strong>Stand dieser Version:</strong> Oktober 2025
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <Link
          href="/impressum"
          className="text-[var(--md-sys-color-primary)] hover:underline font-medium"
        >
          Impressum
        </Link>
      </div>
    </div>
  );
}


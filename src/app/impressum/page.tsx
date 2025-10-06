import Link from "@/components/Link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Impressum - Zielvereinbarung Digital",
  description: "Impressum und Anbieterkennzeichnung",
};

export default function ImpressumPage() {
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
        <h1 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)] mb-8">
          Impressum
        </h1>

        <div className="space-y-8 text-[var(--md-sys-color-on-surface)]">
          {/* Anbieter */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Anbieter
            </h2>
            <div className="space-y-2">
              <p className="font-semibold">
                Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen
              </p>
              <p>Völklinger Straße 49</p>
              <p>40221 Düsseldorf</p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Kontakt
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Telefon:</strong>{" "}
                <a href="tel:+492115837640" className="text-[var(--md-sys-color-primary)] hover:underline">
                  0211 5867-40
                </a>
              </p>
              <p>
                <strong>Telefax:</strong> 0211 5867-3220
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
              <p>
                <strong>Internet:</strong>{" "}
                <a
                  href="https://www.schulministerium.nrw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--md-sys-color-primary)] hover:underline"
                >
                  www.schulministerium.nrw
                </a>
              </p>
            </div>
          </section>

          {/* Vertretungsberechtigte */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Vertretungsberechtigt
            </h2>
            <p>
              Das Ministerium für Schule und Bildung wird vertreten durch die Ministerin
              für Schule und Bildung des Landes Nordrhein-Westfalen.
            </p>
          </section>

          {/* Aufsichtsbehörde */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Aufsichtsbehörde
            </h2>
            <p>
              Das Ministerium für Schule und Bildung untersteht der Dienst- und
              Fachaufsicht der Landesregierung Nordrhein-Westfalen.
            </p>
          </section>

          {/* Umsatzsteuer-ID */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
              <br />
              <strong>DE 811 847 129</strong>
            </p>
          </section>

          {/* Redaktionell verantwortlich */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Redaktionell verantwortlich
            </h2>
            <p>
              Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen
              <br />
              Referat für Presse- und Öffentlichkeitsarbeit
              <br />
              Völklinger Straße 49
              <br />
              40221 Düsseldorf
            </p>
          </section>

          {/* Haftungsausschluss */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Haftungsausschluss
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Inhalt des Onlineangebotes</h3>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                  Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit,
                  Vollständigkeit oder Qualität der bereitgestellten Informationen.
                  Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller
                  oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der
                  dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und
                  unvollständiger Informationen verursacht wurden, sind grundsätzlich
                  ausgeschlossen, sofern seitens des Autors kein nachweislich
                  vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Verweise und Links</h3>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                  Bei direkten oder indirekten Verweisen auf fremde Webseiten
                  (&ldquo;Hyperlinks&rdquo;), die außerhalb des Verantwortungsbereiches des Autors
                  liegen, würde eine Haftungsverpflichtung ausschließlich in dem Fall in
                  Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm
                  technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger
                  Inhalte zu verhindern.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Urheberrecht</h3>
                <p className="text-[var(--md-sys-color-on-surface-variant)]">
                  Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der
                  verwendeten Grafiken, Tondokumente, Videosequenzen und Texte zu
                  beachten, von ihm selbst erstellte Grafiken, Tondokumente,
                  Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken,
                  Tondokumente, Videosequenzen und Texte zurückzugreifen.
                </p>
              </div>
            </div>
          </section>

          {/* Technische Umsetzung */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Technische Umsetzung
            </h2>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              Diese Anwendung wurde im Auftrag des Ministeriums für Schule und Bildung
              des Landes Nordrhein-Westfalen entwickelt.
            </p>
          </section>

          {/* Barrierefreiheit */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[var(--md-sys-color-primary)]">
              Barrierefreiheit
            </h2>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              Diese Anwendung ist nach bestem Wissen und Gewissen unter Berücksichtigung
              der Web Content Accessibility Guidelines (WCAG) 2.1 Level AA entwickelt
              worden. Sollten Sie dennoch auf Barrieren stoßen, bitten wir um eine
              Mitteilung an{" "}
              <a
                href="mailto:poststelle@msb.nrw.de"
                className="text-[var(--md-sys-color-primary)] hover:underline"
              >
                poststelle@msb.nrw.de
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <Link
          href="/datenschutz"
          className="text-[var(--md-sys-color-primary)] hover:underline font-medium"
        >
          Datenschutzerklärung
        </Link>
      </div>
    </div>
  );
}


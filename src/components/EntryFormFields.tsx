"use client";

import { useState } from "react";

type EntryData = {
  title?: string;
  zielsetzungenText?: string | null;
  zielbereich1?: unknown;
  zielbereich2?: unknown;
  zielbereich3?: unknown;
  datengrundlage?: unknown;
  datengrundlageAndere?: string | null;
  zielgruppe?: unknown;
  zielgruppeSusDetail?: string | null;
  massnahmen?: string | null;
  indikatoren?: string | null;
  verantwortlich?: string | null;
  beteiligt?: string | null;
  beginnSchuljahr?: string | null;
  beginnHalbjahr?: number | null;
  endeSchuljahr?: string | null;
  endeHalbjahr?: number | null;
  fortbildungJa?: boolean;
  fortbildungThemen?: string | null;
  fortbildungZielgruppe?: string | null;
};

export function EntryFormFields({ initialData }: { initialData?: EntryData }) {
  const [zielbereich1, setZielbereich1] = useState<string[]>(
    Array.isArray(initialData?.zielbereich1) ? initialData.zielbereich1 as string[] : []
  );
  const [zielbereich2, setZielbereich2] = useState<string[]>(
    Array.isArray(initialData?.zielbereich2) ? initialData.zielbereich2 as string[] : []
  );
  const [zielbereich3, setZielbereich3] = useState<string[]>(
    Array.isArray(initialData?.zielbereich3) ? initialData.zielbereich3 as string[] : []
  );
  const [datengrundlage, setDatengrundlage] = useState<string[]>(
    Array.isArray(initialData?.datengrundlage) ? initialData.datengrundlage as string[] : []
  );
  const [zielgruppe, setZielgruppe] = useState<string[]>(
    Array.isArray(initialData?.zielgruppe) ? initialData.zielgruppe as string[] : []
  );
  const [fortbildungJa, setFortbildungJa] = useState(initialData?.fortbildungJa || false);

  const toggleArrayValue = (arr: string[], value: string, setter: (arr: string[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter((v) => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title (Required) */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)] flex items-center gap-2 mb-4">
          Titel der Maßnahme
          <span className="text-sm font-normal text-[var(--md-sys-color-error)]">*Pflichtfeld</span>
        </h3>
        <div>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={initialData?.title || ""}
            placeholder="z.B. Leseförderung im Deutschunterricht"
            className="w-full rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent invalid:border-[var(--md-sys-color-error)] invalid:focus:ring-[var(--md-sys-color-error)]"
            aria-required="true"
          />
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2">
            Geben Sie einen kurzen, prägnanten Titel für diese Maßnahme ein.
          </p>
        </div>
      </div>

      {/* Field 1: Zielsetzungen und Zielbereiche */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-6">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          1. Zielsetzungen und Zielbereiche
        </h3>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
            Konkrete Zielformulierung
          </label>
          <textarea
            name="zielsetzungenText"
            rows={4}
            defaultValue={initialData?.zielsetzungenText || ""}
            className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent touch-manipulation"
            placeholder="Beschreiben Sie die Zielsetzung..."
          />
        </div>

        {/* Zielbereich 1: Schulkompass NRW 2030 */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
            Zielbereich 1: Schulkompass NRW 2030
          </legend>
          <div className="space-y-3">
            {[
              { value: "mindeststandards", label: "Weniger SuS verfehlen Mindeststandards" },
              { value: "optimalstandards", label: "Mehr SuS erreichen Optimalstandards" },
              { value: "sozial_emotional", label: "Stärkung der sozial-emotionalen Entwicklung" },
              { value: "abschluss_anschluss", label: "BK: Mehr SuS erreichen Abschluss mit Anschlussperspektive" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors"
              >
                <input
                  type="checkbox"
                  checked={zielbereich1.includes(item.value)}
                  onChange={() => toggleArrayValue(zielbereich1, item.value, setZielbereich1)}
                  className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                />
                <span className="text-sm flex-1">{item.label}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="zielbereich1" value={JSON.stringify(zielbereich1)} />
        </fieldset>

        {/* Zielbereich 2: Startchancenprogramm */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
            Zielbereich 2: Startchancenprogramm
          </legend>
          <div className="space-y-3">
            {[
              { value: "basiskompetenzen_deutsch", label: "Erwerb von Basiskompetenzen: Deutsch" },
              { value: "basiskompetenzen_mathe", label: "Erwerb von Basiskompetenzen: Mathematik" },
              { value: "sozial_emotional_komp", label: "Erwerb sozial-emotionaler Kompetenzen" },
              { value: "ausserschulische_koop", label: "Auf- und Ausbau außerschulischer Kooperationen" },
              { value: "schulnetzwerke", label: "Auf- und Ausbau von Schulnetzwerken" },
              { value: "schulkultur", label: "Entwicklung einer positiven Schulkultur" },
              { value: "berufswahlkompetenz", label: "Erwerb von Berufswahlkompetenz (Persönlichkeitsbildung)" },
              { value: "demokratiekompetenz", label: "Erwerb von Demokratiekompetenz (Persönlichkeitsbildung)" },
              { value: "gewaltpraevention", label: "Gewaltprävention" },
              { value: "eltern_einbindung", label: "Lernförderliche Einbindung der Eltern" },
              { value: "sozialraum", label: "Vernetzung in den Sozialraum" },
              { value: "scp_weitere", label: "Weitere relevante schulische SCP-Schwerpunkte" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors"
              >
                <input
                  type="checkbox"
                  checked={zielbereich2.includes(item.value)}
                  onChange={() => toggleArrayValue(zielbereich2, item.value, setZielbereich2)}
                  className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                />
                <span className="text-sm flex-1">{item.label}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="zielbereich2" value={JSON.stringify(zielbereich2)} />
        </fieldset>

        {/* Zielbereich 3: RRSQ */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
            Zielbereich 3: RRSQ (Referenzrahmen Schulqualität)
          </legend>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {[
              { value: "ib1_kompetenzen", label: "IB1: Fachliche und überfachliche Kompetenzen" },
              { value: "ib1_foerderung", label: "IB1: Individuelle Förderung" },
              { value: "ib1_uebergaenge", label: "IB1: Übergänge gestalten" },
              { value: "ib2_unterrichtsgestaltung", label: "IB2: Unterrichtsgestaltung" },
              { value: "ib2_lernbegleitung", label: "IB2: Lernbegleitung" },
              { value: "ib2_arbeitsbedingungen", label: "IB2: Lern- und Arbeitsbedingungen" },
              { value: "ib2_digitaler_wandel", label: "IB2: Lernen und Lehren im digitalen Wandel" },
              { value: "ib3_werte_normen", label: "IB3: Werte- und Normenreflexion" },
              { value: "ib3_kultur_umgang", label: "IB3: Kultur des Umgangs miteinander" },
              { value: "ib3_demokratie", label: "IB3: Demokratische Gestaltung" },
              { value: "ib3_kommunikation", label: "IB3: Kommunikation, Kooperation und Vernetzung" },
              { value: "ib3_schulleben", label: "IB3: Gestaltetes Schulleben" },
              { value: "ib3_gesundheit", label: "IB3: Gesundheit und Bewegung" },
              { value: "ib3_gebaeude", label: "IB3: Gestaltung des Schulgebäudes und -geländes" },
              { value: "ib4_lehrerbildung", label: "IB4: Lehrerbildung" },
              { value: "ib4_anforderungen", label: "IB4: Umgang mit beruflichen Anforderungen" },
              { value: "ib4_teams", label: "IB4: (Multi-)Professionelle Teams" },
              { value: "ib5_fuehrung", label: "IB5: Pädagogische Führung" },
              { value: "ib5_organisation", label: "IB5: Organisation und Steuerung" },
              { value: "ib5_ressourcen", label: "IB5: Ressourcenplanung und Personaleinsatz" },
              { value: "ib5_personalentwicklung", label: "IB5: Personalentwicklung" },
              { value: "ib5_fortbildung", label: "IB5: Fortbildungsplanung" },
              { value: "ib5_qualitaet", label: "IB5: Strategien der Qualitätsentwicklung" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors"
              >
                <input
                  type="checkbox"
                  checked={zielbereich3.includes(item.value)}
                  onChange={() => toggleArrayValue(zielbereich3, item.value, setZielbereich3)}
                  className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                />
                <span className="text-sm flex-1">{item.label}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="zielbereich3" value={JSON.stringify(zielbereich3)} />
        </fieldset>
      </div>

      {/* Field 2: Datengrundlage */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          2. Datengrundlage
        </h3>
        <fieldset className="space-y-3">
          <div className="space-y-3">
            {[
              { value: "vera", label: "VERA/Lernstandserhebungen" },
              { value: "zp", label: "Zentrale Prüfungen" },
              { value: "abitur", label: "Abitur" },
              { value: "interne_eval", label: "Interne Evaluationen" },
              { value: "schulinspekt", label: "Schulinspektion/Qualitätsanalyse" },
              { value: "lehrerbefragung", label: "Lehrerbefragungen" },
              { value: "sus_befragung", label: "Schülerbefragungen" },
              { value: "eltern_befragung", label: "Elternbefragungen" },
              { value: "klassenarbeiten", label: "Klassenarbeiten/Tests" },
              { value: "beobachtung", label: "Unterrichtsbeobachtungen" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors"
              >
                <input
                  type="checkbox"
                  checked={datengrundlage.includes(item.value)}
                  onChange={() => toggleArrayValue(datengrundlage, item.value, setDatengrundlage)}
                  className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                />
                <span className="text-sm flex-1">{item.label}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="datengrundlage" value={JSON.stringify(datengrundlage)} />
        </fieldset>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
            Andere (bitte angeben)
          </label>
          <input
            type="text"
            name="datengrundlageAndere"
            defaultValue={initialData?.datengrundlageAndere || ""}
            className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
            placeholder="z.B. Portfolio-Analysen"
          />
        </div>
      </div>

      {/* Field 3: Zielgruppe */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          3. Zielgruppe der Maßnahme
        </h3>
        <fieldset className="space-y-3">
          <div className="space-y-3">
            {[
              { value: "alle_sus", label: "Alle Schülerinnen und Schüler" },
              { value: "schulleitung", label: "Schulleitung" },
              { value: "lehrkraefte", label: "Lehrkräfte" },
              { value: "paed_personal", label: "Pädagogisches Personal" },
              { value: "and_personal", label: "Anderes Personal" },
              { value: "eltern", label: "Eltern" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors"
              >
                <input
                  type="checkbox"
                  checked={zielgruppe.includes(item.value)}
                  onChange={() => toggleArrayValue(zielgruppe, item.value, setZielgruppe)}
                  className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                />
                <span className="text-sm flex-1">{item.label}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="zielgruppe" value={JSON.stringify(zielgruppe)} />
        </fieldset>
        
        {/* Teilgruppe SuS mit Textfeld und automatischer Checkbox-Aktivierung */}
        <div className="border-2 border-[var(--md-sys-color-outline-variant)] rounded-lg p-4 space-y-3 bg-[var(--md-sys-color-surface-variant)]/30">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={zielgruppe.includes("teilgruppe_sus")}
              onChange={() => toggleArrayValue(zielgruppe, "teilgruppe_sus", setZielgruppe)}
              className="mt-1 w-5 h-5 rounded border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
            />
            <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
              Folgende Teilgruppe von SuS
            </span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Welche Teilgruppe? (Details angeben)
            </label>
            <input
              type="text"
              name="zielgruppeSusDetail"
              defaultValue={initialData?.zielgruppeSusDetail || ""}
              onChange={(e) => {
                // Automatisch Checkbox aktivieren, wenn Text eingegeben wird
                if (e.target.value.trim() && !zielgruppe.includes("teilgruppe_sus")) {
                  setZielgruppe([...zielgruppe, "teilgruppe_sus"]);
                }
              }}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              placeholder="z.B. Klassen 5-7, Fördergruppe Mathematik"
            />
          </div>
        </div>
      </div>

      {/* Field 4: Maßnahmen */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          4. (Datengestützte) Maßnahme(n) zur Zielerreichung
        </h3>
        <textarea
          name="massnahmen"
          rows={4}
          defaultValue={initialData?.massnahmen || ""}
          className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
          placeholder="Beschreiben Sie die geplanten Maßnahmen..."
        />
      </div>

      {/* Field 5: Indikatoren */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          5. Indikatoren: Wir haben das Ziel erreicht, wenn...
        </h3>
        <textarea
          name="indikatoren"
          rows={3}
          defaultValue={initialData?.indikatoren || ""}
          className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
          placeholder="z.B. 80% der Schüler erreichen die Mindeststandards"
        />
      </div>

      {/* Field 6: Verantwortliche */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          6. Verantwortliche / beteiligte Person(en)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Verantwortlich
            </label>
            <input
              type="text"
              name="verantwortlich"
              defaultValue={initialData?.verantwortlich || ""}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              placeholder="z.B. Fr. Müller"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Beteiligt
            </label>
            <input
              type="text"
              name="beteiligt"
              defaultValue={initialData?.beteiligt || ""}
              className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              placeholder="z.B. Fachschaft Deutsch"
            />
          </div>
        </div>
      </div>

      {/* Field 7: Zeitraum */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          7. Beginn und Ende der Maßnahme
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3 text-[var(--md-sys-color-on-surface)]">
              Beginn
            </label>
            <div className="space-y-3">
              <select
                name="beginnSchuljahr"
                defaultValue={initialData?.beginnSchuljahr || ""}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              >
                <option value="">Schuljahr wählen</option>
                <option value="2024/25">2024/25</option>
                <option value="2025/26">2025/26</option>
                <option value="2026/27">2026/27</option>
                <option value="2027/28">2027/28</option>
                <option value="2028/29">2028/29</option>
                <option value="2029/30">2029/30</option>
                <option value="2030/31">2030/31</option>
              </select>
              <select
                name="beginnHalbjahr"
                defaultValue={initialData?.beginnHalbjahr?.toString() || ""}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              >
                <option value="">Halbjahr wählen</option>
                <option value="1">1. Halbjahr</option>
                <option value="2">2. Halbjahr</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-3 text-[var(--md-sys-color-on-surface)]">
              Ende
            </label>
            <div className="space-y-3">
              <select
                name="endeSchuljahr"
                defaultValue={initialData?.endeSchuljahr || ""}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              >
                <option value="">Schuljahr wählen</option>
                <option value="2024/25">2024/25</option>
                <option value="2025/26">2025/26</option>
                <option value="2026/27">2026/27</option>
                <option value="2027/28">2027/28</option>
                <option value="2028/29">2028/29</option>
                <option value="2029/30">2029/30</option>
                <option value="2030/31">2030/31</option>
              </select>
              <select
                name="endeHalbjahr"
                defaultValue={initialData?.endeHalbjahr?.toString() || ""}
                className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              >
                <option value="">Halbjahr wählen</option>
                <option value="1">1. Halbjahr</option>
                <option value="2">2. Halbjahr</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Field 8: Fortbildung */}
      <div className="md-surface rounded-[var(--md-sys-shape-corner-large)] p-4 md:p-6 md-elevation-1 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--md-sys-color-primary)]">
          8. Unterstützung durch Fortbildung / andere Maßnahmen
        </h3>
        <fieldset className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors">
              <input
                type="radio"
                name="fortbildungJa"
                value="false"
                checked={!fortbildungJa}
                onChange={() => setFortbildungJa(false)}
                className="w-5 h-5 text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              />
              <span className="text-base font-medium">Nein</span>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer touch-manipulation transition-colors">
              <input
                type="radio"
                name="fortbildungJa"
                value="true"
                checked={fortbildungJa}
                onChange={() => setFortbildungJa(true)}
                className="w-5 h-5 text-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
              />
              <span className="text-base font-medium">Ja, zu folgenden Themen:</span>
            </label>
          </div>
          {fortbildungJa && (
            <div className="space-y-4 pl-4 md:pl-8 border-l-4 border-[var(--md-sys-color-primary)]">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
                  Themen
                </label>
                <textarea
                  name="fortbildungThemen"
                  rows={3}
                  defaultValue={initialData?.fortbildungThemen || ""}
                  className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                  placeholder="z.B. Methoden zur Leseförderung, Digitalisierung im Unterricht"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
                  Für folgende Zielgruppe
                </label>
                <input
                  type="text"
                  name="fortbildungZielgruppe"
                  defaultValue={initialData?.fortbildungZielgruppe || ""}
                  className="w-full rounded-[var(--md-sys-shape-corner-small)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] touch-manipulation"
                  placeholder="z.B. gesamtes Kollegium, Fachschaft Deutsch"
                />
              </div>
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
}


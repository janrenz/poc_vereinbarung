// Label mappings for form field values
// Used in both the form UI and PDF generation

export const ZIELBEREICH_1_LABELS: Record<string, string> = {
  mindeststandards: "Weniger SuS verfehlen Mindeststandards",
  optimalstandards: "Mehr SuS erreichen Optimalstandards",
  sozial_emotional: "Stärkung der sozial-emotionalen Entwicklung",
  abschluss_anschluss: "BK: Mehr SuS erreichen Abschluss mit Anschlussperspektive",
};

export const ZIELBEREICH_2_LABELS: Record<string, string> = {
  deutsch: "Erwerb von Basiskompetenzen: Deutsch",
  mathematik: "Erwerb von Basiskompetenzen: Mathematik",
  sozial_emotional_kompetenzen: "Erwerb sozial-emotionaler Kompetenzen",
  kooperationen: "Auf- und Ausbau außerschulischer Kooperationen",
  schulnetzwerke: "Auf- und Ausbau von Schulnetzwerken",
  schulkultur: "Entwicklung einer positiven Schulkultur",
  berufswahlkompetenz: "Erwerb von Berufswahlkompetenz (Persönlichkeitsbildung)",
  demokratiekompetenz: "Erwerb von Demokratiekompetenz (Persönlichkeitsbildung)",
  gewaltpraevention: "Gewaltprävention",
  elterneinbindung: "Lernförderliche Einbindung der Eltern",
  sozialraum: "Vernetzung in den Sozialraum",
  weitere: "Weitere relevante schulische SCP-Schwerpunkte",
};

export const ZIELBEREICH_3_LABELS: Record<string, string> = {
  ib1_fachlich: "IB1: Fachliche und überfachliche Kompetenzen",
  ib1_foerderung: "IB1: Individuelle Förderung",
  ib1_uebergaenge: "IB1: Übergänge gestalten",
  ib2_unterrichtsgestaltung: "IB2: Unterrichtsgestaltung",
  ib2_lernbegleitung: "IB2: Lernbegleitung",
  ib2_arbeitsbedingungen: "IB2: Lern- und Arbeitsbedingungen",
  ib2_digitaler_wandel: "IB2: Lernen und Lehren im digitalen Wandel",
  ib3_werte: "IB3: Werte- und Normenreflexion",
  ib3_kultur_umgang: "IB3: Kultur des Umgangs miteinander",
  ib3_demokratie: "IB3: Demokratische Gestaltung",
  ib3_kommunikation: "IB3: Kommunikation, Kooperation und Vernetzung",
  ib3_schulleben: "IB3: Gestaltetes Schulleben",
  ib3_gesundheit: "IB3: Gesundheit und Bewegung",
  ib3_schulgebaeude: "IB3: Gestaltung des Schulgebäudes und -geländes",
  ib4_lehrerbildung: "IB4: Lehrerbildung",
  ib4_anforderungen: "IB4: Umgang mit beruflichen Anforderungen",
  ib4_teams: "IB4: (Multi-)Professionelle Teams",
  ib5_fuehrung: "IB5: Pädagogische Führung",
  ib5_organisation: "IB5: Organisation und Steuerung",
  ib5_ressourcen: "IB5: Ressourcenplanung und Personaleinsatz",
  ib5_personalentwicklung: "IB5: Personalentwicklung",
  ib5_fortbildung: "IB5: Fortbildungsplanung",
  ib5_qualitaet: "IB5: Strategien der Qualitätsentwicklung",
};

export const DATENGRUNDLAGE_LABELS: Record<string, string> = {
  vera: "VERA/Lernstandserhebungen",
  zp: "Zentrale Prüfungen",
  abitur: "Abitur",
  interne_eval: "Interne Evaluationen",
  schulinspekt: "Schulinspektion/Qualitätsanalyse",
  lehrerbefragung: "Lehrerbefragungen",
  sus_befragung: "Schülerbefragungen",
  eltern_befragung: "Elternbefragungen",
  klassenarbeiten: "Klassenarbeiten/Tests",
  beobachtung: "Unterrichtsbeobachtungen",
};

export const ZIELGRUPPE_LABELS: Record<string, string> = {
  alle_sus: "Alle Schülerinnen und Schüler",
  teilgruppe_sus: "Folgende Teilgruppe von SuS",
  schulleitung: "Schulleitung",
  lehrkraefte: "Lehrkräfte",
  paed_personal: "Pädagogisches Personal",
  and_personal: "Anderes Personal",
  eltern: "Eltern",
};

// Helper function to convert array of IDs to labels
export function arrayToLabels(arr: unknown, labelMap: Record<string, string>): string {
  if (!arr) return "-";
  if (Array.isArray(arr)) {
    if (arr.length === 0) return "-";
    return arr.map(id => labelMap[String(id)] || String(id)).join(", ");
  }
  return String(arr);
}




export const LINEN_LABELS: Record<string, string> = {
  bedding: "Bettwäsche",
  bath_mats: "Badematten",
  sink_towels: "WB-Handtücher",
  large_towels: "Badetücher",
  sauna_towels: "Saunatücher",
  small_towels: "Handtücher",
  pillow_cases: "Kissenbezüge",
  kitchen_towels: "Geschirrtücher",
  blankets: "Decken",
  table_linens: "Tischwäsche"
};

export const getLinenLabel = (key: string): string => {
  return LINEN_LABELS[key] || key;
};

export const LINEN_COLOR_LABELS: Record<string, string> = {
  white_striped: "Weiß gestreift",
  white: "Weiß",
  grey: "Grau",
  grey_striped: "Grau gestreift",
  colorful: "Bunt"
};

export const getLinenColorLabel = (key: string): string => {
  return LINEN_COLOR_LABELS[key] || key;
};

// Definierte Reihenfolge für die Anzeige der Artikel
export const LINEN_ORDER: string[] = [
  'bedding',        // 1. Bettwäsche
  'pillow_cases',   // 2. Kissenbezüge
  'small_towels',   // 3. Handtücher
  'large_towels',   // 4. Badetücher
  'sauna_towels',   // 5. Saunatücher
  'bath_mats',      // 6. Badematten
  'sink_towels',    // 7. WB-Handtücher
  'kitchen_towels', // 8. Geschirrtücher
  'blankets',       // 9. Decken
  'table_linens'    // 10. Tischwäsche
];

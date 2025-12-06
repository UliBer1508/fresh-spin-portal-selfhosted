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

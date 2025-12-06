export const LINEN_LABELS: Record<string, string> = {
  bedding: "Bettwäsche",
  bath_mats: "Badematten",
  sink_towels: "WB-Handtücher",
  large_towels: "Badetücher",
  sauna_towels: "Saunahandtücher",
  small_towels: "Handtücher",
  pillow_cases: "Kissenbezüge",
  kitchen_towels: "Küchenhandtücher",
  blankets: "Decken",
  table_linens: "Tischwäsche"
};

export const getLinenLabel = (key: string): string => {
  return LINEN_LABELS[key] || key;
};

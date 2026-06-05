## Ziel
Im Wäschebestellungs-Filter neben "Diese Woche" / "Nächste Woche" zwei zusätzliche Karten hinzufügen: **Diesen Monat** und **Nächsten Monat**. Auswahl bleibt exklusiv pro Zeitraum (eine Periode aktiv) und kombinierbar mit dem Hausfilter.

## Änderungen

### 1. `src/components/QuickFilterCards.tsx`
- `QuickFilter`-Typ erweitern:  
  `week: "thisWeek" | "nextWeek" | "thisMonth" | "nextMonth" | null`  
  (Feldname bleibt `week`, um Diff klein zu halten — alternativ in `period` umbenennen, siehe Technische Details).
- Zwei neue Buttons unter den bestehenden Wochen-Buttons rendern (gleicher `cardBase`-Style, `Calendar`-Icon), mit `t("quickFilter.thisMonth")` und `t("quickFilter.nextMonth")` und Default-Labels "Diesen Monat" / "Nächsten Monat".
- Toggle-Funktion `toggleWeek` akzeptiert die neuen Werte.

### 2. `src/pages/Index.tsx`
- Neue Helper-Funktion `getMonthRange(offsetMonths: number)` analog zu `getWeekRange`, liefert `{ monthStart, monthEnd }` (1. des Monats bis 1. des Folgemonats, lokale Zeit).
- Filterblock erweitern: wenn `quickFilter.week` einer der Monatswerte ist, statt Wochen-Range den Monats-Range nutzen.

### 3. Übersetzungen
In `public/locales/{de,en,nl}/common.json` unter `quickFilter`:
- de: `thisMonth: "Diesen Monat"`, `nextMonth: "Nächsten Monat"`
- en: `thisMonth: "This Month"`, `nextMonth: "Next Month"`
- nl: `thisMonth: "Deze Maand"`, `nextMonth: "Volgende Maand"`

## Technische Details
- Monats-Range mit `new Date(year, month + offset, 1)` für korrekte Lokal-/Zeitzonen-Behandlung (konsistent zur Project-Memory-Regel zur Datumsbehandlung).
- Vergleich identisch zu Wochenfilter: `d >= monthStart && d < monthEnd` auf `delivery_date` (Fallback `check_in`).
- Keine Datenbank-, Hook- oder API-Änderungen nötig — rein Frontend-Filter.
- Anordnung im Grid: `grid-cols-2` bleibt; die vier Zeit-Buttons reihen sich nach den Häusern automatisch ein.

## Nicht enthalten
- Kein Rename des Feldes `week` → `period` (würde mehr Diff erzeugen; nur falls gewünscht).
- Keine Änderung am Hausfilter oder anderen Komponenten.
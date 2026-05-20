# Plan: Quick-Filter kombinierbar machen (Haus + Woche)

## Problem
Aktuell sind die Quick-Filter-Buttons **gegenseitig exklusiv** — beim Klick auf "Wald Chalet" wird eine zuvor aktive "Diese Woche"-Auswahl deaktiviert. Es gibt also keine Möglichkeit, **gleichzeitig** ein Haus *und* eine Woche zu filtern.

## Ziel
Haus-Buttons und Wochen-Buttons sind **unabhängig voneinander** wähl-/abwählbar. Wenn sowohl ein Haus als auch eine Woche aktiv ist, werden die Filter mit UND verknüpft (z.B. „Wald Chalet **und** diese Woche").

## Änderungen

### `src/components/QuickFilterCards.tsx`
- Filter-Typ ändern von Single-Selection zu kombiniertem Zustand:
  ```ts
  export type QuickFilter = {
    house: string | null;
    week: "thisWeek" | "nextWeek" | null;
  };
  ```
- Klick-Verhalten:
  - Haus-Button: schaltet `house` toggle (gleiche Auswahl erneut → null), lässt `week` unverändert.
  - Wochen-Button: schaltet `week` toggle, lässt `house` unverändert. „Diese Woche" und „Nächste Woche" bleiben untereinander exklusiv (nur eine Woche gleichzeitig).
- Aktiv-Styling pro Button bleibt visuell unverändert (grüner Ring/Border).

### `src/pages/Index.tsx`
- Initial-State: `{ house: null, week: null }` statt `null`.
- Filter-Logik in der `useMemo` umschreiben:
  ```ts
  if (quickFilter.house) {
    filtered = filtered.filter(b => b.houses?.name === quickFilter.house);
  }
  if (quickFilter.week) {
    const { weekStart, weekEnd } = getWeekRange(quickFilter.week === "thisWeek" ? 0 : 1);
    filtered = filtered.filter(/* ... bestehende Wochen-Logik ... */);
  }
  ```
- Falls noch ein „aktive Filter"-Indikator existiert, prüft jetzt `quickFilter.house || quickFilter.week`.

## Was unverändert bleibt
- Optik & Layout der Karten (Grid 2-spaltig, grüne Karten, Icons).
- Wochen-Bereich-Berechnung (`getWeekRange`).
- i18n-Keys.

## Verifikation
1. „Wald Chalet" klicken → grün markiert, Liste zeigt nur Wald Chalet.
2. Zusätzlich „Diese Woche" klicken → beide Buttons grün, Liste = Wald Chalet ∩ diese Woche.
3. „Wald Chalet" erneut klicken → Haus-Filter weg, nur Wochenfilter aktiv.
4. „Nächste Woche" klicken bei aktivem „Diese Woche" → wechselt direkt zur nächsten Woche.

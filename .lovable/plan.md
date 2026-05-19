## Quick-Filter-Buttons im Stil des Bildes

Datei: `src/components/QuickFilterCards.tsx` (nur `cardBase`-Klassen anpassen)

**Sichtbare Änderungen im Bild vs. aktuell:**
- Heller, weißer Hintergrund statt `bg-accent`
- Hellblauer Rand (Border in Primary-Ton), deutlicher abgesetzt
- Größere Buttons: mehr vertikales/horizontales Padding (~ `px-5 py-4`, `min-h-[64px]`)
- Größerer Abstand zwischen Icon und Text (`gap-3`)
- Größere Schrift (`text-base` bzw. `text-lg`), weiterhin bold
- Etwas größeres Icon (`w-6 h-6`)
- Eckenradius bleibt `rounded-2xl`

**Konkret:**
- `cardBase`: `flex items-center gap-3 rounded-2xl border-2 bg-card px-5 py-4 min-h-[64px] text-left transition-all active:scale-[0.98] hover:bg-accent/40`
- `inactive`: `border-primary/40`
- `active`: `border-primary ring-2 ring-primary/30 bg-accent/40`
- Icon: `w-6 h-6`
- Text: `text-base font-bold`

Keine Logik-Änderungen, nur Styling. Grid-Layout (2 Spalten, gap-2) bleibt.

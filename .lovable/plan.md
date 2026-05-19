## Ziel
Auf Mobile den ungenutzten Platz oberhalb der Quick-Filter-Buttons entfernen, damit der Inhalt direkt unter der oberen Bildschirmkante beginnt.

## Änderungen

### `src/pages/Index.tsx`
1. Zeile 275: `<div className="pt-12 md:pt-0 flex-1">` → `<div className="flex-1">` — die 48px Reserve für die PWA-Statusleiste entfällt (Bar erscheint nur noch bei Offline/Update).
2. Zeile 292: `<main className="... py-4 sm:py-8 ...">` → `<main className="... pt-2 pb-4 sm:pt-4 sm:pb-8 ...">` — oberes Padding auf Mobile von 16 px auf 8 px reduzieren.

## Nicht-Ziele
- PWAStatusBar-Logik bleibt unverändert.
- Bottom-Padding (für die fixe Menüleiste) bleibt unverändert.
- Header bleibt mobil ausgeblendet.

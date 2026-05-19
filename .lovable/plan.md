## Ziel
Die linke Spalte der Linen-Order-Karte kompakter und visuell konsistent machen. Status, Notizen und Lieferdatum sollen das gleiche horizontale Layout haben — Label links, Eingabe/Button rechts auf gleicher Vertikalachse.

## Änderungen in `src/components/LinenOrderSection.tsx`

### 1. Lieferdatum-Block (Zeilen 253–278) umbauen
Aktuell: Label über volle Breite, Button darunter (2 Zeilen).
Neu: Inline-Layout wie bei Status/Notizen (1 Zeile).

- Wrapper-`div` von `space-y-2` (2-zeilig) auf `flex items-center gap-2` umstellen
- Label-Text von `{t('labels.deliveryBy')}:` ("Lieferung bis zum:") auf kürzeres `Datum` ändern (entsprechend der User-Anforderung „links Datum")
- Label-Container bekommt `flex-shrink-0`
- Button-Wrapper `flex-1 min-w-0` (analog Status/Notizen) → Button rutscht rechts, fluchtet linksbündig mit Status- und Notizen-Buttons

### 2. Konsistente Label-Breite (optional, für sauberen Bündigkeitseffekt)
Damit alle drei Buttons exakt auf der gleichen x-Position starten:
- Label-Container (Icon + Text) bei Datum/Status/Notizen alle auf fixe Mindestbreite `min-w-[72px] sm:min-w-[88px]` setzen
- So fluchten die Buttons garantiert linksbündig, unabhängig von Textlänge

### 3. Debug-Border entfernen
Die `border-2`-Klassen aus dem letzten Edit waren ein Test — entfernen:
- Zeile 264: `border-border ... border-2` → `border border-border`
- Zeile 286: `flex-1 min-w-0 border-2` → `flex-1 min-w-0`
- Zeile 363: `flex-1 min-w-0 border-2` → `flex-1 min-w-0`
- Zeile 366: `border-border ... border-2` → `border border-border`

### 4. Platz-Optimierung
- Outer-Spacing `space-y-1.5 sm:space-y-2` (Zeile 250) belassen
- Lieferdatum spart durch Inline-Layout ~28px vertikal pro Karte

## Ergebnis (Mobile)
```text
📅 Datum   [ 19.6.2026 - 09:00:00 ]
📊 Status  [ 🟡 Ausstehend       ▾]
📝 Notizen [ Automatische ...      ]
           [ 🖨 LS-Drucken         ]
```
Alle Buttons starten auf der gleichen x-Achse linksbündig.

## Offene Frage
Soll das Label wirklich nur „Datum" heißen, oder lieber „Lieferung" (passt besser zum bisherigen `labels.deliveryBy`)? Standard: ich setze `Datum` wie gewünscht.
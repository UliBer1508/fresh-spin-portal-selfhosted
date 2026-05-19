## Ziel

Die Wäschebestellungs-Karte (`LinenOrderCard`) erhält denselben dünnen linken Farbstreifen wie die Buchungskarte (`border-l-4` statt `border-l-8`) und wird für die Mobil-Ansicht (<640px) kompakter dargestellt.

## Änderungen

### 1. `src/components/LinenOrderCard.tsx`
- `border-l-8` → `border-l-4` (gleiche Strichbreite wie BookingCard)
- `CardContent` Padding: `p-2.5 sm:p-3` → `p-3 sm:p-4` (innen mehr Luft, da Border schmaler)

### 2. `src/components/LinenOrderSection.tsx`
Mobile-Optimierung — alle Größen via Tailwind-Breakpoints (`sm:`):

| Element | Mobile | Desktop (sm+) |
|---|---|---|
| Vertikaler Abstand zwischen Zeilen | `space-y-1.5` | `sm:space-y-2` |
| Label-Icons (Calendar, BarChart3, User, FileText, ClipboardList, Shirt) | `w-4 h-4` | `sm:w-5 sm:h-5` |
| Label-Texte ("Lieferung bis", "Status", "Notizen", "Artikel") | `text-xs` | `sm:text-sm` |
| Wert-Buttons (Datum, Notizen) Padding | `p-2` | `sm:p-3` |
| Wert-Buttons min-height | `min-h-[40px]` | `sm:min-h-[44px]` |
| Wert-Text in Buttons | `text-xs` | `sm:text-sm` |
| Select-Trigger min-height | `min-h-[40px]` | `sm:min-h-[44px]` |
| LS-Drucken Button | `min-h-[40px]` | `sm:min-h-[44px]` |
| Grid-Gap zwischen Spalten | `gap-3` | `sm:gap-6` |
| Artikel-Tabelle Zellen-Padding | `py-1.5 px-2` | `sm:py-2 sm:px-4` |

Layout bleibt identisch — nur Maße/Abstände werden auf Mobile reduziert. Resultat: ~25 % weniger vertikale Höhe auf 390px-Breite.

## Nicht betroffen

- BookingCard (bereits kompakt)
- Logik, Datenfluss, Dialoge

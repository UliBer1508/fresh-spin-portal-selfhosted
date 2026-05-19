## Ziel

Buchungskarte kompakter machen — Layout bleibt identisch zur Referenz, nur kleinere Maße/Abstände.

## Änderungen in `src/components/BookingCard.tsx`

Reine Tailwind-Größenanpassungen, keine Logik-Änderungen:

| Element | Vorher | Nachher |
|---|---|---|
| `CardContent` Padding | `p-4 sm:p-6` | `p-3 sm:p-4` |
| Vertikaler Abstand | `space-y-4` | `space-y-2.5` |
| Icon-Tile (Haus) | `w-12 h-12 rounded-xl` + `w-6 h-6` icon | `w-10 h-10 rounded-lg` + `w-5 h-5` icon |
| Haus-Titel | `text-lg` | `text-base` |
| Buchung-Untertitel | `text-sm` | `text-xs` |
| Adresse Icon | `w-4 h-4` | `w-3.5 h-3.5` |
| Guest/Users Icons | `w-5 h-5` | `w-4 h-4` |
| Guest-Text | (default) | `text-sm` |
| Check-in/out Karten Padding | `p-3` + `rounded-xl` | `p-2.5` + `rounded-lg` |
| Check-in/out Datum | `text-lg` | `text-base` |
| Check-in/out Grid Gap | `gap-3` | `gap-2` |
| Border-left | `border-l-8` | `border-l-4` |

Resultat: gleiche Optik wie das hochgeladene Referenzbild, ~25 % weniger Höhe.

Keine weiteren Dateien betroffen.

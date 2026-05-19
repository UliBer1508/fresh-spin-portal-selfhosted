## Ziel

Wäschebestellungs-Karte (`LinenOrderSection`) kompakter darstellen — gleiches Layout, weniger Höhe/Padding.

## Änderungen in `src/components/LinenOrderSection.tsx`

Reine Tailwind-Anpassungen, keine Logik:

| Element | Vorher | Nachher |
|---|---|---|
| Icons (Calendar, BarChart3, User, FileText, ClipboardList) | `w-5 h-5` | `w-4 h-4` |
| Label-Text (Lieferung, Status, Notizen, Artikel, Zugewiesen) | `text-sm font-semibold` | `text-xs font-semibold` |
| Lieferung/Notizen Buttons Padding | `p-3 min-h-[44px]` | `p-2 min-h-[36px]` |
| Lieferung/Notizen Text | `text-sm font-bold` | `text-xs font-bold` |
| SelectTrigger (Status, Wäschekraft) | `min-h-[44px]` | `min-h-[36px] h-9 text-xs` |
| SelectItem | `min-h-[44px]` | `min-h-[36px] text-xs` |
| LS-Drucken Button | `min-h-[44px]` | `min-h-[36px] h-9 text-xs` |
| Printer Icon | `w-4 h-4` (bleibt) | bleibt |
| Vertikaler Abstand linke Spalte | `space-y-2` | `space-y-1.5` |
| Lieferung Sub-Spacing | `space-y-2` (×2) | `space-y-1` |
| Wäschekraft Spacing | `space-y-2` | `space-y-1` |
| Artikel Toggle Button | `py-2 min-h-[44px]` | `py-1.5 min-h-[36px]` |
| Grid gap (linke/rechte Spalte) | `gap-4 sm:gap-6` | `gap-3 sm:gap-4` |
| Artikel-Spalte `space-y-3` | `space-y-3` | `space-y-2` |

Touch-Targets bleiben mit `min-h-[36px]` (≈ 36 px) noch gut tippbar, ohne wuchtig zu wirken.

Keine weiteren Dateien betroffen.

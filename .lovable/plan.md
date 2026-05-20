# Konzept: 2-Spalten Touch-Layout für die Wäschebestellungs-Karte

## Ziel
Die Buttons in `LinenOrderSection.tsx` werden im Stil der hochgeladenen CHECK-IN / CHECK-OUT Karten dargestellt: **2 nebeneinander, weitere darunter**, große touch-freundliche Kacheln in der Hintergrundfarbe der Wäschekarte.

## Layout

```text
┌─────────────────┬─────────────────┐
│ 📅 LIEFERUNG    │ 📊 STATUS       │
│ 19.6.2026 09:00 │ 🟡 Ausstehend ▾ │
├─────────────────┼─────────────────┤
│ 📄 NOTIZEN      │ 🖨️ LSCHEIN      │
│ Keine           │ Drucken         │
├─────────────────┴─────────────────┤
│ 📋 ARTIKEL                        │
│ Anzeigen (18)                     │
└───────────────────────────────────┘
```

- Container: `grid grid-cols-2 gap-2 sm:gap-3`
- 5. Kachel (Artikel) spannt beide Spalten: `col-span-2`
- Jede Kachel: ganze Fläche klickbar, `min-h-[72px]`, `rounded-xl`, `p-3 sm:p-4`
- Inhalt pro Kachel: oben Icon + kleines uppercase Label (`text-xs uppercase tracking-wide text-muted-foreground`), darunter Wert groß/fett (`text-base sm:text-lg font-bold text-foreground`)
- Hintergrundfarbe: leicht hellere Variante der Karten-/Booking-Farbe (vom übergeordneten BookingCard übernommen), Border `border border-border/40`, Hover/Active: `hover:bg-muted/40 active:scale-[0.98] transition`

## Die 5 Kacheln

| # | Icon | Label | Wert | Aktion beim Tap |
|---|------|-------|------|------------------|
| 1 | CalendarClock / Truck | LIEFERUNG | Datum + Uhrzeit | öffnet `EditDeliveryDialog` |
| 2 | BarChart3 | STATUS | Aktueller Status mit Farbpunkt | öffnet Status-Select (Radix Select via Ref) |
| 3 | FileText | NOTIZEN | Snippet oder „Keine" | öffnet `EditNotesDialog` |
| 4 | Printer | LSCHEIN | „Drucken" | öffnet `PrintDeliveryNoteDialog` |
| 5 | ClipboardList | ARTIKEL | „Anzeigen (n)" / „Ausblenden (n)" | toggelt Artikel-Tabelle |

Die Artikel-Tabelle bleibt unverändert direkt unter dem Grid und klappt wie bisher ein/aus.

## Entfernt
- Sektion „Zugewiesene Wäschekraft" inkl. Select wird aus dem UI entfernt (Logik/State bleibt im Code).

## Technische Umsetzung
Eine Datei: `src/components/LinenOrderSection.tsx`
1. Bisherige horizontale Label+Button-Zeilen (Lieferung / Status / Zugewiesen / LSchein) durch ein `grid grid-cols-2` ersetzen
2. Artikel-Header in eine 5. Kachel `col-span-2` umbauen (statt rechte Spalte/Sektion)
3. Wiederverwendbare lokale Komponente `LinenTile({ icon, label, value, onClick, valueClassName })` einführen
4. Status-Tile: programmatisches Öffnen des bestehenden `<Select>` via Ref, damit die gesamte Kachel als Trigger fungiert
5. Klassen mit semantischen Tokens (kein Hardcoded-Color); Touch-Klassen: `touch-manipulation`, `select-none`

## Was unverändert bleibt
- Daten-Queries, Status-Logik, Dialoge, Artikel-Tabellen-Rendering, Übersetzungen, ViewSettings-Flags (außer `showAssignedStaff` Anzeige)

## Offene Frage
Soll die Artikel-Kachel (Position 5) wirklich **volle Breite** (`col-span-2`) bekommen, oder lieber als normale halbe Kachel rechts neben LSchein (also LSchein + Artikel in einer Reihe)?

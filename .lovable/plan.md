# Tag-Klick öffnet Popup mit Tagesinfo

Betroffene Datei: `src/components/CalendarView.tsx`

## Ziel
Beim Klick auf einen Tag in der Kalender-Karte (Monat/Woche) öffnet sich ein zentriertes Modal-Popup wie im Mockup mit:
- **Header:** Wochentag fett (z. B. "Freitag") + darunter Datum gemuted (z. B. "29. Mai 2026"), rechts oben Schließen-X.
- **Event-Liste:** pro Event eine abgerundete Karte mit
  - links rundem mint-farbenem Icon-Badge (Sparkles für Reinigung, Shirt für Wäsche, LogIn/LogOut für Check-in/-out, BedDouble für occupied)
  - rechts Titel fett (Hausname), darunter Subtitel gemuted: `Typ • Uhrzeit • ● Status`
  - Chevron-Right rechts (außer für reine Info-Events)
- Wenn keine Events: leerer Hinweistext.

## Umsetzung

### 1. Dialog-Komponente
- shadcn `Dialog` (`@/components/ui/dialog`) verwenden.
- Neuer State: `dayDialogOpen: boolean` (selectedDate existiert schon und steuert Inhalt).
- `handleDayClick(date)`: setzt `selectedDate(date)` UND `setDayDialogOpen(true)`.

### 2. Dialog-Layout (mobile-first)
```text
┌──────────────────────────────────┐
│ Freitag                      [×] │
│ 29. Mai 2026                     │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ (✨)  Wald Chalet         ›  │ │
│ │      Reinigung · 10:00 ●Gepl.│ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ (👕)  Wald Chalet            │ │
│ │      Wäsche Lieferung ●Geli. │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```
- Container: weiße Karte, `rounded-2xl`, max-width ~480px, auf Mobile mit Rand `mx-4`.
- Event-Cards: `bg-card border rounded-xl p-3 flex items-center gap-3`.
- Icon-Badge: `w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center`.
- Status-Dot: kleiner farbiger Punkt (geplant=blau, geliefert=grün, abgeschlossen=grün, offen=amber).

### 3. Event-Daten anreichern
`CalendarEvent` um optionale Felder erweitern (rein UI, optional):
- `time?: string` (z. B. `10:00`)
- `status?: string` (z. B. `Geplant`, `Geliefert`)
- `statusColor?: string` (semantic class)

Beim Aufbau der Events (`loadCalendarData`) Felder mitschreiben:
- cleaning: status aus `service_tasks.status`, Zeit `10:00` (oder vorhandenes Feld falls da)
- linen: Status aus `linen_orders.status`
- check-in/out: optional Uhrzeit aus booking, Status weglassen
- occupied: nur Hausname, keine Statuszeile

Falls Felder nicht in DB existieren, im UI einfach ausblenden (`event.status && …`).

### 4. Icon-Mapping
```ts
const iconFor = {
  cleaning: Sparkles,
  linen: Shirt,
  'check-in': LogIn,
  'check-out': LogOut,
  occupied: BedDouble,
}
```
Imports aus `lucide-react` ergänzen (Sparkles, Shirt, LogIn, LogOut, BedDouble bereits teilweise vorhanden – nur fehlende ergänzen).

### 5. Cleanup
- Die bestehende Sidebar-Sektion "Selected Date Events" (Zeilen 789-821) bleibt für Desktop optional erhalten oder wird entfernt — **wird entfernt**, weil das Popup beide Plattformen abdeckt und die Sidebar dadurch entlastet wird.

## Technische Hinweise
- Reine Frontend-Änderung; keine Datenmodell-/RLS-Änderungen.
- i18n-Keys für neue Status-/Typ-Labels wiederverwenden falls vorhanden, sonst über vorhandene Event-Title fallen lassen.
- Light-Theme respektieren; Farben über semantische Tokens bzw. dezente `emerald-100/700` für das Icon-Badge.


## Problem: Timezone-Verschiebung bei Datumsanzeige im Gantt-Kalender

### Ursache
In `src/components/CalendarView.tsx` (Zeile 191-192) werden Datum-Strings aus der Datenbank mit `parseISO()` geparst:

```typescript
const checkInDate = parseISO(booking.check_in);   // "2026-02-03" → 2026-02-03T00:00:00Z (UTC)
const checkOutDate = parseISO(booking.check_out);
```

`parseISO("2026-02-03")` liefert **UTC-Mitternacht**. In der Zeitzone `Europe/Vienna` (UTC+1) wird das lokal als `2026-02-02T23:00:00` dargestellt – also **einen Tag zu früh**. Deshalb erscheinen Check-in und Check-out Tage im Gantt-Chart verschoben.

Das gleiche Problem betrifft auch die Monatsansicht und Wochenansicht bei der Event-Generierung (Check-in/Check-out Events auf den falschen Tagen).

### Lösung: Lokales Datum ohne Zeitzone parsen

Statt `parseISO()` wird ein einfaches Hilfsfunktion eingesetzt, die einen `YYYY-MM-DD` String in ein lokales Datum (Mitternacht Lokalzeit) umwandelt:

```typescript
// Parst "YYYY-MM-DD" als lokales Datum (kein UTC-Offset Problem)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // Lokale Mitternacht
};
```

### Betroffene Stellen in `CalendarView.tsx`

**Zeile 191-192** (Gantt + Calendar Events):
```typescript
// VORHER:
const checkInDate = parseISO(booking.check_in);
const checkOutDate = parseISO(booking.check_out);

// NACHHER:
const checkInDate = parseLocalDate(booking.check_in);
const checkOutDate = parseLocalDate(booking.check_out);
```

**Zeile 248** (Service Tasks / Cleaning):
```typescript
// VORHER:
date: parseISO(task.scheduled_date),

// NACHHER:
date: parseLocalDate(task.scheduled_date),
```

**Zeile ~262** (Linen Orders):
```typescript
// VORHER:
date: parseISO(order.delivery_date),

// NACHHER:
date: parseLocalDate(order.delivery_date),
```

### Technische Details

```text
Beispiel mit UTC+1 (Wien, Berlin, Amsterdam):

parseISO("2026-02-03")
→ 2026-02-03T00:00:00.000Z (UTC)
→ Lokal: 2026-02-02T23:00:00+01:00  ← FALSCH (einen Tag zu früh!)

new Date(2026, 1, 3)  // Lokale Mitternacht
→ 2026-02-03T00:00:00+01:00          ← RICHTIG
```

### Import bereinigen
Da `parseISO` nicht mehr benötigt wird, wird es aus dem `date-fns` Import entfernt.

### Versions-Update
- `public/sw.js`: VERSION auf `12.17`
- `src/lib/version.ts`: APP_VERSION auf `12.17.0`
- `index.html`: Service Worker auf `?v=12.17`



## Plan: Stornierte Buchungen aus Kalender herausfiltern

### Problem
Die `CalendarView.tsx` Komponente lädt **alle Buchungen** ohne Filterung nach Status. Dadurch werden auch stornierte Buchungen (`status = 'cancelled'`) im Kalender angezeigt.

### Lösung
Die Supabase-Abfrage für Buchungen um einen Status-Filter erweitern, der stornierte Buchungen ausschließt.

### Technische Details

**Datei: `src/components/CalendarView.tsx`**

**Aktuelle Abfrage (Zeile 143-155):**
```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    id,
    guest_name,
    check_in,
    check_out,
    house_id,
    houses!bookings_house_id_fkey!inner (name, rental_type)
  `)
  .eq('houses.rental_type', 'tourist')
  .gte('check_out', startDate)
  .lte('check_in', endDate);
```

**Neue Abfrage mit Status-Filter:**
```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    id,
    guest_name,
    check_in,
    check_out,
    house_id,
    houses!bookings_house_id_fkey!inner (name, rental_type)
  `)
  .eq('houses.rental_type', 'tourist')
  .neq('status', 'cancelled')  // ← NEU: Stornierte ausschließen
  .gte('check_out', startDate)
  .lte('check_in', endDate);
```

### Zusätzliche Änderung: Import der Konstante (optional, für Konsistenz)
```typescript
import { HOUSE_COLORS, getColorByHash, BOOKING_STATUS } from "@/lib/constants";

// Dann in der Abfrage:
.neq('status', BOOKING_STATUS.CANCELLED)
```

### Versions-Update
- `public/sw.js`: VERSION auf `12.16`
- `src/lib/version.ts`: APP_VERSION auf `12.16.0`
- `index.html`: Service Worker auf `?v=12.16`

### Ergebnis
- Stornierte Buchungen werden **nicht mehr** im Kalender angezeigt
- Betrifft alle Views: Monat, Woche und Gantt
- Nutzt bestehende `BOOKING_STATUS` Konstante für Konsistenz


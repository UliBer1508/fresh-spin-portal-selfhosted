
## Problem: Buchungen werden nicht angezeigt — `parseLocalDate` versteht ISO-Timestamps nicht

### Ursache
Die Datenbank gibt `check_in` und `check_out` als vollständige ISO-Timestamps mit Zeitzone zurück:
```
"2025-08-09T13:00:00+00:00"
```

Die aktuelle `parseLocalDate`-Funktion erwartet jedoch nur das Format `YYYY-MM-DD`.  
Beim Aufteilen nach `-` entsteht als drittes Segment `"09T13:00:00+00:00"`, was `NaN` ergibt:

```typescript
parts.some(isNaN) → true → gibt null zurück
```

Dadurch greift diese Zeile und **alle Buchungen werden übersprungen**:
```typescript
if (!checkInDate || !checkOutDate) return;
```

### Lösung: `parseLocalDate` für beide Formate robust machen

Die Funktion muss beide Datums-Formate unterstützen:
- `"2025-08-09"` (Datumsformat — z.B. `delivery_date`, `scheduled_date`)
- `"2025-08-09T13:00:00+00:00"` (ISO-Timestamp — z.B. `check_in`, `check_out`)

**Neue robuste Implementierung:**
```typescript
const parseLocalDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  // Datumsteil extrahieren (vor dem 'T' bei ISO-Timestamps)
  const datePart = dateStr.split('T')[0];
  
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  
  const [year, month, day] = parts;
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  
  return new Date(year, month - 1, day); // Lokale Mitternacht
};
```

### Warum `.split('T')[0]` die richtige Lösung ist
- `"2025-08-09T13:00:00+00:00".split('T')[0]` → `"2025-08-09"` ✓
- `"2025-08-09".split('T')[0]` → `"2025-08-09"` ✓ (unverändert, da kein T vorhanden)

### Betroffene Datei
**`src/components/CalendarView.tsx`** — Zeile 12-18: Nur die `parseLocalDate`-Funktion wird geändert.

### Versions-Update
- `src/lib/version.ts`: APP_VERSION auf `12.18.0`
- `public/sw.js`: VERSION auf `12.18`
- `index.html`: Service Worker auf `?v=12.18`

### Ergebnis
- Alle Buchungen mit ISO-Timestamp-Datumsfeldern werden korrekt geparst
- Datumsfelder wie `delivery_date` und `scheduled_date` (reines `YYYY-MM-DD`) funktionieren weiterhin
- Gantt-Ansicht zeigt wieder alle Buchungen für den gewählten Monat

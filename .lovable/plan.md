## Problem
In `src/hooks/useBookings.ts` werden aktuell **alle** Buchungen mit Wäschebestellungen geladen – inklusive abgeschlossener Buchungen aus dem letzten Jahr. Es gibt keinen Datumsfilter.

## Lösung
Nur Buchungen anzeigen, deren **Check-Out heute oder in der Zukunft** liegt. Damit:
- laufende Aufenthalte (Gäste schon eingecheckt) bleiben sichtbar
- zukünftige Buchungen bleiben sichtbar
- vergangene/abgeschlossene Buchungen verschwinden aus der Liste

## Änderung

**`src/hooks/useBookings.ts`** (Zeile 115)

Vor dem `.order(...)` einen Filter ergänzen:
```ts
.gte('check_out', new Date().toISOString().split('T')[0])
```

Damit lädt Supabase nur Buchungen mit `check_out >= heute`. Die nachgelagerte Filterung auf `linen_orders.length > 0` bleibt unverändert.

## Hinweis
Falls du lieber nur **zukünftige** Buchungen sehen willst (also Check-In ab heute, laufende Aufenthalte ausgeblendet), würde ich stattdessen `check_in` filtern. Sag Bescheid, falls das gemeint war.

## Ziel
Die „Einzelbestellungen"-Sektion (standalone linen orders ohne `booking_id`) aus der UI entfernen, da Bestellungen immer einer Buchung zugewiesen sind und die Sektion ein historisches Überbleibsel ist.

## Änderungen

**`src/pages/Index.tsx`**
- Block „Standalone Orders Section" (Zeilen ~168–185) inkl. Überschrift „Einzelbestellungen" und `StandaloneOrderCard`-Liste entfernen.
- `filteredStandaloneOrders` useMemo + zugehörigen Quick-Filter-Code entfernen.
- `standaloneOrders` nicht mehr aus `useBookings` destrukturieren bzw. nicht mehr durchreichen.
- Bedingung `filteredBookings.length === 0 && standaloneOrders.length === 0` auf reine `filteredBookings.length === 0` Prüfung reduzieren.
- Import `StandaloneOrderCard` entfernen, Import `Package`-Icon entfernen falls nur dort verwendet.
- `LinenOrder`-Typimport aufräumen, falls nicht mehr benötigt.

**`src/components/QuickFilterCards.tsx`**
- `standaloneOrders` prop entfernen — Häuserliste wird nur noch aus `bookings` aufgebaut.

**`src/components/StandaloneOrderCard.tsx`**
- Datei löschen (keine weiteren Verwender).

**`src/hooks/useBookings.ts`**
- Falls dort `standaloneOrders` separat abgefragt wird: Abfrage und Rückgabe entfernen, damit kein toter Code bleibt. (Wird im Build-Schritt überprüft.)

## Hinweise
- Keine DB-Migration: bestehende standalone-Datensätze (mit `booking_id IS NULL`) bleiben in der Datenbank unangetastet, werden nur nicht mehr angezeigt.
- Falls du sie auch dauerhaft aus der DB entfernen willst, sag Bescheid — das wäre ein separater Schritt (Backup + `DELETE FROM linen_orders WHERE booking_id IS NULL`).
- Memory-Eintrag „Standalone Orders" wird nach Implementierung aus dem Projekt-Memory entfernt.

## Ziel
Die Such- & Filterleiste oben im "Wäsche"-Tab entfernen.

## Änderungen

**`src/pages/Index.tsx`**
- Import von `SearchAndFilter` entfernen
- `<SearchAndFilter ... />` Block (Zeilen 138–148) entfernen
- Da `filteredBookings` / `filteredStandaloneOrders` bisher von `SearchAndFilter` befüllt wurden: durch direkte Nutzung von `bookings` (transformiert auf eine Karte pro `linen_order`, wie bisher in SearchAndFilter via `flatMap`) und `standaloneOrders` ersetzen, damit alle Buchungen ungefiltert angezeigt werden.
- Die `QuickFilterCards` (Haus / diese Woche / nächste Woche) bleiben erhalten; die zugehörige Filterlogik aus `SearchAndFilter` wird in ein kleines `useMemo` in `Index.tsx` übernommen, damit die Quick-Filter weiter funktionieren.

**`src/components/SearchAndFilter.tsx`**
- Datei löschen (wird nicht mehr verwendet).

## Hinweise
- Keine Änderungen an Backend, Datenmodell oder Übersetzungen.
- `viewSettings` / Mobile-Button-Toggle bleibt unberührt (wird im Header gerendert).

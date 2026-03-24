
## Plan: Entwurf-Rechnungen per Rechnungsnummer ausblenden (Status beibehalten)

### Kurzdiagnose
- Aktuell wird in `src/components/InvoiceList.tsx` mit `.neq("status", "Entwurf")` gefiltert.
- In den echten Daten sind Entwürfe aber `status = "offen"` und an `rechnungsnummer` wie `ENTWURF-...` erkennbar.
- Dadurch ist Status allein kein verlässlicher Entwurfs-Filter.
- Gleichzeitig soll der Status wichtig bleiben, damit **nicht bezahlte echte Rechnungen** weiterhin sichtbar sind.

### Umsetzung
1. **Filterlogik in `src/components/InvoiceList.tsx` umstellen**
   - Status-Filter für Entwurf entfernen.
   - Stattdessen nach Rechnungsnummer filtern:
   ```ts
   .not("rechnungsnummer", "ilike", "ENTWURF-%")
   ```
   - `ilike` sorgt dafür, dass auch `entwurf-...`/`Entwurf-...` ausgeschlossen wird.

2. **Status-Anzeige unverändert lassen**
   - Badge-Logik bleibt aktiv (bezahlt/offen/überfällig).
   - Es werden weiterhin alle fachlich relevanten Stati gezeigt; nur Entwurfsnummern fliegen raus.

3. **Defensive Absicherung (optional, aber robust)**
   - Nach dem Fetch zusätzlich clientseitig filtern:
   - `!inv.rechnungsnummer?.toLowerCase().startsWith("entwurf-")`
   - Falls Daten mal mit ungewöhnlicher Groß-/Kleinschreibung oder Whitespace zurückkommen.

4. **Cache/Version aktualisieren (PWA-Sichtbarkeit)**
   - `src/lib/version.ts` → `12.20.0`
   - `public/sw.js` → `12.20`
   - `index.html` SW-Query auf `?v=12.20`
   - Damit die neue Filterlogik sofort in der Vorschau/PWA ankommt.

### Technische Details
```ts
const { data, error } = await supabase
  .from("laundry_invoices")
  .select("*")
  .not("rechnungsnummer", "ilike", "ENTWURF-%")
  .order("rechnungsdatum", { ascending: false });
```

### Erwartetes Ergebnis
- Alle `ENTWURF-...` Rechnungen werden ausgeblendet.
- Echte Rechnungen bleiben sichtbar, auch wenn sie **noch nicht bezahlt** sind.
- Status bleibt für die Anzeige/Einordnung vollständig erhalten.

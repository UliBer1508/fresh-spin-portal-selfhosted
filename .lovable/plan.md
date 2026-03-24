

## Plan: Rechnungen-Tab in die Navigation integrieren

### Ziel
Neues Tab "Rechnungen" (🧾) in der Tab-Navigation hinzufügen, das alle Rechnungen aus der `laundry_invoices`-Tabelle anzeigt -- formatiert wie im Screenshot (Tabelle mit Rechnungsnr., Datum, Fällig, Betrag, Status, Aktionen).

### Vorhandene Daten
Die Tabelle `laundry_invoices` existiert bereits mit allen nötigen Feldern:
- `rechnungsnummer` -- Rechnungsnr.
- `rechnungsdatum` -- Datum
- `faelligkeitsdatum` -- Fällig
- `bruttobetrag` -- Betrag
- `status` -- Status (z.B. "Bezahlt")
- `positionen` (JSON) -- Rechnungspositionen für Detailansicht

### Änderungen

**1. Neue Komponente: `src/components/InvoiceList.tsx`**
- Lädt Rechnungen aus `laundry_invoices` via Supabase, sortiert nach `rechnungsdatum` absteigend
- Tabellenansicht (Desktop) mit Spalten: Rechnungsnr., Datum, Fällig, Betrag, Status, Aktionen
- Kartenansicht (Mobile) mit gleichen Infos
- Aktionen: Ansehen (Eye-Icon) oeffnet Detail-Dialog mit Positionen
- Status-Badge: gruen fuer "Bezahlt", gelb fuer "Offen", rot fuer "Überfällig"
- Datumsformatierung: DD.MM.YYYY (deutsch)
- Betragsformatierung: EUR mit Komma-Dezimaltrennzeichen

**2. Datei: `src/components/TabNavigation.tsx`**
- Neuen Tab hinzufuegen: `{ id: "rechnungen", labelKey: "tabs.invoices", emoji: "🧾" }`

**3. Datei: `src/pages/Index.tsx`**
- Neuen Case `"rechnungen"` im `renderTabContent()` Switch hinzufuegen
- `<InvoiceList />` rendern

**4. Übersetzungsdateien**
- `public/locales/de/navigation.json`: `"invoices": "Rechnungen"`
- `public/locales/en/navigation.json`: `"invoices": "Invoices"`
- `public/locales/nl/navigation.json`: `"invoices": "Facturen"`

**5. Versions-Update**
- `src/lib/version.ts`: APP_VERSION auf `12.19.0`
- `public/sw.js`: VERSION auf `12.19`
- `index.html`: Service Worker auf `?v=12.19`

### Technische Details

Die Supabase-Abfrage:
```typescript
const { data } = await supabase
  .from('laundry_invoices')
  .select('*')
  .order('rechnungsdatum', { ascending: false });
```

Detail-Dialog zeigt `positionen` (JSON-Array) als Tabelle mit Artikelbezeichnung, Menge, Einzelpreis, Gesamtpreis.


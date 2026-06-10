## Problem

Die Rechnungsliste zeigt 0 Einträge, obwohl in `laundry_invoices` 56 Datensätze (13 echte + 43 Entwürfe) liegen.

**Ursache:** Die einzige RLS-Policy auf `laundry_invoices` ist `Admin full access` (nur Rolle `admin`). Der eingeloggte User `waescheoberpinzgau@gmail.com` hat keine Rolle in `user_roles` → RLS filtert alle Zeilen weg → `count: 0, error: null`.

## Lösung

Neue PERMISSIVE SELECT-Policy für alle authentifizierten User hinzufügen. Bestehende Admin-Policy für Schreibrechte bleibt unverändert. Zusätzlich fehlende GRANTs für `authenticated` / `service_role` ergänzen.

### Migration

```sql
-- Grants (fehlen aktuell komplett)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laundry_invoices TO authenticated;
GRANT ALL ON public.laundry_invoices TO service_role;

-- Neue SELECT-Policy: alle eingeloggten User dürfen lesen
CREATE POLICY "Authenticated users can read invoices"
ON public.laundry_invoices
FOR SELECT
TO authenticated
USING (true);
```

Schreib-/Lösch-/Update-Rechte bleiben auf Admins beschränkt (durch die bestehende `Admin full access` Policy).

## Ergebnis

Nach Anwendung sehen alle eingeloggten User die 13 echten Rechnungen (Entwürfe werden weiterhin clientseitig in `InvoiceList.tsx` ausgefiltert).

## Ziel

`status_changed_by` in `linen_orders` soll den real eingeloggten User widerspiegeln — für Teuni's Account immer `"Teuni"`, statt aktuell hartcodiert `"portal"`.

## Änderungen

### 1. `src/components/LinenOrderSection.tsx` — `handleStatusChange`

Aktuell (Zeile 84–101):
```ts
.update({
  status: newStatus,
  status_changed_by: 'portal',
  status_changed_at: new Date().toISOString()
})
```

Neu: Vor dem Update den aktuellen User holen und daraus den Namen ableiten.

```ts
const { data: { user } } = await supabase.auth.getUser();
const email = user?.email?.toLowerCase() ?? '';

let changedBy = 'Unbekannt';
if (email === 'waescheoberpinzgau@gmail.com') {
  changedBy = 'Teuni';
} else if (email === 'uli.berresheim@hotmail.de') {
  changedBy = 'Admin';
} else if (email) {
  changedBy = email;
}

await supabase.from('linen_orders').update({
  status: newStatus,
  status_changed_by: changedBy,
  status_changed_at: new Date().toISOString(),
}).eq('id', orderId);
```

Mapping in einer kleinen Helper-Funktion `getStatusChangerName()` in `src/lib/utils.ts` kapseln, damit es wiederverwendbar ist (z. B. falls künftig weitere Update-Stellen dazukommen).

### 2. PWA-Cache invalidieren

`src/lib/version.ts` Version hochzählen, damit Teuni's gecachte PWA (die heute noch `"Admin"` schreibt) automatisch ein Update zieht. Siehe Memory `pwa-update-mechanism`.

### 3. Datenkorrektur (optional, einmalig)

Den heutigen falschen Eintrag korrigieren:
```sql
UPDATE public.linen_orders
SET status_changed_by = 'Teuni'
WHERE id = '5b4e4e71-cc6f-4b12-a91e-7e9810166474'
  AND status_changed_by = 'Admin';
```

### 4. Memory-Update

`mem://features/linen-order-status-tracking` ergänzen: `status_changed_by` wird dynamisch aus dem eingeloggten User abgeleitet (Email-Mapping in `src/lib/utils.ts`).

## Nicht im Scope

- Keine Änderungen an Triggern, RLS oder Rechnungs-Logik.
- Keine Änderungen an externen Sync-Pfaden (gibt es laut Analyse ohnehin keine — alle DB-Writes auf `status` kommen aus dieser App).

## Offene Frage

Punkt 3 (heutigen Eintrag von Wald Chalet auf „Teuni" korrigieren) — mit ausführen oder lassen?

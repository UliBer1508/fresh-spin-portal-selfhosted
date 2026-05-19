## Plan: Klickbare Felder primary-gefüllt

### `src/components/LinenOrderSection.tsx`

1. **Datum-Button** (Z. 268): `border border-border bg-accent hover:brightness-95` → `bg-primary hover:bg-primary/90 shadow-sm`. Wert-Text: `text-foreground` → `text-primary-foreground`.

2. **Notizen-Button** (Z. 371): gleiche Klassen wie Datum. Wert-Text → `text-primary-foreground`.

3. **Drucken-Button** (Z. 396–403): `variant="outline"` → `variant="default"`, Klassen-Override `bg-accent border-border hover:brightness-95` entfernen.

4. **Status-Select** (Z. 296): Behält `getStatusColor`-Farbe (semantisch), bekommt zusätzlich `ring-2 ring-primary/40 ring-offset-1`.

Kein Edit-Icon — Buttons sind durch Primary-Farbe selbsterklärend klickbar.
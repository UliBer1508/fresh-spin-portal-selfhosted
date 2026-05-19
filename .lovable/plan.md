# Buttons linksbündig wie der Lieferungs-Button

Betroffene Datei: `src/components/LinenOrderSection.tsx`

Der Lieferungs-Button verwendet `text-left` und richtet seinen Inhalt links aus. Die anderen Aktions-Buttons (Notiz, Drucken, Anzeigen) sowie die Status-/Wäschekraft-Selects sollen identisch links ausgerichtet werden.

## Änderungen

1. **Notiz-Button** (Zeile ~369-384): innere `justify-between`-Klasse entfernen — Text bleibt damit garantiert links (statt mittig wirkend bei kurzen Texten).

2. **Drucken-Button** (shadcn `<Button>`, Zeile ~396-402): zusätzliche Klassen `justify-start text-left` hinzufügen, damit der Text "Drucken" linksbündig statt zentriert dargestellt wird.

3. **Anzeigen-Button** (Zeile ~421-428): `text-center` → `text-left` ändern, damit "Anzeigen (n)" links beginnt.

4. **Status-Select & Wäschekraft-Select**: shadcn `SelectTrigger` zeigt den Wert standardmäßig links — keine Änderung nötig (Status/Ausstehend im Screenshot ist bereits links).

Reine UI-/Klassen-Änderung. Keine Logikänderung.

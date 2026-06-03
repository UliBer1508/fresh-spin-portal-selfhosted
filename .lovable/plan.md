## Ziel
Der Header in `src/components/Header.tsx` soll auf Mobilgeräten sichtbar sein, damit Logout und Passwort-ändern erreichbar sind. ChatButton und ViewSettingsDialog bleiben Desktop-only.

## Änderung
Eine einzige Datei: `src/components/Header.tsx`

1. **Äußeres `<header>`-Element:**
   - Alt: `className="hidden md:block bg-white border-b border-border px-6 py-2"`
   - Neu: `className="bg-white border-b border-border px-4 md:px-6 py-2"`
   - Entfernt `hidden md:block`, reduziert Padding auf Mobil von `px-6` auf `px-4`.

2. **ChatButton:**
   - In `<span className="hidden md:inline-flex">...</span>` wrappen.

3. **ViewSettingsDialog-Block (`shouldShowButton`):**
   - In `<span className="hidden md:inline-flex">...</span>` wrappen.

4. **Passwort-ändern-Button (KeyRound) und Abmelden-Button:**
   - Keine Änderung, bleiben ohne `hidden`-Klasse und somit auf allen Größen sichtbar.

5. **ChangePasswordDialog:**
   - Keine Änderung, bleibt im DOM.

Keine anderen Dateien werden geändert.
## Ziel
Den Header-Bereich mit Logo (🧺) und Titel „Teuni Wäscheportal" entfernen, um Platz zu sparen. PWA-relevante Felder (App-Name beim Installieren, Icon, Splash) bleiben unverändert, da sie aus `manifest.json` und `index.html`-Metadaten stammen — nicht aus dem Header.

## Änderungen

### `src/components/Header.tsx`
- Linken Block (Icon-Quadrat + `h1` Titel + Versionstext) entfernen.
- Verbleibende rechte Seite (Chat-Button auf Desktop + ⚙️-ViewSettings) bleibt erhalten.
- Wenn auf Mobile dadurch ein leerer Header sichtbar wäre, gesamte `<header>`-Leiste auf Mobile ausblenden (`hidden md:block`), sodass mobil direkt mit dem Inhalt gestartet wird; auf Desktop kompakte Leiste mit `justify-end`.

## Nicht-Ziele
- Keine Änderung an `public/manifest.json`, `index.html` oder den PWA-Icons → installierte App heißt weiterhin „Teuni Wäscheportal" mit Basket-Icon.
- Keine Änderung an Sprachauswahl, Chat-Logik oder ⚙️-Einstellungen.

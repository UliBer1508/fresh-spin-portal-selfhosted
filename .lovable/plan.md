## Ziel
Platz im Header sparen, indem die Sprachauswahl in den Benachrichtigungs-Dialog wandert und die obere PWA-Statusleiste nur noch bei Offline oder verfügbarem Update sichtbar ist.

## Änderungen

### 1. PWA-Statusleiste (`src/components/PWAStatusBar.tsx`)
- Sichtbarkeitslogik anpassen: Komponente rendert nur noch, wenn `!isOnline` **oder** `updateAvailable === true`.
- Mobile-immer-anzeigen-Verhalten entfernen (kein `isMobile`-State mehr nötig).
- Inhalt bleibt unverändert (Offline-Hinweis bzw. „Aktualisiere…"-Badge).

### 2. Sprachauswahl in Benachrichtigungs-Dialog verschieben
- `src/components/NotificationSettingsDialog.tsx`: Neuen Abschnitt „Sprache" unterhalb der bestehenden Einstellungen hinzufügen, dort `<LanguageSwitcher />` einbinden (mit Trenner/Überschrift im gleichen Stil wie die anderen Felder).
- `src/components/Header.tsx`: Import und Verwendung von `LanguageSwitcher` entfernen.

### 3. Memory-Update
- `mem://features/pwa-status-bar` aktualisieren: Status-Leiste erscheint nur noch bei Offline / Update; vorherige „auf Mobile immer sichtbar"-Regel entfernen.

## Nicht-Ziele
- Funktionalität der Sprachumschaltung bleibt identisch (gleiche Komponente, gleiches Verhalten).
- Keine Änderungen am PWA-Service-Worker, Update-Mechanismus oder anderen Header-Elementen (Logo, Titel, Chat, ⚙️).

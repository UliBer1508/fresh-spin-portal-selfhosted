## Ziel

Keine Install-Banner/Anleitungen mehr. Nur wenn ein neues App-Update verfügbar ist, soll dieses automatisch aufs Handy gepushed (heruntergeladen + aktiviert) werden.

## Aktueller Stand

- Auto-Update ist bereits aktiv (Service Worker in `index.html` prüft alle 5 Min, SKIP_WAITING + Reload via `controllerchange`).
- Zusätzlich existiert `PWAUpdatePrompt`, das einen 5-Sekunden-Countdown-Toast zeigt — das ist eine UI-„Anleitung".
- `PWAInstallPrompt` zeigt nach 30 Sek. ein Install-Banner — soll weg.

## Änderungen

1. **`src/pages/Index.tsx`**
   - Import + Verwendung von `PWAInstallPrompt` entfernen.
   - Import + Verwendung von `PWAUpdatePrompt` entfernen (keine UI mehr beim Update — Update läuft still im Hintergrund und Seite lädt automatisch neu).
   - `PWAStatusBar` bleibt (zeigt nur Offline-Indikator).

2. **`src/components/PWAInstallPrompt.tsx`** löschen.

3. **`src/components/PWAUpdatePrompt.tsx`** löschen.

4. Auto-Update-Mechanismus in `index.html` und `public/sw.js` bleibt unverändert — er pushed Updates bereits automatisch:
   - SW-Check alle 5 Min via `reg.update()`
   - Neuer SW → `SKIP_WAITING` → `controllerchange` → `window.location.reload()`

## Ergebnis

- Kein Install-Banner, keine Update-Toast-Anleitung.
- Sobald ein Update auf dem Server liegt, holt es das Handy innerhalb von max. 5 Min automatisch und lädt die App still neu.

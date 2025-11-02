# Teuni Wäscheportal - PWA Features Documentation

## Übersicht

Das Teuni Wäscheportal ist eine vollständige Progressive Web App (PWA) mit umfassender Offline-Unterstützung, Push-Benachrichtigungen und nativen App-Funktionen.

## 📱 PWA-Features

### 1. Installierbarkeit

**Desktop (Chrome, Edge, Brave):**
1. Klicken Sie auf das Installations-Icon in der Adressleiste
2. Oder: Menü → "App installieren"
3. Die App erscheint in Ihrer Taskbar/Dock

**Mobile (Android):**
1. Tippen Sie auf Menü (⋮) → "Zum Startbildschirm hinzufügen"
2. Oder warten Sie auf den automatischen Installations-Prompt
3. Die App erscheint auf Ihrem Startbildschirm wie eine native App

**Mobile (iOS/Safari):**
1. Tippen Sie auf das Teilen-Icon (□↑)
2. Scrollen Sie zu "Zum Home-Bildschirm"
3. Tippen Sie auf "Hinzufügen"

### 2. Offline-Funktionalität

**Was funktioniert offline:**
- ✅ Alle bereits geladenen Buchungen anzeigen
- ✅ Buchungsdetails durchsuchen
- ✅ Kalenderansicht nutzen
- ✅ Notizen bearbeiten (werden später synchronisiert)
- ✅ Status-Updates vornehmen (werden später synchronisiert)
- ✅ UI-Navigation und alle Komponenten

**Automatische Synchronisierung:**
- Alle Offline-Änderungen werden automatisch synchronisiert, sobald die Verbindung wiederhergestellt ist
- Der Offline-Indikator zeigt die Anzahl ausstehender Aktionen
- Manueller Sync-Button für sofortige Synchronisierung

**Datenspeicherung:**
- Buchungen werden lokal in IndexedDB gecacht
- Änderungen werden in einer Queue gespeichert
- Keine Datenverluste bei Verbindungsabbrüchen

### 3. Push-Benachrichtigungen

**Aktivierung:**
1. Öffnen Sie die Einstellungen
2. Navigieren Sie zu "Push-Benachrichtigungen"
3. Klicken Sie auf "Benachrichtigungen aktivieren"
4. Bestätigen Sie die Browser-Berechtigung

**Benachrichtigungs-Typen:**
- 🔔 Neue Wäschebestellungen
- 📅 Erinnerungen für bevorstehende Check-ins
- ✅ Status-Updates für Bestellungen
- ⚠️ Wichtige System-Meldungen

**Verwaltung:**
- Test-Benachrichtigung zum Testen der Funktionalität
- Deaktivieren jederzeit möglich
- Browser-Einstellungen für detaillierte Kontrolle

### 4. Service Worker & Caching

**Caching-Strategien:**
- **Statische Assets:** Cache-First (sofortiges Laden)
- **API-Daten:** Network-First mit Cache-Fallback
- **Bilder & Icons:** Cache-First mit automatischer Aktualisierung

**Cache-Management:**
- Automatische Versionskontrolle (aktuell: v10.0)
- Alte Caches werden automatisch bereinigt
- Manuelle Cache-Löschung über `/clear-cache.html`

### 5. Background Sync

**Automatische Synchronisierung:**
- Änderungen werden im Hintergrund synchronisiert
- Funktioniert auch wenn die App geschlossen ist
- Retry-Logik mit exponentiellem Backoff bei Fehlern

**Sync-Queue:**
- Alle ausstehenden Aktionen werden priorisiert
- Automatische Conflict-Resolution
- Status-Tracking für jede Aktion

### 6. Offline-Indikator

**Features:**
- Zeigt Online/Offline-Status in Echtzeit
- Anzahl ausstehender Synchronisierungen
- Manueller Sync-Button
- Detaillierte Speicher-Statistiken
- Automatisches Ausblenden wenn alles synchronisiert ist

### 7. Update-Management

**Automatische Updates:**
- Service Worker prüft regelmäßig auf Updates
- Toast-Benachrichtigung bei verfügbarem Update
- Ein-Klick-Installation des Updates
- Keine Unterbrechung der Nutzung

**Update-Prozess:**
1. Neue Version wird im Hintergrund geladen
2. Benutzer erhält Benachrichtigung
3. Klick auf "Aktualisieren" installiert sofort
4. Page Reload mit neuer Version

## 🔧 Technische Details

### Verwendete Technologien

**Frontend:**
- React 18 mit TypeScript
- Vite Build-Tool
- Tailwind CSS für Styling
- shadcn/ui Komponenten

**PWA-Stack:**
- Service Worker (native)
- IndexedDB (via idb library)
- Push API
- Background Sync API
- Cache API
- Web App Manifest

**Backend:**
- Supabase (PostgreSQL)
- Real-time Subscriptions
- Row Level Security

### Dateistruktur

```
├── public/
│   ├── sw.js                      # Service Worker
│   ├── manifest.json              # Web App Manifest
│   ├── offline.html               # Offline Fallback-Seite
│   └── icons/                     # App Icons & Screenshots
│
├── src/
│   ├── components/
│   │   ├── PWAInstallPrompt.tsx   # Installations-Banner
│   │   ├── PWAUpdatePrompt.tsx    # Update-Benachrichtigung
│   │   ├── OfflineIndicator.tsx   # Offline-Status-Anzeige
│   │   └── PushNotificationSetup.tsx  # Push-Setup
│   │
│   ├── hooks/
│   │   └── usePWA.ts              # PWA Hook
│   │
│   └── lib/
│       ├── offlineStorage.ts      # IndexedDB Verwaltung
│       └── pwaUtils.ts            # PWA Hilfsfunktionen
```

### Browser-Kompatibilität

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Installation | ✅ | ✅ | ⚠️* | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️** | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

*Safari: Über "Zum Home-Bildschirm hinzufügen"  
**Safari iOS: Nur mit Add to Home Screen und in iOS 16.4+

## 🚀 Performance

### Lighthouse Scores (Ziel)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

### Optimierungen
- Code-Splitting für schnellere Ladezeiten
- Lazy Loading für Bilder und Komponenten
- Asset-Komprimierung
- Service Worker Precaching
- IndexedDB für schnelle lokale Abfragen

## 🔒 Sicherheit

### Datenschutz
- Alle Daten werden verschlüsselt übertragen (HTTPS)
- Lokale Daten in IndexedDB sind browser-geschützt
- Keine Daten werden ohne Berechtigung an Dritte weitergegeben

### Berechtigungen
- Push-Benachrichtigungen: Nur mit expliziter Zustimmung
- Offline-Speicher: Automatisch, keine Berechtigung erforderlich
- Service Worker: Automatisch für PWA-Funktionalität

## 📊 Storage-Limits

### IndexedDB
- Chrome/Edge: ~60% des freien Speicherplatzes
- Firefox: ~50% des freien Speicherplatzes
- Safari: ~1GB (mit Möglichkeit auf mehr)

### Cache API
- Ähnliche Limits wie IndexedDB
- Automatisches Management durch Service Worker

## 🐛 Troubleshooting

### App lässt sich nicht installieren
1. Prüfen Sie, ob HTTPS aktiv ist
2. Stellen Sie sicher, dass manifest.json geladen wird
3. Überprüfen Sie die Browser-Konsole auf Fehler
4. Versuchen Sie einen Hard Reload (Ctrl+Shift+R)

### Offline-Modus funktioniert nicht
1. Prüfen Sie, ob Service Worker registriert ist (DevTools → Application)
2. Löschen Sie den Cache und laden Sie die Seite neu
3. Prüfen Sie Browser-Berechtigungen für Speicher

### Push-Benachrichtigungen kommen nicht an
1. Überprüfen Sie Browser-Berechtigungen
2. Stellen Sie sicher, dass die App nicht im Private/Inkognito-Modus läuft
3. Testen Sie mit der "Test senden" Funktion
4. Prüfen Sie System-Benachrichtigungseinstellungen

### Updates werden nicht angezeigt
1. Öffnen Sie `/clear-cache.html`
2. Oder: DevTools → Application → Clear Storage
3. Laden Sie die Seite neu

## 🔗 Nützliche Links

- [Service Worker Status](chrome://serviceworker-internals/)
- [Cache Storage](chrome://cache/)
- [Push Notifications Debug](chrome://push-internals/)

## 📝 Changelog

### Version 10.0.0 (Aktuell)
- ✅ 100% PWA-Compliance erreicht
- ✅ Vollständige Offline-Unterstützung mit IndexedDB
- ✅ Push-Benachrichtigungen implementiert
- ✅ Background Sync mit Queue-Management
- ✅ Offline-Indikator mit Sync-Status
- ✅ Automatische Updates mit Benutzer-Benachrichtigung
- ✅ Screenshots für App Stores hinzugefügt
- ✅ Performance-Optimierungen

### Version 9.0.0
- Cache-Optimierungen
- React Duplication Fix

### Version 7.5
- Basis-PWA-Funktionalität
- Service Worker Registration
- Manifest-Datei

## 💡 Best Practices für Entwickler

### Service Worker Updates
```javascript
// Nach Änderungen am Service Worker:
// 1. Cache-Version erhöhen
const CACHE_NAME = 'teuni-waescheportal-v11.0';

// 2. Service Worker manuell aktualisieren
navigator.serviceWorker.getRegistration().then(reg => reg.update());
```

### IndexedDB Debugging
```javascript
// Storage-Statistiken abrufen
import { getStorageStats } from '@/lib/offlineStorage';
const stats = await getStorageStats();
console.log(stats);
```

### PWA-Status prüfen
```javascript
import { isPWAInstalled, getPWADisplayMode } from '@/lib/pwaUtils';
console.log('Installed:', isPWAInstalled());
console.log('Display Mode:', getPWADisplayMode());
```

## 📧 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Troubleshooting-Sektion
2. Schauen Sie in die Browser-Konsole
3. Kontaktieren Sie den Support mit Screenshots und Fehlermeldungen

---

**Version:** 10.0.0  
**Letztes Update:** 2025  
**Status:** ✅ Production Ready

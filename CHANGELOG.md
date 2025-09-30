# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2025-09-30

### Hinzugefügt
- **100% PWA Funktionalität**
  - Vollständige Progressive Web App Implementierung
  - Installation auf mobilen Geräten und Desktop möglich
  - Standalone Display-Modus
  
- **Service Worker mit intelligenten Caching-Strategien**
  - Cache-First Strategie für statische Assets (HTML, CSS, JS, Icons)
  - Network-First Strategie für API-Anfragen mit Fallback auf Cache
  - Runtime-Caching für dynamisch geladene Ressourcen
  - Automatische Cache-Verwaltung und Cleanup alter Caches
  
- **Offline Support**
  - App funktioniert ohne Internetverbindung
  - Dedizierte Offline-Seite für nicht gecachte Inhalte
  - Offline-Fallback für API-Anfragen
  
- **Automatischer Update-Mechanismus**
  - Erkennung neuer Versionen im Hintergrund
  - Stündliche Überprüfung auf Updates
  - Benutzerfreundliche Update-Benachrichtigung mit Toast
  - Ein-Klick-Update mit automatischem Reload
  
- **Versionsnummer im UI**
  - Anzeige der aktuellen App-Version im Header
  - Zentrale Versionsverwaltung über `src/lib/version.ts`
  
- **PWA Manifest**
  - Vollständige Konfiguration mit App-Name, Icons, Theme
  - Screenshots für Wide- und Narrow-Format
  - Deutsche Lokalisierung
  - Optimiert für Business und Utilities Kategorie

- **Push-Benachrichtigungen und Background-Sync**
  - Event-Listener für Push-Benachrichtigungen vorbereitet
  - Background-Sync für zukünftige Offline-Synchronisation

### Technische Details
- **Frameworks**: React 18, Vite, TypeScript
- **UI**: shadcn-ui, Tailwind CSS
- **State Management**: React Hooks, TanStack Query
- **Backend**: Supabase Integration vorbereitet
- **PWA**: Service Worker API, Cache API, Web App Manifest

### Bekannte Einschränkungen
- Service Worker funktioniert nur über HTTPS oder localhost
- Cache-Größe ist browser-abhängig begrenzt
- Push-Benachrichtigungen erfordern Nutzer-Berechtigung

---

## Versionierungsschema

- **MAJOR** (1.x.x): Inkompatible API-Änderungen
- **MINOR** (x.1.x): Neue Funktionen, abwärtskompatibel
- **PATCH** (x.x.1): Bugfixes, abwärtskompatibel

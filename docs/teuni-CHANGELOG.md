# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.1.0] - 2026-07-15

### Geändert — Kalender neu aufgebaut (Woche + Monat)

Der Kalender (`src/components/CalendarView.tsx`) wurde vereinfacht und auf die
eigentliche Aufgabe von Teuni ausgerichtet: sehen, **wann und wo Wäsche zu
liefern ist** über die Woche und den Monat.

- **Drei Ansichten auf zwei reduziert**: Liste, Monat und Gantt ersetzt durch
  **Woche** (Standard) und **Monat**. Gantt entfernt — war Ursache falsch
  platzierter Monatstermine und zeigte Belegung statt Aufgaben.
- **Rollen getrennt**: **Wäsche** ist die Aufgabe (groß, antippbar),
  **Reinigung** nur als kleine graue Info-Zeile.
- **Wochenansicht**: Mo–So mit Lieferungen pro Tag (Haus + Uhrzeit), freie Tage
  gedimmt, plus Vorschau auf die nächsten 4 Wochen.
- **Antippen zeigt Details** (Sheet von unten, nur Ansicht): Haus, Datum,
  Uhrzeit, Status — sowie **Gastname und Anzahl Gäste** (entscheidend für die
  Wäschemenge). Verknüpfung über `linen_orders.booking_id`
  (FK `linen_orders_booking_id_fkey`). Fehlt die Buchung, wird „—" angezeigt und
  die Lieferung bleibt sichtbar.

### Behoben — Doppelte Wäscheeinträge

Stornierte `linen_orders` (und `service_tasks`) wurden **nicht** ausgefiltert,
sodass ein storniert-/aktiv-Paar doppelt erschien. Neuer gemeinsamer Filter
`CANCELLED_STATUSES = {cancelled, storniert, abgebrochen}`
(deutsch + englisch, case-insensitive). Keine DB-Migration — die stornierte
Zeile soll existieren, sie darf nur nicht angezeigt werden.

### Übersetzungen
- Neue Keys in `public/locales/{de,en,nl}/calendar.json`:
  `sidebar.upcomingWeeks`, `detail.guestCount`.

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

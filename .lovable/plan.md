## Konzept: Teuni-Portal Gesamt-Layout (Amela-Stil)

### Ausgangslage (was heute existiert)
- **Shell**: `src/pages/Index.tsx` rendert `Header` + horizontale `TabNavigation` (5 Tabs als Emoji-Buttons) + `main` mit Switch-Case auf `activeTab`. Kein Routing pro Bereich, kein Dashboard, keine Bottom-Nav, keine Sidebar.
- **Tabs**: `waesche`, `kalender`, `rechnungen`, `waeschekraefte`, `benachrichtigungen`.
- **Chat**: `PortalChat` als Overlay, geöffnet via `ChatButton` im Header (kein FAB).
- **Footer**: `Footer.tsx` hat bereits den exakten Copyright-Text (per Memory geschützt).
- **i18n**: `react-i18next` mit Namespaces (`navigation`, `bookings`, `calendar`, `orders`, `notifications`, `common`).
- **Kalender**: `CalendarView.tsx` — Default ist Monat, Toggle Monat/Woche/Gantt; Chevrons `h-8 px-2`; Tages-Detail nur in Sidebar.
- **Listen**: `SearchAndFilter` + `BookingCard` / `StandaloneOrderCard`.

### Zielbild (Amela-analog, Teuni-spezifisch)

```text
Mobile (<768px)                Desktop (≥1024px)
┌──────────────────────┐       ┌────┬───────────────────────┐
│ TopBar Logo/Title/⋯ │       │Side│ TopBar (Title + Chat) │
├──────────────────────┤       │bar ├───────────────────────┤
│                      │       │    │                       │
│   Content (scroll)   │       │Nav │   Content             │
│                      │       │    │                       │
│   [FAB Chat 💬]      │       │    │   [FAB Chat 💬]       │
├──────────────────────┤       │    │                       │
│ 🏠 📅 🧺 💬 ⚙️  Tabs │       │    │                       │
└──────────────────────┘       └────┴───────────────────────┘
│       Footer         │       │       Footer              │
```

### 1. App-Shell & Navigation
- Neuer `AppShell`-Wrapper in `src/components/layout/AppShell.tsx`. Ersetzt die direkte Struktur in `Index.tsx`.
- **Routing**: Migration von Tab-State zu echten Routen via bereits installiertem `react-router-dom`:
  - `/` → Dashboard (neu)
  - `/calendar` → CalendarView
  - `/orders` → Wäschebestellungen-Liste (heutiger `waesche`-Tab)
  - `/messages` → Chat-Vollansicht (zusätzlich zum FAB)
  - `/settings` → Settings/Profil (kombiniert Benachrichtigungen, View-Settings, Wäschekräfte, Rechnungen als Sub-Seiten/Tabs)
- **Mobile Bottom-Nav** (`src/components/layout/BottomNav.tsx`):
  - 5 Tabs: Dashboard 🏠 · Kalender 📅 · Bestellungen 🧺 · Nachrichten 💬 (mit Unread-Badge) · Einstellungen ⚙️
  - Höhe 64 px, `min-h-[44px]` Targets, `pb-[env(safe-area-inset-bottom)]`, `fixed bottom-0 inset-x-0 z-40`
  - Aktiver Tab: Primary-Token + dünner Top-Bar-Indikator
- **Desktop Sidebar** (`src/components/layout/AppSidebar.tsx`) via shadcn `Sidebar` (`collapsible="icon"`): identische Items, `NavLink active`-State, kollabierbar.
- **Top-Bar** (`src/components/layout/TopBar.tsx`): kompakt, Logo links, dynamischer Title mittig, rechts `LanguageSwitcher` + `ChatButton` mit Unread-Badge + Settings-Icon (nur Mobile).
- Bestehende horizontale `TabNavigation` wird entfernt.

### 2. Dashboard (`src/pages/Dashboard.tsx`, neu)
- Begrüßung: „Guten Morgen/Tag/Abend, {name}" + Datum (Locale-aware via `dateLocale`).
- **Status-Kacheln** (Grid `grid-cols-2 md:grid-cols-4 gap-3`):
  - Offen · In Bearbeitung · Heute zu liefern · Eingecheckte Gäste
  - Werte aus bestehendem `useBookings` (clientseitige Aggregation über `bookings` + `standaloneOrders` + Status-Felder).
- **Warn-Banner** „Eingecheckte Gäste" oberhalb der Kacheln, nur wenn `>0` — Token `bg-warning/10 border-warning`.
- **Nächste Bestellungen**: Top 5 nach `delivery_date`, Card-Liste, „Alle anzeigen" → `/orders`.
- Klick auf eine Kachel → gefilterte Liste (`/orders?status=...`).

### 3. Kalender-Polish (`CalendarView.tsx`)
- **Default-View** auf `gantt` umstellen (statt `month`).
- **Chevrons**: `h-11 w-11 rounded-full border shadow-sm active:scale-95`, Desktop `md:h-10 md:w-10`.
- **Tages-Detail Mobile**: zentrierter `Dialog` aus `@/components/ui/dialog` mit
  ```
  w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)]
  max-h-[80vh] overflow-y-auto rounded-3xl p-5 border-0 shadow-2xl
  ```
  Header `text-left` mit Wochentag + Datum (DialogTitle), `DialogClose` 44×44 px oben rechts, Event-Cards mit Hausfarbe-Balken/Icon/Status-Punkt, Footer-Button `w-full`.
- Desktop-Sidebar mit Tagesliste bleibt unverändert.
- Stornierte Bestellungen bleiben gefiltert (bestehend).

### 4. Wäschebestellungen-Liste (`/orders`)
- Übernimmt heutigen `waesche`-Tab-Content.
- **Filter-Leiste** (`SearchAndFilter` erweitern): Status · Haus · Zeitraum · Mitarbeiter (ohne Emojis vor Namen), Such-Input mit `Search`-Icon.
- **Liste**: Mobile Cards (`BookingCard` / `StandaloneOrderCard`), Desktop `Table` (neue Tabellen-Variante in einem `<div className="hidden lg:block">` Container).
- Singular „Wäschebestellung" in i18n-Strings prüfen/anpassen (Namespace `orders`).
- Tap → `/orders/:id` Detail.

### 5. Detail-Ansicht (`/orders/:id`, neu)
- Vollflächige Page (kein Sheet) mit:
  - Header: Status-Badge + Aktions-Buttons („In Bearbeitung", „Geliefert")
  - Sektionen: Objekt-Info · Gast-Info (wenn checked-in) · Bestelldetails · Lieferadresse · Notizen
  - Audit-Trail (Collapsible) aus `status_changed_by/at` (bestehende Memory).
- Workflow-Buttons triggern bestehende Update-Logik (kein Backend-Change).

### 6. Chat-FAB
- Neues `<ChatFab>` Komponente: `fixed bottom-20 right-4 md:bottom-6` (über Bottom-Nav), 56 px rund, `shadow-xl`, Unread-Badge.
- Öffnet bestehendes `PortalChat` (Mobile `100dvh`, Desktop Floating Window — bereits per Memory geregelt).
- `ChatButton` im Header bleibt für Desktop optional.

### 7. Design-System Ergänzungen (`src/index.css` + `tailwind.config.ts`)
- Neue HSL-Tokens:
  - `--status-open`, `--status-in-progress`, `--status-delivered`, `--status-cancelled`
  - `--house-1` … `--house-n` (bereits in `useBookings`/`getHouseColor` vorhanden — Tokens formalisieren)
- `Badge`-Variante `status` mit Variant-Map auf die Tokens.
- Keine hartkodierten Farben in Components — bestehende Verstöße (z. B. `bg-orange-500`, `bg-red-500`, `bg-purple-500` in `CalendarView`/`Index.tsx`) in dieser Iteration durch Tokens ersetzen.

### 8. Daten & Backend
- Keine Schema-Änderung, keine neue Query.
- Bestehende FK-Hint-Joins beibehalten (Memory).
- Filter „nicht-storniert" + „touristisch" bleiben aktiv.

### 9. Notifications
- Bottom-Nav-Icon „Nachrichten" + ChatFab bekommen Unread-Badge via `usePortalMessages().unreadCount`.
- Neue-Bestellung-Toast bleibt; zusätzlich Badge auf Dashboard-Kachel „Offen".
- Sound-Toggle in `/settings` (bestehende `NotificationSettings` einbinden).

### 10. Out of scope
- Backend, Auth, Wäsche-Workflow-Logik, Schema.
- Nur Frontend/Presentation.

---

### Umsetzungs-Reihenfolge (Phasen)
1. **Shell**: `AppShell` + Routing + `TopBar` + `BottomNav` + `AppSidebar` (ohne Inhaltsänderung der Bereiche).
2. **Dashboard**: neue Seite + Aggregations-Hook.
3. **Kalender-Polish**: Chevrons + Mobile-Dialog + Default `gantt`.
4. **Orders-Detail-Route** + Workflow-Buttons aus bestehenden Aktionen.
5. **Tokens** (`--status-*`, `--house-*`) + Cleanup hartkodierter Farben.
6. **ChatFab** + Unread-Badges.

### Technische Hinweise
- Routing via `react-router-dom` (bereits in `App.tsx`).
- `useIsMobile` Hook bereits vorhanden — Breakpoint 768 px.
- Footer + Copyright-String unverändert (Core-Memory).
- Light-Theme strikt (Core-Memory).
- iOS-Inputs `text-base` (Core-Memory).
- Default-Status neuer Bestellungen aus bestehender Linen-Order-Status-Memory.

### Offene Klärung
- Soll der heutige **Rechnungen**-Tab als eigener Bottom-Nav-Eintrag bleiben oder unter `/settings` als Unterseite verschoben werden? (Vorschlag: unter `/settings`, da im Amela-Schema nicht erwähnt — bitte bestätigen.)
- **Authenticated User-Name** für Dashboard-Begrüßung: gibt es ein Profil/Session-Objekt, oder soll generisch „Hallo!" stehen? (Aktuell kein Auth-Flow erkennbar.)

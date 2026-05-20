# Plan: 13 Fixes für fresh-spin-portal

Alle Änderungen sind rein technisch (Stabilität, Hooks, Realtime, UX). Keine Schema-, Auth- oder Designänderungen.

## Kritische Bugs

**1. .gitignore erweitern** — `.env`, `.env.local`, `.env.production` hinzufügen.
Hinweis: Die bereits committete `.env` enthält nur die öffentliche `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key) — kein Sicherheitsrisiko, aber wir verhindern künftige Commits.

**2. `useBookings.ts` — Doppel-Subscription auf `linen_orders`**
Aktuell zwei `.on(...)` auf derselben Tabelle (einmal `*`, einmal `INSERT`). Zusammenführen zu einem `*`-Handler, der bei `payload.eventType === 'INSERT'` zusätzlich `onNewOrderRef.current(payload.new)` aufruft.

**3. `useBookings.ts` — `navigator.onLine` im `useState`-Initializer**
Initial-State auf `true` setzen, dann `useEffect` mit `setIsOnline(navigator.onLine)`.

**4. `Index.tsx` — `handleNewOrder` mit `useCallback`**
`useCallback` zu Imports hinzufügen, `handleNewOrder` mit leerer Dep-Liste umschließen (interner Zustand wird über setState gesetzt, Supabase-Client ist stabil).

**5. `CalendarView.tsx` — `view` in useEffect-Deps**
`useEffect(() => { fetchCalendarData(); }, [currentDate, i18n.language, view]);`

**6. `LinenOrderSection.tsx` — `status_changed_by: 'Teuni'` → `'portal'`**

**7. `useViewSettings.ts` — `loadSettings` mit `useCallback`**
`useCallback` importieren, Funktion mit leerer Dep-Liste umschließen, in Realtime-useEffect-Deps aufnehmen.

**8. `CalendarView.tsx` — Gantt Bar Margin Fix**
- In `getGanttGridPosition`: `startsBeforeRange`/`endsAfterRange` aus Return entfernen.
- Beim Booking-Bar-Element: nur `gridColumn` + `gridRow: 1` setzen, `marginLeft`/`marginRight`/`width`-Inline-Styles entfernen, entsprechende Klassen-Konditionen in `cn()` entfernen.

## Improvements

**9. `App.tsx` — QueryClient-Defaults**
`staleTime: 30s`, `gcTime: 5min`, `retry: 2`, exponentielles `retryDelay`, `refetchOnWindowFocus: false`.

**10. `App.tsx` — `TooltipProvider`-Wrapper**
Import aus `@/components/ui/tooltip`, um `BrowserRouter` legen.

**11. `Index.tsx` — `pb-4` Konflikt**
`pb-4` aus `<main>`-className entfernen.

**12. `Index.tsx` — Loading-Skeleton**
Loading-Text durch 3 Skeleton-Karten ersetzen (`<Skeleton>` aus `@/components/ui/skeleton`), Spacing/Padding wie bestehende Booking-Karten.

**13. `CalendarView.tsx` — Mobile-Default `gantt`**
View-Init-Funktion: bei `window.innerWidth < 768` immer `gantt`, sonst gespeicherten Wert (oder `gantt`).

## Verifikation

- `useBookings`: in DevTools Realtime-Channel prüfen → nur eine Subscription pro Tabelle, `onNewOrder` wird genau einmal pro INSERT aufgerufen.
- Index: keine Re-Subscription-Loop in der Console.
- CalendarView: Wechsel Monat→Woche lädt neuen Range, Gantt-Bars sind korrekt ausgerichtet, Mobile startet in Gantt.
- Build/TS-Check ist grün.

## Reihenfolge

1–8 (Bugs) → 9–13 (Improvements) → Build-Check.

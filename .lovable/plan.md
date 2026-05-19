## Ziel

Die Tab-Navigation (Buchungen 🧺, Kalender 📅, Rechnungen 🧾, Personal 👥, Benachrichtigungen 🔔) soll auf Mobile als feste Leiste am unteren Bildschirmrand erscheinen — analog zum Referenzbild (Bottom-Navigation mit Icon + Label). Auf Desktop bleibt sie wie bisher oben.

## Änderungen

**`src/components/TabNavigation.tsx`**
- Mobile-Variante umbauen: Icon + Label übereinander (statt nur Icon), aktiver Tab in `text-primary` mit Bold-Label.
- Mobile-Container wird `fixed bottom-0 left-0 right-0 z-40` mit `border-t`, `bg-background/95 backdrop-blur` und `pb-[env(safe-area-inset-bottom)]` für iOS Safe-Area.
- Desktop-Variante bleibt unverändert (oben, inline).

**`src/pages/Index.tsx`**
- `<TabNavigation>` bleibt im JSX, aber Mobile rendert es als Portal-artige Fixed-Bar — d.h. die Komponente positioniert sich selbst.
- `<main>` bekommt zusätzlich `pb-20` (oder `pb-24`) auf Mobile, damit Inhalt nicht hinter der Bottom-Bar verschwindet.
- `<Footer>` wird auf Mobile vor der Bottom-Bar ausgeblendet oder mit `mb-20` versehen, sodass der Copyright-Text nicht verdeckt wird.

**Optional (wenn gewünscht):** Header auf Mobile schlanker machen, da Navigation nicht mehr direkt darunter sitzt.

## Technische Details

```text
Mobile:
┌─────────────────┐
│   Header        │
├─────────────────┤
│                 │
│   Inhalt        │  ← pb-20
│                 │
├─────────────────┤
│ Footer          │
├═════════════════┤  ← fixed bottom
│ 🧺 📅 🧾 👥 🔔 │
└─────────────────┘

Desktop: unverändert (Tabs oben unter Header)
```

- Breakpoint: `md:` (≥768px) für Desktop-Variante, `<md` für Bottom-Bar.
- Z-Index 40 (unter Dialogs/Toasts, über Content).
- `safe-area-inset-bottom` für Notch-/Home-Indicator-Geräte.

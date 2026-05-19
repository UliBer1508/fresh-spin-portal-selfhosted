## Plan: Klickbare Quick-Filter-Karten + neues BookingCard-Layout

### Ziel
1. Über der Buchungsliste (Tab "Wäsche") eine 2×2-Grid von klickbaren Karten anzeigen: pro Haus eine Karte + "Diese Woche" / "Nächste Woche". Klick = Filter setzen, erneutes Klicken = Filter aus.
2. Die `BookingCard` optisch an den hochgeladenen Screenshot angleichen — gleiche Inhalte wie heute, nur neues Layout.

---

### 1. Quick-Filter-Karten (neu)

Neue Komponente `src/components/QuickFilterCards.tsx`, eingebunden in `src/pages/Index.tsx` direkt unter `SearchAndFilter` (Tab "waesche").

Layout: `grid grid-cols-2 gap-3` (mobile-first), Karten mit:
- helles Hellblau (`bg-sky-50`), abgerundet (`rounded-2xl`), dünner Border, `min-h-[64px]`, ≥44px Touch.
- Icon links (Home für Häuser, Calendar für Zeit), bold Label rechts.
- Aktiver Zustand: kräftigerer Border + Ring in primary.

Karten:
- **Pro Haus** (dynamisch aus `bookings`/`standaloneOrders` ableiten, alphabetisch, deduped) → setzt House-Filter.
- **Diese Woche** → check_in/delivery_date in [Mo..So aktuelle Woche].
- **Nächste Woche** → analog folgende Woche.

State: `quickFilter: { type: 'house'|'thisWeek'|'nextWeek'|null, value?: string }` in `Index.tsx`. Wird in `SearchAndFilter` mitgegeben (neue Prop) und dort in die bestehende Filterlogik kombiniert (AND mit Suchtext). Toggle: erneutes Klicken auf aktive Karte → reset.

Mehrsprachig via i18n-Keys (`common.json`: `quickFilter.thisWeek`, `quickFilter.nextWeek`).

---

### 2. Neues BookingCard-Layout

Datei: `src/components/BookingCard.tsx` (komplettes Re-Layout, Logik bleibt).

Struktur entsprechend Screenshot:
```
┌─ farbiger Balken links (bestehende Hash-Farbe) ───────────────┐
│ [🏠 dunkelblaues Icon-Tile]  Wald Chalet                       │
│                              Buchung                           │
│                                                                │
│ 📍 Trattenbach 299/17, 5741 Neukirchen am GV                   │
│ 👤 Helena Kunz  ·  👥 3                                         │
│                                                                │
│ ┌──────────────────┐  ┌──────────────────┐                     │
│ │ 📅 CHECK-IN      │  │ 📅 CHECK-OUT     │                     │
│ │ 30.05.2026       │  │ 06.06.2026       │                     │
│ └──────────────────┘  └──────────────────┘                     │
│                                                                │
│ 🧹 Reinigungsauftrag: …  (falls vorhanden)                      │
│ <LinenOrderSection …/>                                          │
└────────────────────────────────────────────────────────────────┘
```

Details:
- Card-Hintergrund bleibt `bg-yellow-50` mit `border-l-8 <hash-color>`.
- Haus-Icon-Tile: `w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center` mit `Home`-Icon (lucide).
- Untertitel "Buchung" als `text-sm text-muted-foreground` (übersetzt via `bookings:labels.booking`).
- Adresse mit `MapPin`-Icon, Gast/Anzahl in einer Zeile mit Mitteldot.
- Check-in/Check-out als zwei gleich breite Sub-Cards: `rounded-xl border bg-background p-3`, Label uppercase `text-xs tracking-wide text-muted-foreground`, Datum `text-lg font-semibold`. Icons farbig (`text-emerald-600` / `text-rose-500`).
- Mobile: Check-in/out bleiben nebeneinander (`grid grid-cols-2 gap-3`), bei sehr schmal evtl. `gap-2`.
- Memory-Regeln eingehalten: keine Labels "Unterkunft:"/"Provider:", Singular "Reinigungsauftrag", iOS-Inputs nicht betroffen.
- `ViewSettings`-Flags (showAccommodationName/Address/GuestName/GuestCount/CheckIn/CheckOut/BookingStatus/LinenOrders) werden weiter respektiert — Felder nur rendern, wenn aktiv.
- `Status`-Badge bleibt rechts oben im Header neben dem Haus-Block (wenn `showBookingStatus`).

### Out of Scope
- Keine Änderung an `StandaloneOrderCard`, `LinenOrderSection`, Datenmodell oder Filter-Backend.
- Keine neuen Dependencies.

### Geänderte/Neue Dateien
- neu: `src/components/QuickFilterCards.tsx`
- edit: `src/pages/Index.tsx` (State + Einbindung)
- edit: `src/components/SearchAndFilter.tsx` (neue Prop `quickFilter`, in Filterlogik integrieren)
- edit: `src/components/BookingCard.tsx` (Re-Layout)
- edit: `public/locales/{de,en,nl}/common.json` und ggf. `bookings.json` (neue Keys)

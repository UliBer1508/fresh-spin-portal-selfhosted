## Plan: Buchung und Wäschebestellung als getrennte Karten

### Ziel
Statt einer kombinierten Karte sollen Buchung und Wäschebestellungen visuell getrennt sein — wie im Screenshot:
1. **Buchungskarte** (gelb, mit Icon-Tile, Adresse, Gast, Check-in/Check-out).
2. Darunter ein **Counter-Header** „N Wäschebestellungen zu dieser Buchung".
3. Jede Wäschebestellung als **eigene Karte** (heller Hintergrund, eigener farbiger Linksbalken, Header mit Sparkles-Icon + Titel + Status-Badge).

Damit ersetzt die Wäschebestellungskarte die bisherige eingebettete `LinenOrderSection`. Funktional bleibt alles (Status ändern, Personal zuweisen, Lieferdatum/Notizen, Drucken, Artikel-Tabelle) — nur die Verpackung wird getrennt.

---

### 1. BookingCard schlanker

Datei: `src/components/BookingCard.tsx`
- Entferne den `LinenOrderSection`-Block aus der Karte.
- Behalte alles andere (Header, Adresse, Gast, Check-in/Out, Reinigungs-Termin).
- Die Karte rendert nur noch die Buchungsdaten (so wie im oberen Teil des Screenshots).

### 2. Neue Komponente `BookingWithOrdersGroup`

Datei: `src/components/BookingWithOrdersGroup.tsx`

Props: `{ booking, orders: LinenOrder[], viewSettings, onUpdate }`.

Rendert:
```
<BookingCard booking … />
{orders.length > 0 && (
  <div header>✨ N Wäschebestellung(en) zu dieser Buchung</div>
  {orders.map(o => <LinenOrderCard order={o} … />)}
)}
```
- Counter-Header: `flex items-center gap-2 text-sm text-muted-foreground` mit `Sparkles` Icon, übersetzt via i18n (`orders:labels.linenOrdersForBooking` mit `{{count}}`).
- Spacing: `space-y-3` zwischen Buchung, Header, einzelnen Wäschebestellungskarten.

### 3. Neue Komponente `LinenOrderCard`

Datei: `src/components/LinenOrderCard.tsx`

Inhalt = bisheriger Inhalt einer Order aus `LinenOrderSection` (Lieferdatum, Status-Dropdown, Personal, Notizen, Drucken, Artikel-Tabelle, Dialoge), aber:
- Als eigene `<Card>` mit `border-l-8` in derselben Hash-Farbe wie die Buchungskarte (`getColorByHash(BOOKING_COLORS, booking.id)`), damit Zusammengehörigkeit visuell klar bleibt.
- Header der Karte: `Sparkles` Icon-Tile in `bg-sky-100`, Titel „Wäschebestellung" + Untertitel (Lieferdatum + Status-Kurztext), Status-Badge rechts.
- Body bleibt funktional identisch zur jetzigen `LinenOrderSection`-Logik (gleiche Handler, gleiche Dialoge, gleiche `viewSettings`-Flags).
- Wichtig: `ViewSettings` Flags (showDelivery*, showOrderStatus, showAssignedStaff, showOrderNotes, showOrderItems) bleiben respektiert.

`LinenOrderSection` selbst bleibt vorerst bestehen (Verwendung an anderen Stellen?), wird aber von `BookingCard` nicht mehr aufgerufen.

### 4. Listenrendering in `Index.tsx`

Aktuell: `filteredBookings` enthält bereits pro Linen-Order ein Eintrag (siehe `SearchAndFilter.bookingsWithIndividualOrders`). Für die neue Gruppierung müssen wir **vor dem Rendern** wieder nach `booking.id` gruppieren, sodass eine Buchung mit ihren *gefilterten* Orders als eine Gruppe erscheint.

Lösung in `Index.tsx` (oder kleinen Helper):
```ts
const grouped = useMemo(() => {
  const map = new Map<string, { booking: Booking; orders: LinenOrder[] }>();
  for (const b of filteredBookings) {
    const existing = map.get(b.id);
    const order = b.linen_orders?.[0];
    if (existing) {
      if (order) existing.orders.push(order);
    } else {
      map.set(b.id, { booking: b, orders: order ? [order] : [] });
    }
  }
  return Array.from(map.values());
}, [filteredBookings]);
```
Dann:
```tsx
{grouped.map(g => (
  <BookingWithOrdersGroup key={g.booking.id} booking={g.booking} orders={g.orders} … />
))}
```

### 5. i18n-Keys

`public/locales/{de,en,nl}/orders.json` → `labels.linenOrdersForBooking`:
- de: „{{count}} Wäschebestellung zu dieser Buchung" / Plural „{{count}} Wäschebestellungen zu dieser Buchung"
- en: „{{count}} linen order for this booking" / „{{count}} linen orders …"
- nl: „{{count}} wasbestelling voor deze boeking" / „{{count}} wasbestellingen …"

### Out of Scope
- `StandaloneOrderCard` bleibt unverändert.
- `LinenOrderSection` wird nicht gelöscht (könnte anderswo verwendet werden); nur Aufruf in `BookingCard` entfällt.
- Keine Backend-/Datenmodell-Änderungen.
- Keine neuen Dependencies.

### Geänderte/Neue Dateien
- edit: `src/components/BookingCard.tsx` (LinenOrderSection-Aufruf entfernen)
- neu: `src/components/LinenOrderCard.tsx`
- neu: `src/components/BookingWithOrdersGroup.tsx`
- edit: `src/pages/Index.tsx` (Gruppierung + neue Komponente verwenden)
- edit: `public/locales/{de,en,nl}/orders.json` (neuer Key)

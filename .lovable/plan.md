
# Konzept: Pflicht-Benachrichtigung bei Buchungsänderungen

## Problem
Teuni hat nicht gesehen, dass sich die Gästeanzahl der Buchung "Dot Shaw" geändert hat. Wir brauchen einen Mechanismus, der:
1. Teuni aktiv informiert, sobald sich relevante Buchungsdaten ändern.
2. **Bestätigung erzwingt** ("wegdrücken"), damit Admin nachvollziehen kann, dass die Nachricht gesehen wurde.

## Lösung (Übersicht)
Wir erweitern das bestehende `OrderNotificationDialog`/`useDeliveryReminders`-Muster um einen zweiten Kanal: **Booking-Change-Notifications**. Eine DB-Tabelle protokolliert Änderungen, ein DB-Trigger erzeugt automatisch Einträge, und ein Pflicht-Dialog im Frontend zwingt Teuni zur Bestätigung. Der Bestätigungs-Zeitpunkt + Bestätiger-Name wird gespeichert, sodass Admin (Uli) jederzeit sieht, ob/wann Teuni die Änderung gesehen hat.

## Ablauf

```text
Admin/iCal ändert number_of_guests
        ↓
DB-Trigger auf bookings (nur wenn aktiver linen_order existiert)
        ↓
INSERT in booking_change_notifications
        ↓
Realtime → Teunis App
        ↓
Pflicht-Dialog (nur "Verstanden" Button, kein X, kein Outside-Click)
        ↓
UPDATE acknowledged_at + acknowledged_by = "Teuni"
        ↓
Admin sieht Status in Buchungskarte / Übersicht
```

## Umfang

### 1. Neue Tabelle `booking_change_notifications`
Spalten:
- `id uuid pk`
- `booking_id uuid → bookings(id) on delete cascade`
- `change_type text` (Start mit `'guest_count'`, später erweiterbar: `'check_in'`, `'check_out'`, `'house'`)
- `old_value text`, `new_value text`
- `created_at timestamptz default now()`
- `acknowledged_at timestamptz null`
- `acknowledged_by text null` (über `getStatusChangerName`)

GRANTs + RLS analog zu bestehenden Tabellen (lesen/updaten für `authenticated`).

### 2. DB-Trigger `notify_booking_guest_count_change`
- AFTER UPDATE OF `number_of_guests` ON `bookings`
- Bedingung: `OLD.number_of_guests IS DISTINCT FROM NEW.number_of_guests` **und** es existiert mind. ein `linen_orders`-Eintrag für diese Buchung mit Status in `('offen','ausstehend','pending','bestaetigt')`.
- Fügt Zeile in `booking_change_notifications` ein.
- Realtime publication für die Tabelle aktivieren.

### 3. Frontend — neuer Hook `useBookingChangeNotifications`
- Lädt alle Zeilen mit `acknowledged_at IS NULL`, inkl. Booking + Haus-Name + aktuelle/alte Gästeanzahl.
- Realtime-Subscription (postgres_changes INSERT).
- Liefert `currentNotification`, `acknowledge()` → UPDATE mit `acknowledged_at = now()`, `acknowledged_by = getStatusChangerName(user.email)`.

### 4. Frontend — `BookingChangeDialog` (neu)
Basierend auf `OrderNotificationDialog`, aber:
- **Nicht schließbar** außer per Button: `onOpenChange` blockiert Schließen, kein `X`, `onPointerDownOutside`/`onEscapeKeyDown` `preventDefault`.
- Inhalt: Haus, Gast, "Anzahl Gäste geändert: **3 → 5**", Check-in/Check-out.
- Großer Button: "✓ Verstanden – Bestätigen".
- Nach Klick: `acknowledge()` → nächste Notification aus Queue.

### 5. Einbindung in `Index.tsx`
Analog zu `useDeliveryReminders`: Hook aufrufen, Dialog rendern, läuft parallel zu bestehenden Reminder-Popups.

### 6. Admin-Sichtbarkeit
In `BookingCard` bzw. `BookingWithOrdersGroup`: kleines Badge wenn eine offene (= nicht bestätigte) Änderung existiert → "⏳ Wartet auf Teunis Bestätigung". Bei bestätigten: "✓ Teuni bestätigt am dd.mm.yyyy hh:mm". Reine Anzeige, keine Logikänderung an Bestellungen.

### 7. Bestehende Fälle (z. B. Dot Shaw)
Beim Migration-Deploy: **kein** Auto-Insert für historische Änderungen — Trigger greift nur ab jetzt. Falls gewünscht, kann ein einmaliger Insert für die aktuelle Dot-Shaw-Buchung manuell folgen (separate Bestätigung).

## Technische Details (für Entwickler)

- Tabelle in Supabase publication `supabase_realtime` aufnehmen und `REPLICA IDENTITY FULL` setzen.
- Trigger als `SECURITY DEFINER` mit `SET search_path = public`.
- RLS-Policies:
  - `SELECT`: `authenticated` (alle eingeloggten dürfen lesen).
  - `UPDATE`: `authenticated`, nur die Felder `acknowledged_at`, `acknowledged_by`.
  - `INSERT`: nur via Trigger (kein direkter Client-Insert nötig).
- PWA-Version (`src/lib/version.ts`) hochzählen, damit Teunis Cache den neuen Dialog lädt.
- Memory-Eintrag `mem://features/booking-change-acknowledgment` mit Regeln (Pflicht-Dialog, `acknowledged_by` via `getStatusChangerName`).

## Erweiterbarkeit
`change_type` als Text macht es einfach, später Änderungen an `check_in`, `check_out`, `house_id` etc. mit demselben Mechanismus zu melden — nur Trigger erweitern.

## Nicht im Umfang
- E-Mail/Push-Versand (kann später ergänzt werden, wenn PWA-Notification gewünscht).
- Änderungs-Historie / Audit-Log über die reine Benachrichtigung hinaus.

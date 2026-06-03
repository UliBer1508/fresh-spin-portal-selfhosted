## Befund
- `notify_days_in_advance` (Default 3) wird in den Einstellungen gespeichert, aber **nirgendwo gelesen**.
- Das Popup `OrderNotificationDialog` erscheint aktuell **nur** bei Realtime-INSERT einer neuen Bestellung — nicht für bereits existierende, bald fällige Bestellungen.
- Ergebnis: Teuni wird nicht erinnert, wenn z. B. heute eine Lieferung in 3 Tagen ansteht.

## Lösung

### 1. Neuer Hook `src/hooks/useDeliveryReminders.ts`
Beim App-Start (und bei Sichtbarkeitswechsel `visibilitychange`):
1. Lade `notification_preferences` (`notifications_enabled`, `notify_days_in_advance`).
2. Falls deaktiviert → Abbruch.
3. Lade alle `linen_orders` mit:
   - `status IN ('offen','ausstehend','pending')`
   - `delivery_date` zwischen heute und heute + N Tage
   - Join auf `bookings` + `houses!linen_orders_house_id_fkey` (mit FK-Hint laut Memory-Regel)
4. Filtere clientseitig bereits in dieser Session bestätigte Reminder (sessionStorage-Key `dismissed-reminders`).
5. Expose: `{ currentReminder, dismissCurrent() }` — zeigt einen nach dem anderen.

### 2. Integration in `src/pages/Index.tsx`
- Hook aufrufen, zweiten `OrderNotificationDialog` rendern (zusätzlich zum bestehenden Realtime-Popup).
- `onOpenChange(false)` → `dismissCurrent()` → nächstes Popup oder Schluss.

### 3. Text im Popup
Der bestehende Popup-Text passt bereits perfekt:
> „Hallo Teuni, es steht eine Bestellung für „<Hausname>" für den <TT.MM.JJJJ> an. Vielen Dank"

### 4. Suppression-Verhalten
- **sessionStorage** (pro Browser-Session): bestätigte Reminder erscheinen nicht erneut bei Reload innerhalb derselben Session.
- Neuer Tag / neue Session → Popup erscheint wieder, solange Lieferung im Fenster liegt und Bestellung noch offen ist.

## Test-Hinweis
Heute (03.06.2026) ist die früheste offene Lieferung am 19.06. (16 Tage entfernt). Bei `notify_days_in_advance=3` würde aktuell **nichts** erscheinen.
Zum Live-Test entweder:
- Frist temporär in den Einstellungen auf z. B. 20 Tage hochsetzen, **oder**
- eine Test-`linen_order` mit `delivery_date = heute + 2 Tage` anlegen.

## Keine DB-Änderungen nötig
Alle Felder existieren (`notification_preferences.notify_days_in_advance`, `linen_orders.delivery_date`).

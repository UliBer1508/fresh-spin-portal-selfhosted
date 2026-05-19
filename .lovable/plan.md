## Ziel

Das 🔔-Icon in der Menüleiste soll nicht mehr zur ganzen Einstellungs-Seite führen, sondern ein kleines Popup öffnen mit:
- Schalter „Benachrichtigungen ein/aus"
- Auswahl „Tage im Voraus benachrichtigen" (z. B. 1–14)

Zusätzlich: Sobald eine neue Wäschebestellung eingeht (oder innerhalb der eingestellten Vorlaufzeit ansteht), öffnet sich automatisch ein zentriertes Popup, das die Wäschebestellung anzeigt.

## Änderungen

### 1. Datenbank (Migration)
- Spalten in `notification_preferences` ergänzen:
  - `notifications_enabled` (boolean, default `true`) — globaler Ein/Aus-Schalter
  - `notify_days_in_advance` (integer, default `3`) — Vorlaufzeit in Tagen

### 2. Neues Popup: Einstellungen (`NotificationSettingsDialog`)
- Klick auf 🔔 in `TabNavigation` (Desktop + Mobile) öffnet einen `Dialog` statt Tab-Wechsel
- Inhalt:
  - Ein Switch: „Benachrichtigungen aktiv"
  - Ein Slider/Select: „Tage im Voraus" (1–14)
  - Speichern-Button (schreibt in `notification_preferences`)
- Die bestehende `NotificationSettings`-Seite + Tab-Eintrag werden entfernt

### 3. Neues Popup: Bestellungs-Alarm (`OrderNotificationDialog`)
- Zentriertes `Dialog`-Fenster, das automatisch aufgeht, wenn:
  - eine neue Bestellung per Realtime eingeht (bisher: nur Toast), oder
  - beim Laden eine Bestellung gefunden wird, deren `delivery_date` innerhalb der eingestellten Vorlaufzeit liegt und noch nicht bestätigt wurde
- Zeigt die Wäschebestellung an (Haus, Lieferdatum, Gast, Artikelübersicht) — wiederverwendet die vorhandene `LinenOrderCard`-Darstellung oder eine schlanke Variante
- „OK / Bestätigen"-Button schließt das Popup
- Respektiert `notifications_enabled` (kommt das Popup nicht, wenn deaktiviert)

### 4. Integration
- `Index.tsx`: 
  - State `notifSettingsOpen`, `orderAlertOpen`, `alertOrder`
  - `onTabChange("benachrichtigungen")` → öffnet stattdessen `notifSettingsOpen`
  - `useBookings(onNewOrder)` Callback bekommt die neue Bestellung übergeben → öffnet `orderAlertOpen` mit der Bestellung
- `useBookings`: Callback erweitern, damit die neue Order an den Caller übergeben wird (statt nur `() => void`)

## Technische Hinweise

- Dialog-Komponenten aus `@/components/ui/dialog`
- Tages-Auswahl als `<Select>` mit Werten 1/2/3/5/7/14 oder als `<Slider>` (1–14)
- Vorhandene Realtime-Subscription in `useBookings.ts` bleibt; nur das Callback-Argument wird ergänzt
- Tab-Inhalt „Benachrichtigungen" wird aus dem Tab-Switch in `Index.tsx` entfernt (Default-Tab bleibt „waesche")

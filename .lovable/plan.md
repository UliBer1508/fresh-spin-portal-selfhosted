## Ziel
In der Buchungskarte (`BookingCard`) soll oben rechts ein "Eingescheckt"-Badge angezeigt werden, wenn der Gast aktuell eingecheckt ist (`check_in <= heute <= check_out`).

Wenn der Gast **nicht** eingecheckt ist, soll **kein** Status-Badge angezeigt werden (auch nicht der ursprüngliche Buchungsstatus wie "confirmed").

## Vorgehen
1. **`src/components/BookingCard.tsx`**
   - Berechne `isCheckedIn = booking.check_in <= today && booking.check_out >= today`.
   - Ersetze den bestehenden `booking.status` Badge: Zeige nur bei `isCheckedIn` einen grünen Badge mit Text "Eingescheckt" (übersetzt via i18n).
   - Wenn nicht eingecheckt: Kein Badge rendern.
   - Header-Container bleibt bestehen, rechte Seite wird bei nicht-Eingecheckt leer sein.

2. **Keine Änderungen** an Datenbank, ViewSettings, anderen Komponenten.
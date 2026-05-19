## Ziel
Wäschebestellungs-Bereich = eine einzige grüne Karte (wie die blaue Reinigungskarte im Beispiel). Kein Kasten im Kasten mehr.

## Änderungen

**1. `src/components/BookingCard.tsx` (Zeile 64)**
Äußere Buchungskarte bekommt grünen Hintergrund statt gelb:
- `bg-yellow-50` → `bg-accent`

**2. `src/components/LinenOrderSection.tsx` (Zeile 246)**
Innerer Wrapper verliert eigenen Hintergrund / Rahmen / Padding — wird ein flacher Block innerhalb der bereits grünen Karte:
- `bg-accent rounded-lg p-3 sm:p-4 mb-3` → `mb-3`

## Ergebnis
Eine durchgehend grüne Karte mit dem farbigen Rand links, analog zur Reinigungskarte. Innenstruktur (Lieferdatum, Status, Notizen, Artikel) bleibt unverändert.

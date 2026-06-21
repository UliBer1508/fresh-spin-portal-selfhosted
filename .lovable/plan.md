## Problem

Im Teuni Wäscheportal (Tab „Bestellungen") fehlen Buchungen von Gästen, die gerade eingecheckt sind. Im Amela Reinigungsportal werden sie korrekt angezeigt.

## Ursache

`src/hooks/useBookings.ts` lädt Buchungen mit `check_out >= heute`, filtert dann aber jede Buchung weg, deren `linen_orders` nicht den Status `offen / ausstehend / pending` haben. Bei einem bereits eingecheckten Gast ist die Wäschelieferung normalerweise schon abgeschlossen (Status `delivered` / `geliefert` / `completed`), daher wird die ganze Buchung entfernt.

## Geplante Änderung

In `src/hooks/useBookings.ts`:

- Aktive Bestellungen weiterhin laden (für laufende Aufgaben).
- Zusätzlich Buchungen behalten, bei denen der Gast **aktuell eingecheckt** ist (`check_in <= heute <= check_out`), selbst wenn die zugehörigen Linen-Orders bereits geliefert/abgeschlossen sind.
- Für diese Buchungen die linen_orders nicht wegfiltern, sondern als „erledigte Lieferung" durchreichen, damit die Karte (mit Check-in/Check-out und Reinigungstermin) sichtbar bleibt.

Keine UI-/Komponenten-Änderungen geplant; das BookingCard rendert bereits beide Zustände. Falls beim Test sichtbar wird, dass abgeschlossene Lieferungen optisch ausgegraut werden sollen, wird das als kleiner Folge-Schritt ergänzt.

## Nicht geändert

- Filterleiste (Diese Woche / Diesen Monat …) bleibt unverändert.
- Keine Datenbank-Migration nötig.

## Problem
Aktuell stecken zwei Karten ineinander:
- Außen: `LinenOrderCard` mit weißem `bg-card` + Padding + farbiger linker Rand
- Innen: in `LinenOrderSection` (Zeile 246) ein grünes `bg-accent rounded-lg p-3 sm:p-4` Kästchen

Ergebnis: grüne Karte schwebt mit weißem Rand innerhalb der äußeren weißen Karte → Karte-in-Karte.

## Ziel
Eine einzige Wäschebestell-Karte: außen grün, klar getrennt von der Buchungskarte darüber (die Trennung passiert ohnehin schon in `BookingWithOrdersGroup` durch `space-y-3` plus die "Wäschebestellungen zu dieser Buchung"-Überschrift).

## Änderungen

**1. `src/components/LinenOrderCard.tsx` (Zeile 18)**
Äußere Karte selbst grün machen:
```
<Card className={`w-full border-border bg-accent border-l-8 ${borderColor}`}>
```
(`bg-card` → `bg-accent`)

**2. `src/components/LinenOrderSection.tsx` (Zeile 246)**
Inneren grünen Wrapper wieder entfernen, da die Farbe jetzt von außen kommt:
```
<div key={order.id} className="mb-3">
```
(`bg-accent rounded-lg p-3 sm:p-4 mb-3` → `mb-3`)

## Ergebnis
- Buchungskarte: bisheriges Aussehen (z.B. gelblich)
- Darunter: Zähler-Überschrift "N Wäschebestellungen zu dieser Buchung"
- Darunter: eine flache grüne Wäschebestell-Karte ohne Karte-in-Karte-Optik

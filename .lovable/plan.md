## Ziel
Die Wäschebestellungs-Karte soll den gleichen grünen Hintergrund haben wie die Buttons darin (`bg-accent`), damit sie als grüne Karte erkennbar ist.

## Änderung

**`src/components/LinenOrderSection.tsx`** (Zeile 246)

Wrapper-Div der Wäschebestellung von:
```
<div key={order.id} className="mb-3">
```
zu:
```
<div key={order.id} className="bg-accent rounded-lg p-3 sm:p-4 mb-3">
```

Die Buchungskarte (außen) bleibt unverändert. Nur der Wäsche-Block wird wieder grün hinterlegt.

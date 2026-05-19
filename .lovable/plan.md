# "Wäschebestellung" Style & Icon ändern

Datei: `src/components/LinenOrderSection.tsx` (Zeile 255-258)

## Aktuell
```tsx
<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" strokeWidth={2} />
<span className="sm:text-sm text-foreground font-bold text-sm">{t('labels.deliveryBy')}:</span>
```

Der Text "Wäschebestellung:" kommt aus i18n (`labels.deliveryBy`) — bleibt unverändert.

## Änderungen
1. Icon `Calendar` → `WashingMachine` (Lucide). Import in der Datei ergänzen.
2. Klassen des Spans: `text-sm font-bold` (klein + fett, ohne `sm:text-sm`-Override).

Reine UI-Änderung, keine Logik betroffen.

## Änderung am OrderNotificationDialog

**Datei:** `src/components/OrderNotificationDialog.tsx`

### Aktuell
Der Dialog zeigt im Header nur:
```
🔔 Neue Wäschebestellung
```
und darunter eine kleine graue Zeile mit „Chalet · Gast: …".

### Neu
Direkt unter dem Titel wird ein deutlich sichtbarer Begrüßungstext eingefügt, der Teuni persönlich anspricht und die wichtigsten Infos hervorhebt:

```
Hallo Teuni, es gibt eine offene Bestellung 
für „Steinbock Chalet 3" für den 24.05.2026.
```

### Umsetzung

1. Aus `booking` den `houses.name` lesen → Chalet-Name.
2. Aus `order.delivery_date` lesen und mit `date-fns` (`format(..., 'dd.MM.yyyy', { locale: de })`) ins Format `TT.MM.JJJJ` bringen — `parseLocalDate` aus `lib/utils.ts` verwenden (Memory: Calendar TZ Handling), damit kein Timezone-Shift auftritt.
3. Den bestehenden grauen `text-muted-foreground`-Untertitel ersetzen durch einen Absatz in `text-base font-medium text-foreground`, der den Satz oben enthält. Chalet-Name und Datum als `<strong>` hervorheben.
4. Darunter bleibt die `LinenOrderCard` mit den Bestelldetails (Artikel, Farbe, Lieferzeit) unverändert.
5. „Bestätigen"-Button bleibt unverändert.

### Verifikation
Nach der Änderung öffne ich das Popup über einen simulierten neuen Order-Event und liefere einen Screenshot (390×736 mobile Viewport) zurück, damit du den fertigen Text siehst.

### Nicht im Scope
- Slider „Tage im Voraus benachrichtigen" verdrahten (separates Thema).
- Push-Notification-Text.
- Toast-Text („Neue Bestellung eingegangen!").

Sag Bescheid wenn auch Toast und Push den gleichen Text bekommen sollen.
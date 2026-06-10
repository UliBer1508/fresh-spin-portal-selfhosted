# CalendarView – Listenansicht, Priorisierung & Tokens

## 1. Neue View `list`

- View-Typ erweitern: `'month' | 'week' | 'gantt' | 'list'`.
- Mobile-Default: `list` statt `gantt` (Desktop-Default bleibt `gantt`, gespeicherter Wert aus localStorage hat Vorrang).
- View-Switcher um vierten Button "Liste" (Label `t('views.list')`); 4 Buttons gleichmäßig verteilt.
- Daten: Für `list` werden Events der nächsten ~60 Tage geladen (separater Fetch mit `startDate = heute`, `endDate = heute + 60 Tage`, nur `service_tasks` (cleaning) und `linen_orders` – keine Bookings nötig). `useEffect`-Dependency-Liste entsprechend anpassen, damit der Fetch auch bei View-Wechsel passend läuft.
- Rendering:
  - Filter: nur Events `type === 'linen' || type === 'cleaning'`, Datum `>= startOfDay(heute)`.
  - Gruppierung nach Tag (sortiert aufsteigend), leere Tage überspringen.
  - Tagesheader: Wochentag + Datum via `format(day, 'EEEE, d. MMMM', { locale })`; heute hervorgehoben (z. B. `text-primary font-bold` + Badge `t('navigation.today')`).
  - Event-Karte (Tap-Target ≥ 44 px, `min-h-[44px]`, `cursor-pointer`, on click → `handleDayClick(day)`):
    - Farbiger Punkt in Haus-Farbe (`getHouseColor(event.house_id).bg`)
    - Icon: `Shirt` für linen, `Sparkles` für cleaning
    - Text: `"{event.title} · {event.house}{ · event.time}"`
  - Mehrere Häuser am selben Tag direkt untereinander (eine Karte pro Event).
  - Leerzustand (keine Events in 60 Tagen): zentriert `t('sidebar.noEvents')`.
- Top-Nav (Prev/Today/Next) in `list` ausblenden – Liste ist relativ zu „heute".

## 2. Event-Priorisierung in Monats-/Wochenzellen

- Sortier-Helper `getEventPriority(type)`: `linen=0, cleaning=1, check-out=2, check-in=3, occupied=4`.
- Vor dem Rendern: `dayEvents` nach Priorität sortieren; `occupied` aus der Badge-Liste herausfiltern (bleibt aber für Hintergrund-Berechnung `isOccupied` erhalten).
- `maxItems = 3` (Monat und Woche). „+x weitere" zählt nur die übrig gebliebenen sichtbaren Typen.
- Damit sind linen/cleaning durch Sortierung garantiert in den ersten 3 Slots.

## 3. Tokenisierung (Light/Dark-fest)

- Tageszellen:
  - Frei: `bg-muted/30 hover:bg-muted/50`
  - Belegt: `bg-primary/15 hover:bg-primary/25`
  - (Ersetzt `bg-blue-50/100/200/300`.)
- Tagesdialog:
  - Status-Punkt: `bg-success` (delivered/done), `bg-warning` bzw. `bg-amber` → falls Token fehlt, `bg-warning` (Fallback `bg-muted-foreground`), sonst `bg-info`. Konkret:
    - delivered/done → `bg-success`
    - offen/open/pending → `bg-warning` (Token existiert nicht überall → Fallback `bg-info` prüfen; sonst `bg-muted-foreground/60`). Hinweis: nur Tokens nutzen, die bereits in `index.css`/`tailwind.config` existieren (`success`, `destructive`, `info`, `muted`, `primary`). Mapping final:
      - delivered → `bg-success`
      - pending/open → `bg-info`
      - sonst → `bg-muted-foreground/60`
  - Icon-Feld: statt fix `bg-emerald-100 text-emerald-700` jetzt Haus-Farbe → `cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', houseColor.bg, houseColor.text)`. Wenn kein `house_id` vorhanden: Fallback `bg-muted text-foreground`.

## 4. i18n-Keys ergänzen

In `public/locales/{de,en,nl}/calendar.json` unter `views` einen neuen Key `list` hinzufügen:
- de: `"list": "Liste"`
- en: `"list": "List"`
- nl: `"list": "Lijst"`

Keine weiteren neuen Strings – alle Texte der Liste verwenden vorhandene Keys (`events.cleaning`, `events.linen`, `sidebar.noEvents`, `navigation.today`).

## Technische Details

- `view`-State + localStorage-Lesen: Mobile-Defaultzweig auf `'list'` ändern, Validation der gespeicherten Werte um `'list'` erweitern.
- `fetchCalendarData`: bei `view === 'list'` Date-Range = heute … heute+60 Tage (statt Monat/Woche), Bookings-Query überspringen.
- Bei View-Wechsel zu/von `list` wird ohnehin neu gefetcht (View ist in der Dependency-Liste).
- `renderListView()` neu implementieren, analog zur bestehenden Renderstruktur.
- Touch-Targets `min-h-[44px]` für Listen-Karten und Switcher-Buttons (Switcher hat schon `h-11`).
- Gantt/Monat/Woche-Kernlogik unverändert (nur Sortierung + Token-Klassen ändern sich in den Zellen).

## Out of scope

- Keine neuen Übersetzungs-Strings außer `views.list`.
- Kein Umbau von Gantt-Rendering oder Daten-Queries für Monat/Woche.
- Keine Änderungen an anderen Komponenten / DB.

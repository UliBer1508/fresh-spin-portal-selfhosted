# Kalender-Toolbar nach Vorbild des Mockups umbauen

Betroffene Datei: `src/components/CalendarView.tsx`

## Änderungen

### 1. Obere Toolbar (oberhalb der Kalenderkarte)
- **Entfernen:** "Heute"-Button + Pfeile (◁ ▷) aus der oberen Leiste.
- **Behalten:** Titel (z. B. "Mai 2026") links.
- **Monat / Woche / Gantt:** als 3 große, gleich breite Buttons direkt unter dem Titel anordnen (full-width, in einer Reihe, größere Höhe, gerundet — wie im Mockup). Aktive Auswahl in dunkelblau/primary, inaktive als Outline.

### 2. In die Kalenderkarte (Month/Week-View) integrieren — neue Kopfzeile in der Karte
Direkt über dem Wochentage-Header eine neue Zeile einfügen mit zwei Bereichen:

- **Links:** kompakte Haus-Legende als horizontale Punkte mit Abkürzung
  ```
  ● VC   ● WC
  ```
  (farbiger Dot in Haus-Farbe + Kurzkürzel via vorhandener Abkürzungs-Funktion). Nur Häuser, keine Check-in/-out/Reinigung/Wäsche-Einträge hier.
- **Rechts:** Navigation mit ◁ + "Heute" + ▷ als gerundete Pill-Buttons (wie im Mockup).

### 3. Sidebar-Legende
- Die ausführliche Legende (Check-in/Check-out/Häuser/Reinigung/Wäsche) bleibt unverändert in der Sidebar — nur die kompakte Haus-Übersicht wird zusätzlich oben in die Kalenderkarte aufgenommen.

### 4. Gantt-View
- Da die Kopfzeile innerhalb der Kalenderkarte sitzt, bleibt die Gantt-Ansicht ohne diese neue Zeile (Gantt rendert separat).
- Für Gantt bleibt damit aktuell keine Heute/Pfeile-Navigation sichtbar → in Gantt rendern wir die Heute/Pfeile-Pills oberhalb des Gantt-Containers (kleine separate Zeile), damit Navigation weiter möglich ist.

## Layout (Month/Week-Karte)

```text
┌─ Kalenderkarte ─────────────────────────────┐
│  ● VC  ● WC                  ◁  Heute  ▷   │
│ ─────────────────────────────────────────── │
│  Mo  Di  Mi  Do  Fr  Sa  So                │
│  ...Kalender-Grid...                        │
└─────────────────────────────────────────────┘
```

## Technische Hinweise
- Bestehende `goToPrevious`, `goToToday`, `goToNext` wiederverwenden.
- Haus-Farbe via `getHouseColor(house.id).bg`, Abkürzung via vorhandener Abkürzungs-Helper (siehe Zeile 83).
- Neue Buttons mit `rounded-full` für Heute/Pfeile-Pills; Monat/Woche/Gantt mit `flex-1` für gleiche Breite und größerer Höhe (`h-11`).
- Keine Logikänderungen, rein Layout/Styling im Frontend.

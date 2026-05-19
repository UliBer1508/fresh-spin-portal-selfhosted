

## Diagnose: Welche Rechnungen fehlen?

### Datenbank-Stand (laundry_invoices)
- **48 Datensätze gesamt**
- **35 Entwürfe** (`ENTWURF-...`) — werden korrekt ausgeblendet
- **13 echte Rechnungen** sollten angezeigt werden:

| Nr | Datum | Status | Brutto |
|---|---|---|---|
| 47 | 28.02.2026 | bezahlt | 386,24 |
| 1 | 23.01.2026 | bezahlt | 474,69 |
| 12 | 31.12.2025 | bezahlt | 153,77 |
| 109 | 31.12.2025 | bezahlt | 272,23 |
| R2025-0001 | 07.12.2025 | bezahlt | 101,30 |
| 81 | 18.08.2025 | bezahlt | 293,16 |
| 73 | 17.07.2025 | bezahlt | 123,60 |
| 52 | 30.04.2025 | bezahlt | 60,82 |
| 41 | 12.04.2025 | bezahlt | 37,96 |
| 34 | 27.03.2025 | bezahlt | 241,93 |
| 25 | 28.02.2025 | bezahlt | 206,63 |
| 19 | 31.01.2025 | bezahlt | 197,34 |
| 1 | 15.01.2025 | bezahlt | 170,17 |

### Beobachtung
- RLS ist **deaktiviert** auf der Tabelle — alle Zeilen sind erreichbar.
- Die Query und der Filter sind korrekt.
- Der Code sollte exakt diese **13 Rechnungen** liefern.

### Mögliche Ursachen, wenn der User weniger sieht
1. **PWA-Cache**: Der Service Worker (v12.20) liefert noch eine alte Version aus.
2. **Erwartung vs. Realität**: Der User erwartet mehr als 13 Rechnungen, aber in der DB sind tatsächlich nur 13 echte vorhanden (Rest sind Entwürfe).
3. **Doppelte Rechnungsnummer "1"**: Es gibt zwei verschiedene Rechnungen mit `rechnungsnummer = "1"` (verschiedene `id`s/Daten). React rendert beide korrekt (Key ist `inv.id`), aber visuell könnte das verwirrend wirken.

### Klärungsfrage notwendig

Ich brauche vom User folgende Information, bevor ich blind Änderungen vornehme:
- Wie viele Rechnungen werden aktuell angezeigt?
- Welche bestimmte Rechnung fehlt (Nummer/Datum)?
- Oder: Sollten die **Entwürfe** doch angezeigt werden (ggf. als separate Sektion)?

→ Ich werde dem User per `ask_questions` diese Frage stellen, statt zu raten.


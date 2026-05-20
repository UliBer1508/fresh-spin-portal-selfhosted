# Plan: Stabiler Lieferschein-Druck (vereinfacht — iOS AirPrint)

## Kernidee
`window.print()` löst auf iPhone/iPad **automatisch den nativen AirPrint-Dialog** aus, der alle erreichbaren Drucker auflistet. Wir müssen nur sicherstellen, dass `window.print()` zuverlässig aufgerufen wird — kein PDF, keine zusätzlichen Libraries.

Das aktuelle Problem: Die **versteckte iframe-Lösung** funktioniert auf iOS Safari unzuverlässig (oft druckt iOS dann die leere Hauptseite statt des iframe-Inhalts, oder zeigt gar nichts).

## Lösung: Pfad nach Umgebung

```text
Klick auf "Drucken"
  ├─ Desktop → bestehende iframe-Lösung (funktioniert dort einwandfrei)
  └─ Mobile (iPhone/iPad/Android) → neues Browser-Fenster + window.print()
                                     → iOS zeigt nativen AirPrint-Sheet
```

## Umsetzung

### Erkennung
Eine Funktion `shouldUseNewWindow()`:
- `true` wenn `/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)`
- `false` sonst (Desktop)

### Mobiler Pfad — neues Fenster
- **Synchron im Click-Handler** (nicht in async/await davor!) `const w = window.open('', '_blank')` aufrufen, sonst blockiert iOS Safari den Popup.
- HTML in das Fenster schreiben (gleicher `generatePrintContent()`-Output wie heute).
- Im geschriebenen HTML ein `<script>`-Tag einbetten:
  ```html
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 300);
    });
  </script>
  ```
- iOS zeigt dann automatisch den AirPrint-Sheet → User wählt Drucker → druckt.
- User schließt das Tab nach dem Druck manuell (iOS-Standard, kein `window.close()` möglich).

### PWA-Standalone-Sonderfall
Im Standalone-Modus (vom Homescreen) blockiert iOS `window.open()`. Falls `w === null`:
- Fallback: ein Hinweis-Toast „Bitte Lieferschein-App im Browser öffnen zum Drucken" + Button, der via `window.location.href` ein eigenes Druck-Route öffnet — oder einfacher: wir empfehlen Nutzern, zum Drucken die Browser-Version zu verwenden.
- Praktischer Workaround: Im PWA-Modus die iframe-Methode versuchen (funktioniert auf manchen iOS-Versionen im Standalone besser als window.open).

### Desktop-Pfad — unverändert
Bestehende iframe-Logik bleibt wie sie ist.

## Technische Umsetzung

**Eine neue Datei:** `src/lib/printDeliveryNote.ts`
- `generatePrintHtml(order)` → bestehender HTML-Generator (verschoben aus Dialog)
- `printViaIframe(html)` → bestehende iframe-Logik (verschoben)
- `printViaNewWindow(html)` → neue window.open()-Logik mit Auto-Print-Script
- `printDeliveryNote(order)` → wählt Pfad nach Umgebung, mit PWA-Fallback

**Geänderte Datei:** `src/components/dialogs/PrintDeliveryNoteDialog.tsx`
- `handlePrintClick` ruft nur noch `printDeliveryNote(order)` auf.
- Vorschau-UI im Modal unverändert.
- `toast.error()` Feedback wenn Druck fehlschlägt (z.B. Popup blockiert).

## Was unverändert bleibt
- Dialog-Vorschau im Modal
- HTML-Inhalt des Lieferscheins (Layout, Felder, Reihenfolge)
- Helper (`getLinenLabel`, `getItemColor`, etc.)
- Keine neuen npm-Pakete

## Verifikation
1. Desktop Chrome/Safari → iframe-Druck ✓
2. iPhone Safari (Browser) → AirPrint-Sheet erscheint ✓
3. Android Chrome → Druckdialog erscheint ✓
4. iPhone PWA (Homescreen) → Fallback funktioniert oder klare Fehlermeldung ✓

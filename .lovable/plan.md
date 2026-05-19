## Einheitliche Lucide-Icons in der Bottom-Navigation

**Problem:** Die Bottom-Navigation (`TabNavigation.tsx`) verwendet aktuell Emojis (🧺 📅 🧾 🔔 💬), während die QuickFilter-Buttons oben bereits Lucide-Icons (`Home`, `Calendar`) nutzen. Im Referenzbild sind alle Icons im selben Lucide-Stil (Linien-Icons, einheitliche Strichstärke).

**Änderung:** `src/components/TabNavigation.tsx`

- Lucide-Icons importieren: `Home`, `Calendar`, `Receipt`, `Bell`, `MessageCircle`
- `tabs`-Array: `emoji` durch `icon` (Komponente) ersetzen
  - `waesche` → `Home`
  - `kalender` → `Calendar`
  - `rechnungen` → `Receipt`
  - `benachrichtigungen` → `Bell`
- Chat-Button: `💬` → `MessageCircle`
- Rendering: `<span>{emoji}</span>` → `<Icon className="w-6 h-6" strokeWidth={2} />` (Desktop `w-5 h-5`)
- Bestehende Badges bleiben (roter Punkt bei `hasNewOrders`, Unread-Count beim Chat) — werden absolut um den Icon-Wrapper positioniert
- Animation `animate-bell-ring` bleibt auf dem Bell-Icon erhalten

Keine Logik-/Routing-Änderungen, nur Icon-Austausch.

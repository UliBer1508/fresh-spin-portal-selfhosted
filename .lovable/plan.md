## Plan
In `src/pages/Index.tsx` Zeile 212: Container der „Wäsche"-Tab-Sektion `space-y-6` → `space-y-2 sm:space-y-3`.

Damit verringert sich der vertikale Abstand zwischen den QuickFilter-Karten (Diese Woche/Nächste Woche/Häuser) und der ersten Buchungskarte deutlich (von 24px auf 8/12px).

Die innere `space-y-6` der Buchungsliste (Z. 233) bleibt unverändert — Abstand zwischen Buchungskarten untereinander.
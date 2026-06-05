## Ziel
Teuni sieht keinen Login-Screen mehr. Die App meldet sich still im Hintergrund mit fixen Zugangsdaten an. RLS bleibt unverändert.

## ⚠️ Sicherheitshinweis (wichtig vor Umsetzung)
`VITE_PORTAL_PASSWORD` wird zur Build-Zeit ins Browser-Bundle eingebettet. Jeder, der die Portal-URL öffnet, kann das Passwort über DevTools → Sources auslesen und sich überall als Teuni anmelden. Das ist faktisch dasselbe wie ein öffentliches Passwort.

Du hast diesen Weg trotzdem so vorgegeben — ich setze ihn 1:1 um. Falls du später doch Server-Seite (Edge Function) willst, sag Bescheid.

## Änderungen

### 1. Secrets / Env-Variablen
Hinzufügen über Lovable Settings:
- `VITE_PORTAL_EMAIL` = Teunis E-Mail
- `VITE_PORTAL_PASSWORD` = aktuelles Passwort

Wird per `secrets--add_secret` angefragt (Eingabemaske beim User).

### 2. `src/hooks/useAuth.ts` ersetzen
- TypeScript-Typen ergänzen (`useState<Session | null>(null)`, `useState<User | null>(null)`) — sonst Build-Fehler
- Logik wie im Prompt: bei fehlender Session `signInWithPassword` mit den Env-Vars
- `onAuthStateChange` Listener bleibt
- Rückgabe: `{ session, user, loading }`

### 3. `src/components/LoginScreen.tsx` ersetzen
- Neutrale Lade-Anzeige (keine Login-Form mehr)
- Wird nur angezeigt, falls Auto-Login fehlschlägt
- Verwendet semantische Design-Tokens (light theme)

### 4. `src/App.tsx`
- Keine Änderung

## Was NICHT geändert wird
- Keine RLS-Policies
- Keine DB-Migrationen
- Keine anderen Komponenten

## Nach Implementierung
- Prüfen, ob `signOut`/andere Exports aus `useAuth` an anderer Stelle verwendet werden — falls ja, schnell anpassen.
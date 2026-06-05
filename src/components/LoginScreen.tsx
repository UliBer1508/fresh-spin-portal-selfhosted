// Fallback screen shown only if auto-login fails (e.g. wrong credentials or missing env vars)
const LoginScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-background p-4">
    <div className="text-center space-y-2">
      <p className="text-lg font-medium text-foreground">🔄 Verbindung wird hergestellt…</p>
      <p className="text-sm text-muted-foreground">Bitte warten oder Seite neu laden.</p>
    </div>
  </div>
);

export default LoginScreen;

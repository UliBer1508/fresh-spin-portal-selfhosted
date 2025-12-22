// v12.4 - Version aus version.ts
import { StrictMode, Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { APP_VERSION } from "./lib/version";

// Preemptive cache check and clear on startup
const performPreemptiveCacheCheck = async () => {
  const lastVersion = localStorage.getItem('app-version');
  const currentVersion = APP_VERSION;
  
  if (lastVersion !== currentVersion) {
    console.log('[Startup] Version changed from', lastVersion, 'to', currentVersion, '- clearing all caches');
    
    try {
      // Clear all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('[Startup] Cleared', cacheNames.length, 'cache(s)');
      }
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('[Startup] Unregistered', registrations.length, 'service worker(s)');
      }
      
      // Clear session storage error counters
      sessionStorage.removeItem('errorBoundaryReloadCount');
      
      // Update version
      localStorage.setItem('app-version', currentVersion);
      console.log('[Startup] Cache cleanup complete');
    } catch (err) {
      console.error('[Startup] Cache cleanup failed:', err);
    }
  }
};

// Run preemptive cache check
performPreemptiveCacheCheck();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  reloadCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    const reloadCount = parseInt(sessionStorage.getItem('errorBoundaryReloadCount') || '0');
    this.state = { hasError: false, error: null, reloadCount };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const reloadCount = parseInt(sessionStorage.getItem('errorBoundaryReloadCount') || '0');
    return { hasError: true, error, reloadCount };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] React error caught:', error, errorInfo);
    
    // Check reload count to prevent infinite loops
    const currentReloadCount = this.state.reloadCount;
    const MAX_RELOADS = 2;
    
    if (currentReloadCount >= MAX_RELOADS) {
      console.error('[ErrorBoundary] ⚠️ Max reload attempts reached, not reloading');
      sessionStorage.removeItem('errorBoundaryReloadCount');
      return;
    }
    
    // Check if this is a React hooks error (cache conflict)
    const isReactError = 
      error.message.includes("Cannot read properties of null") ||
      error.message.includes("Invalid hook call") ||
      error.message.includes("useState") ||
      error.message.includes("useContext") ||
      error.message.includes("useEffect") ||
      error.message.includes("useRef") ||
      error.message.includes("QueryClient");
    
    if (isReactError) {
      console.error('[ErrorBoundary] 🔥 Detected React cache conflict - forcing hard reset (attempt', currentReloadCount + 1, 'of', MAX_RELOADS + ')');
      
      // Increment reload counter
      sessionStorage.setItem('errorBoundaryReloadCount', String(currentReloadCount + 1));
      
      // Clear all caches and force hard reload
      const clearAndReload = async () => {
        try {
          // 1. Clear all browser caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => {
                console.log('[ErrorBoundary] Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
          }
          
          // 2. Clear Service Worker caches via message
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ALL_CACHES' });
          }
          
          // 3. Unregister all service workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
          }
          
          console.log('[ErrorBoundary] All caches cleared, forcing hard reload...');
        } catch (err) {
          console.error('[ErrorBoundary] Cache clear failed:', err);
        } finally {
          // Hard reload with cache bypass
          window.location.href = window.location.href + '?_=' + Date.now();
        }
      };
      
      clearAndReload();
    }
  }

  render() {
    if (this.state.hasError) {
      const isMaxReloads = this.state.reloadCount >= 2;
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          {isMaxReloads ? (
            <>
              <h1>⚠️ App-Fehler</h1>
              <p style={{ maxWidth: '500px', marginTop: '1rem' }}>
                Die App konnte nicht korrekt geladen werden. Bitte laden Sie die Seite manuell neu oder kontaktieren Sie den Support.
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '2rem',
                  padding: '12px 24px',
                  fontSize: '16px',
                  background: 'white',
                  color: '#059669',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Seite neu laden
              </button>
            </>
          ) : (
            <>
              <h1>Cache wird bereinigt...</h1>
              <div style={{
                border: '4px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                borderTop: '4px solid white',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '20px auto'
              }} />
              <p>Die App wird gleich neu geladen...</p>
            </>
          )}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
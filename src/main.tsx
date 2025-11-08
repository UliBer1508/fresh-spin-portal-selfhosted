// v12.1 - React Cache Fix
import { StrictMode, Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] React error caught:', error, errorInfo);
    
    // Check if this is a React hooks error (cache conflict)
    const isReactError = 
      error.message.includes("Cannot read properties of null") ||
      error.message.includes("Invalid hook call") ||
      error.message.includes("useState") ||
      error.message.includes("useContext") ||
      error.message.includes("useEffect") ||
      error.message.includes("useRef");
    
    if (isReactError) {
      console.error('[ErrorBoundary] 🔥 Detected React cache conflict - forcing hard reset');
      
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
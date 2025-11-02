// v11.2 - Error Boundary for cache conflicts
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
      error.message.includes("useContext");
    
    if (isReactError) {
      console.error('[ErrorBoundary] 🔥 Detected React cache conflict - clearing cache and reloading');
      
      // Clear all caches and reload
      const clearAndReload = async () => {
        try {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => {
                console.log('[ErrorBoundary] Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
            console.log('[ErrorBoundary] Cache cleared, reloading...');
          }
        } catch (err) {
          console.error('[ErrorBoundary] Cache clear failed:', err);
        } finally {
          window.location.reload();
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
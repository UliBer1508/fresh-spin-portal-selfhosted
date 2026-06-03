// v12.5 - Multi-language support (DE, EN, NL)
import { useEffect, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import "./lib/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginScreen from "./components/LoginScreen";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Lade...</p>
    </div>
  </div>
);

const AuthGate = () => {
  const { session, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!session) return <LoginScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      toast({
        title: event.detail.title,
        description: event.detail.description,
      });
    };
    
    window.addEventListener('show-toast', handleToast as EventListener);
    return () => window.removeEventListener('show-toast', handleToast as EventListener);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <Suspense fallback={<LoadingSpinner />}>
          <TooltipProvider>
            <AuthGate />
          </TooltipProvider>
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

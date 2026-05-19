// v13 - Routing + AppShell
import { useEffect, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { toast } from "@/hooks/use-toast";
import "./lib/i18n";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import CalendarPage from "./pages/CalendarPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      toast({ title: event.detail.title, description: event.detail.description });
    };
    window.addEventListener("show-toast", handleToast as EventListener);
    return () => window.removeEventListener("show-toast", handleToast as EventListener);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen bg-background">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Lade...</p>
              </div>
            </div>
          }
        >
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

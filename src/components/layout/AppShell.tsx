import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PWAStatusBar from "@/components/PWAStatusBar";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import Footer from "@/components/Footer";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import ChatFab from "./ChatFab";
import { BookingsProvider } from "@/context/BookingsContext";
import { useEffect } from "react";

const AppShell = () => {
  // Clean old localStorage keys once
  useEffect(() => {
    const cleaned = localStorage.getItem("settings-cleaned");
    if (!cleaned) {
      ["viewSettings", "viewSettings-desktop", "viewSettings-mobile", "app-version"].forEach((k) =>
        localStorage.removeItem(k)
      );
      localStorage.setItem("settings-cleaned", "true");
    }
  }, []);

  return (
    <BookingsProvider onNewOrder={() => toast.info("Neue Bestellung eingegangen!")}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <PWAStatusBar />
            <div className="pt-12 md:pt-0">
              <TopBar />
            </div>
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-6 pb-24 md:pb-8">
              <Outlet />
            </main>
            <Footer />
          </div>
          <BottomNav />
          <ChatFab />
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <Toaster />
          <Sonner />
        </div>
      </SidebarProvider>
    </BookingsProvider>
  );
};

export default AppShell;

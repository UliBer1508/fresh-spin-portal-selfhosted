// v12.1 - React Cache Fix
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import NotificationSettings from "@/components/NotificationSettings";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import PWAStatusBar from "@/components/PWAStatusBar";
import { ViewSettings, defaultSettings } from "@/components/ViewSettingsDialog";
import { useBookings, Booking } from "@/hooks/useBookings";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const { bookings, loading, error, refetch } = useBookings();
  
  // Listen for Service Worker sync messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'TRIGGER_SYNC') {
          console.log('[App] Received sync trigger from SW, refetching data');
          refetch();
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [refetch]);

  // Migration script - migrate to unified ViewSettings
  useEffect(() => {
    const appVersion = localStorage.getItem('app-version');
    if (!appVersion || appVersion !== '12.0') {
      console.log('[Migration] Migrating from version', appVersion, 'to 12.0');
      
      // Migrate from Desktop-Settings as basis
      const desktopSettings = localStorage.getItem('viewSettings-desktop');
      if (desktopSettings && !localStorage.getItem('viewSettings')) {
        localStorage.setItem('viewSettings', desktopSettings);
        console.log('[Migration] Migrated desktop settings to unified settings');
      }
      
      // Remove old keys
      localStorage.removeItem('viewSettings-desktop');
      localStorage.removeItem('viewSettings-mobile');
      // Keep: showViewSettingsButtonOnMobile
      
      // Mark as migrated
      localStorage.setItem('app-version', '12.0');
      
      // Force reload to ensure new code is active
      console.log('[Migration] Reloading to apply new version');
      window.location.reload();
    }
  }, []);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Mobile Detection (simple check for button visibility logic)
  const [isMobile] = useState<boolean>(() => window.innerWidth < 768);
  
  // Unified ViewSettings State mit localStorage
  const [viewSettings, setViewSettings] = useState<ViewSettings>(() => {
    try {
      const saved = localStorage.getItem('viewSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to parse viewSettings from localStorage:', error);
      localStorage.removeItem('viewSettings');
    }
    return defaultSettings;
  });

  const handleSettingsChange = (settings: ViewSettings) => {
    console.log('Saving viewSettings:', settings);
    setViewSettings(settings);
    localStorage.setItem('viewSettings', JSON.stringify(settings));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "waesche":
        return (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Alle Buchungen mit Wäschebestellungen
              </h1>
              <p className="text-muted-foreground text-lg">
                Verwalten Sie alle Wäscheaufträge für Ihre Gäste
              </p>
            </div>

            <SearchAndFilter 
              bookings={bookings}
              onFilteredBookingsChange={setFilteredBookings}
              viewSettings={viewSettings}
              onViewSettingsChange={handleSettingsChange}
            />

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Buchungen...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Fehler beim Laden der Buchungen: {error}</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Buchungen gefunden.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    viewSettings={viewSettings}
                  />
                ))}
              </div>
            )}
          </div>
        );
      
      case "kalender":
        return <CalendarView />;
      
      case "waeschekraefte":
        return <LaundryStaffManagement />;
      
      case "benachrichtigungen":
        return <NotificationSettings />;
      
      default:
        // Falls jemand auf einen nicht-existierenden Tab zugreift, zu "waesche" zurückkehren
        if (activeTab !== "waesche") {
          setActiveTab("waesche");
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PWAStatusBar />
      <div className="pt-12 md:pt-0">
        <Header 
          viewSettings={viewSettings}
          onSettingsChange={handleSettingsChange}
          isMobileDevice={isMobile}
        />
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {renderTabContent()}
        </main>
      </div>

      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Index;
// v11.0 - Supabase-native PWA (removed idb dependency)
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

  // Migration script - ensure settings from v10.0 are preserved
  useEffect(() => {
    const appVersion = localStorage.getItem('app-version');
    if (!appVersion || appVersion !== '11.0') {
      console.log('[Migration] Migrating from version', appVersion, 'to 11.0');
      
      // Mark as migrated
      localStorage.setItem('app-version', '11.0');
      
      // Force reload to ensure new code is active
      if (appVersion && appVersion !== '11.0') {
        console.log('[Migration] Reloading to apply new version');
        window.location.reload();
      }
    }
  }, []);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Mobile Detection
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Desktop ViewSettings State mit localStorage
  const [desktopViewSettings, setDesktopViewSettings] = useState<ViewSettings>(() => {
    try {
      const saved = localStorage.getItem('viewSettings-desktop');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to parse desktop viewSettings from localStorage:', error);
      localStorage.removeItem('viewSettings-desktop');
    }
    return defaultSettings;
  });

  // Mobile ViewSettings State mit localStorage
  const [mobileViewSettings, setMobileViewSettings] = useState<ViewSettings>(() => {
    try {
      const saved = localStorage.getItem('viewSettings-mobile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to parse mobile viewSettings from localStorage:', error);
      localStorage.removeItem('viewSettings-mobile');
    }
    return defaultSettings;
  });

  const handleDesktopSettingsChange = (settings: ViewSettings) => {
    console.log('Saving desktop viewSettings:', settings);
    setDesktopViewSettings(settings);
    localStorage.setItem('viewSettings-desktop', JSON.stringify(settings));
  };

  const handleMobileSettingsChange = (settings: ViewSettings) => {
    console.log('Saving mobile viewSettings:', settings);
    setMobileViewSettings(settings);
    localStorage.setItem('viewSettings-mobile', JSON.stringify(settings));
  };

  // Use the correct settings based on device
  const currentViewSettings = isMobile ? mobileViewSettings : desktopViewSettings;

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
              viewSettings={currentViewSettings}
              onViewSettingsChange={isMobile ? handleMobileSettingsChange : handleDesktopSettingsChange}
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
                    viewSettings={currentViewSettings}
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
          desktopViewSettings={desktopViewSettings}
          mobileViewSettings={mobileViewSettings}
          onDesktopSettingsChange={handleDesktopSettingsChange}
          onMobileSettingsChange={handleMobileSettingsChange}
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
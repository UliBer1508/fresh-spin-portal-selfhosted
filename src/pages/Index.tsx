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
        
        if (event.data && event.data.type === 'SETTINGS_RELOAD') {
          console.log('[App] Received settings reload trigger from SW');
          try {
            const desktopSettings = localStorage.getItem('viewSettings-desktop');
            const mobileSettings = localStorage.getItem('viewSettings-mobile');
            
            if (desktopSettings) {
              const parsed = JSON.parse(desktopSettings);
              console.log('[App] Reloading desktop settings:', parsed);
              setDesktopViewSettings({ ...defaultSettings, ...parsed });
            }
            
            if (mobileSettings) {
              const parsed = JSON.parse(mobileSettings);
              console.log('[App] Reloading mobile settings:', parsed);
              setMobileViewSettings({ ...defaultSettings, ...parsed });
            }
          } catch (error) {
            console.error('[App] Failed to reload settings:', error);
          }
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [refetch]);

  // Migration script - ensure settings from v10.0 are preserved (NO RELOAD!)
  useEffect(() => {
    const appVersion = localStorage.getItem('app-version');
    if (!appVersion || appVersion !== '11.1') {
      console.log('[Migration] Migrating to version 11.1 (no reload needed)');
      localStorage.setItem('app-version', '11.1');
    }
  }, []);

  // Migration: Ensure settings button is visible on mobile by default
  useEffect(() => {
    const buttonVisibility = localStorage.getItem('showViewSettingsButtonOnMobile');
    if (buttonVisibility === null) {
      console.log('[Migration] Setting showViewSettingsButtonOnMobile to true');
      localStorage.setItem('showViewSettingsButtonOnMobile', 'true');
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
    // Force new object reference to trigger React re-render
    const newSettings = { ...settings };
    console.log('[Settings] Desktop settings changed:', newSettings);
    setDesktopViewSettings(newSettings);
    localStorage.setItem('viewSettings-desktop', JSON.stringify(newSettings));
  };

  const handleMobileSettingsChange = (settings: ViewSettings) => {
    // Force new object reference to trigger React re-render
    const newSettings = { ...settings };
    console.log('[Settings] Mobile settings changed:', newSettings);
    setMobileViewSettings(newSettings);
    localStorage.setItem('viewSettings-mobile', JSON.stringify(newSettings));
  };

  // Use the correct settings based on device
  const currentViewSettings = isMobile ? mobileViewSettings : desktopViewSettings;

  // Debug: Log settings on app start
  useEffect(() => {
    console.log('=== APP START DEBUG ===');
    console.log('isMobile:', isMobile);
    console.log('desktopViewSettings:', desktopViewSettings);
    console.log('mobileViewSettings:', mobileViewSettings);
    console.log('currentViewSettings:', currentViewSettings);
    console.log('showButtonOnMobile (localStorage):', localStorage.getItem('showViewSettingsButtonOnMobile'));
    console.log('======================');
  }, [isMobile, desktopViewSettings, mobileViewSettings, currentViewSettings]);

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
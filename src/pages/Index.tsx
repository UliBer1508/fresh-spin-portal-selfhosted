// v7.2 - React import fix
import React, { useState, useEffect } from "react";
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
  const { bookings, loading, error } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // ViewSettings State mit localStorage
  const [viewSettings, setViewSettings] = useState<ViewSettings>(() => {
    try {
      const saved = localStorage.getItem('viewSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate that it's a valid object with expected structure
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to parse viewSettings from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('viewSettings');
    }
    return defaultSettings;
  });

  const handleViewSettingsChange = (settings: ViewSettings) => {
    console.log('Saving viewSettings:', settings);
    setViewSettings(settings);
    localStorage.setItem('viewSettings', JSON.stringify(settings));
  };

  // Explizit Settings beim Mount laden
  useEffect(() => {
    console.log('Loading viewSettings on mount...');
    try {
      const saved = localStorage.getItem('viewSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          const mergedSettings = { ...defaultSettings, ...parsed };
          console.log('Loaded viewSettings:', mergedSettings);
          setViewSettings(mergedSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load viewSettings from localStorage:', error);
    }
  }, []);

  // Settings über Tabs synchronisieren
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'viewSettings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const mergedSettings = { ...defaultSettings, ...parsed };
          console.log('ViewSettings updated from storage event:', mergedSettings);
          setViewSettings(mergedSettings);
        } catch (error) {
          console.error('Failed to parse viewSettings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
              onViewSettingsChange={handleViewSettingsChange}
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
          onViewSettingsChange={handleViewSettingsChange}
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
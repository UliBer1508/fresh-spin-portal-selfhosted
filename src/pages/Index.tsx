import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAStatusBar from "@/components/PWAStatusBar";
import { ViewSettings, defaultSettings } from "@/components/ViewSettingsDialog";
import { useBookings, Booking } from "@/hooks/useBookings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const { bookings, loading, error } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // ViewSettings State mit localStorage
  const [viewSettings, setViewSettings] = useState<ViewSettings>(() => {
    const saved = localStorage.getItem('viewSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const handleViewSettingsChange = (settings: ViewSettings) => {
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

      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
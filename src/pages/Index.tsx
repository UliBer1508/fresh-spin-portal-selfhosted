import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import NotificationSettings from "@/components/NotificationSettings";
import { useBookings, Booking } from "@/hooks/useBookings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const { bookings, loading, error } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

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
                  <BookingCard key={booking.id} booking={booking} />
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
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Index;
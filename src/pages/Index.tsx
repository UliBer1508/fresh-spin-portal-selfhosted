import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";

// Mock data for bookings
const mockBookings = [
  {
    id: "1",
    accommodation: "Wald Chalet",
    address: "Trattenbach 299/17, 5741 Neukirchen am GV",
    guest: "Tiepel",
    guestCount: 1,
    checkIn: "24.8.2025",
    checkOut: "7.9.2025",
    status: "in-progress" as const,
  },
  {
    id: "2",
    accommodation: "Berg Villa",
    address: "Bergstraße 15, 5741 Neukirchen am GV",
    guest: "Schmidt",
    guestCount: 4,
    checkIn: "20.8.2025",
    checkOut: "3.9.2025",
    status: "completed" as const,
  },
  {
    id: "3",
    accommodation: "See Haus",
    address: "Seeweg 8, 5741 Neukirchen am GV",
    guest: "Müller",
    guestCount: 2,
    checkIn: "25.8.2025",
    checkOut: "10.9.2025",
    status: "pending" as const,
  },
  {
    id: "4",
    accommodation: "Alpen Lodge",
    address: "Gipfelweg 22, 5741 Neukirchen am GV",
    guest: "Weber",
    guestCount: 6,
    checkIn: "28.8.2025",
    checkOut: "12.9.2025",
    status: "in-progress" as const,
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");

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

            <SearchAndFilter />

            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <BookingCard key={booking.id} {...booking} />
              ))}
            </div>
          </div>
        );
      
      case "kalender":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Kalender-Ansicht
            </h2>
            <p className="text-muted-foreground">
              Die Kalender-Funktion wird in Kürze verfügbar sein.
            </p>
          </div>
        );
      
      case "waeschekraefte":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Wäschekräfte verwalten
            </h2>
            <p className="text-muted-foreground">
              Die Personalverwaltung wird in Kürze verfügbar sein.
            </p>
          </div>
        );
      
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
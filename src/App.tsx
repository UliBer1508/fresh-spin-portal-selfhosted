import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import { useBookings, Booking } from "@/hooks/useBookings";

const SimpleIndex = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const { bookings, loading, error } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-3xl font-bold mb-4">BookingCard Test</h2>
          
          <SearchAndFilter 
            bookings={bookings}
            onFilteredBookingsChange={setFilteredBookings}
          />
          
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              Gefilterte Buchungen: {filteredBookings.length}
            </p>
            
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">BookingCards werden geladen...</p>
                {filteredBookings.slice(0, 2).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Keine Buchungen zum Anzeigen</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SimpleIndex />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;

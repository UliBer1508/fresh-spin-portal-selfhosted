import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
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
          <h2 className="text-3xl font-bold mb-4">SearchAndFilter Test</h2>
          <p className="text-gray-600 mb-4">
            Buchungen geladen: {bookings.length}
          </p>
          
          <SearchAndFilter 
            bookings={bookings}
            onFilteredBookingsChange={setFilteredBookings}
          />
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-gray-600">
              Gefilterte Buchungen: {filteredBookings.length}
            </p>
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

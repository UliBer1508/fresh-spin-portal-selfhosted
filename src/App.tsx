import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import { useBookings } from "@/hooks/useBookings";

const SimpleIndex = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const { bookings, loading, error } = useBookings();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-3xl font-bold mb-4">useBookings Hook Test</h2>
          <p className="text-gray-600">
            Loading: {loading ? "Ja" : "Nein"}
          </p>
          <p className="text-gray-600">
            Error: {error || "Kein Error"}
          </p>
          <p className="text-gray-600">
            Buchungen: {bookings.length} gefunden
          </p>
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

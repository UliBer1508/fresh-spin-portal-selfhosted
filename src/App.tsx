import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";

const SimpleIndex = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-3xl font-bold mb-4">Tab Navigation Test</h2>
          <p className="text-gray-600">
            Aktiver Tab: {activeTab}
          </p>
          <p className="text-gray-600 mt-2">
            Wenn das funktioniert, ist die Tab-Navigation OK.
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

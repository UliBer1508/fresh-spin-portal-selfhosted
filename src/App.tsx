import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";

const SimpleIndex = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-4">Header Test</h2>
        <p className="text-gray-600">
          Wenn das funktioniert, ist der Header OK.
        </p>
      </div>
    </main>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SimpleIndex />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;

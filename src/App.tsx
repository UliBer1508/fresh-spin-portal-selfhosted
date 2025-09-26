import { BrowserRouter, Routes, Route } from "react-router-dom";

const SimpleIndex = () => (
  <div className="min-h-screen bg-background">
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <h1 className="text-xl font-semibold">Teuni Wäscheportal</h1>
    </header>
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-4">Index-Seite Test</h2>
        <p className="text-gray-600">
          Wenn das funktioniert, kann ich die echten Komponenten hinzufügen.
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

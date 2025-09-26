import { BrowserRouter, Routes, Route } from "react-router-dom";

const TestIndex = () => (
  <div className="min-h-screen bg-background p-8">
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">App.tsx funktioniert!</h1>
      <p className="text-gray-600">
        Router und grundlegende Struktur sind OK. Jetzt können wir die Index-Seite testen.
      </p>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TestIndex />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;

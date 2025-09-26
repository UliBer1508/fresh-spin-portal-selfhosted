import { createRoot } from "react-dom/client";
import "./index.css";

const SimpleHeader = () => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-xl font-semibold">Teuni Wäscheportal - Test</h1>
  </header>
);

const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">App läuft!</h2>
          <p className="text-gray-600">
            Grundstruktur funktioniert. Jetzt können wir die Komponenten wieder hinzufügen.
          </p>
        </div>
      </main>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<SimpleApp />);

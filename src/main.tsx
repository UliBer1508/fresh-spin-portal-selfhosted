import { createRoot } from "react-dom/client";
import "./index.css";

console.log("Starting app with CSS...");

const TestApp = () => {
  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="bg-white p-4 rounded">
        <h1 className="text-2xl font-bold text-black">
          CSS Test - Funktioniert Tailwind?
        </h1>
        <p className="text-gray-600 mt-2">
          Wenn die Farben stimmen, funktioniert CSS.
        </p>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<TestApp />);

import { createRoot } from "react-dom/client";

console.log("Starting app...");

const TestApp = () => {
  console.log("TestApp rendering");
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'red',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial'
    }}>
      <div style={{
        backgroundColor: 'white',
        color: 'black',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h1>Minimal Test</h1>
        <p>Wird das angezeigt?</p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<TestApp />);
} else {
  console.error("Root element not found!");
}

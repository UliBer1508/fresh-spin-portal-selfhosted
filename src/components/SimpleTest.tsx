const SimpleTest = () => {
  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "red", 
      color: "white",
      fontSize: "24px",
      fontWeight: "bold"
    }}>
      SIMPLE TEST - Wenn Sie das sehen, funktioniert React!
      <div style={{ marginTop: "10px", fontSize: "16px" }}>
        Aktueller Zeitstempel: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SimpleTest;
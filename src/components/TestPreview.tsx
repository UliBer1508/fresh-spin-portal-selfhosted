const TestPreview = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">🔥 PREVIEW TEST 🔥</h1>
        <p className="text-xl text-gray-600">Wenn Sie das sehen, funktioniert das Preview!</p>
        <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">✅ Rendering erfolgreich</p>
        </div>
      </div>
    </div>
  );
};

export default TestPreview;
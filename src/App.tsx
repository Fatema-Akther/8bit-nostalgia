import PixelGrid from "./components/PixelGrid";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-6">
      <h1 className="text-3xl font-bold">8-Bit Nostalgia 🎮</h1>
      <PixelGrid />
    </div>
  );
}

export default App;

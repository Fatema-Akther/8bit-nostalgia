import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const PixelGrid = () => {
  const gridSize = 8;
  const totalPixels = gridSize * gridSize;
  const STORAGE_KEY = "pixel-art";

  const [pixels, setPixels] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : Array(totalPixels).fill("");
  });

  const [selectedColor, setSelectedColor] = useState<string>("#000000");

  const gridRef = useRef<HTMLDivElement>(null);

  const handlePixelClick = (index: number) => {
    const updated = [...pixels];
    updated[index] = updated[index] === selectedColor ? "" : selectedColor;
    setPixels(updated);
  };

  const handleClear = () => {
    const cleared = Array(totalPixels).fill("");
    setPixels(cleared);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleMirror = () => {
    const newPixels = [...pixels];
    for (let row = 0; row < gridSize; row++) {
      const start = row * gridSize;
      const end = start + gridSize;
      const rowPixels = newPixels.slice(start, end).reverse();
      for (let i = 0; i < gridSize; i++) {
        newPixels[start + i] = rowPixels[i];
      }
    }
    setPixels(newPixels);
  };

  const handleExport = async () => {
    if (gridRef.current) {
      const canvas = await html2canvas(gridRef.current);
      const dataURL = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "pixel-art.png";
      link.click();
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pixels));
  }, [pixels]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <label className="text-white font-medium">🎨 Pick Color:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 rounded"
        />
      </div>

      <div ref={gridRef} className="grid grid-cols-8 gap-1 p-2 bg-white">
        {pixels.map((color, index) => (
          <div
            key={index}
            onClick={() => handlePixelClick(index)}
            className="w-8 h-8 border border-gray-300 cursor-pointer"
            style={{ backgroundColor: color || "white" }}
          ></div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleMirror}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Mirror ↔️
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Clear ❌
        </button>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Export 📸
        </button>
      </div>
    </div>
  );
};

export default PixelGrid;

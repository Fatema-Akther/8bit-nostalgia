import { useState } from "react";

const PixelGrid = () => {
  const gridSize = 8;
  const totalPixels = gridSize * gridSize;

  // State: holds color values per pixel ("" means white)
  const [pixels, setPixels] = useState<string[]>(Array(totalPixels).fill(""));
  const [selectedColor, setSelectedColor] = useState<string>("#000000");

  const handlePixelClick = (index: number) => {
    const updated = [...pixels];
    updated[index] = updated[index] === selectedColor ? "" : selectedColor;
    setPixels(updated);
  };

  const handleClear = () => {
    setPixels(Array(totalPixels).fill(""));
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

      <div className="grid grid-cols-8 gap-1">
        {pixels.map((color, index) => (
          <div
            key={index}
            onClick={() => handlePixelClick(index)}
            className="w-8 h-8 border cursor-pointer"
            style={{ backgroundColor: color || "white" }}
          ></div>
        ))}
      </div>

      <div className="flex gap-4">
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
      </div>
    </div>
  );
};

export default PixelGrid;

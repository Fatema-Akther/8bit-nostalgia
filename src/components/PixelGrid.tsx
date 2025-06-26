import { useState } from "react";

const PixelGrid = () => {
  const gridSize = 8;
  const totalPixels = gridSize * gridSize;

  const [pixels, setPixels] = useState<boolean[]>(Array(totalPixels).fill(false));

  const togglePixel = (index: number) => {
    const updated = [...pixels];
    updated[index] = !updated[index];
    setPixels(updated);
  };

  const handleClear = () => {
    setPixels(Array(totalPixels).fill(false));
  };

  const handleMirror = () => {
    const newPixels = [...pixels];
    for (let row = 0; row < gridSize; row++) {
      const start = row * gridSize;
      const end = start + gridSize;
      const rowPixels = newPixels.slice(start, end);
      rowPixels.reverse();
      for (let i = 0; i < gridSize; i++) {
        newPixels[start + i] = rowPixels[i];
      }
    }
    setPixels(newPixels);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 gap-1">
        {pixels.map((active, index) => (
          <div
            key={index}
            onClick={() => togglePixel(index)}
            className={`w-8 h-8 cursor-pointer border ${
              active ? "bg-black" : "bg-white"
            }`}
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

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const gridSize = 8;
const totalPixels = gridSize * gridSize;

const PixelGrid = () => {
  const STORAGE_KEY = "pixel-art-saves";

  const [pixels, setPixels] = useState<string[]>(Array(totalPixels).fill(""));
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [designName, setDesignName] = useState<string>("");
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Load saved names on first render
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedNames(Object.keys(parsed));
    }
  }, []);

  // Save current design with name
  const handleSave = () => {
    if (!designName.trim()) return alert("Please enter a name!");
    const saved = localStorage.getItem(STORAGE_KEY);
    const allDesigns = saved ? JSON.parse(saved) : {};
    allDesigns[designName] = pixels;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDesigns));
    setSavedNames(Object.keys(allDesigns));
    alert(`Saved "${designName}" successfully!`);
    setDesignName("");
  };

  // Load design by name
  const handleLoad = (name: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const allDesigns = JSON.parse(saved);
    setPixels(allDesigns[name]);
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

  const handlePixelClick = (index: number) => {
    const updated = [...pixels];
    updated[index] = updated[index] === selectedColor ? "" : selectedColor;
    setPixels(updated);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Color Picker */}
      <div className="flex items-center gap-3">
        <label className="text-white font-medium">🎨 Pick Color:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 rounded"
        />
      </div>

      {/* Grid Canvas */}
      <div ref={gridRef} className="grid grid-cols-8 gap-1 p-2 bg-white">
        {pixels.map((color, index) => (
          <div
            key={index}
            onClick={() => handlePixelClick(index)}
            className="w-8 h-8 border cursor-pointer"
            style={{ backgroundColor: color || "white" }}
          ></div>
        ))}
      </div>

      {/* Save/Load Controls */}
      <div className="flex flex-col items-center gap-2">
        <input
          type="text"
          placeholder="Enter design name"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="px-3 py-2 rounded border"
        />
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Save As 💾
        </button>

        <select
          onChange={(e) => handleLoad(e.target.value)}
          className="px-3 py-2 rounded text-black"
        >
          <option value="">📂 Load Design</option>
          {savedNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
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

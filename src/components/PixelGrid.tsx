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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedNames(Object.keys(parsed));
    }
  }, []);

  const handleSave = () => {
    if (!designName.trim()) return;
    const confirmed = confirm(`Overwrite design "${designName}" if it already exists?`);
    if (!confirmed) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const allDesigns = saved ? JSON.parse(saved) : {};
    allDesigns[designName] = pixels;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDesigns));
    setSavedNames(Object.keys(allDesigns));
    alert(`Saved "${designName}" successfully!`);
    setDesignName("");
  };

  const handleLoad = (name: string) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const allDesigns = JSON.parse(saved);
    setPixels(allDesigns[name]);
  };

  const handleDelete = (name: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const allDesigns = JSON.parse(saved);
    delete allDesigns[name];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDesigns));
    setSavedNames(Object.keys(allDesigns));
    alert(`Deleted "${name}"`);
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

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-8 gap-1 p-2 bg-white">
        {pixels.map((color, index) => (
          <div
            key={index}
            onClick={() => handlePixelClick(index)}
            className="w-8 h-8 border cursor-pointer transition-all duration-150"
            style={{
              backgroundColor: color || "white",
              ...(color === ""
                ? {
                    backgroundImage: `linear-gradient(${selectedColor}, ${selectedColor})`,
                    backgroundSize: "0% 0%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }
                : {}),
            }}
            onMouseEnter={(e) => {
              if (pixels[index] === "") {
                e.currentTarget.style.backgroundSize = "100% 100%";
                e.currentTarget.style.boxShadow = `0 0 4px 2px ${selectedColor}80`;
              }
            }}
            onMouseLeave={(e) => {
              if (pixels[index] === "") {
                e.currentTarget.style.backgroundSize = "0% 0%";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          ></div>
        ))}
      </div>

      {/* Save/Load UI */}
      <div className="flex flex-col items-center gap-2">
        <input
          type="text"
          placeholder="e.g., smiley"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="px-3 py-2 rounded border text-black"
        />
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded text-white ${designName.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!designName.trim()}
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

        {savedNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {savedNames.map((name) => (
              <button
                key={name}
                onClick={() => handleDelete(name)}
                className="bg-red-500 hover:bg-red-700 text-white text-sm px-2 py-1 rounded"
              >
                Delete {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
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

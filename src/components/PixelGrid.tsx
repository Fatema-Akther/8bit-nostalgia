import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const defaultGridSize = 8;

const PixelGrid = () => {
  const STORAGE_KEY = "pixel-art-saves";
  const [gridSize, setGridSize] = useState(defaultGridSize);
  const [pixels, setPixels] = useState<string[]>(Array(defaultGridSize * defaultGridSize).fill(""));
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [designName, setDesignName] = useState<string>("");
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedNames(Object.keys(parsed));
    }
  }, []);

  useEffect(() => {
    setPixels(Array(gridSize * gridSize).fill(""));
  }, [gridSize]);

  const pushToUndoStack = () => {
    setUndoStack((prev) => [...prev, [...pixels]]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, [...pixels]]);
    setPixels(lastState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, [...pixels]]);
    setPixels(nextState);
  };

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
    pushToUndoStack();
    setPixels(Array(gridSize * gridSize).fill(""));
  };

  const handleMirror = () => {
    pushToUndoStack();
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
    pushToUndoStack();
    const updated = [...pixels];
    updated[index] = updated[index] === selectedColor ? "" : selectedColor;
    setPixels(updated);
    setFocusedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (focusedIndex === null) return;
    let newIndex = focusedIndex;
    if (e.key === "ArrowRight" && (focusedIndex + 1) % gridSize !== 0) newIndex++;
    else if (e.key === "ArrowLeft" && focusedIndex % gridSize !== 0) newIndex--;
    else if (e.key === "ArrowDown" && focusedIndex + gridSize < pixels.length) newIndex += gridSize;
    else if (e.key === "ArrowUp" && focusedIndex - gridSize >= 0) newIndex -= gridSize;

    if (newIndex !== focusedIndex) {
      e.preventDefault();
      setFocusedIndex(newIndex);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 max-w-screen-sm mx-auto">
      {/* Grid size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label className="text-white font-medium">🧩 Grid Size:</label>
        <select
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          className="px-2 py-1 rounded text-sm text-black"
        >
          <option value={8}>8 × 8</option>
          <option value={16}>16 × 16</option>
          <option value={32}>32 × 32</option>
        </select>
        <small className="text-xs text-gray-300">(Changing size clears current art)</small>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-3">
        <label className="text-white font-medium">🎨 Pick Color:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 rounded"
          aria-label="Pick drawing color"
        />
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid gap-[2px] sm:gap-1 p-1 sm:p-2 bg-white shadow-md"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Pixel drawing canvas"
      >
        {pixels.map((color, index) => (
          <div
            key={index}
            role="button"
            aria-label={`Pixel ${index + 1}`}
            tabIndex={0}
            onClick={() => handlePixelClick(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePixelClick(index);
            }}
            className={`w-6 h-6 sm:w-8 sm:h-8 border border-gray-300 cursor-pointer transition-all duration-150 ease-in-out outline-none ${focusedIndex === index ? "ring-2 ring-blue-400" : ""}`}
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
          className="w-48 sm:w-64 px-3 py-2 rounded border text-sm text-black"
          aria-label="Design name input"
        />
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded text-white ${designName.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
          disabled={!designName.trim()}
          aria-label="Save design"
        >
          Save As 💾
        </button>
        <select
          onChange={(e) => handleLoad(e.target.value)}
          className="w-48 sm:w-64 px-3 py-2 rounded text-sm text-black"
          aria-label="Load saved design"
        >
          <option value="">📂 Load Design</option>
          {savedNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {savedNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {savedNames.map((name) => (
              <button
                key={name}
                onClick={() => handleDelete(name)}
                className="bg-red-500 hover:bg-red-700 text-white text-sm px-2 py-1 rounded"
                aria-label={`Delete ${name}`}
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
          aria-label="Mirror design"
        >
          Mirror ↔️
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          aria-label="Clear canvas"
        >
          Clear ❌
        </button>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          aria-label="Export image"
        >
          Export 📸
        </button>
        <button
          onClick={handleUndo}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          aria-label="Undo"
        >
          Undo ↩️
        </button>
        <button
          onClick={handleRedo}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
          aria-label="Redo"
        >
          Redo ↪️
        </button>
      </div>
    </div>
  );
};

export default PixelGrid;

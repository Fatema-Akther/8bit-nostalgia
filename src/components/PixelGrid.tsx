import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const defaultGridSize = 8;

const clickSound = new Audio("/assets/click.wav.mp3");

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
    clickSound.play();
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
    <div className="font-retro text-retro text-white bg-black min-h-screen w-full p-4 flex flex-col items-center crt-frame">
      <h1 className="font-retro text-xl text-retroAccent text-retro-glow mb-4 pb-2 border-b-2 border-retroBorder">
        🎮 8-bit Pixel Art Maker
      </h1>
      <div className="flex gap-2 mb-4">
        <select
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          className="bg-pink-700 px-2 py-1 rounded text-sm"
        >
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
        </select>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 border border-white"
        />
      </div>

      <div
        ref={gridRef}
        className="grid gap-[2px] p-2 bg-gray-800 pixelated"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {pixels.map((color, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handlePixelClick(index)}
            className={`w-6 h-6 border border-gray-400 cursor-pointer ${
              focusedIndex === index ? "ring-2 ring-yellow-300" : ""
            }`}
            style={{ backgroundColor: color || "#111" }}
          ></div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={handleMirror} className="bg-purple-800 hover:bg-purple-600 px-3 py-1 rounded">
          ↔ Mirror
        </button>
        <button onClick={handleClear} className="bg-red-700 hover:bg-red-500 px-3 py-1 rounded">
          🧹 Clear
        </button>
        <button onClick={handleExport} className="bg-blue-700 hover:bg-blue-500 px-3 py-1 rounded">
          📷 Export
        </button>
      </div>

      <div className="mt-6 w-full max-w-sm">
        <input
          type="text"
          placeholder="Design name..."
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="w-full px-3 py-1 rounded text-black"
        />
        <button
          onClick={handleSave}
          className="bg-green-700 hover:bg-green-500 text-white w-full mt-2 py-1 rounded"
        >
          💾 Save
        </button>
        <select onChange={(e) => handleLoad(e.target.value)} className="w-full mt-2 px-2 py-1 text-black">
          <option value="">📁 Load</option>
          {savedNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-2">
          {savedNames.map((name) => (
            <button
              key={name}
              onClick={() => handleDelete(name)}
              className="bg-red-600 hover:bg-red-400 text-xs px-2 py-1 rounded"
            >
              🗑️ {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelGrid;

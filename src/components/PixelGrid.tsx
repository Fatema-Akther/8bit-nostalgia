import { useState } from "react";

const PixelGrid = () => {
  const gridSize = 8;
  const totalPixels = gridSize * gridSize;

  const [pixels, setPixels] = useState(Array(totalPixels).fill(false));

  const togglePixel = (index: number) => {
    const updated = [...pixels];
    updated[index] = !updated[index];
    setPixels(updated);
  };

  return (
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
  );
};

export default PixelGrid;

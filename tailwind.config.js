/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        retro: "#0a0f1b",
        retroBorder: "#ff00cc",
        retroAccent: "#00ffff",
      },
    },
  },
  // tailwind.config.js
plugins: [
  function ({ addUtilities }) {
    addUtilities({
      '.pixelated': {
        'image-rendering': 'pixelated',
      },
      '.crt-frame': {
        border: '4px double #00ffff',
        boxShadow: '0 0 10px #0ff, inset 0 0 20px #0ff',
        padding: '1rem',
      },
      '.text-retro-glow': {
        textShadow: '0 0 4px #0ff, 0 0 8px #0ff, 0 0 12px #0ff',
      },
    });
  },
],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'racing-green': '#1a472a',
        'racing-gold': '#d4af37',
        'track-brown': '#8b4513',
      },
      animation: {
        'race': 'race linear',
      },
      keyframes: {
        race: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(100% - 80px))' },
        }
      }
    },
  },
  plugins: [],
}

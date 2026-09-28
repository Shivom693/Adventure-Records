/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#09090b',
          darker: '#040406',
          card: '#121215',
          accent: '#7c3aed', // Single subtle accent color (Refined Violet)
          purple: '#8b5cf6',
          blue: '#a1a1aa', // Muted off-white
          cyan: '#a1a1aa', // Muted off-white
          pink: '#8b5cf6',
        }
      },
      fontFamily: {
        orbitron: ['Outfit', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 0.4 }
        }
      }
    },
  },
  plugins: [],
}

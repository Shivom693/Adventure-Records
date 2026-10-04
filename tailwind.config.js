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
          dark: '#0c0b1a',
          darker: '#080714',
          card: '#13112a',
          accent: '#585589',
          purple: '#585589',
          blue: '#a09dbd',
          cyan: '#a09dbd',
          pink: '#6e6ba0',
          primary: '#585589',
          secondary: '#DEDCFF',
          text: '#050315',
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

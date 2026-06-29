/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbf7',
          100: '#e3f6eb',
          200: '#cbeedd',
          300: '#a3dfc4',
          400: '#71c8a4',
          500: '#46ab82',
          600: '#348d68',
          700: '#2b7155',
          800: '#245a45',
          900: '#1e4b3b',
          950: '#0f2b22', // deep dark forest
          gold: {
            50: '#fbfbf7',
            100: '#f6f4e8',
            200: '#eae4c5',
            300: '#d9cd95',
            400: '#c5b163',
            500: '#b49c47',
            600: '#9d833b',
            700: '#826832',
            800: '#69532d',
            900: '#584528',
            950: '#382b18', // rich gold
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

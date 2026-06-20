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
          teal: '#14b8a6',
          sky: '#38bdf8',
          violet: '#818cf8',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        kr: ['Noto Sans KR', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          50: '#f4f6fa',
          100: '#e5eaf3',
          500: '#1e3a8a',
          600: '#1e293b',
          700: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#1e40af',
        accent: '#3b82f6',
        dark: {
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#1b2559',
        'brand-gold': '#e8c4a0',
        'brand-cream': '#fdfbf2',
      }
    },
  },
  plugins: [],
}
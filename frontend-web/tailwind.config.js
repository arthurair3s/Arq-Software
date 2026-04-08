/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ifoodRed: '#ea1d2c',
        ifoodRedDark: '#b91322',
        ifoodBg: '#f7f7f7',
      }
    },
  },
  plugins: [],
}

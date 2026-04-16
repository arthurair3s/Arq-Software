/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#ea1d2c',
        brandRedDark: '#b91322',
        brandBg: '#f7f7f7',
      }
    },
  },
  plugins: [],
}

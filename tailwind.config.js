/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dmart: {
          green: "#0b8a44",
          lightGreen: "#e8f7ee",
          darkGreen: "#075e2e",
          accent: "#ff9900",
          yellow: "#ffd966",
        }
      }
    },
  },
  plugins: [],
}

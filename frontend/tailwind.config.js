/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#effaf5",
          100: "#d9f3e7",
          200: "#b6e7d1",
          300: "#86d7b7",
          400: "#4fc699",
          500: "#2ab483",
          600: "#1e976f",
          700: "#197a5c",
          800: "#155f4a",
          900: "#0f4d3d"
        }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.05)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"]
      }
    }
  },
  plugins: [],
};

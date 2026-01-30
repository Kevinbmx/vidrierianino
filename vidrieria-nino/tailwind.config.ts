const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/dist/**/*.js",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // azul intenso
        secondary: "#0F172A", // fondo oscuro
        coral: "#EF4444", // rojo coral
        whatsapp: "#25D366",
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "gray-600": "#64748B",
        "gray-800": "#1E293B",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    },
  },
  plugins: [heroui({})],
};
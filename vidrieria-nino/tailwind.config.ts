const { heroui } = require("@heroui/react");


/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/react/dist/**/*.js",
    // './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: 'class',
  // plugins: [heroui()],
  plugins: [
    heroui({}),
  ],
}
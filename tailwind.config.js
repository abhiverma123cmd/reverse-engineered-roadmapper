/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          50: "#eef4ff",
          100: "#dce7fd",
          200: "#c0d4fc",
          300: "#94b8fa",
          400: "#617ff6",
          500: "#3f57ef",
          600: "#2b3fe3",
          700: "#2333c8",
          800: "#222ea1",
          900: "#202c7f",
        },
      },
    },
  },
  plugins: [],
};

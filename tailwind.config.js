/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1A237E",
        "slate-gray": "#37474F",
        teal: {
          DEFAULT: "#00BFA5",
          500: "#00BFA5",
          600: "#00A994",
        },
        cyan: {
          400: "#26C6DA",
        },
        white: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

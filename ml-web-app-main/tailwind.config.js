const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "system-ui",
          "segoe ui",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        32: "32px",
        11: "11px",
      },
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#3861fb",
          800: "#075985",
          900: "#0c4a6e",
        },
        blue: {
          700: "#3861fb",
        },
        border: {
          light: "#eff2f5",
        },
        green: {
          500: "rgb(22, 199, 132)",
        },
        gray: {
          200: "#EFF2F5",
          500: "#616E85",
        },
        red: {
          500: "rgb(234, 57, 67)",
        },
        black: {
          100: "#0D1421",
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge /
        "-ms-overflow-style": "none",
        / Firefox /
        "scrollbar-width": "none",
        / Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },

        ".scrollbar-light": {
          "&::-webkit-scrollbar": {
            width: "5px",
            marginTop: "10px",
            height: "6px",
            background: "transparent",
            border: "4px solid transparent",
            borderRadius: "8px",
            cursor: "pointer",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#3eb368",
            border: "4px solid transparent",
            borderRadius: "8px",
            backgroundClip: "paddingBox",
          },
        },

        ".scrollbar-dark": {
          "&::-webkit-scrollbar": {
            width: "5px",
            marginTop: "10px",
            height: "6px",
            background: "#1E222D",
            border: "4px solid transparent",
            borderRadius: "8px",
            cursor: "pointer",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#2A2E39",
            border: "4px solid transparent",
            borderRadius: "8px",
            backgroundClip: "paddingBox",
          },
        },
      });
    }),
  ],
};

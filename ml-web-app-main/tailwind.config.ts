import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%, 100%": {
            opacity: "1",
            filter:
              "brightness(1) drop-shadow(0 0 5px #FFE600) drop-shadow(0 0 10px #FFE600)",
          },
          "50%": {
            opacity: "1",
            filter:
              "brightness(1.3) drop-shadow(0 0 10px #FFE600) drop-shadow(0 0 20px #FFE600)",
          },
        },
        slideIn: {
          "0%": { transform: "translateY(20px) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        slideIn: "slideIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

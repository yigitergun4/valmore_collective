import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ef",
          100: "#e8efe6",
          200: "#d1dfcd",
          300: "#a9c3a3",
          400: "#7fa375",
          500: "#55764F",
          600: "#4a6644",
          700: "#3d5538",
          800: "#32452e",
          900: "#2a3926",
        },
      },
    },
  },
  plugins: [],
};

export default config;

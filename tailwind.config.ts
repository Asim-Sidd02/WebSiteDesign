import type { Config } from "tailwindcss";
const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Peacock & brass: calm, trustworthy teal with a restrained champagne-brass accent.
        // (Token kept as "lotus" so class names stay stable.)
        paper: "#fbf8f1",
        sand: "#f2ebdd",
        ink: "#0c1f22",
        lotus: { 400: "#d8bc8a", 500: "#b8925a", 600: "#7f6235" },
        brand: {
          50: "#e7f5f3",
          100: "#c6e9e4",
          500: "#0e8577",
          600: "#0a6c62",
          700: "#0a5750",
          800: "#0b3a37",
          950: "#051615",
        },
        coral: { 400: "#ff8a6b", 500: "#f2674a" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
});

export default config;

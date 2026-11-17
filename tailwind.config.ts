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
        paper: "#faf7f2",
        sand: "#f1ebe1",
        ink: "#14122b",
        saffron: { 400: "#f4b24a", 500: "#e8913a", 600: "#c26f1f" },
        brand: {
          50: "#eeeefd",
          100: "#dedcfb",
          500: "#2F2FE4",
          600: "#2424c4",
          700: "#162E93",
          800: "#1A1953",
          950: "#080616",
        },
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

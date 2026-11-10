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
        brand: {
          500: "#2F2FE4",
          700: "#162E93",
          800: "#1A1953",
          950: "#080616",
        },
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } },
        glow: { "0%,100%": { opacity: "0.45" }, "50%": { opacity: "0.8" } },
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        glow: "glow 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "fade-up": "fadeUp 0.9s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
});

export default config;

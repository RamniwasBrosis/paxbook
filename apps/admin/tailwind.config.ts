import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { darkTheme } from "../../packages/ui/tailwind-dark";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1A3C8C",
          dark: "#0F2657",
          light: "#E9EEF9",
        },
        accent: {
          DEFAULT: "#F0A93A",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Full dark theme: remaps light colour names per utility (see packages/ui/tailwind-dark.ts).
      ...darkTheme(colors),
    },
  },
  plugins: [],
};

export default config;

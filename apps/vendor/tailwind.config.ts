import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { darkTheme, themeVars } from "../../packages/ui/tailwind-dark";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f766e",
          dark: "#0b5750",
          light: "#e6f5f3",
        },
        accent: {
          DEFAULT: "#d97706",
        },
      },
      // Full dark theme: remaps light colour names per utility (see packages/ui/tailwind-dark.ts).
      ...darkTheme(colors),
    },
  },
  // Dark (default) and light palettes as CSS variables; <html data-theme="light"> switches.
  plugins: [themeVars(colors, { dark: { "--brand-solid": "15 118 110", "--brand-text": "94 234 212" }, light: { "--brand-solid": "15 118 110", "--brand-text": "15 118 110" } })],
};

export default config;

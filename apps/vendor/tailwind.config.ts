import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import { darkTheme } from "../../packages/ui/tailwind-dark";

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
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--tenant-primary, #19377f)",
          dark: "var(--tenant-primary-dark, #0b2050)",
          light: "var(--tenant-primary-light, #e6f0fa)",
        },
        "navy-deep": "#0b2050",
        "brand-blue": "#2f6fcb",
        "brand-blue-soft": "#d9eafd",
        accent: {
          DEFAULT: "#f1ba4b",
          dark: "#db940e",
        },
        mist: {
          DEFAULT: "#f3f8fd",
          strong: "#e6f0fa",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-jakarta)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        premium: "0 20px 40px -12px rgb(15 23 42 / 0.15)",
        glow: "0 0 0 8px rgb(241 186 75 / 0.22)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fly: {
          "0%, 100%": { transform: "translate(-8%, 0) rotate(0deg)" },
          "50%": { transform: "translate(8%, -10px) rotate(-3deg)" },
        },
        runway: {
          "0%": { backgroundPositionX: "0px" },
          "100%": { backgroundPositionX: "-32px" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        fly: "fly 2.4s ease-in-out infinite",
        runway: "runway 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

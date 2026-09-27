import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--tenant-primary, #1b3f8f)",
          dark: "var(--tenant-primary-dark, #122a63)",
          light: "var(--tenant-primary-light, #e8eefb)",
        },
        "navy-deep": "#122a63",
        "brand-blue": "#2f6fc2",
        "brand-blue-soft": "#dbe7fb",
        accent: {
          DEFAULT: "#f5b73d",
          dark: "#d99417",
          // Gold that still reads as text on white (AA at 16px+ bold); the fill gold above fails as text.
          ink: "#a86a06",
        },
        mist: {
          DEFAULT: "#f4f7fd",
          strong: "#e8eefb",
        },
        // Design 2 surfaces: warm cream for hero/footer bands, sand behind the destination arches.
        cream: "#f7f4ea",
        sand: {
          DEFAULT: "#fbf7ee",
          frame: "#efe3c8",
        },
        // Body copy on white/cream — #51628f clears 4.5:1 on both.
        ink: {
          DEFAULT: "#122a63",
          muted: "#51628f",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-jakarta)", "ui-sans-serif", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        premium: "0 20px 40px -12px rgb(15 23 42 / 0.15)",
        glow: "0 0 0 8px rgb(245 183 61 / 0.22)",
        soft: "0 12px 30px -20px rgb(18 42 99 / 0.35)",
        card: "0 16px 34px -22px rgb(18 42 99 / 0.4)",
        float: "0 26px 50px -28px rgb(18 42 99 / 0.45)",
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

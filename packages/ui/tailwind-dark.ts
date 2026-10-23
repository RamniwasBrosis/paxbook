/**
 * Site-wide dark theme, shared by the user site and the admin panel.
 *
 * Instead of rewriting every className, the light-theme colour names are remapped per utility:
 * `bg-white` is a dark surface, `text-navy-deep` / `text-slate-900` are near-white ink, grey borders
 * are faint light lines, and pastel badge fills (`bg-emerald-50`) become tinted glows with lighter
 * text. `text-white` and photo overlays keep their meaning. The surface/ink values are CSS variables
 * (see globals.css), so a yellow button can flip its ink back to dark and print can restore light.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const line = (a: number) => `rgb(255 255 255 / ${a})`;

const HUES = [
  "red",
  "rose",
  "orange",
  "amber",
  "yellow",
  "green",
  "emerald",
  "teal",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
] as const;
type Shades = Record<string, string>;
const rgba = (h: string, a: number) => {
  const n = parseInt(h.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`;
};

/** Pass Tailwind's default palette (`import colors from "tailwindcss/colors"`) from the app config. */
export function darkTheme(colors: object) {
  const tintBg: Record<string, Shades> = {};
  const tintText: Record<string, Shades> = {};
  const tintBorder: Record<string, Shades> = {};
  for (const hue of HUES) {
    const c = (colors as Record<string, Shades>)[hue]!;
    tintBg[hue] = {
      50: rgba(c["500"]!, 0.12),
      100: rgba(c["500"]!, 0.18),
      200: rgba(c["500"]!, 0.26),
    };
    // Dark text shades meant for white backgrounds turn into their light counterparts.
    tintText[hue] = {
      600: c["400"]!,
      700: c["300"]!,
      800: c["300"]!,
      900: c["200"]!,
    };
    tintBorder[hue] = {
      100: rgba(c["400"]!, 0.25),
      200: rgba(c["400"]!, 0.35),
      300: rgba(c["400"]!, 0.45),
    };
  }

  return {
    backgroundColor: {
      white: v("surface"),
      mist: { DEFAULT: v("surface-2"), strong: v("surface-3") },
      cream: v("band"),
      sand: { DEFAULT: v("band"), frame: v("surface-3") },
      "navy-deep": v("navy-solid"),
      "brand-blue-soft": v("surface-3"),
      brand: {
        DEFAULT: v("brand-solid"),
        dark: v("navy-solid"),
        light: v("surface-3"),
      },
      slate: {
        50: v("surface-2"),
        100: v("surface-2"),
        200: v("surface-3"),
        300: "rgb(60 72 112)",
        400: "rgb(93 106 140)",
        900: v("brand-solid"),
      },
      ...tintBg,
    },
    textColor: {
      "navy-deep": v("ink"),
      ink: { DEFAULT: v("ink"), muted: v("ink-muted") },
      brand: {
        DEFAULT: v("brand-text"),
        dark: v("brand-text"),
        light: v("ink"),
      },
      "brand-blue": v("brand-text"),
      accent: { ink: "#f5b73d" },
      slate: {
        200: "rgb(60 72 112)",
        300: "rgb(93 106 140)",
        400: "rgb(127 139 171)",
        500: "rgb(154 166 194)",
        600: "rgb(180 192 214)",
        700: "rgb(203 213 225)",
        800: v("ink"),
        900: v("ink"),
      },
      ...tintText,
    },
    borderColor: {
      white: line(0.9),
      "navy-deep": "rgb(226 232 240)",
      brand: { DEFAULT: "rgb(92 140 220)" },
      "brand-blue": "rgb(111 159 232)",
      sand: { frame: line(0.12) },
      slate: {
        50: line(0.05),
        100: line(0.07),
        200: line(0.1),
        300: line(0.16),
        400: line(0.24),
        900: "rgb(226 232 240)",
      },
      ...tintBorder,
    },
    divideColor: { slate: { 100: line(0.07), 200: line(0.1) } },
    ringColor: {
      "navy-deep": "rgb(226 232 240)",
      slate: { 900: "rgb(226 232 240)" },
    },
    gradientColorStops: {
      white: v("surface"),
      mist: { DEFAULT: v("surface-2"), strong: v("surface-3") },
      "brand-light": v("surface-3"),
      "brand-blue-soft": v("surface-3"),
    },
    boxShadow: {
      sm: "0 1px 2px rgb(0 0 0 / 0.4)",
      md: "0 8px 20px -8px rgb(0 0 0 / 0.55)",
      lg: "0 16px 36px -12px rgb(0 0 0 / 0.6)",
      premium: "0 20px 40px -12px rgb(0 0 0 / 0.55)",
      glow: "0 0 0 8px rgb(245 183 61 / 0.22)",
      soft: "0 12px 30px -18px rgb(0 0 0 / 0.7)",
      card: "0 18px 36px -20px rgb(0 0 0 / 0.75)",
      float: "0 30px 60px -28px rgb(0 0 0 / 0.8)",
    },
  };
}

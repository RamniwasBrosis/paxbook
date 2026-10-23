/**
 * Site-wide dark + light theme, shared by the user site, the admin panel and the vendor portal.
 *
 * Instead of rewriting every className, the colour names the pages already use are remapped per
 * utility to CSS variables: `bg-white` is the card surface, `text-navy-deep` / `text-slate-900` the
 * ink, grey borders a faint line, pastel badge text a readable tint. `themeVars` (a Tailwind plugin)
 * defines those variables twice: dark on :root (the default) and the original light palette under
 * `[data-theme="light"]`, so switching theme is one attribute on <html>. Printing always uses light.
 */
type Shades = Record<string, string>;
type CssRule = { [key: string]: string | CssRule };

const HUES = ["red", "rose", "orange", "amber", "yellow", "green", "emerald", "teal", "sky", "blue", "indigo", "violet", "purple"] as const;
const TINT_TEXT = ["600", "700", "800", "900"] as const;

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const line = (a: number) => `rgb(var(--line) / ${a})`;
const ch = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const rgba = (hex: string, a: number) => `rgb(${ch(hex)} / ${a})`;
const shades = (colors: object, hue: string) => (colors as Record<string, Shades>)[hue]!;

/** Utility remaps for theme.extend. Pass Tailwind's palette: `import colors from "tailwindcss/colors"`. */
export function darkTheme(colors: object) {
  const tintBg: Record<string, Shades> = {};
  const tintText: Record<string, Shades> = {};
  const tintBorder: Record<string, Shades> = {};
  for (const hue of HUES) {
    const c = shades(colors, hue);
    // A 500 wash reads as a pastel on white and as a soft glow on navy, so it needs no variable.
    tintBg[hue] = { 50: rgba(c["500"]!, 0.12), 100: rgba(c["500"]!, 0.18), 200: rgba(c["500"]!, 0.26) };
    tintText[hue] = Object.fromEntries(TINT_TEXT.map((s) => [s, v(`${hue}-${s}`)]));
    tintBorder[hue] = { 100: rgba(c["400"]!, 0.3), 200: rgba(c["400"]!, 0.4), 300: rgba(c["400"]!, 0.5) };
  }
  const slateText = Object.fromEntries(["200", "300", "400", "500", "600", "700"].map((s) => [s, v(`slate-${s}`)]));

  return {
    backgroundColor: {
      white: v("surface"),
      mist: { DEFAULT: v("surface-2"), strong: v("surface-3") },
      cream: v("band"),
      sand: { DEFAULT: v("band-2"), frame: v("sand-frame") },
      "navy-deep": v("navy-solid"),
      "brand-blue-soft": v("blue-soft"),
      brand: { DEFAULT: v("brand-solid"), dark: v("navy-solid"), light: v("surface-3") },
      slate: { 50: v("surface-2"), 100: v("surface-2"), 200: v("surface-3"), 300: v("slate-bg-300"), 400: v("slate-bg-400"), 900: v("btn-dark") },
      ...tintBg,
    },
    textColor: {
      "navy-deep": v("ink"),
      ink: { DEFAULT: v("ink"), muted: v("ink-muted") },
      brand: { DEFAULT: v("brand-text"), dark: v("brand-text"), light: v("ink") },
      "brand-blue": v("blue-text"),
      accent: { ink: v("accent-ink") },
      slate: { ...slateText, 800: v("ink"), 900: v("ink") },
      ...tintText,
    },
    borderColor: {
      white: v("frame"),
      "navy-deep": v("strong-line"),
      brand: { DEFAULT: v("brand-line") },
      "brand-blue": v("blue-line"),
      sand: { frame: v("sand-line") },
      slate: { 50: line(0.05), 100: line(0.07), 200: line(0.1), 300: line(0.16), 400: line(0.24), 900: v("strong-line") },
      ...tintBorder,
    },
    divideColor: { slate: { 100: line(0.07), 200: line(0.1) } },
    ringColor: { "navy-deep": v("strong-line"), slate: { 900: v("strong-line") } },
    gradientColorStops: {
      white: v("surface"),
      mist: { DEFAULT: v("surface-2"), strong: v("surface-3") },
      "brand-light": v("surface-3"),
      "brand-blue-soft": v("blue-soft"),
    },
    boxShadow: {
      sm: "0 1px 2px rgb(var(--shadow) / calc(var(--shadow-a) * 0.5))",
      md: "0 8px 20px -8px rgb(var(--shadow) / var(--shadow-a))",
      lg: "0 16px 36px -12px rgb(var(--shadow) / var(--shadow-a))",
      premium: "0 20px 40px -12px rgb(var(--shadow) / var(--shadow-a))",
      glow: "0 0 0 8px rgb(245 183 61 / 0.22)",
      soft: "0 12px 30px -18px rgb(var(--shadow) / var(--shadow-a))",
      card: "0 18px 36px -20px rgb(var(--shadow) / var(--shadow-a))",
      float: "0 30px 60px -28px rgb(var(--shadow) / var(--shadow-a))",
    },
  };
}

/** The two palettes as CSS variables (a Tailwind plugin). `brand` overrides let an app keep its own brand colour. */
export function themeVars(colors: object, brand?: { dark?: Record<string, string>; light?: Record<string, string> }) {
  const slate = shades(colors, "slate");
  const dark: Record<string, string> = {
    "color-scheme": "dark",
    "--page": "7 13 31",
    "--surface": "15 26 53",
    "--surface-2": "21 34 70",
    "--surface-3": "29 45 90",
    "--band": "10 19 44",
    "--band-2": "10 19 44",
    "--sand-frame": "29 45 90",
    "--blue-soft": "29 45 90",
    "--ink": "238 242 255",
    "--ink-muted": "169 181 210",
    "--navy-solid": "35 64 143",
    "--brand-solid": "47 111 194",
    "--brand-text": "125 166 240",
    "--blue-text": "125 166 240",
    "--accent-ink": "245 183 61",
    "--btn-dark": "47 111 194",
    "--line": "255 255 255",
    "--frame": "255 255 255",
    "--strong-line": "226 232 240",
    "--brand-line": "92 140 220",
    "--blue-line": "111 159 232",
    "--sand-line": "54 68 110",
    "--slate-bg-300": "60 72 112",
    "--slate-bg-400": "93 106 140",
    "--slate-200": "60 72 112",
    "--slate-300": "93 106 140",
    "--slate-400": "127 139 171",
    "--slate-500": "154 166 194",
    "--slate-600": "180 192 214",
    "--slate-700": "203 213 225",
    "--shadow": "0 0 0",
    "--shadow-a": "0.7",
    ...brand?.dark,
  };
  const light: Record<string, string> = {
    "color-scheme": "light",
    "--page": "255 255 255",
    "--surface": "255 255 255",
    "--surface-2": "244 247 253",
    "--surface-3": "232 238 251",
    "--band": "247 244 234",
    "--band-2": "251 247 238",
    "--sand-frame": "239 227 200",
    "--blue-soft": "219 231 251",
    "--ink": "18 42 99",
    "--ink-muted": "81 98 143",
    "--navy-solid": "18 42 99",
    "--brand-solid": "27 63 143",
    "--brand-text": "27 63 143",
    "--blue-text": "47 111 194",
    "--accent-ink": "168 106 6",
    "--btn-dark": "15 23 42",
    "--line": "15 23 42",
    "--frame": "255 255 255",
    "--strong-line": "18 42 99",
    "--brand-line": "27 63 143",
    "--blue-line": "47 111 194",
    "--sand-line": "239 227 200",
    "--slate-bg-300": ch(slate["300"]!),
    "--slate-bg-400": ch(slate["400"]!),
    ...Object.fromEntries(["200", "300", "400", "500", "600", "700"].map((s) => [`--slate-${s}`, ch(slate[s]!)])),
    "--shadow": "18 42 99",
    "--shadow-a": "0.35",
    ...brand?.light,
  };
  // Pastel badge text: on dark the light counterpart (600 → 400 …), on light the original shade.
  const darkShade: Record<string, string> = { "600": "400", "700": "300", "800": "300", "900": "200" };
  for (const hue of HUES) {
    const c = shades(colors, hue);
    for (const s of TINT_TEXT) {
      dark[`--${hue}-${s}`] = ch(c[darkShade[s]!]!);
      light[`--${hue}-${s}`] = ch(c[s]!);
    }
  }

  // Method syntax keeps the parameter check bivariant, so Tailwind's PluginAPI fits without importing its types.
  return ({ addBase }: { addBase(css: CssRule): void }) => {
    addBase({
      ":root": dark,
      '[data-theme="light"]': light,
      "@media print": { ":root, [data-theme]": light },
    });
  };
}

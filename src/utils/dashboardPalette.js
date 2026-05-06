// ================================================================
// Zyrix FinSuite — Dashboard Brand Palette
// 13 hue palettes (wine + 12) with semantic helpers + AR locale swap
// ================================================================

export const BRAND = {
  wineRed:    "#E30A17",
  wineDeep:   "#A8081A",
  wine950:    "#0F0103",
  wineCream:  "#FEF2F2",
  saudiGreen: "#006C35",
  saudiDeep:  "#003D1D",
  saudiCream: "#E6FBF5",
};

export const PALETTE_HUES = [
  { id: "wine",    bg: "#FEF2F2", base: "#E30A17", dark: "#A8081A", chart: "#F87171" },
  { id: "gold",    bg: "#FFFBE5", base: "#D4A017", dark: "#92400E", chart: "#FBBF24" },
  { id: "emerald", bg: "#E6FBF5", base: "#10B981", dark: "#047857", chart: "#34D399" },
  { id: "cyan",    bg: "#E0F7FF", base: "#0EA5E9", dark: "#0369A1", chart: "#38BDF8" },
  { id: "purple",  bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8", chart: "#8B5CF6" },
  { id: "violet",  bg: "#EDE9FE", base: "#8B5CF6", dark: "#5B21B6", chart: "#A78BFA" },
  { id: "rose",    bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239", chart: "#FB7185" },
  { id: "amber",   bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309", chart: "#FBBF24" },
  { id: "teal",    bg: "#DEFAF6", base: "#14B8A6", dark: "#115E59", chart: "#2DD4BF" },
  { id: "indigo",  bg: "#EAEDFF", base: "#6366F1", dark: "#3730A3", chart: "#818CF8" },
  { id: "orange",  bg: "#FFEEDD", base: "#F97316", dark: "#C2410C", chart: "#FB923C" },
  { id: "lime",    bg: "#F0FDD0", base: "#84CC16", dark: "#3F6212", chart: "#A3E635" },
  { id: "sky",     bg: "#E0F2FE", base: "#0284C7", dark: "#075985", chart: "#7DD3FC" },
];

// Adjacent-different palette by index — use in row/grid contexts
export function getCardPalette(idx = 0) {
  const i = ((Number(idx) || 0) % PALETTE_HUES.length + PALETTE_HUES.length) % PALETTE_HUES.length;
  return PALETTE_HUES[i];
}

// Lookup by id
export function getPaletteById(id) {
  return PALETTE_HUES.find((p) => p.id === id) || PALETTE_HUES[0];
}

// Semantic helpers — features always use the right hue
export function getAIPalette()       { return getPaletteById("purple"); }
export function getMoneyPalette()    { return getPaletteById("teal"); }
export function getCustomerPalette() { return getPaletteById("indigo"); }
export function getMarketPalette()   { return getPaletteById("orange"); }
export function getReportsPalette()  { return getPaletteById("sky"); }
export function getAlertPalette()    { return getPaletteById("rose"); }
export function getSuccessPalette()  { return getPaletteById("emerald"); }
export function getWarningPalette()  { return getPaletteById("amber"); }

// Brand palette — wine for TR/EN, Saudi green for AR
export function getBrandPalette(locale = "tr") {
  const l = String(locale || "").toLowerCase();
  if (l === "ar") {
    return {
      id:    "brand-ar",
      bg:    BRAND.saudiCream,
      base:  BRAND.saudiGreen,
      dark:  BRAND.saudiDeep,
      chart: "#34A268",
    };
  }
  return {
    id:    "brand-tr",
    bg:    BRAND.wineCream,
    base:  BRAND.wineRed,
    dark:  BRAND.wineDeep,
    chart: "#F87171",
  };
}

// Resolve a palette from a value that may be: undefined | id-string | palette-object
export function resolvePalette(input, fallbackIdx = 0) {
  if (!input) return getCardPalette(fallbackIdx);
  if (typeof input === "string") return getPaletteById(input);
  if (typeof input === "object" && input.base && input.bg) return input;
  return getCardPalette(fallbackIdx);
}

// Derive a sequence of palettes for a list of N items, ensuring adjacent-different.
// Optionally exclude certain hue ids (e.g., to avoid duplicating the brand color).
export function paletteSequence(count, { exclude = [], startIdx = 0 } = {}) {
  const pool = PALETTE_HUES.filter((p) => !exclude.includes(p.id));
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(startIdx + i) % pool.length]);
  }
  return out;
}

export default {
  BRAND,
  PALETTE_HUES,
  getCardPalette,
  getPaletteById,
  getAIPalette,
  getMoneyPalette,
  getCustomerPalette,
  getMarketPalette,
  getReportsPalette,
  getAlertPalette,
  getSuccessPalette,
  getWarningPalette,
  getBrandPalette,
  resolvePalette,
  paletteSequence,
};

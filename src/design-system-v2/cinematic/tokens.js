// ================================================================
// Cinematic design tokens — Sprint D-1 foundation.
// Inspired by Blade Runner 2049 / Dune / Tron Legacy / Mr. Robot.
// Dark canvas, neon accents, multi-layer glows.
//
// Scope for D-1: tokens are consumed only by /v2/_dev/foundation
// and /v2/_dev/charts showcase routes; existing V2 customer
// dashboard pages keep using src/design-system-v2/colors.js.
// ================================================================

export const CINEMATIC = {
  // Backgrounds — deeper than navy, layered for elevation.
  bg: {
    deepSpace1: '#0A0E27',  // primary
    deepSpace2: '#0D1230',  // secondary surface
    deepSpace3: '#131838'   // elevated surface
  },

  // Accent palette — five tones, each with a "glow" companion.
  accent: {
    cyan:         '#00D9FF',
    cyanGlow:     '#5DFAFF',
    plasmaViolet: '#9D4EDD',
    violetGlow:   '#C084FC',
    neonMint:     '#06FFA5',
    mintGlow:     '#5BFFC5',
    solarAmber:   '#FFB800',
    amberGlow:    '#FFD45C',
    crimsonGlow:  '#FF3D5A',
    crimsonDeep:  '#C92740'
  },

  // Text — pearl white tiers for primary/secondary/tertiary on dark.
  text: {
    pearlWhite: '#F8FAFC',
    pearlDim:   '#CBD5E1',
    pearlFaint: '#64748B'
  },

  // Glass tints — for backdrop-filter surfaces.
  glass: {
    tint1:        'rgba(255,255,255,0.05)',
    tint2:        'rgba(255,255,255,0.08)',
    tint3:        'rgba(255,255,255,0.12)',
    border:       'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.18)'
  },

  // RGB triples — exposed so shadows.js can build rgba() with arbitrary alpha.
  rgb: {
    cyan:    '0, 217, 255',
    violet:  '157, 78, 221',
    mint:    '6, 255, 165',
    amber:   '255, 184, 0',
    crimson: '255, 61, 90'
  }
};

// Map a tone keyword → its primary hex.
export const toneColor = (tone) => ({
  cyan:    CINEMATIC.accent.cyan,
  violet:  CINEMATIC.accent.plasmaViolet,
  mint:    CINEMATIC.accent.neonMint,
  amber:   CINEMATIC.accent.solarAmber,
  crimson: CINEMATIC.accent.crimsonGlow
})[tone] || CINEMATIC.accent.cyan;

// Map a tone keyword → its glow hex.
export const toneGlow = (tone) => ({
  cyan:    CINEMATIC.accent.cyanGlow,
  violet:  CINEMATIC.accent.violetGlow,
  mint:    CINEMATIC.accent.mintGlow,
  amber:   CINEMATIC.accent.amberGlow,
  crimson: CINEMATIC.accent.crimsonGlow
})[tone] || CINEMATIC.accent.cyanGlow;

// Map a tone keyword → its rgb triple (for rgba()).
export const toneRgb = (tone) => ({
  cyan:    CINEMATIC.rgb.cyan,
  violet:  CINEMATIC.rgb.violet,
  mint:    CINEMATIC.rgb.mint,
  amber:   CINEMATIC.rgb.amber,
  crimson: CINEMATIC.rgb.crimson
})[tone] || CINEMATIC.rgb.cyan;

// ─── Typography ────────────────────────────────────────────────
export const TYPE_STACK = {
  display: "'Geist', 'Inter', system-ui, -apple-system, sans-serif",
  body:    "'Inter', system-ui, -apple-system, sans-serif",
  mono:    "'JetBrains Mono', 'Geist Mono', ui-monospace, monospace"
};

export const TYPE_SCALE = {
  displayXl:  { fontSize: '4.5rem',    lineHeight: 1.0,  fontWeight: 700, letterSpacing: '-0.04em' },
  displayLg:  { fontSize: '3.5rem',    lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.03em' },
  displayMd:  { fontSize: '2.5rem',    lineHeight: 1.1,  fontWeight: 600, letterSpacing: '-0.02em' },
  headingLg:  { fontSize: '1.75rem',                      fontWeight: 600 },
  headingMd:  { fontSize: '1.25rem',                      fontWeight: 600 },
  bodyLg:     { fontSize: '1.0625rem',                    fontWeight: 400 },
  bodyMd:     { fontSize: '0.9375rem',                    fontWeight: 400 },
  caption:    { fontSize: '0.8125rem',                    fontWeight: 500, letterSpacing: '0.02em' }
};

// ─── Spacing & radii ──────────────────────────────────────────
export const SPACE  = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 48, '5xl': 64 };
export const RADIUS = { sm: 8, md: 12, lg: 14, xl: 18, '2xl': 22, full: 9999 };

// ─── Timings (used by spring presets and CSS keyframes) ──────
export const TIMING = {
  micro:   150,
  short:   250,
  medium:  400,
  long:    800,
  story:   1200,
  ambient: 24000   // background drift loops
};

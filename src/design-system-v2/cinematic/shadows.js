// ================================================================
// shadows.js — multi-layer glow shadow factories.
// Each glow is 3 stacked box-shadows: inner border-glow, mid halo,
// outer halo. Intensity 1-3 scales spread + alpha.
//
// Replaces the prompt's proposed Tailwind plugin (`shadow-glow-cyan`
// etc.) — repo has no Tailwind, so we expose JS factories instead.
// Consumed via inline `style={{ boxShadow: glowCyan(2) }}`.
// ================================================================
import { toneRgb } from './tokens';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function multiLayer(rgb, intensity = 2) {
  const i = clamp(Math.round(intensity), 1, 3);
  // Layer 1: inner crisp border-tinted ring
  const l1 = `0 0 0 1px rgba(${rgb}, ${0.18 + i * 0.06})`;
  // Layer 2: mid halo
  const mid    = 6 + i * 5;
  const l2     = `0 0 ${mid}px rgba(${rgb}, ${0.18 + i * 0.10})`;
  // Layer 3: outer halo
  const outer  = 18 + i * 10;
  const l3     = `0 0 ${outer}px rgba(${rgb}, ${0.10 + i * 0.06})`;
  return `${l1}, ${l2}, ${l3}`;
}

export const glowCyan    = (intensity = 2) => multiLayer(toneRgb('cyan'),    intensity);
export const glowViolet  = (intensity = 2) => multiLayer(toneRgb('violet'),  intensity);
export const glowMint    = (intensity = 2) => multiLayer(toneRgb('mint'),    intensity);
export const glowAmber   = (intensity = 2) => multiLayer(toneRgb('amber'),   intensity);
export const glowCrimson = (intensity = 2) => multiLayer(toneRgb('crimson'), intensity);

/** Pick a glow factory by tone keyword. Returns 'none' for unknown tones. */
export const glowOf = (tone, intensity = 2) => {
  const fn = { cyan: glowCyan, violet: glowViolet, mint: glowMint, amber: glowAmber, crimson: glowCrimson }[tone];
  return fn ? fn(intensity) : 'none';
};

/**
 * Aurora — composite of violet + cyan glows for "AI thinking" surfaces.
 * Used by GlassCard variant='aurora' and AIInsightCard.
 */
export const aurora = (intensity = 2) =>
  `${glowViolet(intensity)}, ${glowCyan(intensity)}`;

/**
 * Soft elevation — neutral white-tinted shadow for non-glow surfaces.
 * Use for subtle depth without color cast.
 */
export const softElevation = (intensity = 1) => {
  const i = clamp(Math.round(intensity), 1, 3);
  return [
    `0 ${2 + i}px ${10 + i * 6}px rgba(0, 0, 0, ${0.20 + i * 0.06})`,
    `0 0 0 1px rgba(255, 255, 255, ${0.06 + i * 0.02})`
  ].join(', ');
};

/**
 * Inset glow — for surfaces meant to feel "lit from within".
 */
export const insetGlow = (tone = 'cyan', intensity = 1) => {
  const rgb = toneRgb(tone);
  const i   = clamp(Math.round(intensity), 1, 3);
  return `inset 0 0 ${10 + i * 6}px rgba(${rgb}, ${0.10 + i * 0.06})`;
};

// ================================================================
// gradients.js — animated gradient mesh palettes.
// Each palette returns a CSS `background` value composed of 3-4
// radial gradients on top of a deep-space base. Intended to be
// rendered into a positioned <div> inside <GradientMesh /> with a
// CSS keyframe animation drifting the gradient positions.
// ================================================================
import { CINEMATIC } from './tokens';

const { rgb, bg } = CINEMATIC;

// ─── Palette: cosmic — full rainbow nebula (default) ───────────
export const cosmicMesh = `
  radial-gradient(ellipse 60% 50% at 20% 30%, rgba(${rgb.violet}, 0.22), transparent 55%),
  radial-gradient(ellipse 60% 55% at 80% 20%, rgba(${rgb.cyan},   0.18), transparent 60%),
  radial-gradient(ellipse 55% 50% at 60% 80%, rgba(${rgb.mint},   0.14), transparent 55%),
  radial-gradient(ellipse 60% 55% at 30% 75%, rgba(${rgb.amber},  0.12), transparent 60%),
  ${bg.deepSpace1}
`.trim();

// ─── Palette: aurora — cyan + mint, calmer, "intelligence" ─────
export const auroraMesh = `
  radial-gradient(ellipse 65% 55% at 30% 40%, rgba(${rgb.cyan}, 0.20), transparent 60%),
  radial-gradient(ellipse 65% 55% at 70% 60%, rgba(${rgb.mint}, 0.16), transparent 60%),
  radial-gradient(ellipse 70% 50% at 50% 90%, rgba(${rgb.violet}, 0.10), transparent 60%),
  ${bg.deepSpace1}
`.trim();

// ─── Palette: sunrise — amber + crimson, "warning" mood ────────
export const sunriseMesh = `
  radial-gradient(ellipse 60% 55% at 50% 90%, rgba(${rgb.amber},   0.22), transparent 60%),
  radial-gradient(ellipse 55% 50% at 25% 65%, rgba(${rgb.crimson}, 0.16), transparent 60%),
  radial-gradient(ellipse 50% 50% at 75% 30%, rgba(${rgb.violet},  0.10), transparent 60%),
  ${bg.deepSpace2}
`.trim();

// ─── Palette: mono — minimal, single-cyan glow ────────────────
export const monoMesh = `
  radial-gradient(ellipse 70% 60% at 50% 50%, rgba(${rgb.cyan}, 0.10), transparent 65%),
  ${bg.deepSpace1}
`.trim();

export const meshOf = (palette = 'cosmic') => ({
  cosmic:  cosmicMesh,
  aurora:  auroraMesh,
  sunrise: sunriseMesh,
  mono:    monoMesh
})[palette] || cosmicMesh;

/**
 * Linear aurora gradient — for animated borders / progress bars.
 * Cycles violet → cyan → mint → cyan → violet.
 */
export const auroraLinear = `linear-gradient(
  90deg,
  rgba(${rgb.violet}, 0.0)  0%,
  rgba(${rgb.violet}, 0.85) 18%,
  rgba(${rgb.cyan},   0.90) 50%,
  rgba(${rgb.mint},   0.85) 82%,
  rgba(${rgb.violet}, 0.0)  100%
)`;

/**
 * Holographic shading — used by HolographicDonut + AuroraButton (variant=glow).
 */
export const holographic = (tone = 'cyan') => `linear-gradient(
  135deg,
  rgba(${CINEMATIC.rgb[tone] || rgb.cyan}, 0.85) 0%,
  rgba(${CINEMATIC.rgb[tone] || rgb.cyan}, 0.55) 50%,
  rgba(${CINEMATIC.rgb[tone] || rgb.cyan}, 0.95) 100%
)`;

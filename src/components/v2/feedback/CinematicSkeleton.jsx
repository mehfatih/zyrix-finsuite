// ================================================================
// CinematicSkeleton — shimmer skeleton for V2 loading states.
//
// Sprint D-10 — Replaces the pattern of `<Loader2 spin>` rotating
// over an empty page that sits across all V2 surfaces (~126 call
// sites today). Per discovery decision §10.G option G1: one
// primitive with `variant` props instead of per-page bespoke art.
//
// Variants
//   card   — single rectangular surface (default)
//   list   — N rows of skeleton lines
//   chart  — chart-shaped block + legend lines
//   text   — paragraph-style stacked lines
//
// Honors prefers-reduced-motion globally via src/styles/a11y.css
// (the shimmer keyframe is duration-scaled to 0.01ms when reduced).
// ================================================================
import React from 'react';
import { CINEMATIC, RADIUS, SPACE } from '@/design-system-v2/cinematic/tokens';

const SHIMMER = `
@keyframes cinematic-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}`;

const baseShimmer = {
  background: `linear-gradient(90deg, ${CINEMATIC.glass.tint1} 0%, ${CINEMATIC.glass.tint3} 50%, ${CINEMATIC.glass.tint1} 100%)`,
  backgroundSize: '200% 100%',
  animation: 'cinematic-shimmer 1.4s ease-in-out infinite',
  borderRadius: RADIUS.sm,
  border: `1px solid ${CINEMATIC.glass.border}`
};

function StyleBlock() {
  // Inline once; safe to repeat — browsers dedupe identical <style>.
  return <style>{SHIMMER}</style>;
}

export default function CinematicSkeleton({
  variant = 'card',
  rows    = 3,
  height  = 80,
  width   = '100%',
  ariaLabel,
  style   = {}
}) {
  const labelProps = ariaLabel
    ? { role: 'status', 'aria-busy': true, 'aria-label': ariaLabel }
    : { role: 'status', 'aria-busy': true };

  if (variant === 'list') {
    return (
      <div {...labelProps} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, ...style }}>
        <StyleBlock />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ ...baseShimmer, height: 56, width: '100%' }} />
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div {...labelProps} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md, ...style }}>
        <StyleBlock />
        <div style={{ ...baseShimmer, height: 200, width: '100%' }} />
        <div style={{ display: 'flex', gap: SPACE.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ ...baseShimmer, height: 14, flex: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div {...labelProps} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, ...style }}>
        <StyleBlock />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ ...baseShimmer, height: 14, width: i === rows - 1 ? '60%' : '100%', borderRadius: 4 }} />
        ))}
      </div>
    );
  }

  return (
    <div {...labelProps} style={style}>
      <StyleBlock />
      <div style={{ ...baseShimmer, height, width }} />
    </div>
  );
}

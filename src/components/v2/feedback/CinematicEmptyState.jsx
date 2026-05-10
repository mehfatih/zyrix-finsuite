// ================================================================
// CinematicEmptyState — V2 illustrated empty state.
//
// Sprint D-10 — Per discovery decision §10.G option G1: a single
// primitive with a glow tone, an icon, a title, an optional
// description, and an optional CTA. Matches the cinematic identity
// without per-page bespoke illustrations (those defer to a marketing
// polish sprint).
//
// Replaces the V1 `EmptyState.jsx` pattern (emoji + dashboard
// palette) for V2 surfaces. The legacy component stays for V1
// dashboard pages that still use it.
// ================================================================
import React from 'react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

export default function CinematicEmptyState({
  icon,                        // React element — typically a lucide icon
  title,
  description,
  action,                      // React element — typically a button
  tone = 'cyan',
  size = 'normal',             // 'compact' | 'normal' | 'large'
  ariaLabel,
  style = {}
}) {
  const padY = size === 'compact' ? SPACE.lg : size === 'large' ? SPACE['4xl'] : SPACE['3xl'];
  const iconBox = size === 'compact' ? 56 : size === 'large' ? 96 : 72;
  const iconSize = size === 'compact' ? 28 : size === 'large' ? 48 : 36;
  const titleSize = size === 'compact' ? TYPE_SCALE.bodyLg : TYPE_SCALE.headingMd;

  return (
    <div
      role="status"
      aria-label={ariaLabel || title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${padY}px ${SPACE.xl}px`,
        textAlign: 'center',
        gap: SPACE.md,
        fontFamily: TYPE_STACK.body,
        color: CINEMATIC.text.pearlDim,
        ...style
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: iconBox,
          height: iconBox,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: `radial-gradient(circle at 50% 50%, rgba(${toneRgb(tone)},0.18) 0%, rgba(${toneRgb(tone)},0.04) 60%, transparent 100%)`,
          border: `1px solid rgba(${toneRgb(tone)},0.25)`,
          color: toneColor(tone),
          boxShadow: `0 0 24px rgba(${toneRgb(tone)},0.15)`
        }}
      >
        {icon && React.cloneElement(icon, { size: iconSize })}
      </div>

      {title && (
        <div style={{
          ...titleSize,
          fontFamily: TYPE_STACK.display,
          color: CINEMATIC.text.pearlWhite,
          margin: 0
        }}>{title}</div>
      )}

      {description && (
        <div style={{
          ...TYPE_SCALE.bodyMd,
          maxWidth: 420,
          lineHeight: 1.5,
          color: CINEMATIC.text.pearlDim,
          margin: 0
        }}>{description}</div>
      )}

      {action && (
        <div style={{ marginTop: SPACE.sm }}>
          {action}
        </div>
      )}
    </div>
  );
}

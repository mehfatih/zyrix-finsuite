// ================================================================
// PulseDot — live status indicator with concentric pulse ring.
// Always animates (use sparingly so it doesn't become noise).
//
// Sizes  xs | sm | md
// Tones  cyan | violet | mint | amber | crimson
//
// Usage:
//   <PulseDot tone="mint" size="sm" /> Live
// ================================================================
import { toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

const SIZES = {
  xs: { dot: 6,  ring: 14 },
  sm: { dot: 8,  ring: 18 },
  md: { dot: 10, ring: 24 }
};

export default function PulseDot({
  tone = 'mint',
  size = 'sm',
  ariaLabel = 'live',
  style = {}
}) {
  const sz  = SIZES[size] || SIZES.sm;
  const fg  = toneColor(tone);
  const rgb = toneRgb(tone);

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        display: 'inline-block',
        width:  sz.ring,
        height: sz.ring,
        flexShrink: 0,
        ...style
      }}
    >
      {/* Expanding ring */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width:  sz.dot,
          height: sz.dot,
          marginLeft: -sz.dot / 2,
          marginTop:  -sz.dot / 2,
          borderRadius: '50%',
          background: `rgba(${rgb}, 0.45)`,
          animation: 'cn-pulse-ring 1.6s cubic-bezier(0, 0.55, 0.45, 1) infinite'
        }}
      />
      {/* Solid core */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width:  sz.dot,
          height: sz.dot,
          marginLeft: -sz.dot / 2,
          marginTop:  -sz.dot / 2,
          borderRadius: '50%',
          background: fg,
          boxShadow: `0 0 ${sz.dot * 1.5}px rgba(${rgb}, 0.7)`
        }}
      />
    </span>
  );
}

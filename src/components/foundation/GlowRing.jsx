// ================================================================
// GlowRing — decorative ring that wraps avatars or KPI numbers.
//
// Tones      cyan | violet | mint | amber | crimson
// Intensity  1 | 2 | 3   (glow strength)
// Animated   boolean — slow rotate (24s) of the gradient
//
// Pass children — they sit in the center.
//
// Usage:
//   <GlowRing tone="violet" intensity={3} animated>
//     <span style={{ fontSize: 32 }}>🤖</span>
//   </GlowRing>
// ================================================================
import { toneColor, toneRgb, RADIUS } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';

export default function GlowRing({
  tone = 'cyan',
  intensity = 2,
  animated = false,
  size = 64,
  thickness = 2,
  children,
  style = {}
}) {
  const fg  = toneColor(tone);
  const rgb = toneRgb(tone);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:  size,
        height: size,
        borderRadius: '50%',
        ...style
      }}
    >
      {/* Animated conic-gradient ring underlay */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: thickness,
          background: animated
            ? `conic-gradient(from 0deg, rgba(${rgb}, 0.0), rgba(${rgb}, 0.85), rgba(${rgb}, 0.0))`
            : `linear-gradient(135deg, rgba(${rgb}, 0.85), rgba(${rgb}, 0.35))`,
          animation: animated ? 'cn-aurora-rotate 8s linear infinite' : undefined,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          boxShadow: glowOf(tone, intensity)
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color: fg }}>{children}</span>
    </span>
  );
}

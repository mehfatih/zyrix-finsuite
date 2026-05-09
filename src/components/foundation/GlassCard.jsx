// ================================================================
// GlassCard — base glass-morphic surface for the cinematic system.
//
// Variants
//   subtle   — low blur, light tint (e.g. nested cards)
//   standard — default surface
//   elevated — stronger blur + border (modals, hero cards)
//   aurora   — animated cyan→violet→mint border (AI surfaces)
//
// Props
//   variant     'subtle' | 'standard' | 'elevated' | 'aurora'   default 'standard'
//   glow        'cyan' | 'violet' | 'mint' | 'amber' | 'crimson'  optional accent halo
//   interactive boolean — hover lift + glow intensification
//   onClick     () => void
//   style       React.CSSProperties
//   children    React.ReactNode
//
// Usage:
//   <GlassCard variant="aurora" glow="cyan" interactive onClick={…}>
//     …
//   </GlassCard>
// ================================================================
import { useState } from 'react';
import { CINEMATIC, RADIUS } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora, softElevation } from '@/design-system-v2/cinematic/shadows';
import { auroraLinear } from '@/design-system-v2/cinematic/gradients';

const VARIANTS = {
  subtle:   { blur: 12, bg: CINEMATIC.glass.tint1, border: CINEMATIC.glass.border,        padding: 16, radius: RADIUS.lg },
  standard: { blur: 16, bg: CINEMATIC.glass.tint2, border: CINEMATIC.glass.border,        padding: 20, radius: RADIUS.xl },
  elevated: { blur: 24, bg: CINEMATIC.glass.tint3, border: CINEMATIC.glass.borderStrong,  padding: 24, radius: RADIUS.xl },
  aurora:   { blur: 20, bg: CINEMATIC.glass.tint2, border: CINEMATIC.glass.borderStrong,  padding: 22, radius: RADIUS.xl, aurora: true }
};

export default function GlassCard({
  variant = 'standard',
  glow,
  interactive = false,
  onClick,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.standard;

  const baseGlowIntensity = v.aurora ? null : (interactive && hovered ? 3 : 2);
  const accentGlow        = glow ? glowOf(glow, baseGlowIntensity ?? 2) : null;
  const auroraGlow        = v.aurora ? aurora(interactive && hovered ? 3 : 2) : null;
  const boxShadow         = [auroraGlow, accentGlow, softElevation(1)].filter(Boolean).join(', ');
  const isClickable       = Boolean(onClick) || interactive;

  return (
    <div
      className={className}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
      }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      style={{
        position: 'relative',
        background: v.bg,
        backdropFilter: `blur(${v.blur}px) saturate(160%)`,
        WebkitBackdropFilter: `blur(${v.blur}px) saturate(160%)`,
        border: `1px solid ${v.border}`,
        borderRadius: v.radius,
        padding: v.padding,
        color: CINEMATIC.text.pearlWhite,
        boxShadow,
        transform: interactive && hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 320ms ease',
        cursor: isClickable ? 'pointer' : 'default',
        ...style
      }}
      {...rest}
    >
      {v.aurora && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: v.radius,
            padding: 1,
            background: auroraLinear,
            backgroundSize: '200% 100%',
            animation: 'cn-aurora-border 6s ease-in-out infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0.55,
            pointerEvents: 'none'
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

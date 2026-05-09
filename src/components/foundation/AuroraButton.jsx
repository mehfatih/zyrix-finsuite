// ================================================================
// AuroraButton — premium CTA with optional glow halo.
//
// Variants
//   primary — solid tone fill, white text
//   ghost   — transparent with tone border
//   glow    — gradient holographic fill, multi-layer halo
//
// Sizes  sm | md | lg
//
// Props
//   variant  'primary' | 'ghost' | 'glow'                       default 'primary'
//   size     'sm' | 'md' | 'lg'                                  default 'md'
//   glow     'cyan' | 'violet' | 'mint' | 'amber' | 'crimson'    optional, intensifies on hover
//   leading  ReactNode (icon)
//   trailing ReactNode (icon)
//   onClick  () => void
//   disabled boolean
//   children string (label)
//
// All hover/press transitions go through requestAnimationFrame-driven
// spring physics from src/lib/animations/spring.js (no Framer Motion).
// ================================================================
import { useState } from 'react';
import { CINEMATIC, RADIUS, TYPE_STACK, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { holographic } from '@/design-system-v2/cinematic/gradients';
import { useSpring, SPRING_CONFIGS } from '@/lib/animations/spring';

const SIZES = {
  sm: { padding: '6px 12px',  fontSize: '0.8125rem', iconSize: 13, gap: 6,  radius: RADIUS.sm },
  md: { padding: '10px 18px', fontSize: '0.9375rem', iconSize: 15, gap: 8,  radius: RADIUS.md },
  lg: { padding: '14px 24px', fontSize: '1.0625rem', iconSize: 18, gap: 10, radius: RADIUS.md }
};

export default function AuroraButton({
  variant = 'primary',
  size = 'md',
  glow,
  leading,
  trailing,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  children,
  ...rest
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const sz   = SIZES[size] || SIZES.md;
  const tone = glow || (variant === 'ghost' ? 'cyan' : 'violet');
  const fg   = toneColor(tone);
  const rgb  = toneRgb(tone);

  // Spring scale: 1.00 idle, 1.04 hover, 0.96 pressed.
  const targetScale = disabled ? 1 : (pressed ? 0.96 : hovered ? 1.04 : 1);
  const scale = useSpring(targetScale, SPRING_CONFIGS.wobbly);

  const variantStyle = (() => {
    if (variant === 'ghost') {
      return {
        background: 'transparent',
        color: fg,
        border: `1px solid rgba(${rgb}, ${hovered ? 0.6 : 0.3})`
      };
    }
    if (variant === 'glow') {
      return {
        background: holographic(tone),
        color: '#fff',
        border: `1px solid rgba(${rgb}, 0.55)`
      };
    }
    // primary
    return {
      background: `linear-gradient(135deg, rgba(${rgb}, 0.95) 0%, rgba(${rgb}, 0.75) 100%)`,
      color: '#fff',
      border: `1px solid rgba(${rgb}, 0.50)`
    };
  })();

  const intensity = disabled ? 1 : (hovered ? 3 : 2);
  const haloShadow = glow || variant === 'glow' ? glowOf(tone, intensity) : 'none';

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: sz.radius,
        fontFamily: TYPE_STACK.body,
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        boxShadow: haloShadow,
        transform: `scale(${scale.toFixed(3)})`,
        transition: 'box-shadow 220ms ease, opacity 200ms ease, background 220ms ease, border-color 220ms ease',
        outline: 'none',
        ...variantStyle,
        ...style
      }}
      {...rest}
    >
      {leading && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{leading}</span>}
      <span>{children}</span>
      {trailing && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{trailing}</span>}
    </button>
  );
}

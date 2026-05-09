// ================================================================
// NeonBadge — small status pill with optional pulse animation.
//
// Tones    cyan | violet | mint | amber | crimson | neutral
// Pulse    boolean — infinite gentle scale + glow breathing
//
// Sizes    sm | md
//
// Usage:
//   <NeonBadge tone="crimson" pulse>CRITICAL</NeonBadge>
//   <NeonBadge tone="mint">+12.4%</NeonBadge>
// ================================================================
import { CINEMATIC, RADIUS, TYPE_STACK, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';

const SIZES = {
  sm: { padding: '2px 8px',  fontSize: '0.6875rem', iconSize: 10, gap: 4 },
  md: { padding: '4px 10px', fontSize: '0.75rem',   iconSize: 12, gap: 6 }
};

export default function NeonBadge({
  tone = 'cyan',
  pulse = false,
  size = 'md',
  leading,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const sz = SIZES[size] || SIZES.md;

  const isNeutral = tone === 'neutral';
  const fg  = isNeutral ? CINEMATIC.text.pearlDim : toneColor(tone);
  const rgb = isNeutral ? '203, 213, 225' : toneRgb(tone);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: RADIUS.full,
        fontFamily: TYPE_STACK.body,
        fontSize: sz.fontSize,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: fg,
        background: `rgba(${rgb}, 0.10)`,
        border: `1px solid rgba(${rgb}, 0.32)`,
        boxShadow: pulse && !isNeutral ? glowOf(tone, 1) : 'none',
        animation: pulse ? 'cn-pulse-soft 1.6s ease-in-out infinite' : undefined,
        whiteSpace: 'nowrap',
        ...style
      }}
      {...rest}
    >
      {leading && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{leading}</span>}
      {children}
    </span>
  );
}

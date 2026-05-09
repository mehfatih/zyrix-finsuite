// ================================================================
// LiquidKPICard — KPI tile with liquid-fill mount animation.
// The number rises like water filling a glass; sparkline pulses on hover.
//
// Props
//   value     number
//   label     string
//   tone      'cyan' | 'violet' | 'mint' | 'amber' | 'crimson'  default 'cyan'
//   format    (n) => string                                      default toLocaleString()
//   sparkline number[]                                           optional
//   delta     number                                             optional, percent change
//   loading   boolean
//   error     boolean
//   onClick   () => void
//
// Mount animation: number ramps from 0 to value via spring physics
// (gentle config), and a translucent fill "wave" rises from the bottom
// of the card synced to the same progress. Hover: sparkline shimmer.
// ================================================================
import { useState } from 'react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { useSpring, SPRING_CONFIGS } from '@/lib/animations/spring';

export default function LiquidKPICard({
  value = 0,
  label,
  tone = 'cyan',
  format = (n) => Math.round(n).toLocaleString(),
  sparkline,
  delta,
  loading = false,
  error = false,
  onClick,
  style = {}
}) {
  const [hovered, setHovered] = useState(false);
  const fg  = toneColor(tone);
  const rgb = toneRgb(tone);

  const animatedValue = useSpring(loading || error ? 0 : Number(value) || 0, SPRING_CONFIGS.gentle);
  // Fill progress 0-1 mapped from animation range
  const fillProgress = Math.max(0, Math.min(1, value === 0 ? 0 : animatedValue / value));

  if (error) {
    return (
      <div style={{ ...stateBox(tone), ...style }} role="alert">
        <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase' }}>
          Veri yüklenemedi
        </span>
      </div>
    );
  }

  return (
    <div
      role={onClick ? 'button' : 'group'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label ? `${label}: ${format(value)}` : undefined}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(e); } }}
      style={{
        position: 'relative',
        background: CINEMATIC.glass.tint2,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: `1px solid ${CINEMATIC.glass.border}`,
        borderRadius: RADIUS.xl,
        padding: 20,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hovered ? glowOf(tone, 3) : glowOf(tone, 1),
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 320ms ease',
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        ...style
      }}
    >
      {/* Liquid fill wave (rises from bottom) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: `${fillProgress * 100}%`,
          background: `linear-gradient(180deg, rgba(${rgb}, 0.0) 0%, rgba(${rgb}, 0.18) 100%)`,
          transition: 'height 80ms linear',
          pointerEvents: 'none'
        }}
      />
      {/* Wave crest line */}
      {fillProgress > 0 && fillProgress < 1 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: `${fillProgress * 100}%`,
            height: 2,
            background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.85), transparent)`,
            filter: 'blur(1px)',
            pointerEvents: 'none'
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <div style={{
          ...TYPE_SCALE.caption,
          color: CINEMATIC.text.pearlFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12
        }}>
          {loading ? <Shimmer width={80} /> : label}
        </div>

        {/* Value */}
        <div style={{
          ...TYPE_SCALE.displayMd,
          fontFamily: TYPE_STACK.display,
          color: CINEMATIC.text.pearlWhite,
          letterSpacing: '-0.03em',
          marginBottom: 4
        }}>
          {loading ? <Shimmer width={140} height={36} /> : format(animatedValue)}
        </div>

        {/* Delta */}
        {!loading && typeof delta === 'number' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            ...TYPE_SCALE.caption,
            fontWeight: 700,
            color: delta >= 0 ? CINEMATIC.accent.neonMint : CINEMATIC.accent.crimsonGlow
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
            <span style={{ color: CINEMATIC.text.pearlFaint, fontWeight: 500 }}>vs. last period</span>
          </div>
        )}

        {/* Sparkline */}
        {!loading && sparkline && sparkline.length > 1 && (
          <div style={{ marginTop: 14 }}>
            <MiniSparkline data={sparkline} color={fg} hovered={hovered} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniSparkline({ data, color, hovered, width = 120, height = 28 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const path = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={color} strokeWidth={hovered ? 2 : 1.5}
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              filter: hovered ? `drop-shadow(0 0 6px ${color})` : 'none',
              transition: 'stroke-width 200ms, filter 320ms'
            }} />
    </svg>
  );
}

function Shimmer({ width = 100, height = 14 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width, height,
        borderRadius: 6,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'cn-shimmer 1.5s linear infinite'
      }}
    />
  );
}

function stateBox(tone) {
  return {
    position: 'relative',
    background: CINEMATIC.glass.tint1,
    border: `1px dashed ${CINEMATIC.glass.border}`,
    borderRadius: RADIUS.xl,
    padding: 24,
    minHeight: 110,
    display: 'grid',
    placeItems: 'center',
    color: toneColor(tone),
    fontFamily: TYPE_STACK.body
  };
}

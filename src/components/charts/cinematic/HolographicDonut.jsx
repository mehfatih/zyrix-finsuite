// ================================================================
// HolographicDonut — donut chart with depth-shaded gradient segments
// and an outer glow ring. Hovering a segment lifts it outward via
// spring physics (radial offset).
//
// Props
//   data        Array<{ name: string, value: number, tone?: string }>
//   width       number  default 280
//   height      number  default 280
//   thickness   number  default 38   (ring thickness in px)
//   centerLabel string  optional override for center text (default = total)
//   centerSub   string  optional sub-line text
//   format      (n) => string  formatter for center value
//   loading     boolean
//   empty       boolean
//
// Pure SVG. The "depth" is achieved with a radial gradient inside each
// segment — light side faces the segment's mid-angle.
// ================================================================
import { useState, useMemo } from 'react';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { useSpring, SPRING_CONFIGS } from '@/lib/animations/spring';

const DEFAULT_TONES = ['cyan', 'violet', 'mint', 'amber', 'crimson'];

export default function HolographicDonut({
  data = [],
  width = 280,
  height = 280,
  thickness = 38,
  centerLabel,
  centerSub,
  format = (n) => Math.round(n).toLocaleString(),
  loading = false,
  empty = false
}) {
  const [hoverIdx, setHoverIdx] = useState(-1);
  const cx = width / 2;
  const cy = height / 2;
  const rOuter = Math.min(width, height) / 2 - 12;
  const rInner = rOuter - thickness;

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const segments = useMemo(() => {
    if (!data || data.length === 0 || total === 0) return [];
    let acc = 0;
    return data.map((d, i) => {
      const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += d.value;
      const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const tone = d.tone || DEFAULT_TONES[i % DEFAULT_TONES.length];
      return { ...d, start, end, mid: (start + end) / 2, tone };
    });
  }, [data, total]);

  if (loading || empty || data.length === 0) {
    return (
      <DonutPlaceholder width={width} height={height}
                        rOuter={rOuter} rInner={rInner}
                        message={loading ? 'Yükleniyor…' : 'Henüz veri yok'} />
    );
  }

  return (
    <svg role="img" aria-label="holographic donut" width={width} height={height}
         viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        {segments.map((s, i) => {
          const rgb = toneRgb(s.tone);
          return (
            <radialGradient key={i} id={`donut-grad-${i}`}
                            cx={cx + Math.cos(s.mid) * rInner * 0.8}
                            cy={cy + Math.sin(s.mid) * rInner * 0.8}
                            r={rOuter * 0.9} fx="50%" fy="50%"
                            gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={`rgba(${rgb}, 1)`} />
              <stop offset="60%"  stopColor={`rgba(${rgb}, 0.7)`} />
              <stop offset="100%" stopColor={`rgba(${rgb}, 0.35)`} />
            </radialGradient>
          );
        })}
      </defs>

      {/* Outer glow ring underlay */}
      <circle cx={cx} cy={cy} r={rOuter + 4} fill="none"
              stroke={CINEMATIC.glass.border} strokeWidth={1} opacity={0.6} />

      {/* Segments */}
      {segments.map((s, i) => (
        <DonutSegment
          key={i}
          cx={cx} cy={cy}
          rInner={rInner} rOuter={rOuter}
          start={s.start} end={s.end} mid={s.mid}
          tone={s.tone}
          fill={`url(#donut-grad-${i})`}
          isHover={hoverIdx === i}
          onEnter={() => setHoverIdx(i)}
          onLeave={() => setHoverIdx(-1)}
          delay={i * 60}
        />
      ))}

      {/* Center text */}
      <g pointerEvents="none">
        <text x={cx} y={cy - 4} textAnchor="middle"
              fontFamily={TYPE_STACK.display}
              fontSize={28} fontWeight={700}
              letterSpacing="-0.02em"
              fill={CINEMATIC.text.pearlWhite}>
          {centerLabel || format(total)}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle"
              fontFamily={TYPE_STACK.body}
              fontSize={11} letterSpacing="0.08em"
              fill={CINEMATIC.text.pearlFaint}
              style={{ textTransform: 'uppercase' }}>
          {centerSub || (hoverIdx >= 0 ? segments[hoverIdx].name : 'Total')}
        </text>
      </g>
    </svg>
  );
}

function DonutSegment({ cx, cy, rInner, rOuter, start, end, mid, tone, fill, isHover, onEnter, onLeave, delay }) {
  const offset = useSpring(isHover ? 8 : 0, SPRING_CONFIGS.wobbly);
  const dx = Math.cos(mid) * offset;
  const dy = Math.sin(mid) * offset;
  const path = arcPath(cx + dx, cy + dy, rOuter, rInner, start, end);

  return (
    <path
      d={path}
      fill={fill}
      stroke={`rgba(${toneRgb(tone)}, 0.7)`}
      strokeWidth={isHover ? 1.5 : 1}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        cursor: 'pointer',
        filter: isHover ? `drop-shadow(0 0 12px rgba(${toneRgb(tone)}, 0.5))` : 'none',
        transition: 'filter 240ms ease, stroke-width 240ms ease',
        opacity: 0,
        animation: `cn-fade-up 600ms ease ${delay}ms both`
      }}
    />
  );
}

function arcPath(cx, cy, rOuter, rInner, start, end) {
  const x1 = cx + Math.cos(start) * rOuter;
  const y1 = cy + Math.sin(start) * rOuter;
  const x2 = cx + Math.cos(end)   * rOuter;
  const y2 = cy + Math.sin(end)   * rOuter;
  const x3 = cx + Math.cos(end)   * rInner;
  const y3 = cy + Math.sin(end)   * rInner;
  const x4 = cx + Math.cos(start) * rInner;
  const y4 = cy + Math.sin(start) * rInner;
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    'Z'
  ].join(' ');
}

function DonutPlaceholder({ width, height, rOuter, rInner, message }) {
  const cx = width / 2;
  const cy = height / 2;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} fill="none"
              stroke={CINEMATIC.glass.border} strokeWidth={Math.abs(rOuter - rInner)}
              strokeDasharray="6 8" />
      <text x={cx} y={cy + 4} textAnchor="middle"
            fontFamily={TYPE_STACK.body} fontSize={12}
            fill={CINEMATIC.text.pearlFaint}
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {message}
      </text>
    </svg>
  );
}

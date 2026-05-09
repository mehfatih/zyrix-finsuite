// ================================================================
// ConstellationMap — scatter plot where nearby points connect with
// thin "star-line" edges that fade based on distance. Subtle drifting
// nebula in the background.
//
// Props
//   points     Array<{ x, y, value, label, tone? }>  (x,y in 0-1 space)
//   width      number  default 520
//   height     number  default 320
//   linkRadius number  0-1, default 0.22  (max normalized distance for an edge)
//   loading    boolean
//
// Edges are computed once on mount; opacity scales linearly from
// 1 at distance=0 to 0 at distance=linkRadius. Points pulse on hover.
// ================================================================
import { useMemo, useState } from 'react';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

const DEFAULT_TONES = ['cyan', 'violet', 'mint', 'amber'];

export default function ConstellationMap({
  points = [],
  width = 520,
  height = 320,
  linkRadius = 0.22,
  loading = false
}) {
  const [hoverIdx, setHoverIdx] = useState(-1);

  const projected = useMemo(() => {
    if (!points.length) return [];
    const maxV = Math.max(...points.map((p) => p.value || 1));
    return points.map((p, i) => ({
      ...p,
      px: 24 + p.x * (width - 48),
      py: 24 + p.y * (height - 48),
      r: 4 + ((p.value || 1) / maxV) * 10,
      tone: p.tone || DEFAULT_TONES[i % DEFAULT_TONES.length]
    }));
  }, [points, width, height]);

  const edges = useMemo(() => {
    if (projected.length < 2) return [];
    const out = [];
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = (projected[i].x - projected[j].x);
        const dy = (projected[i].y - projected[j].y);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= linkRadius) {
          out.push({ a: i, b: j, opacity: 1 - d / linkRadius });
        }
      }
    }
    return out;
  }, [projected, linkRadius]);

  if (loading || projected.length === 0) {
    return (
      <div style={{
        width, height,
        display: 'grid', placeItems: 'center',
        background: CINEMATIC.glass.tint1,
        border: `1px dashed ${CINEMATIC.glass.border}`,
        borderRadius: 14,
        color: CINEMATIC.text.pearlFaint,
        fontFamily: TYPE_STACK.body
      }}>
        <span style={{ ...TYPE_SCALE.caption, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {loading ? 'Yıldızlar yükleniyor…' : 'Henüz nokta yok'}
        </span>
      </div>
    );
  }

  return (
    <svg role="img" aria-label="constellation scatter map"
         width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ overflow: 'visible' }}>
      {/* Nebula backdrop */}
      <defs>
        <radialGradient id="nebula-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%"  stopColor={`rgba(${CINEMATIC.rgb.violet}, 0.15)`} />
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#nebula-bg)" rx={14} />

      {/* Edges */}
      {edges.map((e, i) => {
        const a = projected[e.a];
        const b = projected[e.b];
        return (
          <line key={i}
                x1={a.px} y1={a.py} x2={b.px} y2={b.py}
                stroke={`rgba(${toneRgb('cyan')}, ${(0.4 * e.opacity).toFixed(3)})`}
                strokeWidth={0.7}
                style={{ opacity: 0, animation: `cn-fade-up 800ms ease ${i * 30}ms both` }} />
        );
      })}

      {/* Points */}
      {projected.map((p, i) => {
        const fg  = toneColor(p.tone);
        const rgb = toneRgb(p.tone);
        const isHover = hoverIdx === i;
        return (
          <g key={i}
             onMouseEnter={() => setHoverIdx(i)}
             onMouseLeave={() => setHoverIdx(-1)}
             style={{ cursor: 'pointer' }}>
            {isHover && (
              <circle cx={p.px} cy={p.py} r={p.r * 1.8}
                      fill={`rgba(${rgb}, 0.18)`} />
            )}
            <circle cx={p.px} cy={p.py} r={p.r}
                    fill={fg}
                    style={{
                      filter: `drop-shadow(0 0 ${isHover ? 12 : 6}px ${fg})`,
                      transition: 'filter 240ms ease'
                    }} />
            <circle cx={p.px} cy={p.py} r={p.r * 0.4} fill="#FFFFFF" opacity={0.85} />
          </g>
        );
      })}

      {/* Hover label */}
      {hoverIdx >= 0 && (
        <g pointerEvents="none">
          <text x={projected[hoverIdx].px}
                y={projected[hoverIdx].py - projected[hoverIdx].r - 10}
                textAnchor="middle"
                fontFamily={TYPE_STACK.body} fontSize={12}
                fill={CINEMATIC.text.pearlWhite}
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.7))' }}>
            {projected[hoverIdx].label}
          </text>
        </g>
      )}
    </svg>
  );
}

// ================================================================
// AuroraChart — line/area chart with gradient-mesh fill and animated
// glow tracing the line on mount. Pure SVG; spring-driven hover.
//
// Props
//   data        Array<{ x: number|string, y: number }>
//   tone        'cyan'|'violet'|'mint'|'amber'|'crimson'  default 'cyan'
//   width       number (px)  default 'auto' via parent
//   height      number (px)  default 240
//   label       string — accessible name
//   loading     boolean
//   empty       boolean
//   error       boolean
//
// Animations:
//   - Line draws in over 1.2s (stroke-dashoffset)
//   - Area gradient fades in over 800ms
//   - On hover: nearest data point gets a glow halo + tooltip
// ================================================================
import { useMemo, useRef, useState } from 'react';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

const PADDING = { top: 16, right: 24, bottom: 24, left: 36 };

export default function AuroraChart({
  data = [],
  tone = 'cyan',
  width = 640,
  height = 240,
  label,
  loading = false,
  empty = false,
  error = false
}) {
  const [hoverIdx, setHoverIdx] = useState(-1);
  const svgRef = useRef(null);
  const fg  = toneColor(tone);
  const rgb = toneRgb(tone);

  const { linePath, areaPath, points, yLabels, xLabels } = useMemo(() => {
    if (!data || data.length < 2) return { linePath: '', areaPath: '', points: [], yLabels: [], xLabels: [] };
    const ys = data.map((d) => d.y);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const range = max - min || 1;
    const W = width - PADDING.left - PADDING.right;
    const H = height - PADDING.top - PADDING.bottom;
    const pts = data.map((d, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * W;
      const y = PADDING.top + H - ((d.y - min) / range) * H;
      return { x, y, raw: d };
    });
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    const areaPath = `${linePath} L${pts[pts.length - 1].x},${PADDING.top + H} L${pts[0].x},${PADDING.top + H} Z`;
    const yLabels = [0, 0.5, 1].map((t) => ({ y: PADDING.top + H - t * H, label: formatNumber(min + t * range) }));
    const xLabels = [0, Math.floor(data.length / 2), data.length - 1].map((i) => ({ x: pts[i].x, label: String(data[i].x) }));
    return { linePath, areaPath, points: pts, yLabels, xLabels };
  }, [data, width, height]);

  const stateMessage = error ? 'Veri yüklenemedi' : empty ? 'Henüz veri yok' : loading ? 'Yükleniyor…' : null;

  if (stateMessage || points.length === 0) {
    return <ChartStateBox width={width} height={height} message={stateMessage || 'Henüz veri yok'} tone={tone} />;
  }

  const gradId = `aurora-${tone}-${Math.random().toString(36).slice(2, 8)}`;
  const lineLen = linePath.length * 1.2;  // rough — looks fine for animation
  const hovered = hoverIdx >= 0 ? points[hoverIdx] : null;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let nearest = -1;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    setHoverIdx(nearest);
  };

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={label || 'aurora line chart'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(-1)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={fg} stopOpacity="0.55" />
          <stop offset="60%"  stopColor={fg} stopOpacity="0.18" />
          <stop offset="100%" stopColor={fg} stopOpacity="0.0" />
        </linearGradient>
        <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Y grid */}
      {yLabels.map((g, i) => (
        <g key={`y${i}`}>
          <line x1={PADDING.left} y1={g.y} x2={width - PADDING.right} y2={g.y}
                stroke={CINEMATIC.glass.border} strokeWidth={1} strokeDasharray="2 4" />
          <text x={PADDING.left - 8} y={g.y + 4} textAnchor="end" fill={CINEMATIC.text.pearlFaint}
                fontSize={10} fontFamily={TYPE_STACK.mono}>{g.label}</text>
        </g>
      ))}
      {/* X labels */}
      {xLabels.map((g, i) => (
        <text key={`x${i}`} x={g.x} y={height - 6} textAnchor="middle" fill={CINEMATIC.text.pearlFaint}
              fontSize={10} fontFamily={TYPE_STACK.mono}>{g.label}</text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`}
            style={{ animation: 'aurora-area-fade 900ms ease both' }} />

      {/* Main line — drawn via dash offset animation */}
      <path
        d={linePath}
        fill="none"
        stroke={fg}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${gradId}-glow)`}
        style={{
          strokeDasharray: lineLen,
          strokeDashoffset: lineLen,
          animation: 'aurora-line-draw 1200ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}
      />

      {/* Data points (always drawn, faint until hover) */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y}
          r={hoverIdx === i ? 5 : 2.5}
          fill={fg}
          opacity={hoverIdx === i ? 1 : 0.7}
          style={{ transition: 'r 200ms ease, opacity 200ms ease' }}
        />
      ))}
      {hovered && (
        <circle cx={hovered.x} cy={hovered.y} r={10} fill="none"
                stroke={`rgba(${rgb}, 0.6)`} strokeWidth={1.5} />
      )}

      {/* Tooltip */}
      {hovered && (
        <g transform={`translate(${Math.min(hovered.x + 12, width - 130)}, ${Math.max(hovered.y - 36, 12)})`}>
          <rect x={0} y={0} width={120} height={42} rx={8} ry={8}
                fill={CINEMATIC.bg.deepSpace3} stroke={`rgba(${rgb}, 0.5)`} strokeWidth={1}
                filter={`url(#${gradId}-glow)`} />
          <text x={10} y={18} fill={CINEMATIC.text.pearlDim} fontSize={10}
                fontFamily={TYPE_STACK.mono} textTransform="uppercase">{String(hovered.raw.x)}</text>
          <text x={10} y={34} fill={CINEMATIC.text.pearlWhite} fontSize={14}
                fontFamily={TYPE_STACK.display} fontWeight={700}>{formatNumber(hovered.raw.y)}</text>
        </g>
      )}

      <style>{`
        @keyframes aurora-line-draw { to { stroke-dashoffset: 0; } }
        @keyframes aurora-area-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </svg>
  );
}

function formatNumber(n) {
  if (typeof n !== 'number') return String(n);
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

function ChartStateBox({ width, height, message, tone }) {
  return (
    <div style={{
      position: 'relative',
      width, height,
      display: 'grid', placeItems: 'center',
      borderRadius: 14,
      background: CINEMATIC.glass.tint1,
      border: `1px dashed ${CINEMATIC.glass.border}`,
      color: CINEMATIC.text.pearlFaint,
      fontFamily: TYPE_STACK.body,
      fontSize: TYPE_SCALE.bodyMd.fontSize
    }}>
      <span style={{ ...TYPE_SCALE.caption, textTransform: 'uppercase', color: toneColor(tone), letterSpacing: '0.08em' }}>
        {message}
      </span>
    </div>
  );
}

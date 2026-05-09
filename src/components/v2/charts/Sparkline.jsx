import { useMemo } from 'react';

/**
 * Tiny SVG sparkline that animates draw-in from left to right.
 *
 * Props:
 *   - data:    number[] (any length, recommended 14)
 *   - color:   string (CSS color)
 *   - width:   number (px, default 80)
 *   - height:  number (px, default 24)
 *   - filled:  boolean (draw a soft gradient fill under the line)
 */
export default function Sparkline({ data, color = '#22D3EE', width = 80, height = 24, filled = true }) {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return [x, y];
    });
    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area };
  }, [data, width, height]);

  if (!pathData.line) return <svg width={width} height={height} />;

  const gradId = `spark-grad-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.30} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {filled && (
        <path
          d={pathData.area}
          fill={`url(#${gradId})`}
          style={{ animation: 'spark-fade 800ms ease both' }}
        />
      )}
      <path
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: 'spark-draw 800ms cubic-bezier(0.4,0,0.2,1) forwards'
        }}
      />
      <style>{`
        @keyframes spark-draw { to { stroke-dashoffset: 0; } }
        @keyframes spark-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </svg>
  );
}

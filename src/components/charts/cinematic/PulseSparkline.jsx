// ================================================================
// PulseSparkline — mini sparkline that pulses at heartbeat tempo when
// the underlying KPI is critical. Color shifts amber → crimson based
// on severity.
//
// Props
//   data       number[]  required, ≥ 2
//   severity   'normal' | 'warning' | 'critical'  default 'normal'
//   width      number  default 100
//   height     number  default 32
//   bpm        number  default 72  (pulse tempo when severity='critical')
//   label      string  accessible name
//
// Spec note: a calmer pulse for 'warning' (40 bpm), strong for 'critical' (72 bpm).
// 'normal' is static.
// ================================================================
import { useMemo } from 'react';
import { CINEMATIC, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

const SEVERITY_TONE = {
  normal:   'cyan',
  warning:  'amber',
  critical: 'crimson'
};

export default function PulseSparkline({
  data = [],
  severity = 'normal',
  width = 100,
  height = 32,
  bpm = 72,
  label
}) {
  const tone = SEVERITY_TONE[severity] || 'cyan';
  const fg   = toneColor(tone);
  const rgb  = toneRgb(tone);

  const { line, area } = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y];
    });
    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area };
  }, [data, width, height]);

  if (!line) return <svg width={width} height={height} aria-label={label} />;

  // Compute animation duration from bpm.
  // Critical: full heartbeat. Warning: gentle pulse. Normal: static.
  const animation = severity === 'critical'
    ? `cn-heartbeat ${(60 / bpm).toFixed(2)}s ease-in-out infinite`
    : severity === 'warning'
      ? `cn-pulse-soft ${(60 / Math.max(bpm * 0.55, 30)).toFixed(2)}s ease-in-out infinite`
      : 'none';

  const gradId = `pulse-${tone}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      role="img"
      aria-label={label || `${severity} sparkline`}
      width={width}
      height={height}
      style={{
        display: 'inline-block',
        animation,
        transformOrigin: 'center',
        filter: severity === 'critical' ? `drop-shadow(0 0 6px rgba(${rgb}, 0.55))` : undefined
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={fg} stopOpacity="0.45" />
          <stop offset="100%" stopColor={fg} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={fg} strokeWidth={1.6}
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ================================================================
// Sprint D-8 — Inline chart renderer.
//
// Engine emits two chart types in V1 (B.3):
//   - sparkline      → KPI value + tiny SVG line + trend pct
//   - cash_forecast  → current cash + daily burn + projected balance
//
// Inline SVG (zero new deps; recharts not imported here to keep
// chat chunk lean per decision §7.K).
// ================================================================
import React from 'react';
import { CINEMATIC, RADIUS } from '@/design-system-v2/cinematic/tokens';

const SVG_W = 120;
const SVG_H = 32;

function fmtNumber(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

function Sparkline({ values, tone }) {
  const arr = Array.isArray(values) && values.length > 1 ? values : [0, 0];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min || 1;
  const pts = arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * (SVG_W - 4) + 2;
    const y = SVG_H - 2 - ((v - min) / range) * (SVG_H - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklineCard({ data }) {
  const value = data?.value;
  const trendPct = Number.isFinite(data?.trendPct) ? data.trendPct : 0;
  const tone = trendPct >= 0 ? '#06FFA5' : '#FF3D5A';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      background: CINEMATIC.glass.tint1,
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint
        }}>
          {data?.kpiId || 'KPI'}
        </div>
        <div style={{
          marginTop: 2, fontSize: 16, fontWeight: 800,
          color: CINEMATIC.text.pearlWhite, letterSpacing: '-0.01em'
        }}>
          {fmtNumber(value)}
        </div>
      </div>
      <div style={{ textAlign: 'end' }}>
        <Sparkline values={data?.values} tone={tone} />
        <div style={{
          marginTop: 2, fontSize: 10, fontWeight: 700, color: tone
        }}>
          {trendPct >= 0 ? '↑' : '↓'} {Math.abs(trendPct).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

function CashForecastCard({ data }) {
  const projected = data?.projected ?? 0;
  const current   = data?.currentCash ?? 0;
  const delta     = projected - current;
  const tone      = delta >= 0 ? '#06FFA5' : '#FF3D5A';
  return (
    <div style={{
      padding: '12px 14px',
      background: CINEMATIC.glass.tint1,
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#00D9FF'
      }}>
        {data?.daysAhead ? `${data.daysAhead}d cash forecast` : 'cash forecast'}
      </div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        marginTop: 6
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: CINEMATIC.text.pearlWhite }}>
          {fmtNumber(projected)}
        </span>
        <span style={{ fontSize: 11, color: CINEMATIC.text.pearlFaint }}>
          from {fmtNumber(current)}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: tone, marginInlineStart: 'auto' }}>
          {delta >= 0 ? '+' : ''}{fmtNumber(delta)}
        </span>
      </div>
      {data?.dailyBurn !== undefined && (
        <div style={{ marginTop: 4, fontSize: 10, color: CINEMATIC.text.pearlFaint }}>
          Daily burn ~ {fmtNumber(data.dailyBurn)}
        </div>
      )}
    </div>
  );
}

export default function InlineChart({ chart }) {
  if (!chart) return null;
  if (chart.type === 'sparkline')      return <SparklineCard     data={chart.data} />;
  if (chart.type === 'cash_forecast')  return <CashForecastCard  data={chart.data} />;
  // Fallback for unknown types.
  return (
    <div style={{
      padding: '8px 10px',
      background: CINEMATIC.glass.tint1,
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm,
      fontSize: 11, color: CINEMATIC.text.pearlFaint
    }}>
      [chart: {chart.type}]
    </div>
  );
}

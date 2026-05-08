// ================================================================
// /admin/revenue/cohorts — Analytics Lab (Bible v2 §17.5)
// Cohort retention heatmap.
// ================================================================
import { useMemo, useState } from 'react';
import AnalyticsLab from '@/components/admin/shared/AnalyticsLab';

const MONTHS = [
  '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11',
  '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'
];

const controlStyle = {
  padding: '8px 12px',
  background: '#1E293B',
  color: '#F9FAFB',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

function buildCohortGrid(metric) {
  return MONTHS.map((cohortMonth, ci) => {
    const cohortQuality = 0.85 + (ci / MONTHS.length) * 0.1;
    const startSize = 80 + ci * 6;
    return {
      cohort: cohortMonth,
      size: startSize,
      retention: Array.from({ length: 12 }, (_, m) => {
        if (m > MONTHS.length - 1 - ci) return null;
        if (m === 0) return 100;
        const decay = Math.pow(0.94 + (cohortQuality - 0.85) * 0.4, m);
        const noise = (Math.sin(ci * 7 + m * 3) * 3);
        let v = Math.round(decay * 100 + noise);
        if (metric === 'mrr') v = Math.round(v * (1 + ci * 0.005));
        return Math.max(0, Math.min(120, v));
      })
    };
  });
}

function colorFor(v) {
  if (v == null) return 'transparent';
  if (v >= 90) return '#22D3EE';
  if (v >= 75) return 'rgba(34,211,238,0.7)';
  if (v >= 60) return 'rgba(34,211,238,0.5)';
  if (v >= 45) return 'rgba(34,211,238,0.35)';
  if (v >= 30) return 'rgba(245,158,11,0.45)';
  if (v >= 15) return 'rgba(239,68,68,0.45)';
  return 'rgba(239,68,68,0.7)';
}

export default function CohortAnalysisPage() {
  const [metric, setMetric] = useState('users');
  const grid = useMemo(() => buildCohortGrid(metric), [metric]);

  const m3 = grid.flatMap((r) => r.retention[3] != null ? [r.retention[3]] : []);
  const m12 = grid.flatMap((r) => r.retention[11] != null ? [r.retention[11]] : []);
  const avgM3 = m3.length ? Math.round(m3.reduce((s, v) => s + v, 0) / m3.length) : 0;
  const avgM12 = m12.length ? Math.round(m12.reduce((s, v) => s + v, 0) / m12.length) : 0;

  let bestRow = grid[0], worstRow = grid[0];
  grid.forEach((r) => {
    const last = r.retention.filter((v) => v != null).slice(-1)[0] ?? 0;
    const bestLast = bestRow.retention.filter((v) => v != null).slice(-1)[0] ?? 0;
    const worstLast = worstRow.retention.filter((v) => v != null).slice(-1)[0] ?? 100;
    if (last > bestLast) bestRow = r;
    if (last < worstLast) worstRow = r;
  });

  const insights = [
    { icon: '🏆', label: 'Best cohort',     value: bestRow.cohort,  trend: null },
    { icon: '⚠',  label: 'Worst cohort',    value: worstRow.cohort, trend: null },
    { icon: '🎯', label: 'Avg M3 retention', value: `${avgM3}%`, trend: 2.4 },
    { icon: '🌳', label: 'Avg M12 retention',value: `${avgM12}%`, trend: -1.1 }
  ];

  const controls = (
    <select value={metric} onChange={(e) => setMetric(e.target.value)} style={controlStyle}>
      <option value="users">Retained users %</option>
      <option value="mrr">Retained MRR %</option>
    </select>
  );

  const mainChart = (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '2px', minWidth: '720px' }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 10px', textAlign: 'start', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cohort</th>
            <th style={{ padding: '6px 10px', textAlign: 'end',   fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</th>
            {Array.from({ length: 12 }, (_, m) => (
              <th key={m} style={{ padding: '6px 8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94A3B8' }}>M{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, ri) => (
            <tr key={row.cohort}>
              <td style={{ padding: '6px 10px', fontSize: '12px', fontWeight: 700, color: '#F9FAFB', whiteSpace: 'nowrap' }}>{row.cohort}</td>
              <td style={{ padding: '6px 10px', fontSize: '12px', color: '#94A3B8', textAlign: 'end' }}>{row.size}</td>
              {row.retention.map((v, mi) => (
                <td key={mi} style={{
                  padding: 0,
                  width: '46px',
                  height: '32px',
                  background: colorFor(v),
                  color: v >= 60 ? '#0B1020' : '#F9FAFB',
                  fontSize: '11px',
                  fontWeight: 700,
                  textAlign: 'center',
                  borderRadius: '4px',
                  animation: `cell-fade ${300 + ri * 40 + mi * 25}ms ease both`
                }}>
                  {v == null ? '—' : `${v}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`@keyframes cell-fade { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );

  const drillDown = (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        Customers from worst cohort ({worstRow.cohort}) still active
      </div>
      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', color: '#F9FAFB', fontSize: '13px' }}>
        {[
          { name: 'Marmara Sigorta', mrr: '₺6,500' },
          { name: 'İzmir Cafe',      mrr: '₺240' },
          { name: 'Mersin Logistik', mrr: '₺290' },
          { name: 'Trabzon Smmm',    mrr: '₺89' }
        ].map((r) => (
          <li key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontWeight: 600 }}>{r.name}</span>
            <span style={{ fontWeight: 700 }}>{r.mrr}/mo</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsLab
        title="Cohort Analysis"
        subtitle="Retention curves by signup month — find the cohorts that stick"
        controls={controls}
        mainChart={mainChart}
        insights={insights}
        drillDown={drillDown}
      />
    </div>
  );
}

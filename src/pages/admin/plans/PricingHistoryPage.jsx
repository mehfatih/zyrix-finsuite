// ================================================================
// /admin/plans/history — Analytics Lab (Bible v2 §17.5)
// 24-month timeline of price changes per tier.
// ================================================================
import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AnalyticsLab from '@/components/admin/shared/AnalyticsLab';

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

const TIER_COLOR = { Lite: '#6B7280', Pro: '#1A56DB', Business: '#7C3AED', Enterprise: '#E30A17' };

const HISTORY = [
  { tier: 'Lite',       date: '2024-06-01', from: 7,   to: 9,   reason: 'Inflation adjustment',   impact: '+₺18k MRR' },
  { tier: 'Pro',        date: '2024-09-15', from: 24,  to: 29,  reason: 'Repackaging',            impact: '+₺92k MRR' },
  { tier: 'Business',   date: '2025-01-10', from: 79,  to: 99,  reason: 'New AI features bundle', impact: '+₺240k MRR' },
  { tier: 'Enterprise', date: '2025-04-01', from: 399, to: 499, reason: 'Add-on consolidation',   impact: '+₺112k ARR/account' },
  { tier: 'Pro',        date: '2025-12-01', from: 29,  to: 29,  reason: 'No change — held flat',   impact: '—' },
  { tier: 'Lite',       date: '2026-02-15', from: 9,   to: 9,   reason: 'No change — held flat',   impact: '—' }
];

export default function PricingHistoryPage() {
  const [tiers, setTiers] = useState({ Lite: true, Pro: true, Business: true, Enterprise: true });

  const data = useMemo(() => {
    const months = [];
    const start = new Date('2024-06-01');
    const end = new Date('2026-05-01');
    const cur = new Date(start);
    while (cur <= end) {
      months.push(cur.toISOString().slice(0, 7));
      cur.setMonth(cur.getMonth() + 1);
    }
    let lite = 7, pro = 24, business = 79, enterprise = 399;
    return months.map((m) => {
      HISTORY.forEach((h) => {
        if (h.date.slice(0, 7) === m) {
          if (h.tier === 'Lite') lite = h.to;
          if (h.tier === 'Pro') pro = h.to;
          if (h.tier === 'Business') business = h.to;
          if (h.tier === 'Enterprise') enterprise = h.to;
        }
      });
      return { m, Lite: lite, Pro: pro, Business: business, Enterprise: enterprise };
    });
  }, []);

  const lastChange = HISTORY.filter((h) => h.from !== h.to).slice(-1)[0];
  const avgIncrease = (() => {
    const real = HISTORY.filter((h) => h.from !== h.to);
    return Math.round(real.reduce((s, h) => s + ((h.to - h.from) / h.from) * 100, 0) / real.length);
  })();
  const mostChanged = (() => {
    const counts = HISTORY.filter((h) => h.from !== h.to).reduce((m, h) => ({ ...m, [h.tier]: (m[h.tier] || 0) + 1 }), {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  const insights = [
    { icon: '🕒', label: 'Last change',     value: lastChange?.date || '—', trend: null },
    { icon: '📈', label: 'Avg price ↑',     value: `${avgIncrease}%`, trend: null },
    { icon: '⚡', label: 'Most-changed',    value: mostChanged, trend: null },
    { icon: '💰', label: 'Revenue impact', value: '+₺462k MRR', trend: 24 }
  ];

  const controls = (
    <>
      {Object.keys(tiers).map((t) => (
        <button key={t} onClick={() => setTiers({ ...tiers, [t]: !tiers[t] })} style={{
          ...controlStyle,
          background: tiers[t] ? TIER_COLOR[t] : '#1E293B',
          color: tiers[t] ? '#FFFFFF' : '#94A3B8',
          opacity: tiers[t] ? 1 : 0.6
        }}>
          {t}
        </button>
      ))}
    </>
  );

  const mainChart = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="m" stroke="#94A3B8" fontSize={11} tickCount={8} />
        <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{ background: '#0B1020', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '8px', color: '#F9FAFB' }}
          formatter={(v, name) => [`$${v}`, name]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {Object.keys(tiers).filter((t) => tiers[t]).map((t, i) => (
          <Line key={t} type="stepAfter" dataKey={t} stroke={TIER_COLOR[t]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={1100} animationBegin={i * 150} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const drillDown = (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        Change log
      </div>
      <table style={{ width: '100%', fontSize: '13px', color: '#F9FAFB' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'start', padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>Date</th>
            <th style={{ textAlign: 'start', padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>Tier</th>
            <th style={{ textAlign: 'end',   padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>From</th>
            <th style={{ textAlign: 'end',   padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>To</th>
            <th style={{ textAlign: 'start', padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>Reason</th>
            <th style={{ textAlign: 'end',   padding: '8px 0', color: '#94A3B8', fontWeight: 700 }}>Impact</th>
          </tr>
        </thead>
        <tbody>
          {HISTORY.map((h, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <td style={{ padding: '8px 0' }}>{h.date}</td>
              <td style={{ padding: '8px 0', fontWeight: 700, color: TIER_COLOR[h.tier] }}>{h.tier}</td>
              <td style={{ padding: '8px 0', textAlign: 'end' }}>${h.from}</td>
              <td style={{ padding: '8px 0', textAlign: 'end', fontWeight: 700 }}>${h.to}</td>
              <td style={{ padding: '8px 0' }}>{h.reason}</td>
              <td style={{ padding: '8px 0', textAlign: 'end', color: h.impact.startsWith('+') ? '#10B981' : '#94A3B8' }}>{h.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsLab
        title="Pricing History"
        subtitle="24 months of price changes by tier"
        controls={controls}
        mainChart={mainChart}
        insights={insights}
        drillDown={drillDown}
      />
    </div>
  );
}

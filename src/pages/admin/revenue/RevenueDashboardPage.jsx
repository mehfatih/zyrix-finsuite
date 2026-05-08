// ================================================================
// /admin/revenue — Analytics Lab (Bible v2 §17.5)
// Stacked revenue by tier with period + dimension drill-downs.
// ================================================================
import { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

export default function RevenueDashboardPage() {
  const [period, setPeriod] = useState('90d');
  const [dimension, setDimension] = useState('plan');

  const data = useMemo(() => {
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000);
      const base = 800000 + i * 1500;
      return {
        date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        Lite:       base * 0.05 + Math.random() * 5000,
        Pro:        base * 0.30 + Math.random() * 12000,
        Business:   base * 0.40 + Math.random() * 18000,
        Enterprise: base * 0.25 + Math.random() * 14000
      };
    });
  }, [period]);

  const insights = [
    { icon: '💰', label: 'Total MRR',  value: '₺929,353', trend: 12.1 },
    { icon: '📈', label: 'ARR',        value: '₺11.15M',  trend: 12.1 },
    { icon: '🎯', label: 'NRR',        value: '108.4%',   trend: 3.2 },
    { icon: '📉', label: 'Churn',      value: '2.1%',     trend: -0.6 }
  ];

  const controls = (
    <>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={controlStyle}>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="365d">Last 12 months</option>
      </select>
      <select value={dimension} onChange={(e) => setDimension(e.target.value)} style={controlStyle}>
        <option value="plan">By plan</option>
        <option value="country">By country</option>
        <option value="cohort">By cohort</option>
      </select>
    </>
  );

  const mainChart = (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="rev-lite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B7280" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6B7280" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="rev-pro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A56DB" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#1A56DB" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="rev-biz" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="rev-ent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E30A17" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#E30A17" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickCount={6} />
        <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{
            background: '#0B1020',
            border: '1px solid rgba(34,211,238,0.3)',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          formatter={(v) => `₺${Math.round(v).toLocaleString()}`}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Area type="monotone" dataKey="Lite"       stackId="1" stroke="#6B7280" fill="url(#rev-lite)" animationDuration={1100} />
        <Area type="monotone" dataKey="Pro"        stackId="1" stroke="#1A56DB" fill="url(#rev-pro)"  animationDuration={1100} />
        <Area type="monotone" dataKey="Business"   stackId="1" stroke="#7C3AED" fill="url(#rev-biz)"  animationDuration={1100} />
        <Area type="monotone" dataKey="Enterprise" stackId="1" stroke="#E30A17" fill="url(#rev-ent)"  animationDuration={1100} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const drillDown = (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        {dimension === 'plan' ? 'Top plans by MRR' : dimension === 'country' ? 'Top countries by MRR' : 'Top cohorts by retained MRR'}
      </div>
      <table style={{ width: '100%', fontSize: '13px', color: '#F9FAFB' }}>
        <tbody>
          {(dimension === 'plan' ? [
            ['Business',    '₺371,741', '+14.2%'],
            ['Enterprise',  '₺232,338', '+9.8%'],
            ['Pro',         '₺278,805', '+6.4%'],
            ['Lite',        '₺46,468',  '-1.2%']
          ] : dimension === 'country' ? [
            ['🇹🇷 Türkiye', '₺612,450', '+13.1%'],
            ['🇦🇪 UAE',     '₺128,300', '+18.4%'],
            ['🇸🇦 KSA',     '₺94,210',  '+8.2%'],
            ['🇪🇬 Egypt',   '₺46,180',  '+5.5%']
          ] : [
            ['2026-Q1', '₺312,400', '+22%'],
            ['2025-Q4', '₺248,100', '+11%'],
            ['2025-Q3', '₺178,400', '+4%'],
            ['2025-Q2', '₺96,200',  '-2%']
          ]).map((row) => (
            <tr key={row[0]} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <td style={{ padding: '10px 0', fontWeight: 700 }}>{row[0]}</td>
              <td style={{ padding: '10px 0', textAlign: 'end', fontWeight: 700 }}>{row[1]}</td>
              <td style={{ padding: '10px 0', textAlign: 'end', color: row[2].startsWith('-') ? '#EF4444' : '#10B981', fontWeight: 700 }}>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsLab
        title="Revenue Dashboard"
        subtitle="Stacked revenue by tier — drill into period and dimension"
        controls={controls}
        mainChart={mainChart}
        insights={insights}
        drillDown={drillDown}
      />
    </div>
  );
}

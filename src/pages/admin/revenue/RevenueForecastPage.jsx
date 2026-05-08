// ================================================================
// /admin/revenue/forecast — Analytics Lab (Bible v2 §17.5)
// 3-scenario MRR forecast with assumption sliders.
// ================================================================
import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
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

const sliderRow = (label, value, setValue, min, max, step, suffix) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    color: '#F9FAFB',
    background: '#1E293B',
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px'
  }}>
    <span style={{ minWidth: '70px', color: '#94A3B8' }}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      style={{ flex: 1 }} />
    <strong style={{ minWidth: '40px', textAlign: 'end' }}>{value}{suffix}</strong>
  </div>
);

export default function RevenueForecastPage() {
  const [horizon, setHorizon] = useState(6);
  const [cac, setCac] = useState(180);
  const [churn, setChurn] = useState(2.1);
  const [conversion, setConversion] = useState(34);

  const data = useMemo(() => {
    const months = ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26'];
    const past = months.map((m, i) => ({ m, actual: 720000 + i * 28000 + Math.random() * 12000 }));

    const lastActual = past[past.length - 1].actual;
    const baseGrowth = 0.04 + (conversion / 100 - 0.34) * 0.5;
    const churnDrag = (churn / 100) * 1.2;

    const futureMonths = ['Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27'].slice(0, horizon);
    const future = futureMonths.map((m, i) => {
      const t = i + 1;
      const conservative = lastActual * Math.pow(1 + (baseGrowth - 0.025) - churnDrag, t);
      const likely       = lastActual * Math.pow(1 + baseGrowth - churnDrag, t);
      const optimistic   = lastActual * Math.pow(1 + (baseGrowth + 0.025) - churnDrag, t);
      return { m, conservative, likely, optimistic };
    });

    return [
      ...past.map((p) => ({ m: p.m, actual: p.actual })),
      ...future
    ];
  }, [horizon, churn, conversion]);

  const lastForecast = data[data.length - 1];
  const predictedMrr = lastForecast?.likely || 0;
  const requiredNew = predictedMrr - 720000;
  const ciDelta = lastForecast ? lastForecast.optimistic - lastForecast.conservative : 0;

  const insights = [
    { icon: '🎯', label: 'Predicted MRR (12mo)', value: `₺${Math.round(predictedMrr / 1000)}k`, trend: null },
    { icon: '📊', label: 'Confidence interval',  value: `±₺${Math.round(ciDelta / 2 / 1000)}k`, trend: null },
    { icon: '📈', label: 'Required new MRR',     value: `₺${Math.round(requiredNew / 1000)}k`, trend: null },
    { icon: '⚠',  label: 'Risk factor',         value: churn > 3 ? 'High' : churn > 2 ? 'Medium' : 'Low', trend: null }
  ];

  const controls = (
    <>
      <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} style={controlStyle}>
        <option value={3}>3 months</option>
        <option value={6}>6 months</option>
        <option value={12}>12 months</option>
      </select>
      {sliderRow('CAC',        cac,        setCac,        80,  500, 10,  '₺')}
      {sliderRow('Churn',      churn,      setChurn,      0.5, 6,   0.1, '%')}
      {sliderRow('Conversion', conversion, setConversion, 10,  60,  1,   '%')}
    </>
  );

  const mainChart = (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="m" stroke="#94A3B8" fontSize={11} />
        <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#0B1020', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '8px', color: '#F9FAFB' }}
          formatter={(v) => `₺${Math.round(v).toLocaleString()}`}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <ReferenceLine x="May 26" stroke="rgba(34,211,238,0.5)" strokeDasharray="4 4" label={{ value: 'now', fill: '#22D3EE', fontSize: 11 }} />
        <Line type="monotone" dataKey="actual"       stroke="#22D3EE" strokeWidth={3} dot={false} animationDuration={1100} />
        <Line type="monotone" dataKey="optimistic"   stroke="#10B981" strokeWidth={2} strokeDasharray="6 4" dot={false} animationDuration={1300} animationBegin={150} />
        <Line type="monotone" dataKey="likely"       stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 4" dot={false} animationDuration={1300} animationBegin={300} />
        <Line type="monotone" dataKey="conservative" stroke="#EF4444" strokeWidth={2} strokeDasharray="6 4" dot={false} animationDuration={1300} animationBegin={450} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsLab
        title="Revenue Forecast"
        subtitle="Three scenarios from current run-rate, CAC, churn, and conversion"
        controls={controls}
        mainChart={mainChart}
        insights={insights}
      />
    </div>
  );
}

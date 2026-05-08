// ================================================================
// /admin/plans/ab-test — Data Explorer (Bible v2 §17.1)
// ================================================================
import DataExplorer from '@/components/admin/shared/DataExplorer';

const STATUSES = [
  { v: 'running', c: '#10B981' },
  { v: 'paused',  c: '#F59E0B' },
  { v: 'done',    c: '#94A3B8' }
];

const tests = [
  { id: 'PT-2026-04', name: 'Pricing card hierarchy',  status: 'running', traffic: 50, lift: 12.4,  confidence: 95, started: '2026-04-12', ends: '2026-05-15', variants: [60, 40] },
  { id: 'PT-2026-03', name: 'Annual upsell modal',     status: 'running', traffic: 25, lift: 4.1,   confidence: 78, started: '2026-04-22', ends: '2026-05-22', variants: [50, 50] },
  { id: 'PT-2026-02', name: 'Free-trial CTA copy',     status: 'done',    traffic: 100, lift: 8.7,  confidence: 99, started: '2026-03-01', ends: '2026-03-30', variants: [50, 50] },
  { id: 'PT-2026-01', name: 'Lite plan removal',       status: 'paused',  traffic: 25, lift: -3.2,  confidence: 22, started: '2026-04-29', ends: '2026-05-29', variants: [70, 30] },
  { id: 'PT-2025-09', name: 'Onboarding video first',  status: 'done',    traffic: 100, lift: 14.3, confidence: 99, started: '2025-09-01', ends: '2025-09-30', variants: [50, 50] },
  { id: 'PT-2025-08', name: 'Founder note on landing', status: 'done',    traffic: 100, lift: 2.1,  confidence: 65, started: '2025-08-01', ends: '2025-08-31', variants: [50, 50] }
];

const StatusDot = ({ status }) => {
  const s = STATUSES.find((x) => x.v === status);
  const c = s?.c || '#94A3B8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '12px', fontWeight: 600, color: c, textTransform: 'capitalize'
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%', background: c,
        animation: status === 'running' ? 'ab-pulse 1.5s ease-in-out infinite' : 'none'
      }} />
      {status}
      <style>{`@keyframes ab-pulse { 0%,100% { box-shadow: 0 0 0 0 ${c}66; } 50% { box-shadow: 0 0 0 5px ${c}00; } }`}</style>
    </span>
  );
};

const SplitBar = ({ variants }) => {
  const total = variants.reduce((s, v) => s + v, 0);
  return (
    <div style={{ display: 'flex', height: '8px', width: '100px', borderRadius: '4px', overflow: 'hidden' }}>
      {variants.map((v, i) => (
        <div key={i} style={{
          flex: v / total,
          background: i === 0 ? '#1A56DB' : '#7C3AED',
          transition: 'flex 250ms ease'
        }} />
      ))}
    </div>
  );
};

export default function ABTestingPage() {
  const running = tests.filter((t) => t.status === 'running').length;
  const wins = tests.filter((t) => t.status === 'done' && t.lift > 0).length;
  const avgLift = (tests.reduce((s, t) => s + Math.abs(t.lift), 0) / tests.length).toFixed(1);

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="A/B Testing"
        subtitle="Pricing and copy experiments"
        data={tests}
        rowKey={(r) => r.id}
        searchKeys={['id', 'name']}
        miniKpis={[
          { label: 'Running',    value: running, color: '#10B981' },
          { label: 'This quarter', value: tests.length, color: '#0F172A' },
          { label: 'Wins',       value: wins, color: '#1A56DB' },
          { label: 'Avg lift',   value: `${avgLift}%`, color: '#7C3AED' }
        ]}
        filters={[
          { key: 'status', label: 'statuses', options: STATUSES.map((s) => ({ value: s.v, label: s.v })) }
        ]}
        columns={[
          { key: 'name', label: 'Test', render: (r) => (
            <div>
              <div style={{ fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'variants', label: 'Variants', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SplitBar variants={r.variants} />
              <span style={{ fontSize: '12px', color: '#64748B' }}>{r.variants.join('/')}</span>
            </div>
          )},
          { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
          { key: 'traffic', label: 'Traffic', render: (r) => `${r.traffic}%` },
          { key: 'lift', label: 'Lift', render: (r) => (
            <span style={{ fontWeight: 700, color: r.lift >= 0 ? '#10B981' : '#EF4444' }}>
              {r.lift > 0 ? '+' : ''}{r.lift}%
            </span>
          )},
          { key: 'confidence', label: 'Confidence', render: (r) => (
            <span style={{
              padding: '2px 8px',
              background: r.confidence >= 95 ? 'rgba(16,185,129,0.1)' : r.confidence >= 80 ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.15)',
              color: r.confidence >= 95 ? '#10B981' : r.confidence >= 80 ? '#F59E0B' : '#64748B',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700
            }}>{r.confidence}%</span>
          )},
          { key: 'started', label: 'Started' },
          { key: 'ends',    label: 'Ends' }
        ]}
        primaryCTA={{
          label: 'New Test',
          icon: '＋',
          onClick: () => console.log('new test')
        }}
        aiInsight={`Pricing test 'PT-2026-04' is at 95% confidence — promote winning variant.`}
      />
    </div>
  );
}

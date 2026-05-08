// ================================================================
// /admin/revenue/failed-payments — Data Explorer (red accent)
// ================================================================
import DataExplorer from '@/components/admin/shared/DataExplorer';

const REASONS = [
  { v: 'Card expired',      c: '#F59E0B' },
  { v: 'Insufficient funds',c: '#DC2626' },
  { v: 'Bank declined',     c: '#991B1B' },
  { v: 'Network timeout',   c: '#64748B' }
];

const NAMES = ['Levana İlaç', 'Aydın Ova', 'Beyoğlu Restoran', 'Cairo Imports', 'MENA Trading',
  'Marmara Sigorta', 'Bursa Gıda', 'Konya Tekstil', 'İzmir Cafe', 'Eskişehir IT',
  'Antalya Tour', 'Mersin Logistik', 'Trabzon Smmm', 'Adana Tekstil', 'Riyadh Holding',
  'Dubai Ventures', 'Doha Trading', 'Alexandria Foods'];

const PLANS = ['Pro', 'Business', 'Enterprise'];

const failed = NAMES.map((name, i) => {
  const reason = REASONS[i % REASONS.length];
  const plan = PLANS[i % PLANS.length];
  const amount = plan === 'Enterprise' ? 4999 : plan === 'Business' ? 1499 : 499;
  const days = (i * 5 + 1) % 60;
  return {
    id: `pay-${5000 + i}`,
    customer: name,
    plan,
    amount,
    reason: reason.v,
    daysOverdue: days,
    lastAttempt: new Date(Date.now() - 86400000).toISOString().slice(0, 16).replace('T', ' '),
    nextRetry: new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  };
});

const ReasonBadge = ({ reason }) => {
  const r = REASONS.find((x) => x.v === reason);
  const c = r?.c || '#64748B';
  return (
    <span style={{
      padding: '3px 10px',
      background: `${c}15`,
      color: c,
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 700
    }}>{reason}</span>
  );
};

export default function FailedPaymentsPage() {
  const totalAtRisk = failed.reduce((s, f) => s + f.amount, 0);
  const critical = failed.filter((f) => f.daysOverdue > 30).length;
  const recoverable = failed.filter((f) => f.reason !== 'Bank declined').length;

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Failed Payments"
        subtitle="Charges that did not complete — recovery queue"
        data={failed}
        rowKey={(r) => r.id}
        searchKeys={['customer', 'id', 'reason']}
        miniKpis={[
          { label: 'Total failed', value: failed.length, color: '#DC2626' },
          { label: 'At risk', value: `₺${totalAtRisk.toLocaleString()}`, color: '#EF4444' },
          { label: 'Critical (>30d)', value: critical, color: '#7F1D1D' },
          { label: 'Recoverable', value: recoverable, color: '#10B981' }
        ]}
        filters={[
          { key: 'reason', label: 'reasons', options: REASONS.map((r) => ({ value: r.v, label: r.v })) }
        ]}
        columns={[
          { key: 'customer', label: 'Customer', render: (r) => (
            <div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.customer}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'plan', label: 'Plan' },
          { key: 'amount', label: 'Amount', render: (r) => (
            <span style={{ fontWeight: 800, color: '#DC2626' }}>₺{r.amount.toLocaleString()}</span>
          )},
          { key: 'reason', label: 'Reason', render: (r) => <ReasonBadge reason={r.reason} /> },
          { key: 'daysOverdue', label: 'Days overdue', render: (r) => (
            <span style={{
              padding: '3px 8px',
              background: r.daysOverdue > 30 ? 'rgba(220,38,38,0.1)' : r.daysOverdue > 7 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              color: r.daysOverdue > 30 ? '#DC2626' : r.daysOverdue > 7 ? '#F59E0B' : '#10B981',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700
            }}>{r.daysOverdue}d</span>
          )},
          { key: 'lastAttempt', label: 'Last attempt' },
          { key: 'nextRetry', label: 'Next retry' }
        ]}
        bulkActions={[
          { label: 'Retry payment now', icon: '↻', primary: true, onClick: (ids) => console.log('retry', ids) },
          { label: 'Send card-update email', icon: '✉', onClick: (ids) => console.log('email', ids) }
        ]}
        primaryCTA={{
          label: 'Retry all',
          icon: '↻',
          background: '#DC2626',
          onClick: () => console.log('retry all')
        }}
        aiInsight={`₺${totalAtRisk.toLocaleString()} at risk · ${critical} critical (>30d) — trigger card-update emails to recover.`}
      />
    </div>
  );
}

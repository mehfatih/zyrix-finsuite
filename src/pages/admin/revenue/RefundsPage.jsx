// ================================================================
// /admin/revenue/refunds — Data Explorer (Bible v2 §17.1)
// ================================================================
import { useNavigate } from 'react-router-dom';
import DataExplorer from '@/components/admin/shared/DataExplorer';

const STATUSES = [
  { v: 'pending',   c: '#F59E0B' },
  { v: 'processed', c: '#10B981' },
  { v: 'failed',    c: '#EF4444' }
];

const REASONS = ['Duplicate charge', 'Cancellation', 'Customer dispute', 'Service issue', 'Bug refund'];

const NAMES = ['Levana İlaç', 'Aydın Ova', 'Beyoğlu Restoran', 'Cairo Imports', 'MENA Trading',
  'Marmara Sigorta', 'Bursa Gıda', 'Konya Tekstil', 'İzmir Cafe', 'Eskişehir IT',
  'Antalya Tour', 'Mersin Logistik', 'Riyadh Holding', 'Dubai Ventures'];

const refunds = NAMES.map((name, i) => {
  const status = STATUSES[i % STATUSES.length].v;
  const amount = (i * 73 % 5000) + 100;
  return {
    id: `ref-${4000 + i}`,
    customer: name,
    originalPayment: `pay-${3000 + i}`,
    amount,
    reason: REASONS[i % REASONS.length],
    status,
    requested: new Date(Date.now() - (i * 2 + 1) * 86400000).toISOString().slice(0, 10),
    processed: status === 'processed' ? new Date(Date.now() - i * 86400000).toISOString().slice(0, 10) : '—'
  };
});

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
        animation: status === 'pending' ? 'ref-pulse 1.5s ease-in-out infinite' : 'none'
      }} />
      {status}
      <style>{`@keyframes ref-pulse { 0%,100% { box-shadow: 0 0 0 0 ${c}66; } 50% { box-shadow: 0 0 0 5px ${c}00; } }`}</style>
    </span>
  );
};

export default function RefundsPage() {
  const navigate = useNavigate();
  const pending = refunds.filter((r) => r.status === 'pending').length;
  const processedThisMonth = refunds.filter((r) => r.status === 'processed').length;
  const totalRefunded = refunds.filter((r) => r.status === 'processed').reduce((s, r) => s + r.amount, 0);
  const oldPending = refunds.filter((r) => r.status === 'pending' && (Date.now() - new Date(r.requested)) / 86400000 > 2).length;

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Refunds"
        subtitle="Pending and processed refund queue"
        data={refunds}
        rowKey={(r) => r.id}
        searchKeys={['customer', 'id', 'originalPayment', 'reason']}
        miniKpis={[
          { label: 'Pending',   value: pending, color: '#F59E0B' },
          { label: 'Processed (mo.)', value: processedThisMonth, color: '#10B981' },
          { label: 'Total refunded', value: `₺${totalRefunded.toLocaleString()}`, color: '#0F172A' },
          { label: 'Avg processing', value: '1.4d', color: '#1A56DB' }
        ]}
        filters={[
          { key: 'status', label: 'statuses', options: STATUSES.map((s) => ({ value: s.v, label: s.v })) },
          { key: 'reason', label: 'reasons',  options: REASONS.map((r) => ({ value: r, label: r })) }
        ]}
        columns={[
          { key: 'customer', label: 'Customer', render: (r) => (
            <div>
              <div style={{ fontWeight: 700 }}>{r.customer}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'originalPayment', label: 'Original payment', render: (r) => (
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>{r.originalPayment}</span>
          )},
          { key: 'amount', label: 'Amount', render: (r) => (
            <span style={{ fontWeight: 800, color: '#0F172A' }}>₺{r.amount.toLocaleString()}</span>
          )},
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
          { key: 'requested', label: 'Requested' },
          { key: 'processed',  label: 'Processed' }
        ]}
        bulkActions={[
          { label: 'Approve selected', icon: '✓', primary: true, onClick: (ids) => console.log('approve', ids) },
          { label: 'Reject',           icon: '✕', danger: true, onClick: (ids) => console.log('reject', ids) }
        ]}
        primaryCTA={{
          label: 'Issue Manual Refund',
          icon: '＋',
          onClick: () => navigate('/admin/revenue/refunds')
        }}
        aiInsight={`${oldPending} refund${oldPending === 1 ? '' : 's'} pending > 48h — review and approve.`}
      />
    </div>
  );
}

// ================================================================
// /admin/plans/quotes — Data Explorer (Bible v2 §17.1)
// ================================================================
import DataExplorer from '@/components/admin/shared/DataExplorer';

const STATUSES = [
  { v: 'draft',    c: '#94A3B8' },
  { v: 'sent',     c: '#1A56DB' },
  { v: 'accepted', c: '#10B981' },
  { v: 'expired',  c: '#EF4444' }
];

const OWNERS = ['M. Fatih', 'Ayşe Demir', 'Hakan Yıldız', 'Selma Kaya'];

const CUSTOMERS = ['Levana İlaç Holding', 'Aydın Ova Üretim', 'Riyadh Holding', 'Cairo Imports', 'Dubai Ventures',
  'Marmara Sigorta', 'Doha Trading', 'Beyoğlu Restoran', 'MENA Trading Co', 'Eskişehir IT',
  'Alexandria Foods', 'Kuwait Ports', 'Baku Logistics', 'Sharjah Industrial', 'Konya Üretim'];

const quotes = CUSTOMERS.map((c, i) => {
  const status = STATUSES[i % STATUSES.length].v;
  const arr = (i * 53 % 200 + 50) * 1000;
  return {
    id: `Q-2026-${String(100 + i).padStart(4, '0')}`,
    customer: c,
    status,
    annualValue: arr,
    created: new Date(Date.now() - (i * 4 + 7) * 86400000).toISOString().slice(0, 10),
    expires: new Date(Date.now() + ((i % 30) - 5) * 86400000).toISOString().slice(0, 10),
    owner: OWNERS[i % OWNERS.length]
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
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c }} />
      {status}
    </span>
  );
};

export default function CustomQuotesPage() {
  const open = quotes.filter((q) => q.status === 'sent' || q.status === 'draft').length;
  const accepted = quotes.filter((q) => q.status === 'accepted').length;
  const pipeline = quotes.filter((q) => q.status === 'sent').reduce((s, q) => s + q.annualValue, 0);
  const avgDeal = Math.round(quotes.reduce((s, q) => s + q.annualValue, 0) / quotes.length);

  const expiringSoon = quotes.filter((q) => {
    const days = (new Date(q.expires) - Date.now()) / 86400000;
    return q.status === 'sent' && days >= 0 && days <= 7;
  });
  const atRisk = expiringSoon.reduce((s, q) => s + q.annualValue, 0);

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Custom Quotes"
        subtitle="Sales-led pricing for Enterprise prospects"
        data={quotes}
        rowKey={(r) => r.id}
        searchKeys={['customer', 'id', 'owner']}
        miniKpis={[
          { label: 'Open',         value: open, color: '#1A56DB' },
          { label: 'Accepted (Q)', value: accepted, color: '#10B981' },
          { label: 'ARR pipeline', value: `₺${pipeline.toLocaleString()}`, color: '#7C3AED' },
          { label: 'Avg deal',     value: `₺${avgDeal.toLocaleString()}`, color: '#F59E0B' }
        ]}
        filters={[
          { key: 'status', label: 'statuses', options: STATUSES.map((s) => ({ value: s.v, label: s.v })) },
          { key: 'owner',  label: 'owners',   options: OWNERS.map((o) => ({ value: o, label: o })) }
        ]}
        columns={[
          { key: 'id', label: 'Quote', render: (r) => (
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#1A56DB', fontWeight: 700 }}>{r.id}</span>
          )},
          { key: 'customer', label: 'Customer', render: (r) => (
            <span style={{ fontWeight: 700 }}>{r.customer}</span>
          )},
          { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
          { key: 'annualValue', label: 'Annual value', render: (r) => (
            <span style={{ fontWeight: 800, color: '#0F172A' }}>₺{r.annualValue.toLocaleString()}</span>
          )},
          { key: 'created', label: 'Created' },
          { key: 'expires', label: 'Expires' },
          { key: 'owner',   label: 'Owner' }
        ]}
        primaryCTA={{
          label: 'New Quote',
          icon: '＋',
          onClick: () => console.log('new quote')
        }}
        aiInsight={`${expiringSoon.length} quote${expiringSoon.length === 1 ? '' : 's'} expiring in <7 days — total ₺${atRisk.toLocaleString()} ARR at risk.`}
      />
    </div>
  );
}

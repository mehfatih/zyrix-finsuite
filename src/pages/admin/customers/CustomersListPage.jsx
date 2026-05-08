// ================================================================
// /admin/customers — Data Explorer (Bible v2 §17.1)
// ================================================================
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataExplorer from '@/components/admin/shared/DataExplorer';

const StatusDot = ({ status }) => {
  const c = status === 'active' ? '#10B981' :
            status === 'trial'  ? '#F59E0B' :
            status === 'paused' ? '#94A3B8' :
                                  '#EF4444';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '12px', fontWeight: 600, color: c,
      textTransform: 'capitalize'
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%', background: c,
        animation: status === 'trial' ? 'dot-pulse 1.5s ease-in-out infinite' : 'none',
        boxShadow: `0 0 0 0 ${c}66`
      }} />
      {status}
      <style>{`@keyframes dot-pulse { 0%,100% { box-shadow: 0 0 0 0 ${c}66; } 50% { box-shadow: 0 0 0 5px ${c}00; } }`}</style>
    </span>
  );
};

const Sparkline = ({ data, trend }) => {
  if (!data) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - ((v - min) / range) * 20}`).join(' ');
  const color = trend >= 0 ? '#10B981' : '#EF4444';
  return <svg width={60} height={20}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
};

const TierBadge = ({ tier }) => {
  const colors = {
    Lite:       '#6B7280',
    Pro:        '#1A56DB',
    Business:   '#7C3AED',
    Enterprise: '#E30A17'
  };
  const c = colors[tier] || '#6B7280';
  return (
    <span style={{
      padding: '3px 10px',
      background: `${c}15`,
      color: c,
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>{tier}</span>
  );
};

const generateMrrSparkline = (base) =>
  Array.from({ length: 14 }, () => base + (Math.random() - 0.5) * base * 0.2);

const mockCustomers = [
  { id: 'cus-1000', name: 'Levana İlaç Holding',  email: 'contact@levana.com.tr',     tier: 'Enterprise', status: 'active',  mrr: 12500, mrrSpark: generateMrrSparkline(12500), trend: 8.4 },
  { id: 'cus-1001', name: 'Aydın Ova Üretim',     email: 'fatura@aydinova.com.tr',    tier: 'Enterprise', status: 'active',  mrr: 11300, mrrSpark: generateMrrSparkline(11300), trend: 6.2 },
  { id: 'cus-1002', name: 'Beyoğlu Restoran',     email: 'mali@beyogluresto.com',     tier: 'Business',   status: 'active',  mrr: 10100, mrrSpark: generateMrrSparkline(10100), trend: 12.1 },
  { id: 'cus-1003', name: 'Cairo Imports',         email: 'finance@cairoimports.eg',   tier: 'Business',   status: 'active',  mrr: 8900,  mrrSpark: generateMrrSparkline(8900), trend: 4.8 },
  { id: 'cus-1004', name: 'MENA Trading Co',       email: 'billing@mena-trade.ae',     tier: 'Business',   status: 'trial',   mrr: 7700,  mrrSpark: generateMrrSparkline(7700), trend: -2.3 },
  { id: 'cus-1005', name: 'Marmara Sigorta',       email: 'finans@marmarasigorta.com', tier: 'Business',   status: 'active',  mrr: 6500,  mrrSpark: generateMrrSparkline(6500), trend: 3.4 },
  { id: 'cus-1006', name: 'Bursa Gıda',            email: 'muhasebe@bursagida.com',    tier: 'Pro',        status: 'paused',  mrr: 580,   mrrSpark: generateMrrSparkline(580), trend: -18.5 },
  { id: 'cus-1007', name: 'Konya Tekstil',         email: 'fatura@konyatekstil.com',   tier: 'Pro',        status: 'active',  mrr: 320,   mrrSpark: generateMrrSparkline(320), trend: -5.2 },
  { id: 'cus-1008', name: 'İzmir Cafe',            email: 'cafe@izmircafe.com',        tier: 'Pro',        status: 'active',  mrr: 240,   mrrSpark: generateMrrSparkline(240), trend: 1.8 },
  { id: 'cus-1009', name: 'Eskişehir IT',          email: 'admin@eskisehir-it.com',    tier: 'Pro',        status: 'trial',   mrr: 410,   mrrSpark: generateMrrSparkline(410), trend: 9.4 },
  { id: 'cus-1010', name: 'Antalya Tour',          email: 'rez@antalyatour.com',       tier: 'Lite',       status: 'active',  mrr: 180,   mrrSpark: generateMrrSparkline(180), trend: -1.1 },
  { id: 'cus-1011', name: 'Mersin Logistik',       email: 'op@mersinlog.com',          tier: 'Lite',       status: 'active',  mrr: 290,   mrrSpark: generateMrrSparkline(290), trend: 0.4 },
  { id: 'cus-1012', name: 'Trabzon Smmm',          email: 'info@trabzonsmmm.com',      tier: 'Lite',       status: 'active',  mrr: 89,    mrrSpark: generateMrrSparkline(89), trend: 14.2 },
  { id: 'cus-1013', name: 'Adana Tekstil',         email: 'fatura@adanatekstil.com',   tier: 'Lite',       status: 'churned', mrr: 0,     mrrSpark: generateMrrSparkline(50), trend: -100 },
  { id: 'cus-1014', name: 'Riyadh Holding',        email: 'fin@riyadh-holding.sa',     tier: 'Enterprise', status: 'active',  mrr: 9200,  mrrSpark: generateMrrSparkline(9200), trend: 7.1 },
  { id: 'cus-1015', name: 'Dubai Ventures',        email: 'cfo@dubai-ventures.ae',     tier: 'Business',   status: 'active',  mrr: 6800,  mrrSpark: generateMrrSparkline(6800), trend: 5.5 },
  { id: 'cus-1016', name: 'Doha Trading',          email: 'admin@doha-trading.qa',     tier: 'Business',   status: 'active',  mrr: 5200,  mrrSpark: generateMrrSparkline(5200), trend: 11.3 },
  { id: 'cus-1017', name: 'Alexandria Foods',      email: 'sales@alexfoods.eg',        tier: 'Pro',        status: 'active',  mrr: 480,   mrrSpark: generateMrrSparkline(480), trend: 2.7 },
  { id: 'cus-1018', name: 'Kayseri Mobilya',       email: 'pazarlama@kayseri.com',     tier: 'Pro',        status: 'active',  mrr: 380,   mrrSpark: generateMrrSparkline(380), trend: 4.1 },
  { id: 'cus-1019', name: 'Hatay İhracat',         email: 'export@hatayihrac.com',     tier: 'Lite',       status: 'trial',   mrr: 120,   mrrSpark: generateMrrSparkline(120), trend: 0 }
];

export default function CustomersListPage() {
  const navigate = useNavigate();

  const totalMrr = mockCustomers.reduce((s, c) => s + c.mrr, 0);
  const activeCount = mockCustomers.filter((c) => c.status === 'active').length;
  const trialCount = mockCustomers.filter((c) => c.status === 'trial').length;

  const buildInsight = (rows) => {
    if (rows.length === 0) return 'No customers match — try clearing filters.';
    const trialing = rows.filter((r) => r.status === 'trial').length;
    const paused = rows.filter((r) => r.status === 'paused').length;
    if (paused > 0) return `${paused} paused account${paused > 1 ? 's' : ''} in this view — review payment status to recover MRR.`;
    if (trialing > 0) return `${trialing} customer${trialing > 1 ? 's' : ''} in trial — schedule conversion outreach this week.`;
    return `${rows.length} customers · combined MRR ₺${rows.reduce((s, r) => s + r.mrr, 0).toLocaleString()}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Customers"
        subtitle="Search, filter, and act on accounts"
        data={mockCustomers}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/admin/customers/${r.id}`)}
        searchKeys={['name', 'email', 'id']}
        miniKpis={[
          { label: 'Total customers', value: mockCustomers.length, color: '#0F172A' },
          { label: 'Active', value: activeCount, color: '#10B981' },
          { label: 'In trial', value: trialCount, color: '#F59E0B' },
          { label: 'Combined MRR', value: `₺${totalMrr.toLocaleString()}`, color: '#1A56DB' }
        ]}
        filters={[
          { key: 'tier', label: 'tiers', options: ['Lite', 'Pro', 'Business', 'Enterprise'].map((v) => ({ value: v, label: v })) },
          { key: 'status', label: 'statuses', options: ['active', 'trial', 'paused', 'churned'].map((v) => ({ value: v, label: v })) }
        ]}
        columns={[
          { key: 'name', label: 'Customer', render: (r) => (
            <div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'email', label: 'Email', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>{r.email}</span> },
          { key: 'tier', label: 'Tier', render: (r) => <TierBadge tier={r.tier} /> },
          { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
          { key: 'mrr', label: 'MRR', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkline data={r.mrrSpark} trend={r.trend} />
              <div style={{ minWidth: '70px', textAlign: 'end' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>₺{r.mrr.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: r.trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {r.trend > 0 ? '+' : ''}{r.trend}%
                </div>
              </div>
            </div>
          )}
        ]}
        bulkActions={[
          { label: 'Email selected', icon: '✉', onClick: (ids) => console.log('email', ids) },
          { label: 'Export', icon: '⬇', onClick: (ids) => console.log('export', ids) },
          { label: 'Archive', icon: '🗃', onClick: (ids) => console.log('archive', ids), danger: true }
        ]}
        primaryCTA={{
          label: 'Add Customer',
          icon: <Plus size={14} />,
          onClick: () => console.log('add')
        }}
        aiInsight={buildInsight}
      />
    </div>
  );
}

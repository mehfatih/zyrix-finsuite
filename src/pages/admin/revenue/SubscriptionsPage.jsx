// ================================================================
// /admin/revenue/subscriptions — Data Explorer (Bible v2 §17.1)
// ================================================================
import DataExplorer from '@/components/admin/shared/DataExplorer';

const StatusDot = ({ status }) => {
  const map = {
    active:    '#10B981',
    trialing:  '#F59E0B',
    past_due:  '#EF4444',
    canceled:  '#94A3B8'
  };
  const c = map[status] || '#94A3B8';
  const label = status.replace('_', ' ');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '12px', fontWeight: 600, color: c,
      textTransform: 'capitalize'
    }}>
      <span style={{
        width: '7px', height: '7px', borderRadius: '50%', background: c,
        animation: status === 'past_due' ? 'sub-pulse 1.5s ease-in-out infinite' : 'none'
      }} />
      {label}
      <style>{`@keyframes sub-pulse { 0%,100% { box-shadow: 0 0 0 0 ${c}66; } 50% { box-shadow: 0 0 0 5px ${c}00; } }`}</style>
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

const generate = (base) => Array.from({ length: 14 }, () => base + (Math.random() - 0.5) * base * 0.2);

const PLANS = ['Lite', 'Pro', 'Business', 'Enterprise'];
const STATUSES = ['active', 'trialing', 'past_due', 'canceled'];
const NAMES = ['Levana İlaç', 'Aydın Ova', 'Beyoğlu Restoran', 'Cairo Imports', 'MENA Trading',
  'Marmara Sigorta', 'Bursa Gıda', 'Konya Tekstil', 'İzmir Cafe', 'Eskişehir IT',
  'Antalya Tour', 'Mersin Logistik', 'Trabzon Smmm', 'Adana Tekstil', 'Riyadh Holding',
  'Dubai Ventures', 'Doha Trading', 'Alexandria Foods', 'Kayseri Mobilya', 'Hatay İhracat',
  'Sakarya Mobilya', 'Gaziantep Baharat', 'Denizli Tekstil', 'Samsun Tarım', 'Ordu Fındık',
  'Yalova Termal', 'Bolu Süt', 'Edirne Pirinç', 'Çanakkale Balık', 'Tekirdağ Şarap'];

const subs = NAMES.map((name, i) => {
  const tier = PLANS[i % PLANS.length];
  const baseMrr = tier === 'Enterprise' ? 9000 + i * 100 :
                   tier === 'Business' ? 5000 + i * 50 :
                   tier === 'Pro' ? 320 + i * 5 : 99;
  const status = STATUSES[i % STATUSES.length];
  const trend = (Math.random() - 0.4) * 20;
  return {
    id: `sub-${2000 + i}`,
    customer: name,
    plan: tier,
    status,
    started: new Date(Date.now() - (i * 21 + 60) * 86400000).toISOString().slice(0, 10),
    nextRenewal: new Date(Date.now() + (15 + i % 28) * 86400000).toISOString().slice(0, 10),
    mrr: status === 'canceled' ? 0 : baseMrr,
    mrrSpark: generate(baseMrr),
    trend
  };
});

export default function SubscriptionsPage() {
  const totalMrr = subs.reduce((s, x) => s + x.mrr, 0);
  const trialing = subs.filter((s) => s.status === 'trialing').length;
  const pastDue  = subs.filter((s) => s.status === 'past_due').length;

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Subscriptions"
        subtitle="Active, trialing, past-due, and canceled subscriptions"
        data={subs}
        rowKey={(r) => r.id}
        searchKeys={['customer', 'id', 'plan']}
        miniKpis={[
          { label: 'Total subs', value: subs.length, color: '#0F172A' },
          { label: 'Trialing', value: trialing, color: '#F59E0B' },
          { label: 'Past due', value: pastDue, color: '#EF4444' },
          { label: 'MRR (active)', value: `₺${totalMrr.toLocaleString()}`, color: '#10B981' }
        ]}
        filters={[
          { key: 'status', label: 'statuses', options: STATUSES.map((v) => ({ value: v, label: v.replace('_', ' ') })) },
          { key: 'plan',   label: 'plans',    options: PLANS.map((v) => ({ value: v, label: v })) }
        ]}
        columns={[
          { key: 'customer', label: 'Customer', render: (r) => (
            <div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.customer}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'plan', label: 'Plan' },
          { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
          { key: 'started', label: 'Started' },
          { key: 'nextRenewal', label: 'Next renewal' },
          { key: 'mrr', label: 'MRR', render: (r) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkline data={r.mrrSpark} trend={r.trend} />
              <div style={{ minWidth: '70px', textAlign: 'end' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>₺{r.mrr.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: r.trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {r.trend > 0 ? '+' : ''}{r.trend.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        ]}
        bulkActions={[
          { label: 'Send dunning email', icon: '✉', onClick: (ids) => console.log('dunning', ids) },
          { label: 'Cancel selected', icon: '✕', danger: true, onClick: (ids) => console.log('cancel', ids) }
        ]}
        aiInsight={`${pastDue} subscription${pastDue === 1 ? '' : 's'} past due — total ₺${subs.filter((s) => s.status === 'past_due').reduce((s, x) => s + x.mrr, 0).toLocaleString()} at risk.`}
      />
    </div>
  );
}

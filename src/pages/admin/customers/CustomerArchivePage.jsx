// ================================================================
// /admin/customers/archive — Data Explorer (red accent)
// Soft-deleted accounts, restorable for 30 days.
// ================================================================
import DataExplorer from '@/components/admin/shared/DataExplorer';

const archived = [
  { id: 'cus-9001', name: 'Eskidji Tekstil',     email: 'old@eskidji.com',         archivedAt: '2026-04-22', archivedBy: 'meh.fatih77@gmail.com', reason: 'Customer request' },
  { id: 'cus-9002', name: 'Ankara Reklam',       email: 'old@ankarareklam.com',    archivedAt: '2026-04-29', archivedBy: 'meh.fatih77@gmail.com', reason: 'Non-payment' },
  { id: 'cus-9003', name: 'İzmit Lojistik',      email: 'old@izmitlogistik.com',   archivedAt: '2026-05-01', archivedBy: 'admin@zyrix.com',       reason: 'Customer request' },
  { id: 'cus-9004', name: 'Konya Üretim',        email: 'fatura@konyauretim.com',  archivedAt: '2026-05-02', archivedBy: 'meh.fatih77@gmail.com', reason: 'Duplicate account' },
  { id: 'cus-9005', name: 'Sharm Travel',        email: 'old@sharmtravel.eg',      archivedAt: '2026-05-03', archivedBy: 'admin@zyrix.com',       reason: 'Bankruptcy' },
  { id: 'cus-9006', name: 'Manisa Bağcılık',     email: 'old@manisabag.com',       archivedAt: '2026-05-04', archivedBy: 'meh.fatih77@gmail.com', reason: 'Customer request' },
  { id: 'cus-9007', name: 'Doha Foods Co',       email: 'old@dohafoods.qa',        archivedAt: '2026-05-05', archivedBy: 'admin@zyrix.com',       reason: 'Non-payment' },
  { id: 'cus-9008', name: 'Erzurum Gıda',        email: 'old@erzurumgida.com',     archivedAt: '2026-05-06', archivedBy: 'meh.fatih77@gmail.com', reason: 'Switched provider' }
];

const ReasonBadge = ({ reason }) => {
  const colors = {
    'Customer request': '#1A56DB',
    'Non-payment':      '#DC2626',
    'Duplicate account':'#7C3AED',
    'Bankruptcy':       '#991B1B',
    'Switched provider':'#F59E0B'
  };
  const c = colors[reason] || '#64748B';
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

export default function CustomerArchivePage() {
  const recentlyArchived = archived.filter((a) => {
    const days = (Date.now() - new Date(a.archivedAt)) / 86400000;
    return days <= 7;
  }).length;

  return (
    <div style={{ padding: '20px' }}>
      <DataExplorer
        title="Archived Customers"
        subtitle="Soft-deleted records — restorable for 30 days"
        data={archived}
        rowKey={(r) => r.id}
        searchKeys={['name', 'email', 'id', 'reason']}
        miniKpis={[
          { label: 'Total archived', value: archived.length, color: '#DC2626' },
          { label: 'Last 7 days', value: recentlyArchived, color: '#F59E0B' },
          { label: 'Restorable', value: archived.length, color: '#10B981' },
          { label: 'Permanent purge', value: 0, color: '#94A3B8' }
        ]}
        filters={[
          {
            key: 'reason',
            label: 'reasons',
            options: ['Customer request', 'Non-payment', 'Duplicate account', 'Bankruptcy', 'Switched provider'].map((v) => ({ value: v, label: v }))
          }
        ]}
        columns={[
          { key: 'name', label: 'Customer', render: (r) => (
            <div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{r.id}</div>
            </div>
          )},
          { key: 'email', label: 'Email', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>{r.email}</span> },
          { key: 'reason', label: 'Reason', render: (r) => <ReasonBadge reason={r.reason} /> },
          { key: 'archivedAt', label: 'Archived', render: (r) => (
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A' }}>{r.archivedAt}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>by {r.archivedBy}</div>
            </div>
          )}
        ]}
        bulkActions={[
          { label: 'Restore selected', icon: '↩', primary: true, onClick: (ids) => console.log('restore', ids) },
          {
            label: 'Permanently delete',
            icon: '🗑',
            danger: true,
            onClick: (ids) => {
              if (window.confirm(`Permanently delete ${ids.length} customer(s)? This cannot be undone.`)) {
                console.log('purge', ids);
              }
            }
          }
        ]}
        aiInsight={`${recentlyArchived} archived in the last 7 days — review reasons for patterns.`}
      />
    </div>
  );
}

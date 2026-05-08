// ================================================================
// /admin/customers/bulk — Operation Console (Bible v2 §17.3)
// Multi-customer bulk action runner.
// ================================================================
import { useState, useMemo } from 'react';
import OperationConsole from '@/components/admin/shared/OperationConsole';

const CUSTOMERS = [
  { id: 'cus-1000', name: 'Levana İlaç Holding', tier: 'Enterprise', status: 'active' },
  { id: 'cus-1001', name: 'Aydın Ova Üretim',    tier: 'Enterprise', status: 'active' },
  { id: 'cus-1002', name: 'Beyoğlu Restoran',    tier: 'Business',   status: 'active' },
  { id: 'cus-1003', name: 'Cairo Imports',       tier: 'Business',   status: 'active' },
  { id: 'cus-1004', name: 'MENA Trading Co',     tier: 'Business',   status: 'trial' },
  { id: 'cus-1006', name: 'Bursa Gıda',          tier: 'Pro',        status: 'paused' },
  { id: 'cus-1007', name: 'Konya Tekstil',       tier: 'Pro',        status: 'active' },
  { id: 'cus-1008', name: 'İzmir Cafe',          tier: 'Pro',        status: 'active' },
  { id: 'cus-1010', name: 'Antalya Tour',        tier: 'Lite',       status: 'active' },
  { id: 'cus-1011', name: 'Mersin Logistik',     tier: 'Lite',       status: 'active' }
];

const ACTIONS = [
  { key: 'email',    label: 'Send email',    icon: '✉',  desc: 'Broadcast a custom email to selected accounts' },
  { key: 'export',   label: 'Export',        icon: '⬇',  desc: 'Download a CSV of selected accounts' },
  { key: 'tag',      label: 'Apply tag',     icon: '🏷', desc: 'Attach a label such as "VIP" or "At-Risk"' },
  { key: 'tier',     label: 'Change tier',   icon: '⬆', desc: 'Move accounts to a different plan tier' },
  { key: 'archive',  label: 'Archive',       icon: '🗃', desc: 'Soft-delete accounts (restorable for 30 days)' }
];

const labelStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid rgba(239,68,68,0.15)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

export default function CustomerBulkOpsPage() {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionKey, setActionKey] = useState('email');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [tierValue, setTierValue] = useState('Pro');

  const filtered = useMemo(() => {
    if (!search) return CUSTOMERS;
    const q = search.toLowerCase();
    return CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [search]);

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectedList = CUSTOMERS.filter((c) => selectedIds.has(c.id));
  const action = ACTIONS.find((a) => a.key === actionKey);

  return (
    <div style={{ padding: '20px' }}>
      <OperationConsole
        title="Bulk Operations"
        subtitle="Apply an action to many customers at once"
        warning="Bulk actions affect every selected account. Most actions are reversible (Email, Tag, Tier change), but Archive moves accounts to soft-delete state. Review carefully before executing."
        steps={[
          {
            key: 'select',
            label: 'Select customers',
            content: (
              <div>
                <label style={labelStyle}>Find customers</label>
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 600
                }}>
                  <span>{selectedIds.size} selected</span>
                  <button onClick={() => setSelectedIds(new Set(filtered.map((c) => c.id)))}
                    style={{ padding: '4px 10px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                    Select all visible
                  </button>
                  <button onClick={() => setSelectedIds(new Set())}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    Clear
                  </button>
                </div>
                <div style={{ marginTop: '12px', maxHeight: '320px', overflowY: 'auto' }}>
                  {filtered.map((c) => {
                    const checked = selectedIds.has(c.id);
                    return (
                      <label key={c.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: checked ? 'rgba(220,38,38,0.06)' : 'transparent',
                        border: `1px solid ${checked ? 'rgba(220,38,38,0.2)' : 'transparent'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '4px'
                      }}>
                        <input type="checkbox" checked={checked} onChange={() => toggle(c.id)} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>{c.id} · {c.tier} · {c.status}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )
          },
          {
            key: 'action',
            label: 'Pick action',
            content: (
              <div>
                <label style={labelStyle}>What should happen?</label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {ACTIONS.map((a) => (
                    <label key={a.key} style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '12px 14px',
                      background: actionKey === a.key ? 'rgba(220,38,38,0.06)' : '#FFFFFF',
                      border: `1px solid ${actionKey === a.key ? 'rgba(220,38,38,0.3)' : 'rgba(239,68,68,0.1)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <input type="radio" name="bulkAction" value={a.key} checked={actionKey === a.key} onChange={() => setActionKey(a.key)} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{a.icon} {a.label}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{a.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          },
          {
            key: 'configure',
            label: 'Configure',
            content: (
              <div>
                {actionKey === 'email' && (
                  <>
                    <label style={labelStyle}>Subject</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Important update for your Zyrix account"
                      style={inputStyle} />
                    <label style={{ ...labelStyle, marginTop: '14px' }}>Body</label>
                    <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
                      rows={6}
                      placeholder="Hi [Name], we wanted to let you know..."
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </>
                )}
                {actionKey === 'export' && (
                  <div style={{ fontSize: '14px', color: '#0F172A' }}>
                    A CSV with id, name, email, tier, status, mrr will be downloaded for the {selectedIds.size} selected customers.
                  </div>
                )}
                {actionKey === 'tag' && (
                  <>
                    <label style={labelStyle}>Tag to apply</label>
                    <input type="text" value={tagValue} onChange={(e) => setTagValue(e.target.value)} placeholder="VIP" style={inputStyle} />
                  </>
                )}
                {actionKey === 'tier' && (
                  <>
                    <label style={labelStyle}>Move to tier</label>
                    <select value={tierValue} onChange={(e) => setTierValue(e.target.value)} style={inputStyle}>
                      <option>Lite</option><option>Pro</option><option>Business</option><option>Enterprise</option>
                    </select>
                  </>
                )}
                {actionKey === 'archive' && (
                  <div style={{ fontSize: '14px', color: '#7F1D1D' }}>
                    Selected customers will be soft-deleted. They can be restored from the Archive page within 30 days.
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'preview',
            label: 'Preview & execute',
            content: (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>Final review</h3>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#DC2626',
                  marginBottom: '8px'
                }}>{selectedIds.size}</div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                  customer{selectedIds.size === 1 ? '' : 's'} will be affected
                </div>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Action:</td><td style={{ fontWeight: 700 }}>{action.icon} {action.label}</td></tr>
                    {actionKey === 'email' && <>
                      <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Subject:</td><td style={{ fontWeight: 600 }}>{emailSubject || '(empty)'}</td></tr>
                    </>}
                    {actionKey === 'tag' && <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Tag:</td><td style={{ fontWeight: 700 }}>{tagValue || '(empty)'}</td></tr>}
                    {actionKey === 'tier' && <tr><td style={{ padding: '6px 0', color: '#64748B' }}>New tier:</td><td style={{ fontWeight: 700 }}>{tierValue}</td></tr>}
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
        livePreview={(
          <div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
              <strong style={{ color: '#DC2626' }}>{action.icon} {action.label}</strong>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {selectedList.length} selected
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {selectedList.length === 0 && (
                <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                  No customers selected yet.
                </div>
              )}
              {selectedList.map((c) => (
                <div key={c.id} style={{
                  padding: '8px 10px',
                  background: 'rgba(15,23,42,0.03)',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '10px' }}>{c.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        executeLabel={`Execute on ${selectedIds.size}`}
        onExecute={() => alert(`Running ${action.label} on ${selectedIds.size} customers...`)}
      />
    </div>
  );
}

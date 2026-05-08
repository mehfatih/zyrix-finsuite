// ================================================================
// /admin/customers/impersonate — Operation Console (Bible v2 §17.3)
// ================================================================
import { useState, useMemo } from 'react';
import OperationConsole from '@/components/admin/shared/OperationConsole';

const CUSTOMERS = [
  { id: 'cus-1000', name: 'Levana İlaç Holding', tier: 'Enterprise' },
  { id: 'cus-1001', name: 'Aydın Ova Üretim',    tier: 'Enterprise' },
  { id: 'cus-1002', name: 'Beyoğlu Restoran',    tier: 'Business' },
  { id: 'cus-1003', name: 'Cairo Imports',       tier: 'Business' },
  { id: 'cus-1004', name: 'MENA Trading Co',     tier: 'Business' },
  { id: 'cus-1006', name: 'Bursa Gıda',          tier: 'Pro' },
  { id: 'cus-1014', name: 'Riyadh Holding',      tier: 'Enterprise' },
  { id: 'cus-1015', name: 'Dubai Ventures',      tier: 'Business' }
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

export default function CustomerImpersonatePage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return CUSTOMERS;
    const q = search.toLowerCase();
    return CUSTOMERS.filter((c) =>
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div style={{ padding: '20px' }}>
      <OperationConsole
        title="Impersonate Customer"
        subtitle="View the application as a specific customer for support and debugging"
        warning="You will see exactly what this customer sees, including private data. The session will be logged in the audit trail. The customer will NOT be notified, but the action is fully traceable. Use only for explicit support requests."
        steps={[
          {
            key: 'select',
            label: 'Select customer',
            content: (
              <div>
                <label style={labelStyle}>Customer</label>
                <input
                  type="text"
                  placeholder="Search customer name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ marginTop: '14px', maxHeight: '240px', overflowY: 'auto' }}>
                  {filtered.map((c) => (
                    <div key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      style={{
                        padding: '10px 12px',
                        background: selectedCustomer?.id === c.id ? 'rgba(220,38,38,0.08)' : 'transparent',
                        border: selectedCustomer?.id === c.id ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '4px'
                      }}>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{c.id} · {c.tier}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            key: 'reason',
            label: 'Reason',
            content: (
              <div>
                <label style={labelStyle}>Justification (required for audit)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Customer reported invoice #1284 not loading — investigating per ticket SUP-4521"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <label style={{ ...labelStyle, marginTop: '14px' }}>Session duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            )
          },
          {
            key: 'confirm',
            label: 'Confirm',
            content: (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>Final review</h3>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Customer:</td><td style={{ fontWeight: 700 }}>{selectedCustomer?.name || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Account ID:</td><td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{selectedCustomer?.id || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Reason:</td><td style={{ fontWeight: 500 }}>{reason || '(missing)'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Duration:</td><td style={{ fontWeight: 700 }}>{duration} minutes</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Audit log:</td><td style={{ fontWeight: 700, color: '#10B981' }}>Will be recorded</td></tr>
                  </tbody>
                </table>
                <div style={{
                  background: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '14px',
                  fontSize: '12px',
                  color: '#7F1D1D'
                }}>
                  ⚠ Clicking "Start Impersonation" will redirect you to the customer's view. Click "Exit Impersonation" (red banner) at any time to return.
                </div>
              </div>
            )
          }
        ]}
        livePreview={selectedCustomer ? (
          <div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>You will appear as:</div>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{selectedCustomer.name}</div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>{selectedCustomer.id}</div>
            <div style={{
              padding: '4px 8px',
              background: 'rgba(220,38,38,0.1)',
              color: '#DC2626',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 800,
              display: 'inline-block',
              marginTop: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{selectedCustomer.tier}</div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '14px 0' }} />
            <div style={{ fontSize: '12px', color: '#64748B' }}>Session length: <strong>{duration} min</strong></div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Logged by: <strong>meh.fatih77@gmail.com</strong></div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
            Select a customer to preview the impersonation session.
          </div>
        )}
        executeLabel="Start Impersonation"
        onExecute={() => alert(`Starting impersonation of ${selectedCustomer?.name}...`)}
      />
    </div>
  );
}

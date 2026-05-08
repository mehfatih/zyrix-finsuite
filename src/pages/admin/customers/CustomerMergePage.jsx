// ================================================================
// /admin/customers/merge — Operation Console (Bible v2 §17.3)
// Merge duplicate accounts into a primary record.
// ================================================================
import { useState, useMemo } from 'react';
import OperationConsole from '@/components/admin/shared/OperationConsole';

const ACCOUNTS = [
  { id: 'cus-1000', name: 'Levana İlaç Holding', email: 'contact@levana.com.tr', phone: '+90 212 555 0100', taxId: '6080612345', address: 'Maslak, İstanbul', tier: 'Enterprise', mrr: 12500 },
  { id: 'cus-1080', name: 'Levana Ilac',          email: 'fatura@levana.com.tr',  phone: '+90 212 555 0100', taxId: '6080612345', address: 'Maslak Mah., İstanbul', tier: 'Pro', mrr: 320 },
  { id: 'cus-1090', name: 'Levana Holding',       email: 'cfo@levana.com.tr',     phone: '+90 212 555 0101', taxId: '6080612345', address: 'Maslak, İstanbul', tier: 'Lite', mrr: 89 },
  { id: 'cus-2000', name: 'Aydın Ova Üretim',     email: 'fatura@aydinova.com.tr',phone: '+90 256 444 1010', taxId: '7090812345', address: 'Aydın OSB',         tier: 'Enterprise', mrr: 11300 }
];

const FIELDS = [
  { key: 'name',    label: 'Company name' },
  { key: 'email',   label: 'Primary email' },
  { key: 'phone',   label: 'Phone' },
  { key: 'taxId',   label: 'Tax ID' },
  { key: 'address', label: 'Billing address' },
  { key: 'tier',    label: 'Plan tier' }
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

export default function CustomerMergePage() {
  const [primaryId, setPrimaryId] = useState(null);
  const [secondaryIds, setSecondaryIds] = useState(new Set());
  const [resolved, setResolved] = useState({});

  const primary = ACCOUNTS.find((a) => a.id === primaryId);
  const secondaries = ACCOUNTS.filter((a) => secondaryIds.has(a.id));
  const involved = primary ? [primary, ...secondaries] : [];

  const conflicts = useMemo(() => {
    if (!primary || secondaries.length === 0) return [];
    return FIELDS
      .filter((f) => secondaries.some((s) => s[f.key] !== primary[f.key]))
      .map((f) => ({
        ...f,
        choices: Array.from(new Set(involved.map((a) => a[f.key])))
      }));
  }, [primary, secondaries, involved]);

  const merged = useMemo(() => {
    if (!primary) return null;
    const out = { ...primary };
    FIELDS.forEach((f) => {
      out[f.key] = resolved[f.key] ?? primary[f.key];
    });
    out.mrr = involved.reduce((s, a) => s + a.mrr, 0);
    return out;
  }, [primary, involved, resolved]);

  const togglePrimary = (id) => {
    setPrimaryId(id);
    const next = new Set(secondaryIds);
    next.delete(id);
    setSecondaryIds(next);
    setResolved({});
  };

  const toggleSecondary = (id) => {
    if (id === primaryId) return;
    const next = new Set(secondaryIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSecondaryIds(next);
    setResolved({});
  };

  return (
    <div style={{ padding: '20px' }}>
      <OperationConsole
        title="Account Merging"
        subtitle="Combine duplicate accounts into a single primary record"
        warning="Merging is permanent. Secondary accounts will be archived; their MRR, invoices, tickets, and history will all roll up into the primary account. You cannot un-merge."
        steps={[
          {
            key: 'primary',
            label: 'Pick primary',
            content: (
              <div>
                <label style={labelStyle}>Choose the account to KEEP</label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {ACCOUNTS.map((a) => (
                    <label key={a.id} style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '10px 14px',
                      background: primaryId === a.id ? 'rgba(220,38,38,0.06)' : '#FFFFFF',
                      border: `1px solid ${primaryId === a.id ? 'rgba(220,38,38,0.3)' : 'rgba(239,68,68,0.1)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <input type="radio" name="primary" checked={primaryId === a.id} onChange={() => togglePrimary(a.id)} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{a.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{a.id} · {a.tier} · ₺{a.mrr.toLocaleString()}/mo</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          },
          {
            key: 'secondary',
            label: 'Pick duplicates',
            content: (
              <div>
                <label style={labelStyle}>Accounts to merge into <strong>{primary?.name || '—'}</strong></label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {ACCOUNTS.filter((a) => a.id !== primaryId).map((a) => {
                    const checked = secondaryIds.has(a.id);
                    return (
                      <label key={a.id} style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '10px 14px',
                        background: checked ? 'rgba(220,38,38,0.06)' : '#FFFFFF',
                        border: `1px solid ${checked ? 'rgba(220,38,38,0.3)' : 'rgba(239,68,68,0.1)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleSecondary(a.id)} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{a.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>{a.id} · {a.tier} · ₺{a.mrr.toLocaleString()}/mo</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )
          },
          {
            key: 'conflicts',
            label: 'Resolve conflicts',
            content: (
              <div>
                <label style={labelStyle}>For each differing field, pick the value to keep</label>
                {conflicts.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#10B981' }}>
                    ✓ No conflicts detected — every field matches across selected accounts.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {conflicts.map((f) => (
                      <div key={f.key} style={{
                        padding: '12px 14px',
                        background: '#FFFBFB',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>{f.label}</div>
                        <div style={{ display: 'grid', gap: '6px' }}>
                          {f.choices.map((val) => (
                            <label key={String(val)} style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '6px 10px',
                              background: (resolved[f.key] ?? primary?.[f.key]) === val ? 'rgba(220,38,38,0.06)' : 'transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}>
                              <input type="radio" name={`field-${f.key}`}
                                checked={(resolved[f.key] ?? primary?.[f.key]) === val}
                                onChange={() => setResolved({ ...resolved, [f.key]: val })} />
                              <span style={{ fontFamily: f.key === 'taxId' || f.key === 'phone' ? 'monospace' : 'inherit' }}>{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'execute',
            label: 'Execute',
            content: (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>Final review</h3>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Primary account:</td><td style={{ fontWeight: 700 }}>{primary?.name} ({primary?.id})</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Will absorb:</td><td style={{ fontWeight: 700 }}>{secondaries.map((s) => s.name).join(', ') || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Combined MRR:</td><td style={{ fontWeight: 700, color: '#10B981' }}>₺{merged?.mrr?.toLocaleString() || 0}/mo</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Conflicts resolved:</td><td style={{ fontWeight: 700 }}>{conflicts.length}</td></tr>
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
        livePreview={merged ? (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Merged result
            </div>
            <div style={{
              padding: '14px',
              background: '#FFFFFF',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{merged.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginBottom: '12px' }}>{merged.id}</div>
              {FIELDS.filter((f) => f.key !== 'name').map((f) => (
                <div key={f.key} style={{ fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>{f.label}: </span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{merged[f.key]}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.06)', margin: '10px 0' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>₺{merged.mrr.toLocaleString()}/mo combined MRR</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
            Select a primary account to preview the merged result.
          </div>
        )}
        executeLabel={`Merge ${secondaries.length} into primary`}
        onExecute={() => alert(`Merging ${secondaries.length} accounts into ${primary?.name}...`)}
      />
    </div>
  );
}

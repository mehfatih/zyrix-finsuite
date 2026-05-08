// ================================================================
// /admin/revenue/invoice — Operation Console (Bible v2 §17.3)
// Build and send a manual invoice through Resend.
// ================================================================
import { useState, useMemo } from 'react';
import OperationConsole from '@/components/admin/shared/OperationConsole';

const CUSTOMERS = [
  { id: 'cus-1000', name: 'Levana İlaç Holding', email: 'fatura@levana.com.tr', taxId: '6080612345' },
  { id: 'cus-1002', name: 'Beyoğlu Restoran',    email: 'mali@beyogluresto.com', taxId: '1234567890' },
  { id: 'cus-1006', name: 'Bursa Gıda',          email: 'muhasebe@bursagida.com', taxId: '9876543210' },
  { id: 'cus-1014', name: 'Riyadh Holding',      email: 'fin@riyadh-holding.sa', taxId: '300123456789' }
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
  padding: '10px 12px',
  border: '1px solid rgba(239,68,68,0.15)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

export default function ManualInvoicePage() {
  const [customerId, setCustomerId] = useState(null);
  const [items, setItems] = useState([
    { description: 'Pro plan — May 2026', qty: 1, price: 499, tax: 18 }
  ]);

  const customer = CUSTOMERS.find((c) => c.id === customerId);
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const taxTotal = items.reduce((s, it) => s + it.qty * it.price * (it.tax / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const updateItem = (i, key, val) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: key === 'description' ? val : Number(val) };
    setItems(next);
  };
  const addItem = () => setItems([...items, { description: '', qty: 1, price: 0, tax: 18 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div style={{ padding: '20px' }}>
      <OperationConsole
        title="Manual Invoice"
        subtitle="Build and send a one-off invoice"
        warning="Manual invoices are sent immediately by email and recorded in the customer's billing history. Double-check totals and tax rates before sending — refunds require a separate workflow."
        steps={[
          {
            key: 'customer',
            label: 'Customer',
            content: (
              <div>
                <label style={labelStyle}>Recipient</label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {CUSTOMERS.map((c) => (
                    <label key={c.id} style={{
                      display: 'flex', gap: '10px', padding: '10px 14px',
                      background: customerId === c.id ? 'rgba(220,38,38,0.06)' : '#FFFFFF',
                      border: `1px solid ${customerId === c.id ? 'rgba(220,38,38,0.3)' : 'rgba(239,68,68,0.1)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
                      <input type="radio" name="cust" checked={customerId === c.id} onChange={() => setCustomerId(c.id)} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{c.email} · Tax ID {c.taxId}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          },
          {
            key: 'items',
            label: 'Line items',
            content: (
              <div>
                <label style={labelStyle}>Items</label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {items.map((it, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 70px 100px 70px 28px',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <input value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Description" style={inputStyle} />
                      <input type="number" value={it.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} style={inputStyle} />
                      <input type="number" value={it.price} onChange={(e) => updateItem(i, 'price', e.target.value)} style={inputStyle} />
                      <input type="number" value={it.tax} onChange={(e) => updateItem(i, 'tax', e.target.value)} style={inputStyle} />
                      <button onClick={() => removeItem(i)} style={{
                        background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '18px'
                      }}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} style={{
                  marginTop: '10px',
                  padding: '8px 14px',
                  background: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#DC2626',
                  cursor: 'pointer'
                }}>+ Add line</button>
                <div style={{ marginTop: '14px', fontSize: '13px', color: '#475569' }}>
                  Subtotal: <strong>₺{subtotal.toLocaleString()}</strong> · Tax: <strong>₺{taxTotal.toFixed(2)}</strong> · Total: <strong style={{ color: '#0F172A' }}>₺{grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            )
          },
          {
            key: 'review',
            label: 'Review',
            content: (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>Final review</h3>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Recipient:</td><td style={{ fontWeight: 700 }}>{customer?.name || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Email:</td><td style={{ fontWeight: 600 }}>{customer?.email || '—'}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Line items:</td><td style={{ fontWeight: 700 }}>{items.length}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: '#64748B' }}>Total:</td><td style={{ fontWeight: 800, color: '#10B981' }}>₺{grandTotal.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            )
          },
          {
            key: 'send',
            label: 'Send',
            content: (
              <div>
                <p style={{ fontSize: '14px', color: '#0F172A' }}>
                  Click <strong>Send Invoice</strong> below to email the invoice to <strong>{customer?.email || '—'}</strong> via Resend.
                </p>
              </div>
            )
          }
        ]}
        livePreview={(
          <div style={{ fontSize: '12px', color: '#0F172A' }}>
            <div style={{
              padding: '14px',
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ width: '32px', height: '32px', background: '#E30A17', borderRadius: '8px', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 800 }}>Zyrix FinSuite</div>
                  <div style={{ color: '#64748B' }}>Maslak, İstanbul</div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontWeight: 800 }}>INVOICE</div>
                  <div style={{ color: '#64748B' }}>#{(Math.random() * 9000 + 1000) | 0}</div>
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 700 }}>Bill to</div>
                <div>{customer?.name || '—'}</div>
                <div style={{ color: '#64748B' }}>{customer?.email || ''}</div>
              </div>
              <table style={{ width: '100%', fontSize: '11px', marginBottom: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <th style={{ textAlign: 'start', padding: '4px 0', color: '#64748B' }}>Item</th>
                    <th style={{ textAlign: 'end',   padding: '4px 0', color: '#64748B' }}>Qty</th>
                    <th style={{ textAlign: 'end',   padding: '4px 0', color: '#64748B' }}>Price</th>
                    <th style={{ textAlign: 'end',   padding: '4px 0', color: '#64748B' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 0' }}>{it.description}</td>
                      <td style={{ padding: '4px 0', textAlign: 'end' }}>{it.qty}</td>
                      <td style={{ padding: '4px 0', textAlign: 'end' }}>₺{it.price}</td>
                      <td style={{ padding: '4px 0', textAlign: 'end', fontWeight: 700 }}>₺{(it.qty * it.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '6px', textAlign: 'end' }}>
                <div>Subtotal: <strong>₺{subtotal.toLocaleString()}</strong></div>
                <div>Tax: <strong>₺{taxTotal.toFixed(2)}</strong></div>
                <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Total: ₺{grandTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
        executeLabel="Send Invoice"
        onExecute={() => alert(`Invoice sent to ${customer?.email}`)}
      />
    </div>
  );
}

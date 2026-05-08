// ================================================================
// /admin/revenue/dunning — Configurator (Bible v2 §17.4)
// ================================================================
import { useState } from 'react';
import Configurator from '@/components/admin/shared/Configurator';

const labelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginTop: '14px',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(124,58,237,0.15)',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const TEMPLATES = {
  'card-failed-1d':  { subject: 'Heads up — your payment didn\'t go through', body: 'Hi [Name], we tried to charge your card on file and it didn\'t complete. No worries — this usually fixes itself in seconds. [Update payment method] · [Retry now]' },
  'card-failed-3d':  { subject: 'Reminder: card update needed', body: 'Hi [Name], it\'s been 3 days since your payment failed. Please update your card so we can keep your account active.' },
  'card-failed-7d':  { subject: 'Final notice — account access ending in 7 days', body: 'Hi [Name], without a working card on file we\'ll need to suspend your access in 7 days. Please update your billing details.' },
  'card-failed-14d': { subject: 'Account access suspended', body: 'Hi [Name], your account has been suspended due to a 14-day non-payment. Update your card to restore full access.' },
  'sub-exp-renewal-7d':  { subject: 'Your subscription renews in 7 days', body: 'Just a heads up that your annual plan renews on [Date]. Nothing to do unless you want to switch tiers.' },
  'sub-exp-renewal-1d':  { subject: 'Last chance — renews tomorrow', body: 'Your annual plan renews tomorrow at the price you locked in. Need to switch? Let us know today.' },
  'sub-exp-grace-3d':    { subject: 'Renew now — 3-day grace period', body: 'Your subscription expired 3 days ago. Renew now to avoid downgrade and keep your data accessible.' },
  'trial-3d': { subject: 'Welcome to Pro in 3 days', body: 'Hi [Name], your free trial converts to Pro in 3 days. Add a card now and we\'ll match the trial price for the first month.' },
  'trial-1d': { subject: 'Your trial ends tomorrow', body: 'Hi [Name], the trial ends tomorrow. Add a card to keep going — same workspace, same data.' },
  'trial-0d': { subject: 'Trial ended — pick a plan', body: 'Hi [Name], your trial just ended. Pick a plan to keep using Pro features, or stay on the free Lite tier.' }
};

export default function DunningRulesPage() {
  const tree = [
    {
      key: 'card-failed', label: 'Card failed', icon: '💳',
      children: [
        { key: 'card-failed-1d',  label: 'Day 1 — Soft email',     icon: '📧' },
        { key: 'card-failed-3d',  label: 'Day 3 — Reminder',       icon: '📧' },
        { key: 'card-failed-7d',  label: 'Day 7 — Final notice',   icon: '⚠' },
        { key: 'card-failed-14d', label: 'Day 14 — Suspend access',icon: '🛑' }
      ]
    },
    {
      key: 'subscription-expired', label: 'Subscription expired', icon: '⏰',
      children: [
        { key: 'sub-exp-renewal-7d', label: '7 days before — Renewal reminder', icon: '📧' },
        { key: 'sub-exp-renewal-1d', label: '1 day before — Last chance email',  icon: '⚠' },
        { key: 'sub-exp-grace-3d',   label: 'Day 3 grace — Renew prompt',        icon: '📧' }
      ]
    },
    {
      key: 'trial-ending', label: 'Trial ending', icon: '🆓',
      children: [
        { key: 'trial-3d', label: '3 days before — Welcome to Pro',  icon: '🎉' },
        { key: 'trial-1d', label: '1 day before — Add card prompt',  icon: '💳' },
        { key: 'trial-0d', label: 'Day 0 — Conversion or downgrade', icon: '🔄' }
      ]
    }
  ];

  const [selectedKey, setSelectedKey] = useState('card-failed-1d');
  const tpl = TEMPLATES[selectedKey] || TEMPLATES['card-failed-1d'];

  const editor = (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>Edit rule: <span style={{ fontFamily: 'monospace' }}>{selectedKey}</span></h3>

      <label style={labelStyle}>Trigger delay (days)</label>
      <input type="number" defaultValue="1" style={inputStyle} />

      <label style={labelStyle}>Action</label>
      <select style={inputStyle}>
        <option>Send email</option>
        <option>Send SMS</option>
        <option>Webhook</option>
        <option>Suspend account</option>
        <option>Apply discount and retry</option>
      </select>

      <label style={labelStyle}>Email template</label>
      <select style={inputStyle}>
        <option>card_failed_soft</option>
        <option>card_failed_reminder</option>
        <option>card_failed_final</option>
      </select>

      <label style={labelStyle}>Retry payment</label>
      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <input type="radio" name="retry" defaultChecked /> Yes, after 24h
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <input type="radio" name="retry" /> No, manual only
        </label>
      </div>

      <label style={{ ...labelStyle, marginTop: '14px' }}>Languages</label>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {['🇹🇷 TR', '🇬🇧 EN', '🇸🇦 AR'].map((l) => (
          <label key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(124,58,237,0.06)', borderRadius: '999px', fontSize: '12px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked /> {l}
          </label>
        ))}
      </div>
    </div>
  );

  const preview = (
    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569', whiteSpace: 'pre-wrap' }}>
      <strong>Subject:</strong> {tpl.subject}<br /><br />
      {tpl.body}
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Configurator
        title="Dunning Rules"
        tree={tree}
        selectedKey={selectedKey}
        onSelect={(n) => setSelectedKey(n.key)}
        editorPanel={editor}
        preview={preview}
        onSave={() => alert('Rule saved')}
      />
    </div>
  );
}

// ================================================================
// /admin/plans — Configurator (Bible v2 §17.4)
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

export default function PlansEditorPage() {
  const tree = [
    { key: 'free',       label: 'Free',       icon: '🆓' },
    { key: 'lite',       label: 'Lite',       icon: '🥉' },
    { key: 'pro',        label: 'Pro',        icon: '🥈' },
    { key: 'business',   label: 'Business',   icon: '🥇' },
    { key: 'enterprise', label: 'Enterprise', icon: '💎' },
    { key: 'lifetime',   label: 'Lifetime',   icon: '♾' },
    { key: 'custom',     label: 'Custom',     icon: '⚙' }
  ];

  const plansData = {
    free:       { price: 0,    annualDiscount: 0,  trialDays: 0,  name: 'Free' },
    lite:       { price: 9,    annualDiscount: 15, trialDays: 14, name: 'Lite' },
    pro:        { price: 29,   annualDiscount: 20, trialDays: 14, name: 'Pro' },
    business:   { price: 99,   annualDiscount: 25, trialDays: 14, name: 'Business' },
    enterprise: { price: null, annualDiscount: 0,  trialDays: 30, name: 'Enterprise', custom: true },
    lifetime:   { price: 990,  annualDiscount: 0,  trialDays: 0,  name: 'Lifetime' },
    custom:     { price: null, annualDiscount: 0,  trialDays: 0,  name: 'Custom', custom: true }
  };

  const [selectedKey, setSelectedKey] = useState('pro');
  const plan = plansData[selectedKey];

  const editor = (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>{plan.name} Plan</h3>

      <label style={labelStyle}>Plan name</label>
      <input type="text" defaultValue={plan.name} key={`${selectedKey}-name`} style={inputStyle} />

      <label style={labelStyle}>Monthly price (USD)</label>
      <input type="number" defaultValue={plan.price ?? ''} key={`${selectedKey}-price`} placeholder={plan.custom ? 'Custom (sales-led)' : '0'} style={inputStyle} disabled={plan.custom} />

      <label style={labelStyle}>Annual discount (%)</label>
      <input type="range" min="0" max="40" defaultValue={plan.annualDiscount} key={`${selectedKey}-disc`} style={{ width: '100%' }} />

      <label style={labelStyle}>Trial duration (days)</label>
      <select defaultValue={plan.trialDays} key={`${selectedKey}-trial`} style={inputStyle}>
        {[0, 7, 14, 30].map((d) => <option key={d} value={d}>{d} days{d === 0 ? ' (no trial)' : ''}</option>)}
      </select>

      <label style={labelStyle}>Status</label>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {['Published', 'Draft', 'Hidden'].map((s) => (
          <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: s === 'Published' ? 'rgba(16,185,129,0.08)' : 'rgba(124,58,237,0.06)', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <input type="radio" name={`status-${selectedKey}`} defaultChecked={s === 'Published'} /> {s}
          </label>
        ))}
      </div>
    </div>
  );

  const preview = (
    <div style={{
      background: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
      color: '#FFFFFF',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '280px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, marginBottom: '8px' }}>
        {plan.name}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>
        {plan.custom ? 'Custom' : plan.price === 0 ? 'Free' : `$${plan.price}`}
        {!plan.custom && plan.price > 0 && <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.85 }}>/mo</span>}
      </div>
      {plan.annualDiscount > 0 && (
        <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.85 }}>
          Save {plan.annualDiscount}% with annual billing
        </div>
      )}
      {plan.trialDays > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          display: 'inline-block'
        }}>
          {plan.trialDays}-day free trial
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Configurator
        title="Plans Editor"
        tree={tree}
        selectedKey={selectedKey}
        onSelect={(n) => setSelectedKey(n.key)}
        editorPanel={editor}
        preview={preview}
        onSave={() => alert(`${plan.name} plan saved`)}
      />
    </div>
  );
}

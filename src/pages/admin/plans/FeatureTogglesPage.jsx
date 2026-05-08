// ================================================================
// /admin/plans/features — Configurator (Bible v2 §17.4)
// Per-tier feature matrix.
// ================================================================
import { useState } from 'react';
import Configurator from '@/components/admin/shared/Configurator';

const TIERS = ['Lite', 'Pro', 'Business', 'Enterprise'];

const CATEGORIES = [
  {
    key: 'ai', label: 'AI', icon: '🤖',
    features: [
      { key: 'ai-cofounder',  label: 'AI Co-Founder Mode',     access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'ai-forecast',   label: 'AI Forecasts',            access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } },
      { key: 'ai-anomaly',    label: 'Anomaly Detection',       access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'ai-voice',      label: 'Voice CX',                access: { Lite: false, Pro: false, Business: false, Enterprise: true } }
    ]
  },
  {
    key: 'reporting', label: 'Reporting', icon: '📊',
    features: [
      { key: 'rep-basic',    label: 'Basic reports',          access: { Lite: true,  Pro: true,  Business: true,  Enterprise: true } },
      { key: 'rep-custom',   label: 'Custom reports',         access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } },
      { key: 'rep-schedule', label: 'Scheduled reports',      access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'rep-export',   label: 'Excel/PDF export',       access: { Lite: true,  Pro: true,  Business: true,  Enterprise: true } }
    ]
  },
  {
    key: 'integrations', label: 'Integrations', icon: '🔌',
    features: [
      { key: 'int-banks',     label: 'Bank connections',       access: { Lite: true,  Pro: true,  Business: true,  Enterprise: true } },
      { key: 'int-zapier',    label: 'Zapier',                 access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } },
      { key: 'int-webhooks',  label: 'Webhooks',               access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'int-erp',       label: 'ERP integration',        access: { Lite: false, Pro: false, Business: false, Enterprise: true } }
    ]
  },
  {
    key: 'collab', label: 'Collaboration', icon: '👥',
    features: [
      { key: 'col-team',      label: 'Team members',           access: { Lite: true,  Pro: true,  Business: true,  Enterprise: true } },
      { key: 'col-roles',     label: 'Custom roles',           access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'col-comments',  label: 'Comments and mentions',  access: { Lite: true,  Pro: true,  Business: true,  Enterprise: true } },
      { key: 'col-approvals', label: 'Approval workflows',     access: { Lite: false, Pro: false, Business: true,  Enterprise: true } }
    ]
  },
  {
    key: 'api', label: 'API', icon: '🛠',
    features: [
      { key: 'api-read',      label: 'Read-only API',          access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } },
      { key: 'api-write',     label: 'Write API',              access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'api-rate',      label: 'High rate limit',        access: { Lite: false, Pro: false, Business: false, Enterprise: true } }
    ]
  },
  {
    key: 'compliance', label: 'Compliance', icon: '🛡',
    features: [
      { key: 'cmp-audit',     label: 'Audit logs',             access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } },
      { key: 'cmp-sso',       label: 'SSO / SAML',             access: { Lite: false, Pro: false, Business: false, Enterprise: true } },
      { key: 'cmp-residency', label: 'Data residency',         access: { Lite: false, Pro: false, Business: false, Enterprise: true } },
      { key: 'cmp-dpa',       label: 'DPA / GDPR contract',    access: { Lite: false, Pro: false, Business: true,  Enterprise: true } },
      { key: 'cmp-kvkk',      label: 'KVKK reports',           access: { Lite: false, Pro: true,  Business: true,  Enterprise: true } }
    ]
  }
];

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

export default function FeatureTogglesPage() {
  const tree = CATEGORIES.map((c) => ({
    key: c.key, label: c.label, icon: c.icon,
    children: c.features.map((f) => ({ key: f.key, label: f.label, icon: '•' }))
  }));

  const [selectedKey, setSelectedKey] = useState('ai-cofounder');
  const allFeatures = CATEGORIES.flatMap((c) => c.features);
  const selectedFeature = allFeatures.find((f) => f.key === selectedKey) || allFeatures[0];

  const editor = (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>{selectedFeature.label}</h3>
      <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Toggle availability per tier.</p>

      <label style={labelStyle}>Per-tier access</label>
      <div style={{ display: 'grid', gap: '10px' }}>
        {TIERS.map((t) => (
          <label key={t} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            <input type="checkbox" defaultChecked={selectedFeature.access[t]} key={`${selectedFeature.key}-${t}`} />
            <strong style={{ minWidth: '90px' }}>{t}</strong>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              {selectedFeature.access[t] ? '✓ Included' : 'Locked'}
            </span>
          </label>
        ))}
      </div>

      <label style={labelStyle}>Visibility on pricing page</label>
      <select style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
      }}>
        <option>Visible to everyone</option>
        <option>Hidden — internal only</option>
        <option>Visible to logged-in users only</option>
      </select>
    </div>
  );

  const preview = (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
        Compare plans — {selectedFeature.label}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${TIERS.length}, 1fr)`,
        gap: '8px'
      }}>
        {TIERS.map((t) => (
          <div key={t} style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{t}</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              color: selectedFeature.access[t] ? '#10B981' : '#94A3B8',
              marginTop: '4px'
            }}>
              {selectedFeature.access[t] ? '✓' : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Configurator
        title="Feature Toggles"
        tree={tree}
        selectedKey={selectedKey}
        onSelect={(n) => allFeatures.some((f) => f.key === n.key) && setSelectedKey(n.key)}
        editorPanel={editor}
        preview={preview}
        onSave={() => alert(`Toggles for ${selectedFeature.label} saved`)}
      />
    </div>
  );
}

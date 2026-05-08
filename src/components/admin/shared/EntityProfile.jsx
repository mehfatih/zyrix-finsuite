// ================================================================
// <EntityProfile> — Archetype B (Bible v2 §17.2)
// Hero + KPIs + tabs + AI summary for single-record detail pages.
// ================================================================
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function EntityProfile({
  hero,
  kpis,
  tabs,
  aiSummary
}) {
  const palette = ARCHETYPE_PALETTES.profile;
  const [activeTab, setActiveTab] = useState(tabs[0]?.key);

  return (
    <div style={{ background: palette.bg, minHeight: '100%' }}>
      <button onClick={() => window.history.back()} style={{
        background: 'transparent',
        border: 'none',
        color: palette.textMuted,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {hero.avatar && (
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '14px',
            background: palette.accentSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
            color: palette.accent,
            flexShrink: 0
          }}>{hero.avatar}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: palette.text,
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: 'none'
          }}>{hero.title}</h1>
          <p style={{
            fontSize: '14px',
            color: palette.textMuted,
            margin: '4px 0 8px',
            textShadow: 'none'
          }}>{hero.subtitle}</p>
          {hero.statusBadges && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {hero.statusBadges.map((b, i) => (
                <span key={i} style={{
                  padding: '3px 10px',
                  background: b.bg || palette.accentSoft,
                  color: b.color || palette.accent,
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>{b.label}</span>
              ))}
            </div>
          )}
        </div>
        {hero.actions && <div style={{ display: 'flex', gap: '8px' }}>{hero.actions}</div>}
      </div>

      {kpis && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          {kpis}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        borderBottom: `1px solid ${palette.border}`,
        flexWrap: 'wrap'
      }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === t.key ? palette.accent : 'transparent'}`,
            color: activeTab === t.key ? palette.accent : palette.textMuted,
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {tabs.find((t) => t.key === activeTab)?.content}
      </div>

      {aiSummary && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(34,211,238,0.04))',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '12px',
          padding: '16px 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#7C3AED',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>✨ AI Insights</div>
          <div style={{ fontSize: '13px', color: palette.text, lineHeight: 1.6 }}>{aiSummary}</div>
        </div>
      )}
    </div>
  );
}

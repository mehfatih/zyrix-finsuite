// Sprint D-11 — Fixed import path (was './i18n' which resolved to a
// non-existent module; only AdminLoginPage's static import-tree didn't
// trigger the resolution before D-11 mounted this in the chrome layer).
import { useI18n, SUPPORTED_LANGS } from '../i18n/i18n.jsx';
import { useState } from 'react';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGS.find(l => l.code === lang) || SUPPORTED_LANGS[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'rgba(108,58,255,0.08)',
          border: '1px solid rgba(108,58,255,0.2)',
          borderRadius: 10, padding: compact ? '5px 10px' : '7px 14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: '#6C3AFF',
        }}
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)',
            right: 0, zIndex: 999,
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden', minWidth: 140,
          }}>
            {SUPPORTED_LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  width: '100%', padding: '10px 16px',
                  background: l.code === lang ? 'rgba(108,58,255,0.06)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, fontWeight: l.code === lang ? 700 : 400,
                  color: l.code === lang ? '#6C3AFF' : '#374151',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                {l.label}
                {l.code === lang && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
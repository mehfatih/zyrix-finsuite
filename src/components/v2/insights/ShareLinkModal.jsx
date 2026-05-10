// ================================================================
// Sprint D-7 — Share-link generation modal.
// Opens from the management page's "+ New share link" button (or
// from any future inline "Share publicly" button on an insight card).
// Handles: pick insight (or pre-fill via prop), choose privacy mode,
// set expiry preset, optional password + comments + email gate,
// submits, then reveals the share URL with copy button.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { Link2, Lock, Eye, EyeOff, Copy, CheckCircle2, X, Loader2 } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { createShareLink } from '@/api/v2/publicShareLinks';
import { getInsightHistory } from '@/api/v2/insights';

const LABEL = {
  title:        { tr: 'Paylaşım bağlantısı oluştur', en: 'Create share link',          ar: 'إنشاء رابط مشاركة' },
  cancel:       { tr: 'İptal',                       en: 'Cancel',                     ar: 'إلغاء' },
  insightField: { tr: 'Paylaşılacak içgörü',          en: 'Insight to share',           ar: 'الرؤية المراد مشاركتها' },
  insightHint:  { tr: 'Aşağıdan bir içgörü seç.',     en: 'Pick an insight from below.', ar: 'اختر رؤية أدناه.' },
  privacy:      { tr: 'Gizlilik modu',                en: 'Privacy mode',               ar: 'وضع الخصوصية' },
  privacyFull:        { tr: 'Tam şeffaf',             en: 'Full transparency',          ar: 'شفافية كاملة' },
  privacyMasked:      { tr: 'Sayılar maskelenmiş',     en: 'Masked numbers',             ar: 'أرقام مخفية' },
  privacyNarrative:   { tr: 'Sadece anlatı',          en: 'Narrative only',             ar: 'سردي فقط' },
  privacyAnonymous:   { tr: 'Anonim',                  en: 'Anonymous',                 ar: 'مجهول' },
  privacyFullDesc:        { tr: 'Tüm sayılar ve isimler görünür.',
                            en: 'All numbers and names visible.',
                            ar: 'تظهر جميع الأرقام والأسماء.' },
  privacyMaskedDesc:      { tr: 'Para ve yüzde değerleri aralık olarak gösterilir.',
                            en: 'Currency + percent shown as ranges.',
                            ar: 'تظهر العملة والنسب كمدى.' },
  privacyNarrativeDesc:   { tr: 'Sadece anlatı; sayı yok.',
                            en: 'Just the narrative; no numbers.',
                            ar: 'السرد فقط بدون أرقام.' },
  privacyAnonymousDesc:   { tr: 'Anlatı + şirket adı gizli.',
                            en: 'Narrative + company name hidden.',
                            ar: 'السرد مع إخفاء اسم الشركة.' },
  expiry:       { tr: 'Geçerlilik süresi',            en: 'Link lifetime',              ar: 'مدة الرابط' },
  expiry7d:     { tr: '7 gün',                        en: '7 days',                     ar: '7 أيام' },
  expiry30d:    { tr: '30 gün',                       en: '30 days',                    ar: '30 يومًا' },
  expiry90d:    { tr: '90 gün',                       en: '90 days',                    ar: '90 يومًا' },
  expiry1y:     { tr: '1 yıl',                        en: '1 year',                     ar: 'سنة واحدة' },
  expiryPerm:   { tr: 'Süresiz',                       en: 'Permanent',                  ar: 'دائم' },
  passwordToggle:  { tr: 'Parola ile koru',           en: 'Require password',           ar: 'حماية بكلمة مرور' },
  passwordPlaceholder: { tr: 'Parola (en az 4 karakter)', en: 'Password (min 4 chars)',  ar: 'كلمة المرور (4 أحرف على الأقل)' },
  commentsToggle:  { tr: 'Yorumlara izin ver',        en: 'Allow comments',             ar: 'السماح بالتعليقات' },
  requireEmailToggle: { tr: 'Yorum için e-posta zorunlu', en: 'Require email on comments', ar: 'البريد إلزامي للتعليق' },
  generate:     { tr: 'Bağlantı oluştur',              en: 'Generate link',              ar: 'أنشئ الرابط' },
  generating:   { tr: 'Oluşturuluyor…',                en: 'Generating…',                ar: 'جارٍ الإنشاء…' },
  ready:        { tr: 'Bağlantın hazır',               en: 'Your link is ready',         ar: 'الرابط جاهز' },
  copy:         { tr: 'Kopyala',                       en: 'Copy',                       ar: 'نسخ' },
  copied:       { tr: 'Kopyalandı',                    en: 'Copied',                     ar: 'تم النسخ' },
  preview:      { tr: 'Önizle',                        en: 'Open preview',               ar: 'فتح المعاينة' },
  done:         { tr: 'Bitti',                         en: 'Done',                       ar: 'تم' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

const EXPIRY_PRESETS = [
  { key: '7d',  days: 7   },
  { key: '30d', days: 30  },
  { key: '90d', days: 90  },
  { key: '1y',  days: 365 },
  { key: 'perm', permanent: true }
];

const PRIVACY_OPTIONS = [
  { key: 'full',           tone: '#06A87E' },
  { key: 'masked',         tone: '#FFB800' },
  { key: 'narrative_only', tone: '#9D4EDD' },
  { key: 'anonymous',      tone: '#FF3D5A' }
];

export default function ShareLinkModal({ open, onClose, language = 'tr', initialInsightId = null, onCreated }) {
  const [insights, setInsights]     = useState([]);
  const [loadingInsights, setLI]    = useState(false);
  const [insightId, setInsightId]   = useState(initialInsightId || '');
  const [privacyMode, setPrivacyMode] = useState('full');
  const [expiryKey, setExpiryKey]   = useState('30d');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPwd]  = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [requireEmail, setRequireEmail]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [created, setCreated]       = useState(null);
  const [copiedFlag, setCopied]     = useState(false);

  // Hydrate insight picker.
  useEffect(() => {
    if (!open) return undefined;
    setLI(true);
    getInsightHistory({ days: 30, limit: 50 })
      .then((rows) => setInsights(Array.isArray(rows) ? rows : []))
      .catch(() => setInsights([]))
      .finally(() => setLI(false));
    return undefined;
  }, [open]);

  // Reset on open / close.
  useEffect(() => {
    if (open) {
      setError(null);
      setCreated(null);
      setSubmitting(false);
      setInsightId(initialInsightId || '');
      setPrivacyMode('full');
      setExpiryKey('30d');
      setUsePassword(false);
      setPassword('');
      setAllowComments(true);
      setRequireEmail(false);
    }
  }, [open, initialInsightId]);

  const computedExpiresAt = useMemo(() => {
    const preset = EXPIRY_PRESETS.find((p) => p.key === expiryKey);
    if (!preset || preset.permanent) return null;
    return new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000).toISOString();
  }, [expiryKey]);

  const submit = async () => {
    if (!insightId) { setError(new Error(_('insightHint', language))); return; }
    if (usePassword && (password.length < 4 || password.length > 64)) {
      setError(new Error(_('passwordPlaceholder', language))); return;
    }
    setSubmitting(true); setError(null);
    try {
      const payload = {
        resourceType:  'insight',
        resourceId:    insightId,
        privacyMode,
        permanent:     expiryKey === 'perm',
        expiresAt:     computedExpiresAt,
        password:      usePassword ? password : undefined,
        allowComments,
        requireEmail
      };
      const data = await createShareLink(payload);
      setCreated(data?.shareLink || null);
      if (onCreated && data?.shareLink) onCreated(data.shareLink);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyUrl = async () => {
    if (!created?.url) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  if (!open) return null;

  return (
    <div style={backdropStyle} onClick={onClose} role="dialog" aria-modal="true">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={16} style={{ color: CINEMATIC.accent.cyanGlow }} />
            <strong style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em' }}>{_('title', language)}</strong>
          </span>
          <button type="button" onClick={onClose} aria-label={_('cancel', language)} style={iconBtn}>
            <X size={14} />
          </button>
        </div>

        {error && !created && (
          <div role="alert" style={errorBanner}>
            {String(error.message || error)}
          </div>
        )}

        {!created && (
          <div style={bodyStyle}>
            <SectionLabel>{_('insightField', language)}</SectionLabel>
            <select
              value={insightId}
              onChange={(e) => setInsightId(e.target.value)}
              style={selectStyle}
              disabled={loadingInsights}
            >
              <option value="">{loadingInsights ? '…' : _('insightHint', language)}</option>
              {insights.slice(0, 50).map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.type}] {String(i.title || '').slice(0, 60)}
                </option>
              ))}
            </select>

            <SectionLabel style={{ marginTop: SPACE.lg }}>{_('privacy', language)}</SectionLabel>
            <div style={privacyGridStyle}>
              {PRIVACY_OPTIONS.map((opt) => {
                const selected = privacyMode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPrivacyMode(opt.key)}
                    style={{
                      ...privacyCardStyle,
                      borderColor: selected ? opt.tone : CINEMATIC.glass.border,
                      background: selected ? `${opt.tone}14` : CINEMATIC.glass.tint1,
                      boxShadow: selected ? `0 0 0 1px ${opt.tone}55` : 'none'
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: selected ? opt.tone : CINEMATIC.text.pearlWhite }}>
                      {_(`privacy${opt.key === 'full' ? 'Full' : opt.key === 'masked' ? 'Masked' : opt.key === 'narrative_only' ? 'Narrative' : 'Anonymous'}`, language)}
                    </div>
                    <div style={{ fontSize: 10, color: CINEMATIC.text.pearlFaint, marginTop: 4, lineHeight: 1.4 }}>
                      {_(`privacy${opt.key === 'full' ? 'Full' : opt.key === 'masked' ? 'Masked' : opt.key === 'narrative_only' ? 'Narrative' : 'Anonymous'}Desc`, language)}
                    </div>
                  </button>
                );
              })}
            </div>

            <SectionLabel style={{ marginTop: SPACE.lg }}>{_('expiry', language)}</SectionLabel>
            <div style={chipRowStyle}>
              {EXPIRY_PRESETS.map((p) => (
                <ChipButton
                  key={p.key}
                  selected={expiryKey === p.key}
                  onClick={() => setExpiryKey(p.key)}
                >
                  {_(`expiry${p.key === '7d' ? '7d' : p.key === '30d' ? '30d' : p.key === '90d' ? '90d' : p.key === '1y' ? '1y' : 'Perm'}`, language)}
                </ChipButton>
              ))}
            </div>

            <div style={{ marginTop: SPACE.lg }}>
              <Toggle
                label={_('passwordToggle', language)}
                value={usePassword}
                onChange={setUsePassword}
                tone="amber"
                icon={<Lock size={11} />}
              />
              {usePassword && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={_('passwordPlaceholder', language)}
                    minLength={4}
                    maxLength={64}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label="toggle"
                    style={iconBtn}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: SPACE.md }}>
              <Toggle
                label={_('commentsToggle', language)}
                value={allowComments}
                onChange={setAllowComments}
                tone="cyan"
              />
            </div>

            {allowComments && (
              <div style={{ marginTop: SPACE.sm }}>
                <Toggle
                  label={_('requireEmailToggle', language)}
                  value={requireEmail}
                  onChange={setRequireEmail}
                  tone="violet"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: SPACE.lg }}>
              <button type="button" onClick={onClose} style={ghostBtn}>
                {_('cancel', language)}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !insightId}
                style={{ ...primaryBtn, opacity: (submitting || !insightId) ? 0.5 : 1 }}
              >
                {submitting
                  ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
                  : <Link2 size={13} />}
                {submitting ? _('generating', language) : _('generate', language)}
              </button>
            </div>
          </div>
        )}

        {created && (
          <div style={bodyStyle}>
            <div style={{
              padding: '14px 16px',
              background: 'rgba(6, 168, 126, 0.08)',
              border: '1px solid rgba(6, 168, 126, 0.30)',
              borderRadius: RADIUS.sm,
              marginBottom: SPACE.lg,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <CheckCircle2 size={16} style={{ color: '#06A87E' }} />
              <strong style={{ fontSize: 13, color: CINEMATIC.text.pearlWhite }}>
                {_('ready', language)}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                readOnly
                value={created.url}
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                onFocus={(e) => e.target.select()}
              />
              <button type="button" onClick={copyUrl} style={ghostBtn}>
                {copiedFlag ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copiedFlag ? _('copied', language) : _('copy', language)}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: SPACE.lg }}>
              <a href={created.url} target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: 'none' }}>
                {_('preview', language)}
              </a>
              <button type="button" onClick={onClose} style={primaryBtn}>
                {_('done', language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── helpers (inline) ──────────────────────────────────────

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint,
      marginBottom: 6,
      ...style
    }}>{children}</div>
  );
}

function Toggle({ label, value, onChange, tone, icon }) {
  const fg = ({ cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' })[tone];
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', width: '100%',
        background: value ? `${fg}14` : CINEMATIC.glass.tint1,
        color: value ? fg : CINEMATIC.text.pearlDim,
        border: `1px solid ${value ? fg : CINEMATIC.glass.border}`,
        borderRadius: RADIUS.sm,
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
        transition: 'box-shadow 180ms, background 180ms, border-color 180ms'
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {icon}
        {label}
      </span>
      <span style={{
        width: 26, height: 14, borderRadius: 999,
        background: value ? fg : 'rgba(255,255,255,0.10)',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute', top: 2,
          insetInlineStart: value ? 14 : 2,
          width: 10, height: 10, borderRadius: '50%',
          background: '#0A0E27',
          transition: 'inset-inline-start 200ms'
        }} />
      </span>
    </button>
  );
}

function ChipButton({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: selected ? 'rgba(0, 217, 255, 0.10)' : 'transparent',
        color: selected ? CINEMATIC.accent.cyanGlow : CINEMATIC.text.pearlDim,
        border: `1px solid ${selected ? 'rgba(0, 217, 255, 0.45)' : CINEMATIC.glass.border}`,
        borderRadius: 999,
        fontSize: 11, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit'
      }}
    >{children}</button>
  );
}

const backdropStyle = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(10, 14, 39, 0.72)',
  backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16
};

const modalStyle = {
  width: '100%', maxWidth: 540,
  background: CINEMATIC.bg.deepSpace1,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: RADIUS.lg,
  color: CINEMATIC.text.pearlWhite,
  fontFamily: "'Inter', system-ui, sans-serif",
  boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: `1px solid ${CINEMATIC.glass.border}`
};

const bodyStyle = { padding: 18 };

const errorBanner = {
  margin: '12px 18px 0',
  padding: '10px 14px',
  background: 'rgba(255, 61, 90, 0.10)',
  color: CINEMATIC.accent.crimsonGlow,
  border: '1px solid rgba(255, 61, 90, 0.36)',
  borderRadius: RADIUS.sm,
  fontSize: 12
};

const selectStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  color: CINEMATIC.text.pearlWhite,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  colorScheme: 'dark'
};

const inputStyle = {
  padding: '8px 10px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  color: CINEMATIC.text.pearlWhite,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  colorScheme: 'dark'
};

const privacyGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 6
};

const privacyCardStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  borderRadius: RADIUS.sm,
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const chipRowStyle = {
  display: 'flex', gap: 6, flexWrap: 'wrap'
};

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 18px',
  background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))',
  color: '#FFFFFF',
  border: '1px solid rgba(157, 78, 221, 0.5)',
  borderRadius: 6,
  fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: glowOf('violet', 1)
};

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28,
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  cursor: 'pointer'
};

// ================================================================
// Sprint D-6 — Public weekly-report unsubscribe / preference page.
// Mounted at /unsubscribe-weekly. Reached from the weekly email
// footer; the JWT in the URL IS the credential (no login required).
// Distinct namespace from D-5's /unsubscribe page (decision §6.G).
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { FileText, Pause, CalendarRange, MailX, CheckCircle2, Loader2 } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import { getUnsubInfo, applyUnsub } from '@/api/v2/weeklyReport';

const LABEL = {
  appName:      { tr: 'Zyrix FinSuite',          en: 'Zyrix FinSuite',           ar: 'زيريكس فينسوت' },
  pageTitle:    { tr: 'Haftalık Performans',      en: 'Weekly Performance',      ar: 'الأداء الأسبوعي' },
  prompt:       { tr: 'Haftalık raporu almayı bırakmak istiyor musun?',
                  en: 'Stop receiving the weekly report?',
                  ar: 'هل تريد إيقاف التقرير الأسبوعي؟' },
  promptSub:    { tr: 'Aşağıdan bir seçenek seç. Hesabın etkilenmez.',
                  en: 'Pick an option below. Your account is not affected.',
                  ar: 'اختر خيارًا أدناه. لن يتأثر حسابك.' },
  reasonsLabel: { tr: 'Sebep (isteğe bağlı)',     en: 'Reason (optional)',        ar: 'السبب (اختياري)' },
  reasons: {
    tooLong:    { tr: 'Çok uzun',                  en: 'Too long',                ar: 'طويل جدًا' },
    notRelevant:{ tr: 'İlgisiz',                   en: 'Not relevant',            ar: 'غير ذي صلة' },
    overload:   { tr: 'Çok fazla e-posta',         en: 'Email overload',          ar: 'بريد كثير جدًا' },
    other:      { tr: 'Başka',                     en: 'Other',                   ar: 'أخرى' }
  },
  pause30:      { tr: '30 gün duraklat',           en: 'Pause for 30 days',        ar: 'إيقاف 30 يومًا' },
  biweekly:     { tr: 'Bu haftayı atla',           en: 'Skip this week',           ar: 'تخطي هذا الأسبوع' },
  unsub:        { tr: 'Aboneliği iptal et',        en: 'Confirm unsubscribe',     ar: 'تأكيد إلغاء الاشتراك' },
  doneUnsub:    { tr: 'Abonelik iptal edildi.',     en: 'You have been unsubscribed.', ar: 'تم إلغاء اشتراكك.' },
  donePause:    { tr: 'Rapor 30 gün duraklatıldı.', en: 'Report paused for 30 days.', ar: 'تم إيقاف التقرير 30 يومًا.' },
  doneBi:       { tr: 'Bu haftaki rapor atlandı.',  en: 'This week skipped.',       ar: 'تم تخطي هذا الأسبوع.' },
  doneCta:      { tr: 'Panele dön',                en: 'Back to dashboard',         ar: 'العودة إلى اللوحة' },
  loading:      { tr: 'Yükleniyor…',                en: 'Loading…',                  ar: 'جارٍ التحميل…' },
  invalid:      { tr: 'Bağlantı geçersiz veya süresi dolmuş.',
                  en: 'This link is invalid or has expired.',
                  ar: 'هذا الرابط غير صالح أو منتهي الصلاحية.' }
};
function _(k, lang) {
  if (k.includes('.')) {
    const [a, b] = k.split('.');
    const node = LABEL[a]?.[b];
    return node?.[lang] || node?.tr || k;
  }
  return LABEL[k]?.[lang] || LABEL[k]?.tr || k;
}

const REASON_KEYS = ['tooLong', 'notRelevant', 'overload', 'other'];

const ACTION_DONE_KEY = {
  unsubscribe: 'doneUnsub',
  pause30:     'donePause',
  biweekly:    'doneBi'
};

function detectLanguage() {
  try {
    const stored = localStorage.getItem('zyrix_lang') || localStorage.getItem('language');
    if (stored && ['tr', 'en', 'ar'].includes(stored)) return stored;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('ar')) return 'ar';
    if (nav.startsWith('en')) return 'en';
  } catch { /* ignore */ }
  return 'tr';
}

export default function WeeklyUnsubscribePage() {
  const language = useMemo(detectLanguage, []);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  }, []);

  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [reasons, setReasons] = useState([]);
  const [action,  setAction]  = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setError(new Error('missing_token'));
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    getUnsubInfo(token)
      .then((data) => !cancelled && setInfo(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [token]);

  const toggleReason = (k) =>
    setReasons((cur) => cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]);

  const apply = async (chosen) => {
    setPending(chosen); setError(null);
    try {
      await applyUnsub(token, chosen, reasons.map((k) => _(`reasons.${k}`, language).slice(0, 64)));
      setAction(chosen);
    } catch (err) {
      setError(err);
    } finally {
      setPending(null);
    }
  };

  return (
    <div dir={dir} style={{
      position: 'relative',
      minHeight: '100vh',
      background: CINEMATIC.bg.deepSpace1,
      color: CINEMATIC.text.pearlWhite,
      fontFamily: language === 'ar'
        ? "'IBM Plex Sans Arabic', 'Inter', system-ui, sans-serif"
        : TYPE_STACK.body,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACE['2xl'],
      overflow: 'hidden'
    }}>
      <GradientMesh palette="cosmic" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 540 }}>
        <header style={{ textAlign: 'center', marginBottom: SPACE.lg }}>
          <NeonBadge tone="violet" size="sm" leading={<FileText size={11} />}>
            {_('pageTitle', language)}
          </NeonBadge>
          <h1 style={{
            ...TYPE_SCALE.displayMd,
            fontFamily: TYPE_STACK.display,
            margin: `${SPACE.md}px 0 ${SPACE.xs}px`
          }}>
            {action ? _(ACTION_DONE_KEY[action], language) : _('prompt', language)}
          </h1>
          {!action && (
            <p style={{ margin: 0, color: CINEMATIC.text.pearlDim, fontSize: 13, lineHeight: 1.55 }}>
              {_('promptSub', language)}
            </p>
          )}
        </header>

        <GlassCard variant="standard">
          {loading && (
            <div style={{ padding: SPACE.lg, textAlign: 'center', color: CINEMATIC.text.pearlFaint }}>
              <Loader2 size={16} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite', verticalAlign: 'middle', marginInlineEnd: 8 }} />
              {_('loading', language)}
            </div>
          )}

          {!loading && error && (
            <div style={{
              padding: SPACE.lg,
              color: CINEMATIC.accent.crimsonGlow,
              fontSize: 13,
              textAlign: 'center',
              background: 'rgba(255, 61, 90, 0.08)',
              border: '1px solid rgba(255, 61, 90, 0.30)',
              borderRadius: RADIUS.sm
            }}>
              {_('invalid', language)}
            </div>
          )}

          {!loading && !error && action && (
            <div style={{ padding: SPACE.lg, textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ color: '#06A87E', marginBottom: SPACE.sm }} />
              <p style={{ margin: `0 0 ${SPACE.lg}px`, color: CINEMATIC.text.pearlDim, fontSize: 13 }}>
                {info?.merchant?.emailMasked || ''}
              </p>
              <a href="https://finsuite.zyrix.co/dashboard" style={primaryBtnLink}>
                {_('doneCta', language)}
              </a>
            </div>
          )}

          {!loading && !error && !action && info && (
            <>
              <div style={{
                marginBottom: SPACE.md,
                padding: '10px 12px',
                background: CINEMATIC.glass.tint1,
                border: `1px solid ${CINEMATIC.glass.border}`,
                borderRadius: RADIUS.sm,
                fontSize: 13,
                color: CINEMATIC.text.pearlDim
              }}>
                <div style={{ fontWeight: 700, color: CINEMATIC.text.pearlWhite }}>
                  {info?.merchant?.name || '—'}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 2 }}>
                  {info?.merchant?.emailMasked || ''}
                </div>
              </div>

              <SectionLabel>{_('reasonsLabel', language)}</SectionLabel>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 6,
                marginTop: 8,
                marginBottom: SPACE.lg
              }}>
                {REASON_KEYS.map((k) => (
                  <ReasonChip
                    key={k}
                    label={_(`reasons.${k}`, language)}
                    selected={reasons.includes(k)}
                    onClick={() => toggleReason(k)}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ActionButton
                  icon={<CalendarRange size={13} />}
                  label={_('biweekly', language)}
                  onClick={() => apply('biweekly')}
                  disabled={pending !== null}
                  loading={pending === 'biweekly'}
                  tone="cyan"
                />
                <ActionButton
                  icon={<Pause size={13} />}
                  label={_('pause30', language)}
                  onClick={() => apply('pause30')}
                  disabled={pending !== null}
                  loading={pending === 'pause30'}
                  tone="amber"
                />
                <ActionButton
                  icon={<MailX size={13} />}
                  label={_('unsub', language)}
                  onClick={() => apply('unsubscribe')}
                  disabled={pending !== null}
                  loading={pending === 'unsubscribe'}
                  tone="crimson"
                  variant="outline"
                />
              </div>
            </>
          )}
        </GlassCard>

        <p style={{ marginTop: SPACE.lg, textAlign: 'center', color: CINEMATIC.text.pearlFaint, fontSize: 11 }}>
          {_('appName', language)} · finsuite.zyrix.co
        </p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled, loading, tone, variant = 'solid' }) {
  const fg = ({ amber: '#FFB800', violet: '#9D4EDD', mint: '#06FFA5', crimson: '#FF3D5A', cyan: '#00D9FF' })[tone];
  const styleSolid = {
    background: `linear-gradient(135deg, ${fg}EE, ${fg}AA)`,
    color: '#0A0E27',
    border: `1px solid ${fg}`
  };
  const styleOutline = {
    background: 'transparent',
    color: fg,
    border: `1px solid ${fg}55`
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 18px',
        borderRadius: RADIUS.sm,
        fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !loading ? 0.5 : 1,
        fontFamily: 'inherit',
        ...(variant === 'outline' ? styleOutline : styleSolid)
      }}
    >
      {loading
        ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
        : icon}
      {label}
    </button>
  );
}

function ReasonChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 12px',
        background: selected ? 'rgba(0, 217, 255, 0.10)' : 'transparent',
        color: selected ? CINEMATIC.accent.cyanGlow : CINEMATIC.text.pearlDim,
        border: `1px solid ${selected ? 'rgba(0, 217, 255, 0.40)' : CINEMATIC.glass.border}`,
        borderRadius: 999,
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: selected ? glowOf('cyan', 1) : 'none'
      }}
    >{label}</button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint
    }}>{children}</div>
  );
}

const primaryBtnLink = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 22px',
  background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))',
  color: '#FFFFFF',
  textDecoration: 'none',
  border: '1px solid rgba(157, 78, 221, 0.5)',
  borderRadius: 6,
  fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
  fontFamily: 'inherit',
  boxShadow: glowOf('violet', 2)
};

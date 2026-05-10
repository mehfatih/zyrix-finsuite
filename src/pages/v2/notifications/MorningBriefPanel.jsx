// ================================================================
// Sprint D-5 — Morning Brief settings panel.
// Mounted inside NotificationPreferencesPage as a sibling section
// to the existing channels / matrix / digest cards.
// ================================================================
import { useEffect, useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, Sunrise, Pause } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard } from '@/components/foundation';
import { getSubscription, updateSubscription, sendTest, getStats } from '@/api/v2/morningBrief';

const LABEL = {
  panelTitle:    { tr: 'Sabah Brifingi',         en: 'Morning Brief',         ar: 'إيجاز الصباح' },
  panelSub:      { tr: 'Her sabah seçtiğin saatte e-postanı 3 içgörü ile aç.',
                   en: 'Open your inbox to 3 insights at the time you choose every morning.',
                   ar: 'افتح بريدك على ثلاث رؤى في الوقت الذي تحدده كل صباح.' },
  enabled:       { tr: 'Etkin',                   en: 'Enabled',               ar: 'مفعّل' },
  frequency:     { tr: 'Sıklık',                  en: 'Frequency',             ar: 'التكرار' },
  freqDaily:     { tr: 'Her gün',                 en: 'Daily',                 ar: 'يومي' },
  freqWeekdays:  { tr: 'Hafta içi',               en: 'Weekdays',              ar: 'أيام العمل' },
  freqWeekly:    { tr: 'Haftalık',                en: 'Weekly',                ar: 'أسبوعي' },
  freqNever:     { tr: 'Asla',                    en: 'Never',                 ar: 'مطلقًا' },
  weeklyDay:     { tr: 'Gün',                     en: 'Day',                   ar: 'اليوم' },
  sendHour:      { tr: 'Gönderim saati (yerel)',   en: 'Send hour (local)',    ar: 'ساعة الإرسال (محلي)' },
  timezone:      { tr: 'Saat dilimi',              en: 'Timezone',              ar: 'المنطقة الزمنية' },
  pausedUntil:   { tr: 'Duraklatıldı:',            en: 'Paused until',          ar: 'متوقفة حتى' },
  resume:        { tr: 'Şimdi devam et',           en: 'Resume now',            ar: 'استئناف الآن' },
  test:          { tr: 'Test gönder',              en: 'Send test',             ar: 'إرسال اختبار' },
  testing:       { tr: 'Gönderiliyor…',            en: 'Sending…',              ar: 'جارٍ الإرسال…' },
  testOk:        { tr: 'Gönderildi',               en: 'Sent',                  ar: 'تم الإرسال' },
  save:          { tr: 'Kaydet',                   en: 'Save',                  ar: 'حفظ' },
  saving:        { tr: 'Kaydediliyor…',            en: 'Saving…',               ar: 'جارٍ الحفظ…' },
  saved:         { tr: 'Kaydedildi',               en: 'Saved',                 ar: 'تم الحفظ' },
  statsHeader:   { tr: 'Son 30 gün',               en: 'Last 30 days',          ar: 'آخر 30 يومًا' },
  statsSent:     { tr: 'Gönderilen',               en: 'Sent',                  ar: 'مرسل' },
  statsOpened:   { tr: 'Açılan',                    en: 'Opened',                ar: 'مفتوح' },
  statsClicked:  { tr: 'Tıklanan',                 en: 'Clicked',               ar: 'مضغوط' },
  statsBounced:  { tr: 'Geri dönen',                en: 'Bounced',               ar: 'مرتد' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

const FREQ_OPTIONS = ['daily', 'weekdays', 'weekly', 'never'];

const DAY_LABELS = {
  tr: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
};

export default function MorningBriefPanel({ language = 'tr' }) {
  const [sub, setSub]           = useState(null);
  const [tz, setTz]             = useState('');
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savedFlag, setSaved]   = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testOkFlag, setTestOk] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    Promise.all([getSubscription(), getStats().catch(() => null)])
      .then(([s, st]) => {
        if (cancelled) return;
        setSub(s.subscription);
        setTz(s.timezone);
        if (st) setStats(st);
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const set = (patch) => setSub((s) => ({ ...s, ...patch }));

  const save = async () => {
    if (!sub) return;
    setSaving(true); setError(null);
    try {
      const data = await updateSubscription({
        enabled:       sub.enabled,
        frequency:     sub.frequency,
        weeklyDay:     sub.frequency === 'weekly' ? (sub.weeklyDay ?? 1) : null,
        sendHourLocal: sub.sendHourLocal
      });
      setSub(data.subscription);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const resume = async () => {
    setSaving(true); setError(null);
    try {
      const data = await updateSubscription({ clearPause: true });
      setSub(data.subscription);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true); setError(null);
    try {
      await sendTest();
      setTestOk(true);
      setTimeout(() => setTestOk(false), 2200);
      // refresh stats so the new send shows up
      getStats().then(setStats).catch(() => undefined);
    } catch (err) {
      setError(err);
    } finally {
      setTesting(false);
    }
  };

  if (loading || !sub) {
    return (
      <GlassCard variant="standard">
        <SectionLabel>{_('panelTitle', language)}</SectionLabel>
        <div style={{ padding: SPACE.md, color: CINEMATIC.text.pearlFaint, fontSize: 13 }}>
          {_('saving', language)}
        </div>
      </GlassCard>
    );
  }

  const pausedActive = sub.pausedUntil && new Date(sub.pausedUntil).getTime() > Date.now();

  return (
    <GlassCard variant="standard">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: SPACE.sm }}>
        <Sunrise size={14} style={{ color: CINEMATIC.accent.amberGlow || '#FFB800' }} />
        <SectionLabel style={{ margin: 0 }}>{_('panelTitle', language)}</SectionLabel>
      </div>
      <p style={{ margin: 0, color: CINEMATIC.text.pearlDim, fontSize: 12, lineHeight: 1.55 }}>
        {_('panelSub', language)}
      </p>

      {/* Enabled toggle */}
      <div style={{ marginTop: SPACE.md }}>
        <Toggle
          label={_('enabled', language)}
          value={sub.enabled}
          onChange={(v) => set({ enabled: v })}
          tone="amber"
        />
      </div>

      {/* Paused banner */}
      {pausedActive && (
        <div style={{
          marginTop: SPACE.md,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255, 184, 0, 0.08)',
          color: CINEMATIC.text.pearlWhite,
          border: '1px solid rgba(255, 184, 0, 0.30)',
          borderRadius: RADIUS.sm,
          fontSize: 12
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Pause size={11} />
            {_('pausedUntil', language)} {new Date(sub.pausedUntil).toLocaleDateString()}
          </span>
          <button type="button" onClick={resume} style={ghostBtn}>
            {_('resume', language)}
          </button>
        </div>
      )}

      {/* Frequency */}
      <SectionLabel style={{ marginTop: SPACE.lg }}>{_('frequency', language)}</SectionLabel>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {FREQ_OPTIONS.map((f) => (
          <ChipButton
            key={f}
            selected={sub.frequency === f}
            onClick={() => set({ frequency: f })}
          >
            {_(`freq${f.charAt(0).toUpperCase() + f.slice(1)}`, language)}
          </ChipButton>
        ))}
      </div>

      {/* Weekly day picker */}
      {sub.frequency === 'weekly' && (
        <>
          <SectionLabel style={{ marginTop: SPACE.md }}>{_('weeklyDay', language)}</SectionLabel>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            {DAY_LABELS[language].map((label, idx) => (
              <ChipButton
                key={idx}
                size="xs"
                selected={(sub.weeklyDay ?? 1) === idx}
                onClick={() => set({ weeklyDay: idx })}
              >
                {label}
              </ChipButton>
            ))}
          </div>
        </>
      )}

      {/* Send hour + timezone display */}
      <div style={{ display: 'flex', gap: 12, marginTop: SPACE.lg, flexWrap: 'wrap' }}>
        <HourInput
          label={_('sendHour', language)}
          value={sub.sendHourLocal}
          onChange={(v) => set({ sendHourLocal: v ?? 7 })}
        />
        <div style={{ flex: 1, minWidth: 160 }}>
          <SectionLabel style={{ marginBottom: 4 }}>{_('timezone', language)}</SectionLabel>
          <div style={{
            padding: '8px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${CINEMATIC.glass.border}`,
            borderRadius: 6,
            color: CINEMATIC.text.pearlWhite,
            fontSize: 13,
            fontFamily: 'monospace'
          }}>
            {tz || '—'}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <SectionLabel style={{ marginTop: SPACE.lg }}>{_('statsHeader', language)}</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 8,
            marginTop: 8
          }}>
            <StatTile label={_('statsSent', language)}    value={stats.sent}     tone="cyan" />
            <StatTile label={_('statsOpened', language)}  value={`${stats.opened} (${stats.openRate}%)`}  tone="violet" />
            <StatTile label={_('statsClicked', language)} value={`${stats.clicked} (${stats.clickRate}%)`} tone="mint" />
            <StatTile label={_('statsBounced', language)} value={stats.bounced}   tone="crimson" />
          </div>
        </>
      )}

      {error && (
        <div role="alert" style={{
          marginTop: SPACE.md,
          padding: '10px 14px',
          background: 'rgba(255, 61, 90, 0.10)',
          color: CINEMATIC.accent.crimsonGlow,
          border: '1px solid rgba(255, 61, 90, 0.35)',
          borderRadius: RADIUS.sm,
          fontSize: 12
        }}>
          {String(error.message || error)}
          {error.waitSeconds ? ` (${error.waitSeconds}s)` : ''}
        </div>
      )}

      {/* Action row */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: SPACE.lg,
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
      }}>
        <button type="button" onClick={test} disabled={testing} style={{ ...ghostBtn, opacity: testing ? 0.6 : 1 }}>
          {testing
            ? <Loader2 size={12} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
            : testOkFlag ? <CheckCircle2 size={12} /> : <Send size={12} />}
          {testing ? _('testing', language) : testOkFlag ? _('testOk', language) : _('test', language)}
        </button>
        <button type="button" onClick={save} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
          {saving
            ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
            : savedFlag ? <CheckCircle2 size={13} /> : <Mail size={13} />}
          {saving ? _('saving', language) : savedFlag ? _('saved', language) : _('save', language)}
        </button>
      </div>
    </GlassCard>
  );
}

// ─── helpers (kept local to this file; mirror NotificationPreferencesPage shape) ───

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint,
      ...style
    }}>{children}</div>
  );
}

function Toggle({ label, value, onChange, tone }) {
  const fg = ({ cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' })[tone];
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        width: '100%',
        background: value ? `${fg}14` : CINEMATIC.glass.tint1,
        color: value ? fg : CINEMATIC.text.pearlDim,
        border: `1px solid ${value ? fg : CINEMATIC.glass.border}`,
        borderRadius: RADIUS.sm,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
        boxShadow: value ? `0 0 0 1px ${fg}55` : 'none',
        transition: 'box-shadow 180ms, background 180ms, border-color 180ms'
      }}
    >
      {label}
      <span style={{
        width: 28, height: 16, borderRadius: 999,
        background: value ? fg : 'rgba(255,255,255,0.10)',
        position: 'relative',
        transition: 'background 200ms'
      }}>
        <span style={{
          position: 'absolute',
          top: 2,
          insetInlineStart: value ? 14 : 2,
          width: 12, height: 12, borderRadius: '50%',
          background: '#0A0E27',
          transition: 'inset-inline-start 200ms'
        }} />
      </span>
    </button>
  );
}

function ChipButton({ children, selected, onClick, size = 'sm' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: size === 'xs' ? '3px 9px' : '5px 12px',
        background: selected ? 'rgba(0, 217, 255, 0.10)' : 'transparent',
        color: selected ? CINEMATIC.accent.cyanGlow : CINEMATIC.text.pearlDim,
        border: `1px solid ${selected ? 'rgba(0, 217, 255, 0.45)' : CINEMATIC.glass.border}`,
        borderRadius: 999,
        fontSize: size === 'xs' ? 10 : 11,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: selected ? glowOf('cyan', 1) : 'none',
        transition: 'box-shadow 200ms ease'
      }}
    >{children}</button>
  );
}

function HourInput({ label, value, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint }}>
        {label}
      </span>
      <input
        type="number"
        min={0} max={23}
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') return onChange(null);
          const n = parseInt(v, 10);
          if (!Number.isFinite(n)) return;
          onChange(Math.max(0, Math.min(23, n)));
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: 6,
          color: CINEMATIC.text.pearlWhite,
          padding: '8px 10px',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          colorScheme: 'dark'
        }}
      />
    </label>
  );
}

function StatTile({ label, value, tone }) {
  const fg = ({ cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' })[tone];
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: fg
      }}>{label}</div>
      <div style={{
        marginTop: 4,
        fontSize: 16, fontWeight: 800, color: CINEMATIC.text.pearlWhite,
        letterSpacing: '-0.01em'
      }}>{value}</div>
    </div>
  );
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 18px',
  background: `linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))`,
  color: '#FFFFFF',
  border: `1px solid rgba(157, 78, 221, 0.5)`,
  borderRadius: 6,
  fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: glowOf('violet', 2)
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

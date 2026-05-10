// ================================================================
// /settings/notifications — preference editor.
// Per-channel master toggles, per-severity channel matrix, digest
// frequency, quiet hours, mute kill-switch.
// ================================================================
import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import { getPreferences, updatePreferences } from '@/api/v2/notifications';
import MorningBriefPanel from './MorningBriefPanel';
import WeeklyReportPanel from './WeeklyReportPanel';

const LABEL = {
  pageTitle:  { tr: 'Bildirim Ayarları',     en: 'Notification Settings',   ar: 'إعدادات الإشعارات' },
  subtitle:   { tr: 'Hangi olaylar için, hangi kanaldan, ne zaman bildirilsin?', en: 'Which events, which channels, and when?', ar: 'أي أحداث، أي قنوات، ومتى؟' },
  channels:   { tr: 'Kanallar',              en: 'Channels',                ar: 'القنوات' },
  inapp:      { tr: 'Uygulama içi',          en: 'In-app',                  ar: 'داخل التطبيق' },
  email:      { tr: 'E-posta',               en: 'Email',                   ar: 'البريد' },
  webpush:    { tr: 'Web Push',              en: 'Web Push',                ar: 'إشعار المتصفح' },
  mobilepush: { tr: 'Mobil Push',            en: 'Mobile Push',             ar: 'إشعار الجوال' },
  matrix:     { tr: 'Olay türü kanalları',   en: 'Per-event channels',      ar: 'قنوات حسب نوع الحدث' },
  critical:   { tr: 'Kritik',                en: 'Critical',                ar: 'حرج' },
  attention:  { tr: 'Dikkat',                en: 'Attention',               ar: 'تنبيه' },
  opportunity:{ tr: 'Fırsat',                en: 'Opportunity',             ar: 'فرصة' },
  share:      { tr: 'Paylaşım',              en: 'Share',                   ar: 'مشاركة' },
  digest:     { tr: 'Toplu gönderim',        en: 'Digest frequency',        ar: 'تردد التجميع' },
  digestInstant: { tr: 'Anında',             en: 'Instant',                 ar: 'فوري' },
  digestHourly:  { tr: 'Saatlik',            en: 'Hourly',                  ar: 'كل ساعة' },
  digestDaily:   { tr: 'Günlük',             en: 'Daily',                   ar: 'يومي' },
  digestNever:   { tr: 'Hiçbir zaman',       en: 'Never',                   ar: 'أبدًا' },
  quiet:      { tr: 'Sessiz saatler',        en: 'Quiet hours',             ar: 'ساعات الصمت' },
  quietFrom:  { tr: 'Başlangıç (0-23)',      en: 'Start (0-23)',            ar: 'البداية (0-23)' },
  quietTo:    { tr: 'Bitiş (0-23)',          en: 'End (0-23)',              ar: 'النهاية (0-23)' },
  save:       { tr: 'Kaydet',                en: 'Save',                    ar: 'حفظ' },
  saving:     { tr: 'Kaydediliyor…',         en: 'Saving…',                 ar: 'جارٍ الحفظ…' },
  saved:      { tr: 'Kaydedildi',            en: 'Saved',                   ar: 'تم الحفظ' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

const ALL_CHANNELS = ['inapp', 'email', 'webpush', 'mobilepush'];
const FREQ_OPTIONS = ['instant', 'hourly', 'daily', 'never'];

export default function NotificationPreferencesPage({ language = 'tr' }) {
  const [prefs, setPrefs]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [savedFlag, setSaved]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(null);
    getPreferences()
      .then((p) => setPrefs(p))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  const save = async () => {
    setSaving(true); setError(null);
    try {
      const updated = await updatePreferences(prefs);
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: CINEMATIC.bg.deepSpace1,
      color: CINEMATIC.text.pearlWhite,
      fontFamily: TYPE_STACK.body,
      padding: `${SPACE['3xl']}px ${SPACE['2xl']}px`,
      overflow: 'hidden'
    }}>
      <GradientMesh palette="cosmic" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto' }}>
        <header style={{ marginBottom: SPACE['2xl'] }}>
          <NeonBadge tone="violet" size="sm" leading={<Settings size={11} />}>Sprint D-4</NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            {_('pageTitle', language)}
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620 }}>
            {_('subtitle', language)}
          </p>
        </header>

        {loading || !prefs ? (
          <GlassCard variant="subtle" style={emptyCenter}>{_('saving', language)}</GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.lg }}>

            {/* Channel master toggles */}
            <GlassCard variant="standard">
              <SectionLabel>{_('channels', language)}</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 8 }}>
                <Toggle label={_('inapp',      language)} value={prefs.inappEnabled}      onChange={(v) => set({ inappEnabled: v })} tone="cyan" />
                <Toggle label={_('email',      language)} value={prefs.emailEnabled}      onChange={(v) => set({ emailEnabled: v })} tone="violet" />
                <Toggle label={_('webpush',    language)} value={prefs.webPushEnabled}    onChange={(v) => set({ webPushEnabled: v })} tone="mint" />
                <Toggle label={_('mobilepush', language)} value={prefs.mobilePushEnabled} onChange={(v) => set({ mobilePushEnabled: v })} tone="amber" disabled />
              </div>
            </GlassCard>

            {/* Per-severity channels */}
            <GlassCard variant="standard">
              <SectionLabel>{_('matrix', language)}</SectionLabel>
              <ChannelMatrix
                rows={[
                  { key: 'criticalChannels',    labelKey: 'critical',    tone: 'crimson' },
                  { key: 'attentionChannels',   labelKey: 'attention',   tone: 'amber' },
                  { key: 'opportunityChannels', labelKey: 'opportunity', tone: 'mint' },
                  { key: 'shareEventChannels',  labelKey: 'share',       tone: 'cyan' }
                ]}
                prefs={prefs} setPrefs={set} language={language} _={_}
              />
            </GlassCard>

            {/* Sprint D-5 — Morning brief subscription */}
            <MorningBriefPanel language={language} />

            {/* Sprint D-6 — Weekly report subscription */}
            <WeeklyReportPanel language={language} />

            {/* Digest + quiet hours */}
            <GlassCard variant="standard">
              <SectionLabel>{_('digest', language)}</SectionLabel>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {FREQ_OPTIONS.map((f) => (
                  <ChipButton
                    key={f}
                    selected={prefs.digestFrequency === f}
                    onClick={() => set({ digestFrequency: f })}
                  >
                    {_(`digest${f.charAt(0).toUpperCase() + f.slice(1)}`, language)}
                  </ChipButton>
                ))}
              </div>

              <SectionLabel style={{ marginTop: SPACE.lg }}>{_('quiet', language)}</SectionLabel>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <HourInput label={_('quietFrom', language)} value={prefs.quietHoursStart}
                           onChange={(v) => set({ quietHoursStart: v })} />
                <HourInput label={_('quietTo',   language)} value={prefs.quietHoursEnd}
                           onChange={(v) => set({ quietHoursEnd: v })} />
              </div>
            </GlassCard>

            {error && (
              <div role="alert" style={{
                padding: '10px 14px',
                background: 'rgba(255, 61, 90, 0.10)',
                color: CINEMATIC.accent.crimsonGlow,
                border: `1px solid rgba(255, 61, 90, 0.35)`,
                borderRadius: RADIUS.sm,
                fontSize: 12
              }}>{String(error.message || error)}</div>
            )}

            {/* Save row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
                 : savedFlag ? <CheckCircle2 size={13} />
                              : <Save size={13} />}
                {saving ? _('saving', language) : savedFlag ? _('saved', language) : _('save', language)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelMatrix({ rows, prefs, setPrefs, language, _ }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
      {rows.map((row) => (
        <div key={row.key} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          background: CINEMATIC.glass.tint1,
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: RADIUS.sm
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            minWidth: 100,
            fontSize: 12, fontWeight: 700,
            color: CINEMATIC.text.pearlWhite
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: ({ cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' })[row.tone],
              marginInlineEnd: 8
            }} />
            {_(row.labelKey, language)}
          </span>
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
            {ALL_CHANNELS.map((ch) => (
              <ChipButton
                key={ch}
                size="xs"
                selected={(prefs[row.key] || []).includes(ch)}
                onClick={() => {
                  const current = prefs[row.key] || [];
                  const next = current.includes(ch)
                    ? current.filter((x) => x !== ch)
                    : [...current, ch];
                  setPrefs({ [row.key]: next });
                }}
              >
                {_(ch, language)}
              </ChipButton>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange, tone, disabled }) {
  const fg = ({ cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' })[tone];
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      role="switch"
      aria-checked={value}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        background: value ? `${fg}14` : CINEMATIC.glass.tint1,
        color: value ? fg : CINEMATIC.text.pearlDim,
        border: `1px solid ${value ? fg : CINEMATIC.glass.border}`,
        borderRadius: RADIUS.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.02em',
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
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
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

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint,
      ...style
    }}>{children}</div>
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
const emptyCenter = {
  textAlign: 'center',
  padding: SPACE['3xl'],
  color: CINEMATIC.text.pearlFaint,
  fontSize: 13
};

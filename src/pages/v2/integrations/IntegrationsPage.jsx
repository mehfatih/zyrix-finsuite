// ================================================================
// /settings/integrations — Slack & Microsoft Teams hub (Sprint D-9).
//
// Slack card states:
//   - "Setup pending"  → backend reports configured=false (env vars
//                        not yet provisioned on Railway).
//   - "Connect"        → no installation rows yet.
//   - "Connected"      → one or more SlackInstallation rows; show
//                        installation cards + channel mapping panel.
//
// Teams card is permanently "Coming soon" in V1 per discovery
// decision §10.A (Microsoft's incoming-webhook connector EOL Aug 2024;
// full Bot Framework + Azure AD path is its own sprint).
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Zap, ShieldCheck, ExternalLink, Loader2, AlertTriangle, Plug } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import {
  listSlackInstallations,
  getSlackInstallUrl,
  uninstallSlack
} from '@/api/v2/integrations';
import SlackInstallationCard from './SlackInstallationCard';

const LABEL = {
  pageTitle:    { tr: 'Entegrasyonlar', en: 'Integrations', ar: 'التكاملات' },
  subtitle:     { tr: 'AI içgörülerin ekibinin çalıştığı yere aksın.', en: 'Let your AI insights flow where your team already works.', ar: 'دع رؤى الذكاء الاصطناعي تتدفق إلى حيث يعمل فريقك.' },
  enterprise:   { tr: 'Enterprise', en: 'Enterprise', ar: 'إنتربرايز' },
  slack:        { tr: 'Slack', en: 'Slack', ar: 'سلاك' },
  slackTagline: { tr: 'Kritik içgörüleri canlı kanallara göster.', en: 'Surface critical insights in your live channels.', ar: 'اعرض الرؤى الحرجة في قنواتك المباشرة.' },
  teams:        { tr: 'Microsoft Teams', en: 'Microsoft Teams', ar: 'مايكروسوفت تيمز' },
  teamsTagline: { tr: 'Microsoft 365 dünyası için. Yakında.', en: 'For the Microsoft 365 world. Coming soon.', ar: 'لعالم Microsoft 365. قريبًا.' },
  comingSoon:   { tr: 'Yakında', en: 'Coming soon', ar: 'قريبًا' },
  setupPending: { tr: 'Kurulum bekleniyor', en: 'Setup pending', ar: 'الإعداد قيد الانتظار' },
  setupPendingHint: {
    tr: 'Slack uygulaması henüz Railway üzerinde yapılandırılmadı. Yöneticin SLACK_CLIENT_ID gibi anahtarları sağladığında bağlantı butonu burada görünür.',
    en: "Slack app isn't configured on Railway yet. The connect button appears here once your admin provisions SLACK_CLIENT_ID and the related secrets.",
    ar: 'لم يتم إعداد تطبيق Slack على Railway بعد. سيظهر زر الاتصال هنا بمجرد توفير SLACK_CLIENT_ID والأسرار المرتبطة.'
  },
  connect:      { tr: 'Slack’i Bağla', en: 'Connect Slack', ar: 'اربط Slack' },
  connecting:   { tr: 'Bağlanıyor…', en: 'Connecting…', ar: 'جارٍ الاتصال…' },
  bullets: {
    tr: ['Kanal eşlemesi (örn. kritik → #alerts)', 'Çift yönlü aksiyonlar (Çözüldü, Yoksay)', 'Slash komutları (/zyrix today, /zyrix mrr)'],
    en: ['Channel mapping (e.g. critical → #alerts)', 'Two-way actions (Resolve, Dismiss)', 'Slash commands (/zyrix today, /zyrix mrr)'],
    ar: ['ربط القنوات (مثل critical → #alerts)', 'إجراءات ثنائية الاتجاه (محلول، تجاهل)', 'أوامر الشرطة المائلة (/zyrix today, /zyrix mrr)']
  },
  toastConnected: { tr: 'Slack çalışma alanı bağlandı.', en: 'Slack workspace connected.', ar: 'تم ربط مساحة عمل Slack.' },
  toastError:     { tr: 'Slack bağlantısı başarısız oldu.', en: 'Slack connection failed.', ar: 'فشل الاتصال بـ Slack.' },
  loadError:      { tr: 'Entegrasyon listesi yüklenemedi.', en: 'Could not load integrations.', ar: 'تعذر تحميل قائمة التكاملات.' },
  noWorkspaces:   { tr: 'Henüz bağlı çalışma alanı yok.', en: 'No connected workspaces yet.', ar: 'لا توجد مساحات عمل متصلة بعد.' }
};
const _ = (k, lang) => {
  const v = LABEL[k];
  if (!v) return k;
  if (typeof v === 'object' && !Array.isArray(v[lang])) return v[lang] || v.tr || k;
  return v[lang] || v.tr || k;
};

export default function IntegrationsPage({ language = 'tr' }) {
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const [data, setData]         = useState({ configured: false, installations: [] });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [busy, setBusy]         = useState(false);
  const [toast, setToast]       = useState(null);

  // Capture ?slack=connected | error from the OAuth redirect, then strip it.
  useEffect(() => {
    const slackFlag = search.get('slack');
    if (slackFlag === 'connected') {
      const ws = search.get('workspace') || '';
      setToast({
        tone: 'mint',
        text: ws ? `${_('toastConnected', language)} (${ws})` : _('toastConnected', language)
      });
      const next = new URLSearchParams(search);
      next.delete('slack'); next.delete('workspace'); next.delete('reason');
      setSearch(next, { replace: true });
    } else if (slackFlag === 'error') {
      const reason = search.get('reason') || '';
      setToast({
        tone: 'crimson',
        text: reason ? `${_('toastError', language)} — ${reason}` : _('toastError', language)
      });
      const next = new URLSearchParams(search);
      next.delete('slack'); next.delete('reason'); next.delete('workspace');
      setSearch(next, { replace: true });
    }
    if (slackFlag) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const refresh = async () => {
    setLoading(true); setError(null);
    try {
      const res = await listSlackInstallations();
      setData(res || { configured: false, installations: [] });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const activeInstallations = useMemo(
    () => (data.installations || []).filter((i) => !i.uninstalledAt),
    [data]
  );
  const slackConnected = activeInstallations.length > 0;

  const handleConnect = async () => {
    setBusy(true);
    try {
      const { url } = await getSlackInstallUrl();
      // Same-tab redirect — Slack's OAuth UI is full-page and rejects
      // popups in some browser configs. After auth, Slack redirects to
      // /api/integrations/slack/oauth-callback, which 302s back here
      // with ?slack=connected.
      window.location.href = url;
    } catch (err) {
      setBusy(false);
      setToast({ tone: 'crimson', text: err.message || _('toastError', language) });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleUninstall = async (installationId) => {
    if (!installationId) return;
    setBusy(true);
    try {
      await uninstallSlack(installationId);
      await refresh();
    } catch (err) {
      setToast({ tone: 'crimson', text: err.message || _('toastError', language) });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: CINEMATIC.bg.deepSpace1,
      fontFamily: TYPE_STACK.body,
      color: CINEMATIC.text.pearlWhite,
      padding: `${SPACE['3xl']}px ${SPACE['2xl']}px ${SPACE['4xl']}px`,
      overflow: 'hidden'
    }}>
      <GradientMesh tone="cyan" intensity={0.4} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 980,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE['3xl']
      }}>
        {/* Header */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md, flexWrap: 'wrap' }}>
            <Link2 size={28} color={CINEMATIC.accent.cyan} />
            <h1 style={{
              ...TYPE_SCALE.headingLg,
              fontFamily: TYPE_STACK.display,
              margin: 0,
              color: CINEMATIC.text.pearlWhite
            }}>{_('pageTitle', language)}</h1>
            <NeonBadge tone="violet" size="sm">{_('enterprise', language)}</NeonBadge>
          </div>
          <p style={{ ...TYPE_SCALE.bodyMd, margin: 0, color: CINEMATIC.text.pearlDim }}>
            {_('subtitle', language)}
          </p>
        </header>

        {/* Toast */}
        {toast && (
          <GlassCard variant="subtle" glow={toast.tone} style={{ padding: SPACE.lg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md }}>
              <AlertTriangle size={18} color={toast.tone === 'mint' ? CINEMATIC.accent.neonMint : CINEMATIC.accent.crimsonGlow} />
              <span style={{ ...TYPE_SCALE.bodyMd }}>{toast.text}</span>
            </div>
          </GlassCard>
        )}

        {/* Loading / error */}
        {loading && (
          <GlassCard variant="standard" style={{ padding: SPACE['2xl'], textAlign: 'center' }}>
            <Loader2 size={20} color={CINEMATIC.accent.cyan} style={{ animation: 'spin 1s linear infinite' }} />
          </GlassCard>
        )}
        {error && !loading && (
          <GlassCard variant="standard" glow="crimson" style={{ padding: SPACE['2xl'] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md }}>
              <AlertTriangle size={18} color={CINEMATIC.accent.crimsonGlow} />
              <span>{_('loadError', language)}</span>
            </div>
          </GlassCard>
        )}

        {/* Slack card */}
        {!loading && !error && (
          <GlassCard variant="elevated" glow="violet" style={{ padding: SPACE['2xl'] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACE.lg, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md, flexWrap: 'wrap' }}>
                  <SlackLogo />
                  <h2 style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, margin: 0 }}>{_('slack', language)}</h2>
                  {!data.configured && (
                    <NeonBadge tone="amber" size="sm">{_('setupPending', language)}</NeonBadge>
                  )}
                  {data.configured && slackConnected && (
                    <NeonBadge tone="mint" size="sm">{activeInstallations.length}× {language === 'ar' ? 'متصل' : language === 'en' ? 'connected' : 'bağlı'}</NeonBadge>
                  )}
                </div>
                <p style={{ ...TYPE_SCALE.bodyMd, margin: 0, color: CINEMATIC.text.pearlDim }}>
                  {_('slackTagline', language)}
                </p>
                <ul style={{
                  margin: `${SPACE.md}px 0 0`,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: SPACE.xs,
                  color: CINEMATIC.text.pearlDim,
                  ...TYPE_SCALE.bodyMd
                }}>
                  {LABEL.bullets[language]?.map((line, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: SPACE.sm }}>
                      <Zap size={14} color={CINEMATIC.accent.plasmaViolet} /> {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, alignItems: 'stretch', minWidth: 200 }}>
                {!data.configured && (
                  <p style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, margin: 0, lineHeight: 1.4 }}>
                    {_('setupPendingHint', language)}
                  </p>
                )}
                {data.configured && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={busy}
                    style={connectButtonStyle(busy)}
                    aria-label={_('connect', language)}
                    aria-busy={busy}
                  >
                    {busy
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> {_('connecting', language)}</>
                      : <><Plug size={16} aria-hidden="true" /> {_('connect', language)}</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Connected installations */}
            {data.configured && activeInstallations.length === 0 && (
              <p style={{
                marginTop: SPACE['2xl'],
                ...TYPE_SCALE.bodyMd,
                color: CINEMATIC.text.pearlFaint,
                textAlign: 'center'
              }}>
                {_('noWorkspaces', language)}
              </p>
            )}
            {activeInstallations.length > 0 && (
              <div style={{ marginTop: SPACE['2xl'], display: 'flex', flexDirection: 'column', gap: SPACE.lg }}>
                {activeInstallations.map((inst) => (
                  <SlackInstallationCard
                    key={inst.id}
                    installation={inst}
                    language={language}
                    onUninstall={() => handleUninstall(inst.id)}
                    onChanged={refresh}
                    busy={busy}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Teams card (Coming soon) */}
        {!loading && !error && (
          <GlassCard variant="standard" style={{ padding: SPACE['2xl'], opacity: 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: SPACE.lg, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md, flexWrap: 'wrap' }}>
                <TeamsLogo />
                <div>
                  <h2 style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, margin: 0 }}>{_('teams', language)}</h2>
                  <p style={{ ...TYPE_SCALE.caption, margin: `${SPACE.xs}px 0 0`, color: CINEMATIC.text.pearlFaint }}>
                    {_('teamsTagline', language)}
                  </p>
                </div>
              </div>
              <NeonBadge tone="cyan" size="md">{_('comingSoon', language)}</NeonBadge>
            </div>
          </GlassCard>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function connectButtonStyle(disabled) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 18px',
    fontFamily: TYPE_STACK.body,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: CINEMATIC.text.pearlWhite,
    background: `linear-gradient(135deg, ${CINEMATIC.accent.plasmaViolet}, ${CINEMATIC.accent.cyan})`,
    border: `1px solid ${CINEMATIC.glass.borderStrong}`,
    borderRadius: RADIUS.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: glowOf('violet', 0.4),
    transition: 'transform 150ms ease, box-shadow 150ms ease'
  };
}

// Inline SVG marks so we don't pull in a logo library; ~1 KB total.
function SlackLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#E01E5A" d="M5 14a2 2 0 1 0 2 2v-2H5zM6 14a2 2 0 1 1 2-2h6a2 2 0 1 1 0 4H6z" />
      <path fill="#36C5F0" d="M10 5a2 2 0 1 0 2 2h-2zM10 6a2 2 0 1 1-2 2v6a2 2 0 1 1-4 0V6z" />
      <path fill="#2EB67D" d="M19 10a2 2 0 1 0-2-2v2zM18 10a2 2 0 1 1-2 2h-6a2 2 0 1 1 0-4h8z" />
      <path fill="#ECB22E" d="M14 19a2 2 0 1 0-2-2h2zM14 18a2 2 0 1 1 2-2v-6a2 2 0 1 1 4 0v8z" />
    </svg>
  );
}

function TeamsLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="6" width="13" height="12" rx="2" fill="#5059C9" />
      <text x="8.5" y="16" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" fill="#fff" textAnchor="middle">T</text>
      <circle cx="19" cy="9" r="3.5" fill="#7B83EB" />
      <circle cx="19" cy="9" r="1.6" fill="#fff" />
    </svg>
  );
}

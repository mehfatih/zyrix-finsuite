// ================================================================
// /insights/shares — share audit log.
// Filterable timeline by date / channel / status. Click row → details.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageCircle, CheckCircle2, XCircle, Clock, Download, History, ExternalLink } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import RecipientAvatarChip from '@/components/v2/sharing/RecipientAvatarChip';
import { listShares } from '@/api/v2/sharing';

const LABEL = {
  pageTitle: { tr: 'Paylaşım Geçmişi', en: 'Share History', ar: 'سجل المشاركة' },
  subtitle:  { tr: 'AI içgörü ve raporları kime, ne zaman, hangi kanaldan paylaştın', en: 'Audit log of every insight and report you shared', ar: 'سجل تدقيق لكل ما شاركته' },
  filterAll:    { tr: 'Tümü',         en: 'All',          ar: 'الكل' },
  filterEmail:  { tr: 'E-posta',      en: 'Email',        ar: 'بريد' },
  filterWa:     { tr: 'WhatsApp',     en: 'WhatsApp',     ar: 'واتساب' },
  empty:        { tr: 'Henüz paylaşım yapmadın.', en: 'No shares yet.', ar: 'لا توجد مشاركات بعد.' },
  channelEmail: { tr: 'E-posta',      en: 'Email',        ar: 'بريد' },
  channelWa:    { tr: 'WhatsApp',     en: 'WhatsApp',     ar: 'واتساب' },
  reportInsight: { tr: 'İçgörü',      en: 'Insight',      ar: 'رؤية' },
  reportBrief:   { tr: 'Günlük Brifing', en: 'Daily Brief', ar: 'الإيجاز اليومي' },
  reportRange:   { tr: 'Performans Raporu', en: 'Performance Report', ar: 'تقرير الأداء' },
  statusSent:      { tr: 'Gönderildi',  en: 'Sent',        ar: 'تم الإرسال' },
  statusDelivered: { tr: 'Ulaştı',      en: 'Delivered',   ar: 'تم التسليم' },
  statusOpened:    { tr: 'Açıldı',      en: 'Opened',      ar: 'تم الفتح' },
  statusFailed:    { tr: 'Başarısız',   en: 'Failed',      ar: 'فشل' },
  statusPending:   { tr: 'Bekliyor',    en: 'Pending',     ar: 'قيد الانتظار' },
  downloadCount:   { tr: 'indirme',     en: 'downloads',   ar: 'تنزيلات' },
  days:            { tr: 'gün',         en: 'days',        ar: 'يومًا' },
  range:           { tr: 'Süre',        en: 'Range',       ar: 'النطاق' },
  channel:         { tr: 'Kanal',       en: 'Channel',     ar: 'القناة' }
};
function _(k, lang) { return LABEL[k]?.[lang] || LABEL[k]?.tr || k; }

export default function SharesPage({ language = 'tr' }) {
  const [days, setDays]         = useState(30);
  const [channel, setChannel]   = useState('all');
  const [shares, setShares]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listShares({ days, limit: 200 })
      .then((rows) => { if (!cancelled) setShares(rows); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  const filtered = useMemo(() => {
    if (channel === 'all') return shares;
    return shares.filter((s) => s.channel === channel);
  }, [shares, channel]);

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
      <GradientMesh palette="aurora" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

        {/* Hero */}
        <header style={{ marginBottom: SPACE['2xl'] }}>
          <NeonBadge tone="cyan" size="sm" leading={<History size={11} />}>
            Sprint D-3
          </NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            {_('pageTitle', language)}
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620, marginBottom: SPACE.lg }}>
            {_('subtitle', language)}
          </p>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.md, alignItems: 'center' }}>
            <FilterChips
              label={_('range', language)}
              options={[7, 30, 90, 365]}
              value={days}
              onChange={setDays}
              renderLabel={(n) => `${n} ${_('days', language)}`}
            />
            <FilterChips
              label={_('channel', language)}
              options={['all', 'email', 'whatsapp']}
              value={channel}
              onChange={setChannel}
              renderLabel={(v) => v === 'all' ? _('filterAll', language)
                                : v === 'email' ? _('filterEmail', language)
                                                  : _('filterWa', language)}
            />
          </div>
        </header>

        {/* Timeline */}
        {loading ? (
          <div style={emptyCenter}>…</div>
        ) : error ? (
          <div style={{ ...emptyCenter, color: CINEMATIC.accent.crimsonGlow }}>{String(error.message || error)}</div>
        ) : filtered.length === 0 ? (
          <GlassCard variant="subtle" style={{ ...emptyCenter, padding: SPACE['3xl'], textAlign: 'center' }}>
            <span style={{ color: CINEMATIC.text.pearlFaint, fontSize: 13 }}>{_('empty', language)}</span>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md }}>
            {filtered.map((s) => (
              <ShareRow key={s.id} share={s} language={language} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareRow({ share, language }) {
  const ChannelIcon = share.channel === 'email' ? Mail : MessageCircle;
  const channelTone = share.channel === 'email' ? 'cyan' : 'mint';
  const channelLabel = share.channel === 'email' ? _('channelEmail', language) : _('channelWa', language);
  const reportLabel =
      share.reportType === 'single_insight' ? _('reportInsight', language)
    : share.reportType === 'daily_brief'    ? _('reportBrief',   language)
                                              : _('reportRange',  language);

  const StatusIcon =
      share.status === 'delivered' || share.status === 'opened' || share.status === 'sent' ? CheckCircle2
    : share.status === 'failed'  ? XCircle
                                   : Clock;
  const statusColor =
      share.status === 'failed'    ? CINEMATIC.accent.crimsonGlow
    : share.status === 'opened'    ? CINEMATIC.accent.neonMint
    : share.status === 'delivered' ? CINEMATIC.accent.cyan
    : share.status === 'sent'      ? CINEMATIC.accent.cyan
                                     : CINEMATIC.accent.solarAmber;
  const statusLabelKey =
      share.status === 'delivered' ? 'statusDelivered'
    : share.status === 'opened'    ? 'statusOpened'
    : share.status === 'failed'    ? 'statusFailed'
    : share.status === 'pending'   ? 'statusPending'
                                     : 'statusSent';

  const recipient = share.recipientSnapshot || {};
  const insightTitle = share.insight?.title || share.recipientSnapshot?.documentTitle || reportLabel;

  return (
    <GlassCard variant="standard" style={{ display: 'flex', alignItems: 'center', gap: SPACE.lg }}>
      {/* Channel icon */}
      <span style={{
        flexShrink: 0,
        width: 40, height: 40, borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `${rgbaTone(channelTone, 0.10)}`,
        color: toneHex(channelTone),
        boxShadow: glowOf(channelTone, 1)
      }}>
        <ChannelIcon size={18} />
      </span>

      {/* Center body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: CINEMATIC.text.pearlWhite, letterSpacing: '-0.01em' }}>
            {insightTitle}
          </span>
          <NeonBadge tone="violet" size="sm">{reportLabel}</NeonBadge>
          <NeonBadge tone={channelTone} size="sm">{channelLabel}</NeonBadge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <RecipientAvatarChip
            name={recipient.name || '—'}
            email={recipient.email}
            phone={recipient.phone}
            role={recipient.role}
            size="sm"
            compact
          />
          <span style={{ fontSize: 11, color: CINEMATIC.text.pearlFaint }}>
            {formatDateTime(new Date(share.sentAt), language)}
          </span>
        </div>
        {share.message && (
          <div style={{
            marginTop: 8, padding: '6px 10px',
            background: CINEMATIC.glass.tint1,
            borderRadius: 6,
            fontSize: 11,
            color: CINEMATIC.text.pearlDim,
            fontStyle: 'italic'
          }}>"{share.message}"</div>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: statusColor,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>
          <StatusIcon size={12} />
          {_(statusLabelKey, language)}
        </span>
        {share.downloadCount > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: CINEMATIC.text.pearlFaint }}>
            <Download size={10} /> {share.downloadCount} {_('downloadCount', language)}
          </span>
        )}
        {share.errorMessage && (
          <span style={{ fontSize: 10, color: CINEMATIC.accent.crimsonGlow, maxWidth: 200, textAlign: 'right' }}>
            {share.errorMessage.slice(0, 100)}
          </span>
        )}
      </div>
    </GlassCard>
  );
}

function FilterChips({ label, options, value, onChange, renderLabel }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint }}>
        {label}:
      </span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '4px 10px',
              background: active ? `rgba(0, 217, 255, 0.10)` : 'transparent',
              color: active ? CINEMATIC.accent.cyanGlow : CINEMATIC.text.pearlDim,
              border: `1px solid ${active ? 'rgba(0, 217, 255, 0.45)' : CINEMATIC.glass.border}`,
              borderRadius: 999,
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: active ? glowOf('cyan', 1) : 'none',
              transition: 'box-shadow 200ms ease'
            }}
          >{renderLabel ? renderLabel(opt) : String(opt)}</button>
        );
      })}
    </div>
  );
}

function rgbaTone(tone, a) {
  const map = { cyan: '0,217,255', violet: '157,78,221', mint: '6,255,165', amber: '255,184,0', crimson: '255,61,90' };
  return `rgba(${map[tone] || map.cyan}, ${a})`;
}
function toneHex(tone) {
  return { cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' }[tone] || '#00D9FF';
}
function formatDateTime(d, locale) {
  const lc = locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US';
  try {
    return new Intl.DateTimeFormat(lc, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return d.toISOString();
  }
}

const emptyCenter = {
  textAlign: 'center',
  padding: SPACE['2xl'],
  color: CINEMATIC.text.pearlDim,
  fontSize: 13
};

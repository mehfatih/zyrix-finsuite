// ================================================================
// SlackInstallationCard — single connected workspace card.
//
// B.7 ships the shell (workspace name, install date, disconnect
// button). B.8 expands with the channel mapping panel inside this
// same card.
// ================================================================
import { useState } from 'react';
import { Hash, Trash2, Loader2 } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { GlassCard, NeonBadge } from '@/components/foundation';
import SlackChannelMappingPanel from './SlackChannelMappingPanel';

const LABEL = {
  installedOn:  { tr: 'Yüklendi', en: 'Installed', ar: 'تم التثبيت' },
  scopes:       { tr: 'İzinler',  en: 'Scopes',    ar: 'الصلاحيات' },
  disconnect:   { tr: 'Bağlantıyı kes', en: 'Disconnect', ar: 'قطع الاتصال' },
  disconnecting:{ tr: 'Kesiliyor…', en: 'Disconnecting…', ar: 'جارٍ القطع…' },
  confirm:      { tr: 'Emin misin? Bu çalışma alanı için Slack mesajları durur.', en: 'Are you sure? Slack delivery to this workspace will stop.', ar: 'هل أنت متأكد؟ ستتوقف رسائل Slack لمساحة العمل هذه.' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

function formatDate(iso, lang) {
  if (!iso) return '';
  try {
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'tr-TR';
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export default function SlackInstallationCard({ installation, language = 'tr', onUninstall, onChanged, busy }) {
  const [confirming, setConfirming] = useState(false);

  const requestUninstall = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setConfirming(false);
    onUninstall?.();
  };

  return (
    <GlassCard variant="standard" style={{ padding: SPACE['2xl'] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACE.lg, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, flex: '1 1 auto', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.sm, flexWrap: 'wrap' }}>
            <Hash size={16} color={CINEMATIC.accent.plasmaViolet} />
            <span style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display }}>
              {installation.workspaceName}
            </span>
            <NeonBadge tone="violet" size="sm">{installation.workspaceId}</NeonBadge>
          </div>
          <div style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint }}>
            {_('installedOn', language)}: {formatDate(installation.installedAt, language)}
          </div>
          {installation.scope && (
            <div style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, fontFamily: TYPE_STACK.mono, opacity: 0.75 }}>
              {_('scopes', language)}: {installation.scope}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={requestUninstall}
          disabled={busy}
          title={confirming ? _('confirm', language) : ''}
          aria-label={confirming ? _('confirm', language) : `${_('disconnect', language)} — ${installation.workspaceName}`}
          aria-busy={busy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontFamily: TYPE_STACK.body,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: confirming ? CINEMATIC.text.pearlWhite : CINEMATIC.accent.crimsonGlow,
            background: confirming ? CINEMATIC.accent.crimsonDeep : 'transparent',
            border: `1px solid ${confirming ? CINEMATIC.accent.crimsonDeep : CINEMATIC.glass.border}`,
            borderRadius: RADIUS.md,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
            transition: 'background 150ms ease, color 150ms ease'
          }}
        >
          {busy
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {_('disconnecting', language)}</>
            : <><Trash2 size={14} /> {confirming ? _('confirm', language).slice(0, 30) + '…' : _('disconnect', language)}</>
          }
        </button>
      </div>

      <SlackChannelMappingPanel
        installationId={installation.id}
        language={language}
        onChanged={onChanged}
      />
    </GlassCard>
  );
}

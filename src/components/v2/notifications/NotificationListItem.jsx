// ================================================================
// NotificationListItem — single row in the dropdown / archive list.
// Compact + full variants share the same shell; tone derives from
// severity (CRITICAL=crimson, ATTENTION=amber, OPPORTUNITY=mint,
// SHARE_EVENT=cyan, SYSTEM=violet).
// ================================================================
import { AlertTriangle, AlertCircle, Sparkles, Send, Bell } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';

const SEVERITY_TONE = {
  CRITICAL:    'crimson',
  ATTENTION:   'amber',
  OPPORTUNITY: 'mint',
  SHARE_EVENT: 'cyan',
  SYSTEM:      'violet'
};

const SEVERITY_ICON = {
  CRITICAL:    AlertTriangle,
  ATTENTION:   AlertCircle,
  OPPORTUNITY: Sparkles,
  SHARE_EVENT: Send,
  SYSTEM:      Bell
};

function toneHex(t) {
  return { cyan: '#00D9FF', violet: '#9D4EDD', mint: '#06FFA5', amber: '#FFB800', crimson: '#FF3D5A' }[t] || '#00D9FF';
}
function rgbaTone(t, a) {
  const map = { cyan: '0,217,255', violet: '157,78,221', mint: '6,255,165', amber: '255,184,0', crimson: '255,61,90' };
  return `rgba(${map[t] || map.cyan}, ${a})`;
}

function relativeTime(iso, language = 'tr') {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return language === 'tr' ? 'şimdi' : language === 'ar' ? 'الآن' : 'now';
  if (m < 60) return language === 'tr' ? `${m} dk` : language === 'ar' ? `${m} د` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return language === 'tr' ? `${h} sa` : language === 'ar' ? `${h} س` : `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return language === 'tr' ? `${d} g`  : language === 'ar' ? `${d} ي` : `${d}d`;
  return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : language === 'ar' ? 'ar-SA' : 'en-US',
    { month: 'short', day: 'numeric' }).format(new Date(iso));
}

/**
 * @param {{
 *   notification: any,
 *   variant?: 'compact' | 'full',
 *   language?: 'tr' | 'ar' | 'en',
 *   onClick?: () => void,
 *   onMarkRead?: () => void,
 *   onArchive?: () => void
 * }} props
 */
export default function NotificationListItem({
  notification: n, variant = 'compact', language = 'tr', onClick, onMarkRead, onArchive
}) {
  const sev = n.severity || (n.iconTone ? Object.keys(SEVERITY_TONE).find((k) => SEVERITY_TONE[k] === n.iconTone) : 'SYSTEM') || 'SYSTEM';
  const tone = n.iconTone || SEVERITY_TONE[sev] || 'cyan';
  const fg = toneHex(tone);
  const Icon = SEVERITY_ICON[sev] || Bell;
  const unread = !n.isRead;

  const handleClick = (e) => {
    if (unread && onMarkRead) onMarkRead();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        padding: variant === 'full' ? 16 : 12,
        background: unread ? rgbaTone(tone, 0.06) : 'transparent',
        border: `1px solid ${unread ? rgbaTone(tone, 0.25) : CINEMATIC.glass.border}`,
        borderRadius: variant === 'full' ? RADIUS.md : RADIUS.sm,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        textAlign: 'inherit',
        cursor: 'pointer',
        boxShadow: unread ? glowOf(tone, 1) : 'none',
        transition: 'box-shadow 200ms, background 200ms, border-color 200ms'
      }}
    >
      {/* Icon */}
      <span style={{
        flexShrink: 0,
        width: 30, height: 30, borderRadius: 8,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: rgbaTone(tone, 0.12),
        color: fg
      }}>
        <Icon size={15} />
      </span>

      {/* Body */}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: variant === 'full' ? 13 : 12,
            fontWeight: 700,
            color: CINEMATIC.text.pearlWhite,
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{n.title}</span>
          {unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: fg, flexShrink: 0 }} />}
        </span>
        <span style={{
          fontSize: 11,
          color: CINEMATIC.text.pearlDim,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: variant === 'full' ? 3 : 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>{n.body || n.message}</span>
        <span style={{ fontSize: 10, color: CINEMATIC.text.pearlFaint, marginTop: 2 }}>
          {relativeTime(n.createdAt, language)}
        </span>
      </span>

      {/* Optional actions (full variant only) */}
      {variant === 'full' && onArchive && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          style={{
            flexShrink: 0,
            color: CINEMATIC.text.pearlFaint,
            fontSize: 10,
            cursor: 'pointer',
            padding: 4
          }}
        >×</span>
      )}
    </button>
  );
}

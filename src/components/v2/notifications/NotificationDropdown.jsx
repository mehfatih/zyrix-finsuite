// ================================================================
// NotificationDropdown — glass panel attached to NotificationBell.
// Sections: Today / This week / Older. Mark-all-read + view-all
// links in the footer.
// ================================================================
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, Archive } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora } from '@/design-system-v2/cinematic/shadows';
import { auroraLinear } from '@/design-system-v2/cinematic/gradients';
import { useNotificationCenter } from './NotificationCenterContext';
import NotificationListItem from './NotificationListItem';

const LABEL = {
  notifications: { tr: 'Bildirimler',         en: 'Notifications',     ar: 'الإشعارات' },
  today:         { tr: 'Bugün',               en: 'Today',             ar: 'اليوم' },
  thisWeek:      { tr: 'Bu hafta',            en: 'This week',         ar: 'هذا الأسبوع' },
  older:         { tr: 'Daha eski',           en: 'Older',             ar: 'أقدم' },
  empty:         { tr: 'Yeni bildirim yok',   en: 'No notifications',  ar: 'لا توجد إشعارات' },
  markAllRead:   { tr: 'Tümünü okundu işaretle', en: 'Mark all read',  ar: 'وضع علامة على الكل كمقروء' },
  viewAll:       { tr: 'Tümünü gör',          en: 'View all',          ar: 'عرض الكل' },
  loading:       { tr: 'Yükleniyor…',         en: 'Loading…',          ar: 'يتم التحميل…' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

function bucket(iso) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diffH = (now - t) / (1000 * 60 * 60);
  if (diffH < 24)  return 'today';
  if (diffH < 168) return 'thisWeek';
  return 'older';
}

export default function NotificationDropdown({ language = 'tr', onClose }) {
  const { recent, loading, bulkRead, markRead, archive, refreshList } = useNotificationCenter();

  // Kick a fresh fetch when dropdown opens.
  useEffect(() => { refreshList(); }, [refreshList]);

  const grouped = useMemo(() => {
    const map = { today: [], thisWeek: [], older: [] };
    for (const n of recent) {
      if (n.archived) continue;
      map[bucket(n.createdAt)].push(n);
    }
    return map;
  }, [recent]);

  const total = grouped.today.length + grouped.thisWeek.length + grouped.older.length;

  return (
    <div
      role="menu"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        insetInlineEnd: 0,
        width: 420,
        maxHeight: 600,
        zIndex: 1000,
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        boxShadow: `${aurora(2)}, 0 18px 60px rgba(0, 0, 0, 0.5)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'cn-fade-up 240ms ease both'
      }}
    >
      {/* Aurora border underlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: RADIUS.xl,
          padding: 1,
          background: auroraLinear,
          backgroundSize: '200% 100%',
          animation: 'cn-aurora-border 6s ease-in-out infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0.4,
          pointerEvents: 'none'
        }}
      />

      {/* Header */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: `1px solid ${CINEMATIC.glass.border}`
      }}>
        <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint }}>
          {_('notifications', language)}
        </span>
        {total > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); bulkRead(); }}
            style={iconBtnStyle}
            title={_('markAllRead', language)}
          ><CheckCheck size={13} /></button>
        )}
      </div>

      {/* Sections */}
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: 12 }}>
        {loading && total === 0 ? (
          <div style={loadingBox}>{_('loading', language)}</div>
        ) : total === 0 ? (
          <div style={emptyBox}>{_('empty', language)}</div>
        ) : (
          <>
            {grouped.today.length    > 0 && <Section label={_('today',    language)} items={grouped.today}    {...{ language, onClose, markRead, archive }} />}
            {grouped.thisWeek.length > 0 && <Section label={_('thisWeek', language)} items={grouped.thisWeek} {...{ language, onClose, markRead, archive }} />}
            {grouped.older.length    > 0 && <Section label={_('older',    language)} items={grouped.older}    {...{ language, onClose, markRead, archive }} />}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative',
        padding: '10px 14px',
        borderTop: `1px solid ${CINEMATIC.glass.border}`,
        textAlign: 'center'
      }}>
        <Link
          to="/notifications"
          onClick={onClose}
          style={{
            color: CINEMATIC.accent.cyanGlow,
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.04em',
            textDecoration: 'none'
          }}
        >{_('viewAll', language)} →</Link>
      </div>
    </div>
  );
}

function Section({ label, items, language, onClose, markRead, archive }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        ...TYPE_SCALE.caption,
        color: CINEMATIC.text.pearlFaint,
        marginBottom: 6,
        paddingInline: 4
      }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((n) => (
          <NotificationListItem
            key={n.id}
            notification={n}
            language={language}
            onMarkRead={() => markRead(n.id)}
            onClick={() => {
              if (n.ctaRoute) window.location.href = n.ctaRoute;
              onClose?.();
            }}
          />
        ))}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'transparent',
  border: `1px solid ${CINEMATIC.glass.border}`,
  color: CINEMATIC.text.pearlDim,
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontFamily: 'inherit'
};
const emptyBox = {
  padding: 32,
  textAlign: 'center',
  color: CINEMATIC.text.pearlFaint,
  fontSize: 12
};
const loadingBox = { ...emptyBox };

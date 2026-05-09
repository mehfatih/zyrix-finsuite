// ================================================================
// /notifications — full archive of merchant notifications.
// Filters: type (all/critical/attention/opportunity/share/system),
// status (all/unread), date range. Bulk actions: mark all read,
// archive.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Archive } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import NotificationListItem from '@/components/v2/notifications/NotificationListItem';
import { listNotifications, markRead, bulkRead, archive as apiArchive } from '@/api/v2/notifications';

const LABEL = {
  pageTitle:   { tr: 'Bildirimler',           en: 'Notifications',           ar: 'الإشعارات' },
  subtitle:    { tr: 'AI içgörüleri ve sistem etkinlikleri tek bir akışta', en: 'All AI insights and system events in one feed', ar: 'كل الإشعارات في تيار واحد' },
  filters:     { tr: 'Filtreler',             en: 'Filters',                 ar: 'مرشحات' },
  type:        { tr: 'Tip',                   en: 'Type',                    ar: 'النوع' },
  status:      { tr: 'Durum',                 en: 'Status',                  ar: 'الحالة' },
  filterAll:   { tr: 'Tümü',                  en: 'All',                     ar: 'الكل' },
  unread:      { tr: 'Okunmamış',             en: 'Unread',                  ar: 'غير مقروء' },
  read:        { tr: 'Okundu',                en: 'Read',                    ar: 'مقروء' },
  critical:    { tr: 'Kritik',                en: 'Critical',                ar: 'حرج' },
  attention:   { tr: 'Dikkat',                en: 'Attention',               ar: 'تنبيه' },
  opportunity: { tr: 'Fırsat',                en: 'Opportunity',             ar: 'فرصة' },
  share:       { tr: 'Paylaşım',              en: 'Share',                   ar: 'مشاركة' },
  system:      { tr: 'Sistem',                en: 'System',                  ar: 'النظام' },
  empty:       { tr: 'Henüz bildirim yok.',   en: 'No notifications yet.',   ar: 'لا توجد إشعارات.' },
  loading:     { tr: 'Yükleniyor…',           en: 'Loading…',                ar: 'يتم التحميل…' },
  markAllRead: { tr: 'Tümünü okundu işaretle', en: 'Mark all read',          ar: 'وضع علامة على الكل كمقروء' },
  count:       { tr: '{n} bildirim',          en: '{n} notifications',       ar: '{n} إشعارات' },
  unreadCount: { tr: '{n} okunmamış',         en: '{n} unread',              ar: '{n} غير مقروء' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

export default function NotificationArchivePage({ language = 'tr' }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [typeFilter, setType]   = useState('all');     // all | CRITICAL | ATTENTION | OPPORTUNITY | SHARE_EVENT | SYSTEM
  const [statusFilter, setStatus] = useState('all');   // all | unread | read

  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const rows = await listNotifications({ limit: 100, unread: statusFilter === 'unread' });
      setItems(rows);
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [statusFilter]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (typeFilter !== 'all') {
        const sev = n.severity || 'SYSTEM';
        if (typeFilter === 'CRITICAL'    && sev !== 'CRITICAL')    return false;
        if (typeFilter === 'ATTENTION'   && sev !== 'ATTENTION')   return false;
        if (typeFilter === 'OPPORTUNITY' && sev !== 'OPPORTUNITY') return false;
        if (typeFilter === 'SHARE_EVENT' && sev !== 'SHARE_EVENT') return false;
        if (typeFilter === 'SYSTEM'      && sev !== 'SYSTEM')      return false;
      }
      if (statusFilter === 'read'   && !n.isRead) return false;
      if (statusFilter === 'unread' &&  n.isRead) return false;
      return true;
    });
  }, [items, typeFilter, statusFilter]);

  const totalCount  = items.length;
  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id) => {
    setItems((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n));
    try { await markRead(id); } catch { /* ignore */ }
  };
  const handleBulkRead = async () => {
    setItems((p) => p.map((n) => ({ ...n, isRead: true })));
    try { await bulkRead(); } catch { /* ignore */ }
  };
  const handleArchive = async (id) => {
    setItems((p) => p.filter((n) => n.id !== id));
    try { await apiArchive(id); } catch { /* ignore */ }
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
      <GradientMesh palette="aurora" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

        {/* Hero */}
        <header style={{ marginBottom: SPACE['2xl'] }}>
          <NeonBadge tone="cyan" size="sm" leading={<Bell size={11} />}>
            Sprint D-4
          </NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            {_('pageTitle', language)}
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620, marginBottom: SPACE.lg }}>
            {_('subtitle', language)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.md, alignItems: 'center' }}>
            <NeonBadge tone="cyan">{_('count', language).replace('{n}', String(totalCount))}</NeonBadge>
            {unreadCount > 0 && <NeonBadge tone="crimson" pulse>{_('unreadCount', language).replace('{n}', String(unreadCount))}</NeonBadge>}
            <span style={{ flex: 1 }} />
            {unreadCount > 0 && (
              <button type="button" onClick={handleBulkRead} style={primaryBtnStyle}>
                <CheckCheck size={13} color={CINEMATIC.accent.cyan} />
                {_('markAllRead', language)}
              </button>
            )}
          </div>
        </header>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.md, marginBottom: SPACE.lg, alignItems: 'center' }}>
          <FilterChips
            label={_('type', language)}
            options={['all', 'CRITICAL', 'ATTENTION', 'OPPORTUNITY', 'SHARE_EVENT', 'SYSTEM']}
            value={typeFilter}
            onChange={setType}
            renderLabel={(v) => v === 'all' ? _('filterAll', language)
                              : v === 'CRITICAL'    ? _('critical',    language)
                              : v === 'ATTENTION'   ? _('attention',   language)
                              : v === 'OPPORTUNITY' ? _('opportunity', language)
                              : v === 'SHARE_EVENT' ? _('share',       language)
                                                    : _('system',      language)}
          />
          <FilterChips
            label={_('status', language)}
            options={['all', 'unread', 'read']}
            value={statusFilter}
            onChange={setStatus}
            renderLabel={(v) => v === 'all' ? _('filterAll', language)
                              : v === 'unread' ? _('unread', language)
                                                : _('read',   language)}
          />
        </div>

        {/* List */}
        {loading ? (
          <GlassCard variant="subtle" style={emptyCenter}>{_('loading', language)}</GlassCard>
        ) : error ? (
          <GlassCard variant="subtle" style={{ ...emptyCenter, color: CINEMATIC.accent.crimsonGlow }}>
            {String(error.message || error)}
          </GlassCard>
        ) : filtered.length === 0 ? (
          <GlassCard variant="subtle" style={emptyCenter}>{_('empty', language)}</GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((n) => (
              <NotificationListItem
                key={n.id}
                notification={n}
                variant="full"
                language={language}
                onMarkRead={() => handleMarkRead(n.id)}
                onClick={() => { if (n.ctaRoute) window.location.href = n.ctaRoute; }}
                onArchive={() => handleArchive(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChips({ label, options, value, onChange, renderLabel }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint
      }}>{label}:</span>
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
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: active ? glowOf('cyan', 1) : 'none',
              transition: 'box-shadow 200ms ease'
            }}
          >{renderLabel ? renderLabel(opt) : String(opt)}</button>
        );
      })}
    </div>
  );
}

const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px',
  background: `linear-gradient(135deg, ${CINEMATIC.bg.deepSpace2}, ${CINEMATIC.bg.deepSpace3})`,
  color: CINEMATIC.text.pearlWhite,
  border: `1px solid rgba(0, 217, 255, 0.45)`,
  borderRadius: 6,
  fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: glowOf('cyan', 1)
};
const emptyCenter = {
  textAlign: 'center',
  padding: SPACE['3xl'],
  color: CINEMATIC.text.pearlFaint,
  fontSize: 13
};

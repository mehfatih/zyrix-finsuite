// ================================================================
// /insights/share-links — Sprint D-7.
// List of all active and past public share links with engagement
// counts, copy / preview / revoke actions, and a "+ New share link"
// CTA that opens ShareLinkModal.
// ================================================================
import { useEffect, useState } from 'react';
import {
  Link2, Eye, MessageSquare, Calendar, Copy, ExternalLink,
  Trash2, CheckCircle2, Loader2, Sparkles, Lock
} from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import { listShareLinks, revokeShareLink } from '@/api/v2/publicShareLinks';
import ShareLinkModal from '@/components/v2/insights/ShareLinkModal';
import { CinematicSkeleton, CinematicEmptyState, CinematicErrorBlock } from '@/components/v2/feedback';

const LABEL = {
  pageTitle:    { tr: 'Paylaşım Bağlantıları', en: 'Share Links',         ar: 'روابط المشاركة' },
  subtitle:     { tr: 'Genel paylaşım bağlantılarını görüntüle ve yönet.',
                  en: 'View and manage your public share links.',
                  ar: 'عرض وإدارة روابط المشاركة العامة.' },
  loading:      { tr: 'Yükleniyor…',           en: 'Loading…',             ar: 'جارٍ التحميل…' },
  empty:        { tr: 'Henüz bağlantı yok',     en: 'No share links yet',    ar: 'لا توجد روابط مشاركة بعد' },
  emptyHint:    { tr: '"Yeni bağlantı" ile bir içgörüyü herkese aç.',
                  en: 'Use "+ New link" to open an insight to anyone.',
                  ar: 'استخدم "+ رابط جديد" لمشاركة رؤية مع الجميع.' },
  newLink:      { tr: '+ Yeni bağlantı',        en: '+ New link',           ar: '+ رابط جديد' },
  views:        { tr: 'Görüntüleme',            en: 'Views',                ar: 'مشاهدات' },
  comments:     { tr: 'Yorum',                  en: 'Comments',             ar: 'تعليقات' },
  expires:      { tr: 'Bitiş',                  en: 'Expires',              ar: 'تنتهي' },
  permanent:    { tr: 'Süresiz',                 en: 'Permanent',            ar: 'دائم' },
  revoked:      { tr: 'İptal edildi',            en: 'Revoked',              ar: 'ملغى' },
  copy:         { tr: 'Kopyala',                en: 'Copy',                  ar: 'نسخ' },
  copied:       { tr: 'Kopyalandı',              en: 'Copied',                ar: 'تم النسخ' },
  preview:      { tr: 'Aç',                      en: 'Open',                  ar: 'فتح' },
  revoke:       { tr: 'İptal et',                en: 'Revoke',                ar: 'إلغاء' },
  confirmRevoke: { tr: 'Bu bağlantıyı iptal etmek istediğine emin misin?',
                   en: 'Are you sure you want to revoke this link?',
                   ar: 'هل أنت متأكد من إلغاء هذا الرابط؟' },
  privacyFull:        { tr: 'Tam',          en: 'Full',          ar: 'كامل' },
  privacyMasked:      { tr: 'Maskelenmiş',   en: 'Masked',        ar: 'مخفي' },
  privacyNarrative:   { tr: 'Anlatı',        en: 'Narrative',     ar: 'سرد' },
  privacyAnonymous:   { tr: 'Anonim',         en: 'Anonymous',     ar: 'مجهول' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

const PRIVACY_TONE = {
  full:           '#06A87E',
  masked:         '#FFB800',
  narrative_only: '#9D4EDD',
  anonymous:      '#FF3D5A'
};

function fmtDate(s, lang) {
  if (!s) return '—';
  const lc = lang === 'ar' ? 'ar-EG' : lang === 'tr' ? 'tr-TR' : 'en-US';
  try {
    return new Date(s).toLocaleDateString(lc, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return String(s).slice(0, 10); }
}

export default function ShareLinksManagementPage({ language = 'tr' }) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modalOpen, setModal]   = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [acting, setActing]     = useState(null);

  const reload = () => {
    setLoading(true); setError(null);
    listShareLinks({ limit: 50 })
      .then((data) => setRows(data?.shareLinks || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleCopy = async (row) => {
    if (!row.url) return;
    try {
      await navigator.clipboard.writeText(row.url);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 1400);
    } catch { /* ignore */ }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm(_('confirmRevoke', language))) return;
    setActing(id); setError(null);
    try {
      await revokeShareLink(id);
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setActing(null);
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto' }}>
        <header style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: SPACE.lg, flexWrap: 'wrap',
          marginBottom: SPACE['2xl']
        }}>
          <div>
            <NeonBadge tone="cyan" size="sm" leading={<Link2 size={11} />}>Sprint D-7</NeonBadge>
            <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
              {_('pageTitle', language)}
            </h1>
            <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620 }}>
              {_('subtitle', language)}
            </p>
          </div>
          <button type="button" onClick={() => setModal(true)} style={primaryBtn}>
            <Sparkles size={13} /> {_('newLink', language)}
          </button>
        </header>

        {error && (
          <CinematicErrorBlock error={error} language={language} />
        )}

        {loading ? (
          <CinematicSkeleton variant="list" rows={4} ariaLabel={_('loading', language)} />
        ) : rows.length === 0 ? (
          <GlassCard variant="standard" style={{ padding: SPACE.md }}>
            <CinematicEmptyState
              icon={<Link2 />}
              title={_('empty', language)}
              description={_('emptyHint', language)}
              tone="cyan"
            />
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md }}>
            {rows.map((row) => (
              <ShareLinkRow
                key={row.id}
                row={row}
                language={language}
                copiedId={copiedId}
                acting={acting === row.id}
                onCopy={() => handleCopy(row)}
                onRevoke={() => handleRevoke(row.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ShareLinkModal
        open={modalOpen}
        onClose={() => setModal(false)}
        language={language}
        onCreated={() => { setModal(false); reload(); }}
      />
    </div>
  );
}

function ShareLinkRow({ row, language, copiedId, acting, onCopy, onRevoke }) {
  const tone = PRIVACY_TONE[row.privacyMode] || '#94A3B8';
  const isRevoked = row.revoked === true;
  const privacyLabelKey = row.privacyMode === 'full' ? 'privacyFull'
    : row.privacyMode === 'masked' ? 'privacyMasked'
    : row.privacyMode === 'narrative_only' ? 'privacyNarrative'
    : 'privacyAnonymous';

  return (
    <div style={{
      padding: '14px 16px',
      background: CINEMATIC.glass.tint1,
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.lg,
      opacity: isRevoked ? 0.55 : 1
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACE.md, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          {/* Privacy + status + has-password tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <Tag color={tone} text={_(privacyLabelKey, language)} />
            {row.hasPassword && <Tag color="#FFB800" text="🔒" />}
            {isRevoked && <Tag color="#FF3D5A" text={_('revoked', language)} />}
          </div>

          {/* URL */}
          <div style={{
            fontFamily: 'monospace', fontSize: 12, color: CINEMATIC.text.pearlWhite,
            wordBreak: 'break-all',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${CINEMATIC.glass.border}`,
            borderRadius: 6
          }}>
            {row.url}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 14, flexWrap: 'wrap',
            marginTop: 8,
            color: CINEMATIC.text.pearlFaint, fontSize: 11
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Eye size={11} /> {row.viewCount || 0}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MessageSquare size={11} /> {row.commentCount || 0}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} />
              {row.permanent ? _('permanent', language) : `${_('expires', language)} ${fmtDate(row.expiresAt, language)}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={onCopy} disabled={isRevoked} style={ghostBtn}>
            {copiedId === row.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copiedId === row.id ? _('copied', language) : _('copy', language)}
          </button>
          <a href={row.url} target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: 'none', pointerEvents: isRevoked ? 'none' : 'auto', opacity: isRevoked ? 0.4 : 1 }}>
            <ExternalLink size={12} /> {_('preview', language)}
          </a>
          {!isRevoked && (
            <button type="button" onClick={onRevoke} disabled={acting} style={dangerBtn}>
              {acting ? <Loader2 size={12} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} /> : <Trash2 size={12} />}
              {_('revoke', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ color, text }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px',
      background: `${color}1A`,
      border: `1px solid ${color}55`,
      borderRadius: 999,
      color,
      fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase'
    }}>{text}</span>
  );
}

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
  boxShadow: glowOf('violet', 2)
};

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 12px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 11, fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const dangerBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 12px',
  background: 'transparent',
  color: CINEMATIC.accent.crimsonGlow,
  border: `1px solid rgba(255, 61, 90, 0.36)`,
  borderRadius: 6,
  fontSize: 11, fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const errorBanner = {
  padding: '10px 14px',
  background: 'rgba(255, 61, 90, 0.10)',
  color: CINEMATIC.accent.crimsonGlow,
  border: '1px solid rgba(255, 61, 90, 0.35)',
  borderRadius: RADIUS.sm,
  fontSize: 12,
  marginBottom: SPACE.lg
};

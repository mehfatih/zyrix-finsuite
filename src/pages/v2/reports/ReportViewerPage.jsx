// ================================================================
// /reports/weekly/:id — Sprint D-6 viewer.
// Iframe-embedded PDF (decision §6.D option D1) with a sidebar of
// actions: Download, Mail to me, Generate again, Back to archive.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCcw, Loader2, FileText, Mail, CheckCircle2 } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import { getReport, pdfUrl, regenerateReport, sendTest } from '@/api/v2/weeklyReport';

const LABEL = {
  pageTitle:   { tr: 'Haftalık Rapor',         en: 'Weekly Report',           ar: 'التقرير الأسبوعي' },
  back:        { tr: 'Arşive dön',              en: 'Back to archive',         ar: 'العودة إلى الأرشيف' },
  loading:     { tr: 'Yükleniyor…',             en: 'Loading…',                ar: 'جارٍ التحميل…' },
  download:    { tr: 'PDF indir',               en: 'Download PDF',            ar: 'تنزيل PDF' },
  regen:       { tr: 'Yeniden oluştur',          en: 'Generate again',          ar: 'أعد الإنشاء' },
  regenning:   { tr: 'Oluşturuluyor…',           en: 'Generating…',             ar: 'جارٍ الإنشاء…' },
  sendMe:      { tr: 'Bana e-posta gönder',      en: 'Email it to me',          ar: 'أرسله إلى بريدي' },
  sending:     { tr: 'Gönderiliyor…',            en: 'Sending…',                ar: 'جارٍ الإرسال…' },
  sentOk:      { tr: 'Gönderildi',               en: 'Sent',                    ar: 'تم الإرسال' },
  notFound:    { tr: 'Rapor bulunamadı.',       en: 'Report not found.',       ar: 'لم يتم العثور على التقرير.' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

function fmtRange(start, end, lang) {
  const lc = lang === 'ar' ? 'ar-EG' : lang === 'tr' ? 'tr-TR' : 'en-US';
  try {
    const s = new Date(start).toLocaleDateString(lc, { day: 'numeric', month: 'short' });
    const e = new Date(end).toLocaleDateString(lc,   { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} — ${e}`;
  } catch { return `${start} — ${end}`; }
}

export default function ReportViewerPage({ language = 'tr' }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [regen, setRegen]     = useState(false);
  const [sending, setSending] = useState(false);
  const [sentFlag, setSent]   = useState(false);

  const iframeSrc = useMemo(() => (id ? pdfUrl(id) : ''), [id]);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setLoading(true); setError(null);
    getReport(id)
      .then((data) => !cancelled && setMeta(data?.report || null))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  const handleRegen = async () => {
    setRegen(true); setError(null);
    try {
      const data = await regenerateReport();
      // Force iframe reload by appending a cache-busting query param.
      const newId = data?.reportId || id;
      if (newId !== id) {
        navigate(`/reports/weekly/${encodeURIComponent(newId)}`, { replace: true });
      } else {
        // Re-fetch metadata; iframe's PDF will be re-generated server-side too.
        const fresh = await getReport(id);
        setMeta(fresh?.report || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setRegen(false);
    }
  };

  const handleSend = async () => {
    setSending(true); setError(null);
    try {
      await sendTest();
      setSent(true);
      setTimeout(() => setSent(false), 2200);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        <header style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: SPACE.lg, marginBottom: SPACE.lg, flexWrap: 'wrap'
        }}>
          <div>
            <NeonBadge tone="violet" size="sm" leading={<FileText size={11} />}>Sprint D-6</NeonBadge>
            <h1 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
              marginTop: SPACE.sm, marginBottom: 4
            }}>
              {_('pageTitle', language)}
            </h1>
            <div style={{ fontSize: 13, color: CINEMATIC.text.pearlDim }}>
              {meta ? fmtRange(meta.weekStart, meta.weekEnd, language) : ''}
            </div>
          </div>

          <button type="button" onClick={() => navigate('/reports/weekly')} style={ghostBtn}>
            <ArrowLeft size={12} /> {_('back', language)}
          </button>
        </header>

        {error && (
          <div role="alert" style={errorBanner}>
            {String(error.message || error)}
            {error.waitSeconds ? ` (${error.waitSeconds}s)` : ''}
          </div>
        )}

        {loading ? (
          <GlassCard variant="subtle" style={{ textAlign: 'center', padding: SPACE['3xl'] }}>
            <Loader2 size={18} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite', verticalAlign: 'middle', marginInlineEnd: 8 }} />
            {_('loading', language)}
          </GlassCard>
        ) : !meta ? (
          <GlassCard variant="standard" style={{ textAlign: 'center', padding: SPACE['3xl'] }}>
            <p style={{ margin: 0, color: CINEMATIC.text.pearlDim, fontSize: 13 }}>{_('notFound', language)}</p>
          </GlassCard>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 220px',
            gap: SPACE.lg
          }}>
            {/* Iframe viewer */}
            <div style={{
              background: '#0F1424',
              border: `1px solid ${CINEMATIC.glass.border}`,
              borderRadius: RADIUS.lg,
              overflow: 'hidden',
              minHeight: '80vh',
              boxShadow: glowOf('violet', 1)
            }}>
              <iframe
                src={iframeSrc}
                title={_('pageTitle', language)}
                style={{ width: '100%', height: '85vh', border: 'none', background: '#0F1424' }}
              />
            </div>

            {/* Sidebar actions */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm }}>
              <a
                href={iframeSrc}
                target="_blank"
                rel="noreferrer"
                download
                style={{ ...primaryBtn, textDecoration: 'none', justifyContent: 'center' }}
              >
                <Download size={13} /> {_('download', language)}
              </a>
              <button type="button" onClick={handleSend} disabled={sending} style={{ ...secondaryBtn, opacity: sending ? 0.6 : 1 }}>
                {sending
                  ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
                  : sentFlag ? <CheckCircle2 size={13} /> : <Mail size={13} />}
                {sending ? _('sending', language) : sentFlag ? _('sentOk', language) : _('sendMe', language)}
              </button>
              <button type="button" onClick={handleRegen} disabled={regen} style={{ ...secondaryBtn, opacity: regen ? 0.6 : 1 }}>
                {regen
                  ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
                  : <RefreshCcw size={13} />}
                {regen ? _('regenning', language) : _('regen', language)}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 12, fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '12px 16px',
  background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))',
  color: '#FFFFFF',
  border: '1px solid rgba(157, 78, 221, 0.5)',
  borderRadius: 8,
  fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: glowOf('violet', 1)
};

const secondaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
  padding: '11px 16px',
  background: CINEMATIC.glass.tint1,
  color: CINEMATIC.text.pearlWhite,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 8,
  fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
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

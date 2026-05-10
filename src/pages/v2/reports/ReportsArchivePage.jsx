// ================================================================
// /reports/weekly — Sprint D-6 archive grid.
// Lists past weekly reports with KPI headline preview cards.
// Cinematic chrome via design-system-v2 tokens.
// ================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Download, FileText, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import { listReports, pdfUrl, regenerateReport } from '@/api/v2/weeklyReport';

const LABEL = {
  pageTitle:   { tr: 'Haftalık Raporlar',    en: 'Weekly Reports',           ar: 'التقارير الأسبوعية' },
  subtitle:    { tr: 'Geçmiş haftalık performans raporlarını incele.',
                 en: 'Browse past weekly performance reports.',
                 ar: 'تصفح تقارير الأداء الأسبوعية السابقة.' },
  loading:     { tr: 'Yükleniyor…',           en: 'Loading…',                ar: 'جارٍ التحميل…' },
  empty:       { tr: 'İlk haftalık raporun pazar günü gelecek.',
                 en: 'Your first weekly report will arrive on Sunday.',
                 ar: 'سيصل تقريرك الأسبوعي الأول يوم الأحد.' },
  emptyTitle:  { tr: 'Henüz rapor yok',       en: 'No reports yet',          ar: 'لا توجد تقارير بعد' },
  view:        { tr: 'Görüntüle',             en: 'View',                    ar: 'عرض' },
  download:    { tr: 'İndir',                  en: 'Download',                ar: 'تنزيل' },
  generateNow: { tr: 'Şimdi oluştur',          en: 'Generate now',            ar: 'أنشئ الآن' },
  generating:  { tr: 'Oluşturuluyor…',         en: 'Generating…',             ar: 'جارٍ الإنشاء…' },
  mrr:         { tr: 'MRR',                   en: 'MRR',                    ar: 'الإيرادات الشهرية' },
  netCash:     { tr: 'Net Nakit',              en: 'Net Cash',                ar: 'صافي النقد' },
  margin:      { tr: 'Brüt Marj',              en: 'Gross Margin',            ar: 'الهامش' },
  runway:      { tr: 'Nakit Ömrü',             en: 'Cash Runway',             ar: 'عمر النقد' }
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

function fmtCurrency(n, lang) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  const lc = lang === 'ar' ? 'ar-EG' : lang === 'tr' ? 'tr-TR' : 'en-US';
  return `₺${Math.round(n).toLocaleString(lc)}`;
}

function fmtPct(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return `${n.toFixed(0)}%`;
}

function fmtDays(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return `${Math.round(n)}d`;
}

export default function ReportsArchivePage({ language = 'tr' }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [regen,  setRegen]    = useState(false);

  const reload = () => {
    setLoading(true); setError(null);
    listReports({ limit: 24 })
      .then((data) => setReports(data?.reports || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleRegenerate = async () => {
    setRegen(true); setError(null);
    try {
      await regenerateReport();
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setRegen(false);
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
            <NeonBadge tone="violet" size="sm" leading={<FileText size={11} />}>Sprint D-6</NeonBadge>
            <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
              {_('pageTitle', language)}
            </h1>
            <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620 }}>
              {_('subtitle', language)}
            </p>
          </div>
          <button type="button" onClick={handleRegenerate} disabled={regen} style={primaryBtn}>
            {regen
              ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
              : <Sparkles size={13} />}
            {regen ? _('generating', language) : _('generateNow', language)}
          </button>
        </header>

        {error && (
          <div role="alert" style={{
            padding: '10px 14px',
            background: 'rgba(255, 61, 90, 0.10)',
            color: CINEMATIC.accent.crimsonGlow,
            border: '1px solid rgba(255, 61, 90, 0.35)',
            borderRadius: RADIUS.sm,
            fontSize: 12,
            marginBottom: SPACE.lg
          }}>{String(error.message || error)}</div>
        )}

        {loading ? (
          <GlassCard variant="subtle" style={{ textAlign: 'center', padding: SPACE['3xl'] }}>
            <Loader2 size={18} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite', verticalAlign: 'middle', marginInlineEnd: 8 }} />
            {_('loading', language)}
          </GlassCard>
        ) : reports.length === 0 ? (
          <GlassCard variant="standard" style={{ textAlign: 'center', padding: SPACE['3xl'] }}>
            <Calendar size={36} style={{ color: CINEMATIC.text.pearlFaint, marginBottom: SPACE.sm }} />
            <h2 style={{ ...TYPE_SCALE.headingMd, margin: 0, color: CINEMATIC.text.pearlWhite }}>
              {_('emptyTitle', language)}
            </h2>
            <p style={{ marginTop: SPACE.sm, color: CINEMATIC.text.pearlDim, fontSize: 13 }}>
              {_('empty', language)}
            </p>
          </GlassCard>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: SPACE.lg
          }}>
            {reports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                language={language}
                onView={() => navigate(`/reports/weekly/${encodeURIComponent(r.id)}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, language, onView }) {
  const k = report.headline || {};
  return (
    <div
      style={cardStyle}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onView()}
    >
      <div style={cardHeader}>
        <Calendar size={14} style={{ color: CINEMATIC.accent.cyanGlow }} />
        <span>{fmtRange(report.weekStart, report.weekEnd, language)}</span>
      </div>

      <div style={kpiGridStyle}>
        <KpiTile label={_('mrr', language)}     value={fmtCurrency(k.mrr, language)}     tone="#9D4EDD" />
        <KpiTile label={_('netCash', language)} value={fmtCurrency(k.netCash, language)} tone="#00D9FF" />
        <KpiTile label={_('margin', language)}  value={fmtPct(k.margin)}                 tone="#06A87E" />
        <KpiTile label={_('runway', language)}  value={fmtDays(k.runway)}                tone="#FFB800" />
      </div>

      <div style={cardActions}>
        <a
          href={pdfUrl(report.id)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={ghostBtn}
        >
          <Download size={12} /> {_('download', language)}
        </a>
        <span style={viewLink}>
          {_('view', language)} <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}

function KpiTile({ label, value, tone }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: tone
      }}>{label}</div>
      <div style={{
        marginTop: 4,
        fontSize: 14, fontWeight: 800, color: CINEMATIC.text.pearlWhite,
        letterSpacing: '-0.01em'
      }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  position: 'relative',
  padding: SPACE.lg,
  background: CINEMATIC.glass.tint1,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: RADIUS.lg,
  cursor: 'pointer',
  transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease'
};

const cardHeader = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 12, fontWeight: 700, color: CINEMATIC.text.pearlDim,
  marginBottom: SPACE.md
};

const kpiGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 8,
  marginBottom: SPACE.md
};

const cardActions = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingTop: SPACE.sm,
  borderTop: `1px solid ${CINEMATIC.glass.border}`
};

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 12px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 11, fontWeight: 700,
  textDecoration: 'none',
  fontFamily: 'inherit'
};

const viewLink = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 12, fontWeight: 700,
  color: CINEMATIC.accent.cyanGlow
};

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

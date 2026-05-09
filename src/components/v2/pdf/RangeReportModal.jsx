// ================================================================
// RangeReportModal — date-range picker + section selector + theme
// chooser. Generates a multi-page custom-range report PDF.
//
// Triggered from /insights/history (or anywhere a "Generate report"
// button makes sense). Exports: <RangeReportModal /> as default;
// <OpenRangeReportButton /> as a default trigger.
// ================================================================
import { useEffect, useState } from 'react';
import { CalendarRange, X, Download, Loader2, CheckCircle2, Sun, Moon, Sparkles } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { generateRangeReport } from '@/api/v2/pdf';
import { usePdfDownload } from '@/hooks/v2/usePdfDownload';

const LABEL = {
  rangeReport:    { tr: 'Performans Raporu',     en: 'Performance Report',  ar: 'تقرير الأداء' },
  generate:       { tr: 'Rapor Oluştur',         en: 'Generate Report',     ar: 'إنشاء تقرير' },
  rangePrompt:    { tr: 'Tarih aralığı seç',     en: 'Pick a date range',   ar: 'اختر النطاق الزمني' },
  startDate:      { tr: 'Başlangıç',             en: 'Start date',          ar: 'تاريخ البدء' },
  endDate:        { tr: 'Bitiş',                 en: 'End date',            ar: 'تاريخ الانتهاء' },
  sections:       { tr: 'Bölümler',              en: 'Sections',            ar: 'الأقسام' },
  insights:       { tr: 'İçgörüler',             en: 'Insights',            ar: 'الرؤى' },
  kpis:           { tr: 'KPI Özeti',             en: 'Key Metrics',         ar: 'المقاييس' },
  customers:      { tr: 'Önde Gelen Müşteriler', en: 'Top Customers',       ar: 'كبار العملاء' },
  cashflow:       { tr: 'Nakit Akışı',           en: 'Cash Flow',           ar: 'التدفق النقدي' },
  taxes:          { tr: 'Vergi Takvimi',         en: 'Tax Timeline',        ar: 'الجدول الضريبي' },
  theme:          { tr: 'Tema',                  en: 'Theme',               ar: 'السمة' },
  digital:        { tr: 'Dijital',               en: 'Digital',             ar: 'رقمي' },
  print:          { tr: 'Yazdırma',              en: 'Print',               ar: 'طباعة' },
  cancel:         { tr: 'İptal',                 en: 'Cancel',              ar: 'إلغاء' },
  close:          { tr: 'Kapat',                 en: 'Close',               ar: 'إغلاق' },
  loading:        { tr: 'Rapor hazırlanıyor…',   en: 'Generating report…',  ar: 'يتم إنشاء التقرير…' },
  done:           { tr: 'Rapor hazır',           en: 'Report ready',        ar: 'التقرير جاهز' },
  errInvalidRange:{ tr: 'Geçersiz tarih aralığı', en: 'Invalid date range', ar: 'نطاق غير صالح' },
  errMaxRange:    { tr: 'Maksimum 90 gün',       en: 'Max 90 days',         ar: '90 يومًا كحد أقصى' },
  errSections:    { tr: 'En az bir bölüm seç',   en: 'Pick at least one section', ar: 'اختر قسمًا واحدًا على الأقل' }
};

const SECTION_DEFS = [
  { key: 'insights',  default: true  },
  { key: 'kpis',      default: true  },
  { key: 'customers', default: false },
  { key: 'cashflow',  default: false },
  { key: 'taxes',     default: false }
];

function isoDays(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function RangeReportModal({ open, onClose, language = 'tr' }) {
  const _ = (k) => LABEL[k]?.[language] || LABEL[k]?.tr || k;

  const [startDate, setStartDate] = useState(isoDays(-7));
  const [endDate,   setEndDate]   = useState(isoDays(0));
  const [theme,     setTheme]     = useState('digital');
  const [localErr,  setLocalErr]  = useState(null);
  const [sections,  setSections]  = useState(() =>
    SECTION_DEFS.reduce((acc, s) => ({ ...acc, [s.key]: s.default }), {})
  );
  const { state, error, run, isLoading } = usePdfDownload();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !isLoading) onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, isLoading, onClose]);

  if (!open) return null;

  const validate = () => {
    setLocalErr(null);
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) {
      setLocalErr(_('errInvalidRange'));
      return false;
    }
    const days = (e - s) / 86400000;
    if (days > 90) {
      setLocalErr(_('errMaxRange'));
      return false;
    }
    const picked = Object.keys(sections).filter((k) => sections[k]);
    if (picked.length === 0) {
      setLocalErr(_('errSections'));
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    const picked = Object.keys(sections).filter((k) => sections[k]);
    try {
      await run(() => generateRangeReport({ startDate, endDate, sections: picked, theme, locale: language }));
      setTimeout(() => onClose?.(), 800);
    } catch {
      // state stays 'error'; user can retry.
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={_('rangeReport')}
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10, 14, 39, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        padding: 24,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        boxShadow: `${glowOf('violet', 2)}, ${glowOf('cyan', 1)}, 0 18px 60px rgba(0,0,0,0.55)`,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: `${CINEMATIC.accent.plasmaViolet}22`,
              color: CINEMATIC.accent.plasmaViolet,
              boxShadow: glowOf('violet', 1)
            }}><Sparkles size={15} /></span>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {_('rangeReport')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => !isLoading && onClose?.()}
            aria-label={_('close')}
            style={{
              background: 'transparent', border: 'none',
              color: CINEMATIC.text.pearlFaint,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: 4
            }}
          ><X size={16} /></button>
        </div>

        {/* Date range */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 12,
          marginBottom: 16,
          background: CINEMATIC.glass.tint1,
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: RADIUS.md
        }}>
          <CalendarRange size={16} color={CINEMATIC.accent.cyan} />
          <DateField label={_('startDate')} value={startDate} onChange={setStartDate} />
          <span style={{ color: CINEMATIC.text.pearlFaint }}>—</span>
          <DateField label={_('endDate')} value={endDate} onChange={setEndDate} />
        </div>

        {/* Sections */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint,
            marginBottom: 8
          }}>{_('sections')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SECTION_DEFS.map((s) => (
              <SectionChip
                key={s.key}
                label={_(s.key)}
                checked={!!sections[s.key]}
                onToggle={() => setSections((p) => ({ ...p, [s.key]: !p[s.key] }))}
              />
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint,
            marginBottom: 8
          }}>{_('theme')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ThemeChip selected={theme === 'digital'} onSelect={() => setTheme('digital')}
                       icon={<Moon size={13} />} tone={CINEMATIC.accent.plasmaViolet} label={_('digital')} />
            <ThemeChip selected={theme === 'print'} onSelect={() => setTheme('print')}
                       icon={<Sun size={13} />} tone={CINEMATIC.accent.solarAmber} label={_('print')} />
          </div>
        </div>

        {/* Inline error */}
        {(localErr || (state === 'error' && error)) && (
          <div role="alert" style={{
            marginTop: 4, marginBottom: 12,
            padding: '8px 12px',
            background: 'rgba(255, 61, 90, 0.10)',
            color: CINEMATIC.accent.crimsonGlow,
            border: `1px solid rgba(255, 61, 90, 0.35)`,
            borderRadius: RADIUS.sm,
            fontSize: 12
          }}>{localErr || String(error?.message)}</div>
        )}

        {/* Loading thinking-state — keep it minimal text since ParticleField requires layout space */}
        {isLoading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginTop: 4, marginBottom: 12,
            background: CINEMATIC.glass.tint1,
            border: `1px solid ${CINEMATIC.accent.cyanGlow}40`,
            borderRadius: RADIUS.sm,
            color: CINEMATIC.accent.cyanGlow,
            fontSize: 11, letterSpacing: '0.04em'
          }}>
            <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
            {_('loading')}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={() => !isLoading && onClose?.()}
            disabled={isLoading}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: CINEMATIC.text.pearlDim,
              border: `1px solid ${CINEMATIC.glass.border}`,
              borderRadius: RADIUS.sm,
              fontSize: 12, fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.4 : 1,
              fontFamily: 'inherit'
            }}
          >{_('cancel')}</button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px',
              background: state === 'success'
                ? 'linear-gradient(135deg, rgba(6,255,165,0.95), rgba(6,255,165,0.75))'
                : 'linear-gradient(135deg, rgba(157,78,221,0.95), rgba(0,217,255,0.75))',
              color: '#FFF',
              border: '1px solid rgba(157, 78, 221, 0.5)',
              borderRadius: RADIUS.sm,
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: isLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: glowOf(state === 'success' ? 'mint' : 'violet', 2)
            }}
          >
            {isLoading ? <Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
             : state === 'success' ? <CheckCircle2 size={13} />
                                    : <Download size={13} />}
            {isLoading ? _('loading')
             : state === 'success' ? _('done')
                                    : _('generate')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, color: CINEMATIC.text.pearlWhite }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase'
      }}>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: 6,
          color: CINEMATIC.text.pearlWhite,
          padding: '5px 8px',
          fontSize: 12,
          fontFamily: 'inherit',
          outline: 'none',
          colorScheme: 'dark'
        }}
      />
    </label>
  );
}

function SectionChip({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px',
        background: checked ? 'rgba(0, 217, 255, 0.10)' : 'transparent',
        color: checked ? CINEMATIC.accent.cyanGlow : CINEMATIC.text.pearlDim,
        border: `1px solid ${checked ? 'rgba(0, 217, 255, 0.45)' : CINEMATIC.glass.border}`,
        borderRadius: 99,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: checked ? glowOf('cyan', 1) : 'none',
        transition: 'box-shadow 200ms ease, border-color 200ms ease'
      }}
    >
      <span style={{
        display: 'inline-block', width: 12, height: 12, borderRadius: 4,
        background: checked ? CINEMATIC.accent.cyan : 'transparent',
        border: `1px solid ${checked ? CINEMATIC.accent.cyan : CINEMATIC.glass.border}`,
        position: 'relative'
      }}>
        {checked && <span style={{
          position: 'absolute', inset: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: CINEMATIC.bg.deepSpace1, fontSize: 9, fontWeight: 900
        }}>✓</span>}
      </span>
      {label}
    </button>
  );
}

function ThemeChip({ selected, onSelect, icon, tone, label }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px',
        background: selected ? `${tone}1A` : 'transparent',
        color: selected ? tone : CINEMATIC.text.pearlDim,
        border: `1px solid ${selected ? tone : CINEMATIC.glass.border}`,
        borderRadius: 99,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: selected ? `0 0 12px ${tone}55` : 'none',
        transition: 'box-shadow 200ms ease'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Convenience trigger button. Mounts the button + manages its own modal state.
 * Drop into pages where a "Generate Report" CTA is needed.
 */
export function OpenRangeReportButton({ language = 'tr' }) {
  const [open, setOpen] = useState(false);
  const _ = (k) => LABEL[k]?.[language] || LABEL[k]?.tr || k;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px',
          background: `linear-gradient(135deg, ${CINEMATIC.bg.deepSpace2} 0%, ${CINEMATIC.bg.deepSpace3} 100%)`,
          color: CINEMATIC.text.pearlWhite,
          border: `1px solid rgba(157, 78, 221, 0.45)`,
          borderRadius: RADIUS.sm,
          fontFamily: TYPE_STACK.body,
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          boxShadow: glowOf('violet', 1),
          transition: 'box-shadow 220ms ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowOf('violet', 3); }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = glowOf('violet', 1); }}
      >
        <Sparkles size={13} color={CINEMATIC.accent.plasmaViolet} />
        {_('generate')}
      </button>
      <RangeReportModal open={open} onClose={() => setOpen(false)} language={language} />
    </>
  );
}

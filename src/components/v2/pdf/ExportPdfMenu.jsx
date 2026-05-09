// ================================================================
// ExportPdfMenu — drop-in component for any insight card.
//
// UI: a small button (glass-styled with violet glow + download icon)
// that opens a dropdown with theme options. On theme select, kicks
// off /api/customer/pdf/insight/:id and triggers a browser download.
//
// Props:
//   insightId  string (required)
//   language   'tr' | 'ar' | 'en'  (default 'tr')
//   compact    boolean — small icon-only button when true
//
// Locale strings ride along with the existing inline-translation
// pattern used by AICoPilotStrip.jsx.
// ================================================================
import { useEffect, useRef, useState } from 'react';
import { Download, Sun, Moon, Loader2, CheckCircle2 } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { exportInsightPdf } from '@/api/v2/pdf';
import { usePdfDownload } from '@/hooks/v2/usePdfDownload';

const LABEL = {
  pdf:        { tr: 'PDF',          en: 'PDF',           ar: 'PDF' },
  exportPdf:  { tr: 'PDF olarak indir', en: 'Export as PDF', ar: 'تنزيل بصيغة PDF' },
  digital:    { tr: 'Dijital',      en: 'Digital',       ar: 'رقمي' },
  print:      { tr: 'Yazdırma',     en: 'Print',         ar: 'للطباعة' },
  digitalDesc:{ tr: 'Koyu tema, ekran için', en: 'Dark theme, for screens', ar: 'سمة داكنة، للشاشات' },
  printDesc:  { tr: 'Beyaz arka plan',       en: 'White background',         ar: 'خلفية بيضاء' },
  loading:    { tr: 'Hazırlanıyor…', en: 'Preparing…',   ar: 'يتم التحضير…' },
  done:       { tr: 'İndirildi',    en: 'Downloaded',    ar: 'تم التنزيل' },
  error:      { tr: 'Hata oluştu',  en: 'Failed',        ar: 'فشل' }
};

export default function ExportPdfMenu({ insightId, language = 'tr', compact = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { state, error, run, isLoading } = usePdfDownload();
  const _ = (k) => LABEL[k]?.[language] || LABEL[k]?.tr || k;

  // Dismiss dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleExport = async (theme) => {
    setOpen(false);
    try {
      await run(() => exportInsightPdf(insightId, { theme, locale: language }));
    } catch {
      // state already toggles to 'error'
    }
  };

  // The trigger button is dark-themed (cinematic) on the light V2 dashboard
  // — first place cinematic tokens enter a live page, per the prompt.
  const triggerColor = state === 'success' ? CINEMATIC.accent.neonMint
                     : state === 'error'   ? CINEMATIC.accent.crimsonGlow
                                            : CINEMATIC.accent.plasmaViolet;

  const Icon = isLoading ? Loader2
             : state === 'success' ? CheckCircle2
                                   : Download;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => !isLoading && setOpen((p) => !p)}
        disabled={isLoading}
        title={_('exportPdf')}
        aria-label={_('exportPdf')}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '6px 8px' : '6px 12px',
          background: `linear-gradient(135deg, ${CINEMATIC.bg.deepSpace2} 0%, ${CINEMATIC.bg.deepSpace3} 100%)`,
          color: CINEMATIC.text.pearlWhite,
          border: `1px solid rgba(157, 78, 221, 0.45)`,
          borderRadius: RADIUS.sm,
          fontFamily: TYPE_STACK.body,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.85 : 1,
          boxShadow: glowOf('violet', 1),
          transition: 'box-shadow 220ms ease, border-color 220ms ease'
        }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.boxShadow = glowOf('violet', 3); }}
        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.boxShadow = glowOf('violet', 1); }}
      >
        <Icon
          size={13}
          color={triggerColor}
          style={isLoading ? { animation: 'cn-aurora-rotate 0.9s linear infinite' } : undefined}
        />
        {!compact && (
          <span>
            {state === 'loading' ? _('loading')
             : state === 'success' ? _('done')
             : state === 'error'   ? _('error')
                                    : _('pdf')}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineEnd: 0,
            minWidth: 220,
            zIndex: 1000,
            padding: 6,
            background: CINEMATIC.bg.deepSpace2,
            border: `1px solid ${CINEMATIC.glass.borderStrong}`,
            borderRadius: RADIUS.md,
            color: CINEMATIC.text.pearlWhite,
            fontFamily: TYPE_STACK.body,
            boxShadow: `${glowOf('violet', 2)}, 0 12px 36px rgba(0,0,0,0.45)`
          }}
        >
          <ThemeOption
            icon={<Moon size={14} />}
            tone={CINEMATIC.accent.plasmaViolet}
            label={_('digital')}
            description={_('digitalDesc')}
            onSelect={() => handleExport('digital')}
          />
          <ThemeOption
            icon={<Sun size={14} />}
            tone={CINEMATIC.accent.solarAmber}
            label={_('print')}
            description={_('printDesc')}
            onSelect={() => handleExport('print')}
          />
        </div>
      )}

      {state === 'error' && error && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            insetInlineStart: 0,
            background: CINEMATIC.bg.deepSpace3,
            color: CINEMATIC.accent.crimsonGlow,
            border: `1px solid rgba(255, 61, 90, 0.4)`,
            borderRadius: RADIUS.sm,
            padding: '4px 10px',
            fontSize: 11,
            fontFamily: TYPE_STACK.body,
            whiteSpace: 'nowrap'
          }}
        >
          {String(error.message || _('error'))}
        </div>
      )}
    </div>
  );
}

function ThemeOption({ icon, tone, label, description, onSelect }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 10px',
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        color: CINEMATIC.text.pearlWhite,
        fontFamily: 'inherit',
        textAlign: 'inherit',
        transition: 'background 180ms ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        display: 'inline-flex', width: 22, height: 22, borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
        background: `${tone}20`, color: tone
      }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{label}</span>
        <span style={{ display: 'block', fontSize: 10, color: CINEMATIC.text.pearlFaint, marginTop: 1 }}>
          {description}
        </span>
      </span>
    </button>
  );
}

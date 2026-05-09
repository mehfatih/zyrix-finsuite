// ================================================================
// DownloadTodayButton — top-right CTA on the AI Co-Pilot strip.
// Click opens a small modal with a theme picker. On confirm, hits
// /api/customer/pdf/daily-brief and triggers a browser download.
// ================================================================
import { useEffect, useState } from 'react';
import { Calendar, Sun, Moon, Loader2, X, Download, CheckCircle2 } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { downloadDailyBriefPdf } from '@/api/v2/pdf';
import { usePdfDownload } from '@/hooks/v2/usePdfDownload';

const LABEL = {
  todayBrief:    { tr: "Bugünün Brifingi",        en: "Today's Brief",                       ar: 'الإيجاز اليومي' },
  download:      { tr: 'PDF olarak indir',        en: 'Download as PDF',                     ar: 'تنزيل بصيغة PDF' },
  description:   { tr: '3 içgörü + KPI özeti',    en: '3 insights + KPI snapshot',            ar: '3 رؤى + لقطة KPI' },
  digital:       { tr: 'Dijital tema',            en: 'Digital theme',                       ar: 'سمة رقمية' },
  print:         { tr: 'Yazdırma teması',         en: 'Print theme',                         ar: 'سمة الطباعة' },
  digitalDesc:   { tr: 'Koyu arka plan, ekrana özel', en: 'Dark background, screen-tuned',    ar: 'خلفية داكنة' },
  printDesc:     { tr: 'Beyaz arka plan',         en: 'White background',                    ar: 'خلفية بيضاء' },
  generate:      { tr: 'Oluştur',                 en: 'Generate',                            ar: 'إنشاء' },
  cancel:        { tr: 'İptal',                   en: 'Cancel',                              ar: 'إلغاء' },
  close:         { tr: 'Kapat',                   en: 'Close',                               ar: 'إغلاق' },
  loading:       { tr: 'PDF hazırlanıyor…',       en: 'Preparing PDF…',                      ar: 'يتم تحضير PDF…' },
  done:          { tr: 'PDF hazır',               en: 'PDF ready',                           ar: 'PDF جاهز' }
};

export default function DownloadTodayButton({ language = 'tr' }) {
  const [open, setOpen]   = useState(false);
  const [theme, setTheme] = useState('digital');
  const { state, error, run, isLoading } = usePdfDownload();
  const _ = (k) => LABEL[k]?.[language] || LABEL[k]?.tr || k;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !isLoading) setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, isLoading]);

  const handleGenerate = async () => {
    try {
      await run(() => downloadDailyBriefPdf({ theme, locale: language }));
      // Close modal after the download starts.
      setTimeout(() => setOpen(false), 800);
    } catch {
      // state stays 'error' — user can retry.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={_('todayBrief')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: `linear-gradient(135deg, ${CINEMATIC.bg.deepSpace2} 0%, ${CINEMATIC.bg.deepSpace3} 100%)`,
          color: CINEMATIC.text.pearlWhite,
          border: `1px solid rgba(0, 217, 255, 0.45)`,
          borderRadius: RADIUS.sm,
          fontFamily: TYPE_STACK.body,
          fontSize: 12, fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          boxShadow: glowOf('cyan', 1),
          transition: 'box-shadow 220ms ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowOf('cyan', 3); }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = glowOf('cyan', 1); }}
      >
        <Calendar size={13} color={CINEMATIC.accent.cyan} />
        <span>{_('todayBrief')}</span>
      </button>

      {open && (
        <Modal onClose={() => !isLoading && setOpen(false)} ariaLabel={_('todayBrief')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{
              margin: 0,
              fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
              color: CINEMATIC.text.pearlWhite
            }}>{_('todayBrief')}</h2>
            <button
              type="button"
              onClick={() => !isLoading && setOpen(false)}
              aria-label={_('close')}
              style={{
                background: 'transparent', border: 'none',
                color: CINEMATIC.text.pearlFaint,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: 4, display: 'inline-flex',
                opacity: isLoading ? 0.4 : 1
              }}
            ><X size={16} /></button>
          </div>
          <p style={{
            margin: 0,
            color: CINEMATIC.text.pearlDim,
            fontSize: 12, lineHeight: 1.5, marginBottom: 18
          }}>{_('description')}</p>

          <ThemeOption
            selected={theme === 'digital'}
            onSelect={() => setTheme('digital')}
            icon={<Moon size={14} />}
            tone={CINEMATIC.accent.plasmaViolet}
            label={_('digital')}
            description={_('digitalDesc')}
          />
          <ThemeOption
            selected={theme === 'print'}
            onSelect={() => setTheme('print')}
            icon={<Sun size={14} />}
            tone={CINEMATIC.accent.solarAmber}
            label={_('print')}
            description={_('printDesc')}
          />

          {state === 'error' && error && (
            <div role="alert" style={{
              marginTop: 12,
              padding: '8px 12px',
              background: 'rgba(255, 61, 90, 0.10)',
              color: CINEMATIC.accent.crimsonGlow,
              border: `1px solid rgba(255, 61, 90, 0.35)`,
              borderRadius: RADIUS.sm,
              fontSize: 12
            }}>{String(error.message)}</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => !isLoading && setOpen(false)}
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
                padding: '8px 16px',
                background: state === 'success'
                  ? `linear-gradient(135deg, rgba(6,255,165,0.95), rgba(6,255,165,0.75))`
                  : `linear-gradient(135deg, rgba(0,217,255,0.95), rgba(0,217,255,0.75))`,
                color: '#FFF',
                border: '1px solid rgba(0, 217, 255, 0.5)',
                borderRadius: RADIUS.sm,
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: isLoading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: glowOf(state === 'success' ? 'mint' : 'cyan', isLoading ? 1 : 2)
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
        </Modal>
      )}
    </>
  );
}

function ThemeOption({ selected, onSelect, icon, tone, label, description }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%',
        padding: '10px 12px',
        marginBottom: 8,
        background: selected ? 'rgba(255,255,255,0.06)' : 'transparent',
        border: `1px solid ${selected ? tone : CINEMATIC.glass.border}`,
        borderRadius: RADIUS.sm,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: 'inherit',
        textAlign: 'inherit',
        cursor: 'pointer',
        boxShadow: selected ? `0 0 0 1px ${tone}, 0 0 12px rgba(157, 78, 221, 0.2)` : 'none',
        transition: 'background 180ms ease, border-color 180ms ease'
      }}
    >
      <span style={{
        display: 'inline-flex', width: 28, height: 28, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
        background: `${tone}24`, color: tone
      }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{label}</span>
        <span style={{ display: 'block', fontSize: 11, color: CINEMATIC.text.pearlFaint, marginTop: 2 }}>
          {description}
        </span>
      </span>
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        border: `1px solid ${selected ? tone : CINEMATIC.glass.border}`,
        background: selected ? tone : 'transparent'
      }} />
    </button>
  );
}

function Modal({ children, onClose, ariaLabel }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10, 14, 39, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        padding: 22,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        boxShadow: `${glowOf('cyan', 2)}, 0 18px 60px rgba(0,0,0,0.55)`
      }}>
        {children}
      </div>
    </div>
  );
}

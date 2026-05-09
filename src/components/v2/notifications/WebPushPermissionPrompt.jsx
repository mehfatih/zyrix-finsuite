// ================================================================
// WebPushPermissionPrompt — cinematic consent UI.
// Replaces the raw browser dialog with a glass card that explains
// what the merchant gets, then triggers the actual browser
// permission request only when they tap "Enable".
//
// State machine:
//   idle      → initial; show value-prop card + "Enable" CTA
//   loading   → permission request + SW register + subscribe in flight
//   granted   → success, fade out / dismiss
//   denied    → fallback message + link to settings page
//   error     → show error + retry
// ================================================================
import { useEffect, useState } from 'react';
import { Bell, BellRing, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora } from '@/design-system-v2/cinematic/shadows';
import { auroraLinear } from '@/design-system-v2/cinematic/gradients';
import { GradientMesh } from '@/components/foundation';
import { enableWebPush, isWebPushSupported } from '@/api/v2/webPush';

const LABEL = {
  title:       { tr: 'Önemli içgörüleri kaçırma',         en: "Don't miss critical insights",       ar: 'لا تفوّت الرؤى الحرجة' },
  body:        { tr: 'Zyrix sana sadece kritik durumlar için bildirim gönderir — gecikmiş alacak, kritik vergi tarihi, nakit krizi gibi.', en: 'Zyrix only pushes critical alerts — overdue receivables, tax deadlines, cash-flow risks.', ar: 'إشعارات للحالات الحرجة فقط: ذمم متأخرة، مواعيد ضريبية، مخاطر نقدية.' },
  enable:      { tr: 'Bildirimleri aç',                    en: 'Enable notifications',                ar: 'تفعيل الإشعارات' },
  enabling:    { tr: 'İzin isteniyor…',                    en: 'Requesting permission…',              ar: 'جارٍ طلب الإذن…' },
  enabled:     { tr: 'Bildirimler aktif',                  en: 'Notifications enabled',               ar: 'الإشعارات مفعّلة' },
  notNow:      { tr: 'Şimdi değil',                        en: 'Not now',                             ar: 'ليس الآن' },
  denied:      { tr: 'Tarayıcı izni reddetti — ayarlardan açabilirsin', en: "Browser denied — re-enable from browser settings", ar: 'رفض المتصفح — يمكنك التفعيل من الإعدادات' },
  unsupported: { tr: 'Bu tarayıcı Web Push desteklemiyor', en: 'This browser does not support Web Push', ar: 'هذا المتصفح لا يدعم الإشعارات' },
  retry:       { tr: 'Tekrar dene',                        en: 'Retry',                               ar: 'حاول مجددًا' }
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onEnabled?: () => void,
 *   language?: 'tr' | 'ar' | 'en'
 * }} props
 */
export default function WebPushPermissionPrompt({ open, onClose, onEnabled, language = 'tr' }) {
  const [state, setState]     = useState('idle');     // idle | loading | granted | denied | error | unsupported
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    if (!isWebPushSupported()) setState('unsupported');
    else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') setState('granted');
    else setState('idle');
  }, [open]);

  if (!open) return null;

  const handleEnable = async () => {
    setState('loading');
    setError(null);
    try {
      await enableWebPush();
      setState('granted');
      onEnabled?.();
      setTimeout(() => onClose?.(), 1400);
    } catch (err) {
      const msg = String(err?.message || err);
      if (/denied/i.test(msg) || (typeof Notification !== 'undefined' && Notification.permission === 'denied')) {
        setState('denied');
      } else {
        setState('error');
        setError(err);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={_('title', language)}
      onClick={(e) => { if (e.target === e.currentTarget && state !== 'loading') onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(10, 14, 39, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        padding: 24,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        overflow: 'hidden',
        boxShadow: `${aurora(2)}, 0 18px 60px rgba(0, 0, 0, 0.6)`
      }}>
        {/* Aurora mesh decoration */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
          <GradientMesh palette="aurora" speed="slow" withNoise={false} />
        </div>
        {/* Animated aurora border */}
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
            opacity: 0.5,
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative' }}>
          {/* Close */}
          {state !== 'loading' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute', top: -4, insetInlineEnd: -4,
                background: 'transparent', border: 'none',
                color: CINEMATIC.text.pearlFaint, cursor: 'pointer', padding: 4
              }}
            ><X size={16} /></button>
          )}

          {/* Bell icon */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 14,
            background: state === 'granted' ? `${CINEMATIC.accent.neonMint}22` : `${CINEMATIC.accent.cyan}22`,
            color:      state === 'granted' ? CINEMATIC.accent.neonMint : CINEMATIC.accent.cyanGlow,
            boxShadow:  state === 'granted' ? glowOf('mint', 2) : glowOf('cyan', 2),
            marginBottom: 14
          }}>
            {state === 'granted' ? <CheckCircle2 size={26} /> : <BellRing size={26} />}
          </div>

          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
            {state === 'granted'    ? _('enabled',     language)
           : state === 'unsupported' ? _('unsupported', language)
                                     : _('title',       language)}
          </h2>

          {state !== 'unsupported' && state !== 'granted' && (
            <p style={{ margin: 0, color: CINEMATIC.text.pearlDim, fontSize: 13, lineHeight: 1.55, marginBottom: 16 }}>
              {_('body', language)}
            </p>
          )}

          {state === 'denied' && (
            <div role="alert" style={infoBox('amber')}>
              <AlertCircle size={13} /> {_('denied', language)}
            </div>
          )}
          {state === 'error' && error && (
            <div role="alert" style={infoBox('crimson')}>
              <AlertCircle size={13} /> {String(error.message || error)}
            </div>
          )}

          {state !== 'unsupported' && state !== 'granted' && state !== 'denied' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={handleEnable}
                disabled={state === 'loading'}
                style={{ ...primaryBtn, opacity: state === 'loading' ? 0.6 : 1, cursor: state === 'loading' ? 'wait' : 'pointer' }}
              >
                {state === 'loading'
                  ? <><Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />{_('enabling', language)}</>
                  : <><Bell size={13} />{_('enable', language)}</>}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={state === 'loading'}
                style={ghostBtn}
              >{_('notNow', language)}</button>
            </div>
          )}
          {state === 'error' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={handleEnable} style={primaryBtn}>{_('retry', language)}</button>
              <button type="button" onClick={onClose} style={ghostBtn}>{_('notNow', language)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function infoBox(tone) {
  const colors = {
    amber:   { fg: CINEMATIC.accent.solarAmber,  bg: 'rgba(255, 184, 0, 0.10)',  border: 'rgba(255, 184, 0, 0.40)'  },
    crimson: { fg: CINEMATIC.accent.crimsonGlow, bg: 'rgba(255, 61, 90, 0.10)',  border: 'rgba(255, 61, 90, 0.40)'  }
  };
  const c = colors[tone] || colors.amber;
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 12px',
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.border}`,
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 12
  };
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 18px',
  background: `linear-gradient(135deg, rgba(0, 217, 255, 0.95), rgba(157, 78, 221, 0.75))`,
  color: '#FFFFFF',
  border: `1px solid rgba(0, 217, 255, 0.5)`,
  borderRadius: RADIUS.sm,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.04em',
  fontFamily: 'inherit',
  cursor: 'pointer',
  boxShadow: glowOf('cyan', 2)
};
const ghostBtn = {
  padding: '10px 16px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: RADIUS.sm,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer'
};

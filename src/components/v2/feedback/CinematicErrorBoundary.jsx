// ================================================================
// CinematicErrorBoundary — top-level React error boundary.
//
// Sprint D-10 — Wraps RequireAuth's children in App.jsx so a
// render-time exception in any V2 page shows the cinematic
// "Something glitched in the matrix" surface instead of React's
// default white screen of death.
//
// Forwards captured errors to Sentry (no-op when Sentry is not
// configured per F7). Provides a "Reload" button for the user;
// no infrastructure for "go home" because customers may have
// landed via a deep link they want to retry.
// ================================================================
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { captureBoundaryError } from '@/services/observability/sentry';

const COPY = {
  tr: {
    title:   'Bir şey matriste kısa bir süre takıldı.',
    body:    'Bir hata oluştu ve sayfa render edilemedi. Tekrar yüklemeyi denersen büyük olasılıkla devam edebilirsin.',
    reload:  'Sayfayı yenile',
    support: 'Destek hattına yaz'
  },
  en: {
    title:   'Something glitched in the matrix.',
    body:    'A render error stopped this page. A reload usually clears it.',
    reload:  'Reload page',
    support: 'Email support'
  },
  ar: {
    title:   'حدث خلل قصير في المصفوفة.',
    body:    'تعذّر عرض الصفحة بسبب خطأ. عادةً ما تُحلّ المشكلة بإعادة التحميل.',
    reload:  'إعادة تحميل الصفحة',
    support: 'مراسلة الدعم'
  }
};

function pickLocale() {
  const v = (typeof document !== 'undefined' && document.documentElement.lang) || 'tr';
  return v === 'ar' ? 'ar' : v === 'en' ? 'en' : 'tr';
}

export default class CinematicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Best-effort forwarding to Sentry; safe no-op when DSN unset.
    try { captureBoundaryError(error, info); } catch { /* never fail render */ }
    if (process.env.NODE_ENV !== 'production') {
      console.error('[CinematicErrorBoundary]', error, info);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const lang = pickLocale();
    const copy = COPY[lang] || COPY.tr;
    const message = this.state.error?.message;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          background: `radial-gradient(circle at 50% 30%, rgba(157,78,221,0.18) 0%, ${CINEMATIC.bg.deepSpace1} 60%)`,
          fontFamily: TYPE_STACK.body,
          color: CINEMATIC.text.pearlWhite,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: SPACE['3xl']
        }}
      >
        <div style={{
          maxWidth: 480,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACE.lg
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,61,90,0.25) 0%, rgba(255,61,90,0.05) 60%, transparent 100%)`,
            border: `1px solid rgba(255,61,90,0.35)`,
            display: 'grid', placeItems: 'center',
            color: CINEMATIC.accent.crimsonGlow
          }} aria-hidden="true">
            <AlertTriangle size={44} />
          </div>
          <h1 style={{ ...TYPE_SCALE.headingLg, fontFamily: TYPE_STACK.display, margin: 0 }}>
            {copy.title}
          </h1>
          <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, margin: 0 }}>
            {copy.body}
          </p>
          {message && process.env.NODE_ENV !== 'production' && (
            <pre style={{
              ...TYPE_SCALE.caption,
              fontFamily: TYPE_STACK.mono,
              padding: SPACE.md,
              background: CINEMATIC.glass.tint1,
              border: `1px solid ${CINEMATIC.glass.border}`,
              borderRadius: RADIUS.sm,
              color: CINEMATIC.text.pearlDim,
              maxWidth: '100%',
              overflow: 'auto',
              margin: 0,
              textAlign: 'left'
            }}>{message}</pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              fontFamily: TYPE_STACK.body,
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: CINEMATIC.text.pearlWhite,
              background: `linear-gradient(135deg, ${CINEMATIC.accent.plasmaViolet}, ${CINEMATIC.accent.cyan})`,
              border: `1px solid ${CINEMATIC.glass.borderStrong}`,
              borderRadius: RADIUS.md,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} /> {copy.reload}
          </button>
          <a
            href="mailto:destek@zyrix.co"
            style={{
              ...TYPE_SCALE.caption,
              color: CINEMATIC.accent.cyan,
              textDecoration: 'none'
            }}
          >
            {copy.support}
          </a>
        </div>
      </div>
    );
  }
}

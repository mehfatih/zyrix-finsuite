// ================================================================
// CinematicErrorBlock — page-level error UI with cinematic identity.
//
// Sprint D-10 — Per discovery §6: 87 inline `setError + crimson-box`
// call sites across V2 pages collapse onto this primitive. Single
// component; consistent retry affordance; ARIA-correct so screen
// readers announce the failure.
//
// Props
//   error    — Error | string | null
//   onRetry  — optional () => void; renders a Retry button when present
//   compact  — true for inline use inside a card body; false (default)
//              for full-section take-over
//   title    — override the default localized header
//   tone     — defaults to 'crimson'; pass 'amber' for soft failures
// ================================================================
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE, toneRgb } from '@/design-system-v2/cinematic/tokens';

const COPY = {
  tr: {
    title: 'Bir şeyler ters gitti.',
    retry: 'Tekrar dene'
  },
  en: {
    title: 'Something went wrong.',
    retry: 'Try again'
  },
  ar: {
    title: 'حدث خطأ ما.',
    retry: 'حاول مرة أخرى'
  }
};

function pickLocale() {
  const v = (typeof document !== 'undefined' && document.documentElement.lang) || 'tr';
  return v === 'ar' ? 'ar' : v === 'en' ? 'en' : 'tr';
}

export default function CinematicErrorBlock({
  error,
  onRetry,
  compact = false,
  title,
  tone = 'crimson',
  language,
  style = {}
}) {
  if (!error) return null;
  const lang = language || pickLocale();
  const copy = COPY[lang] || COPY.tr;
  const message = typeof error === 'string' ? error : (error?.message || copy.title);
  const requestId = typeof error === 'object' && error ? (error.requestId || error?.cause?.requestId) : undefined;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        gap: SPACE.md,
        alignItems: compact ? 'center' : 'flex-start',
        padding: compact ? SPACE.md : SPACE.lg,
        borderRadius: RADIUS.md,
        border: `1px solid rgba(${toneRgb(tone)},0.45)`,
        background: `rgba(${toneRgb(tone)},0.08)`,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        ...style
      }}
    >
      <AlertTriangle
        size={compact ? 18 : 22}
        color={`rgba(${toneRgb(tone)},1)`}
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: compact ? 0 : 2 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.xs, flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE_SCALE.bodyMd, fontWeight: 600 }}>
          {title || copy.title}
        </div>
        <div style={{
          ...TYPE_SCALE.bodyMd,
          color: CINEMATIC.text.pearlDim,
          wordBreak: 'break-word'
        }}>
          {message}
          {requestId && (
            <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, fontFamily: TYPE_STACK.mono, display: 'block', marginTop: 4 }}>
              ref: {requestId}
            </span>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              alignSelf: 'flex-start',
              marginTop: SPACE.xs,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontFamily: TYPE_STACK.body,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: `rgba(${toneRgb(tone)},1)`,
              background: 'transparent',
              border: `1px solid rgba(${toneRgb(tone)},0.45)`,
              borderRadius: RADIUS.sm,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            {copy.retry}
          </button>
        )}
      </div>
    </div>
  );
}

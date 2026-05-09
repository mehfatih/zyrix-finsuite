// ================================================================
// AIInsightCard — KRİTİK / DİKKAT / FIRSAT card with aurora border,
// glow-pulse for critical, ambient glow for opportunity. Renders the
// single-card form of an insight from the Sprint D-1 Insight model.
//
// Props
//   severity     'critical' | 'attention' | 'opportunity'
//   title        string
//   description  string
//   actionLabel  string?
//   onAction     () => void   navigate / dispatch
//   language     'tr' | 'ar' | 'en'   default 'tr'
//   loading      boolean
//   error        boolean
//
// Severity tones:
//   critical    → crimson, glow-pulse animation (cn-glow-breathe + heartbeat halo)
//   attention   → amber, soft pulse
//   opportunity → mint, ambient glow (no pulse)
//
// Built on top of <GlassCard variant='aurora'> with severity-specific
// glow tone overlay.
// ================================================================
import { useState } from 'react';
import { AlertTriangle, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora } from '@/design-system-v2/cinematic/shadows';
import { auroraLinear } from '@/design-system-v2/cinematic/gradients';

const SEVERITY = {
  critical: {
    tone: 'crimson',
    icon: AlertTriangle,
    badge: { tr: 'KRİTİK',  en: 'CRITICAL',    ar: 'حرج' },
    pulse: true
  },
  attention: {
    tone: 'amber',
    icon: AlertTriangle,
    badge: { tr: 'DİKKAT',  en: 'ATTENTION',   ar: 'تنبيه' },
    pulse: 'soft'
  },
  opportunity: {
    tone: 'mint',
    icon: TrendingUp,
    badge: { tr: 'FIRSAT',  en: 'OPPORTUNITY', ar: 'فرصة' },
    pulse: false
  }
};

export default function AIInsightCard({
  severity = 'critical',
  title,
  description,
  actionLabel,
  onAction,
  language = 'tr',
  loading = false,
  error = false,
  delay = 0,
  style = {}
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = SEVERITY[severity] || SEVERITY.critical;
  const fg  = toneColor(cfg.tone);
  const rgb = toneRgb(cfg.tone);
  const Icon = cfg.icon;

  const baseGlow   = glowOf(cfg.tone, hovered ? 3 : 2);
  const auroraHalo = aurora(hovered ? 3 : 2);
  const boxShadow  = `${auroraHalo}, ${baseGlow}`;

  const pulseAnim =
    cfg.pulse === true   ? 'cn-glow-breathe 1.6s ease-in-out infinite'
  : cfg.pulse === 'soft' ? 'cn-glow-breathe 2.6s ease-in-out infinite'
                         : undefined;

  return (
    <div
      role="region"
      aria-label={`${cfg.badge[language] || cfg.badge.tr}: ${title || ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: CINEMATIC.glass.tint2,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        padding: 22,
        color: CINEMATIC.text.pearlWhite,
        boxShadow,
        animation: `cn-fade-up 600ms ease ${delay}ms both${pulseAnim ? `, ${pulseAnim}` : ''}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 320ms ease',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        ...style
      }}
    >
      {/* Aurora border underlay */}
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
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        {/* Severity badge row */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color={fg} />
          <span style={{
            ...TYPE_SCALE.caption,
            color: fg,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700
          }}>
            {cfg.badge[language] || cfg.badge.tr}
          </span>
          <span aria-hidden="true" style={{ flex: 1 }} />
          {severity === 'opportunity' && <Sparkles size={13} color={fg} />}
        </div>

        {/* Body */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <SkeletonStack />
          ) : error ? (
            <div style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlFaint }}>
              Veri alınamadı.
            </div>
          ) : (
            <>
              <div style={{
                ...TYPE_SCALE.headingMd,
                fontFamily: TYPE_STACK.display,
                color: CINEMATIC.text.pearlWhite,
                marginBottom: 6,
                letterSpacing: '-0.01em'
              }}>
                {title || ''}
              </div>
              <div style={{
                ...TYPE_SCALE.bodyMd,
                color: CINEMATIC.text.pearlDim,
                lineHeight: 1.5
              }}>
                {description || ''}
              </div>
            </>
          )}
        </div>

        {/* Action */}
        {!loading && !error && actionLabel && onAction && (
          <button
            onClick={onAction}
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: RADIUS.sm,
              background: `linear-gradient(135deg, rgba(${rgb}, 0.95) 0%, rgba(${rgb}, 0.7) 100%)`,
              border: `1px solid rgba(${rgb}, 0.5)`,
              color: '#FFF',
              fontFamily: TYPE_STACK.body,
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              boxShadow: glowOf(cfg.tone, 1),
              transition: 'box-shadow 220ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowOf(cfg.tone, 3); }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = glowOf(cfg.tone, 1); }}
          >
            {actionLabel}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonStack() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ShimLine width="70%" height={14} />
      <ShimLine width="92%" height={11} />
      <ShimLine width="84%" height={11} />
    </div>
  );
}
function ShimLine({ width, height }) {
  return (
    <span style={{
      display: 'block',
      width, height,
      borderRadius: 6,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)',
      backgroundSize: '200% 100%',
      animation: 'cn-shimmer 1.5s linear infinite'
    }} />
  );
}

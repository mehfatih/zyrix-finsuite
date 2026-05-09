import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

const SEVERITY_STYLE = {
  critical: {
    icon: AlertTriangle,
    iconColor: CUSTOMER_PALETTE.brand.wine,
    bg: CUSTOMER_PALETTE.brand.wineSoft,
    border: CUSTOMER_PALETTE.brand.wineBorder,
    badge: { tr: 'KRİTİK', en: 'CRITICAL', ar: 'حرج' },
    badgeColor: CUSTOMER_PALETTE.brand.wine
  },
  attention: {
    icon: AlertTriangle,
    iconColor: CUSTOMER_PALETTE.accent.amber,
    bg: CUSTOMER_PALETTE.accent.amberSoft,
    border: 'rgba(245,158,11,0.20)',
    badge: { tr: 'DİKKAT', en: 'ATTENTION', ar: 'تنبيه' },
    badgeColor: CUSTOMER_PALETTE.accent.amber
  },
  opportunity: {
    icon: TrendingUp,
    iconColor: CUSTOMER_PALETTE.accent.mint,
    bg: CUSTOMER_PALETTE.accent.mintSoft,
    border: 'rgba(45,212,191,0.20)',
    badge: { tr: 'FIRSAT', en: 'OPPORTUNITY', ar: 'فرصة' },
    badgeColor: CUSTOMER_PALETTE.accent.mint
  }
};

const btnGhost = {
  padding: '4px 10px',
  background: 'transparent',
  border: `1px solid ${CUSTOMER_PALETTE.border.default}`,
  borderRadius: '6px',
  fontSize: '11px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  color: CUSTOMER_PALETTE.text.secondary,
  display: 'inline-flex', alignItems: 'center', gap: '4px'
};

/**
 * AI Co-Pilot strip with always 3 cards: critical / attention / opportunity.
 *
 * Props:
 *   - brief         { criticalCard, attentionCard, opportunityCard, generatedAt, focusArea } | null
 *   - loading       boolean
 *   - onRefresh     () => void
 *   - onChangeFocus () => void   opens focus picker
 *   - language      'tr'|'en'|'ar'
 */
export default function AICoPilotStrip({ brief, loading, onRefresh, onChangeFocus, language = 'tr' }) {
  const { isMobile } = useViewport();
  const cards = [
    { severity: 'critical',    data: brief?.criticalCard },
    { severity: 'attention',   data: brief?.attentionCard },
    { severity: 'opportunity', data: brief?.opportunityCard }
  ];

  return (
    <section style={{ marginTop: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px',
            background: CUSTOMER_PALETTE.accent.violetSoft,
            color: CUSTOMER_PALETTE.accent.violet,
            borderRadius: '999px',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={11} /> AI Co-Pilot
          </span>
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: CUSTOMER_PALETTE.text.primary
          }}>Bugün Odaklan</span>
          {brief?.focusArea && brief.focusArea !== 'all' && (
            <span style={{
              fontSize: '11px', fontWeight: 600,
              color: CUSTOMER_PALETTE.text.tertiary
            }}>· {brief.focusArea}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onChangeFocus && (
            <button onClick={onChangeFocus} style={btnGhost}>Odak değiştir</button>
          )}
          {onRefresh && (
            <button onClick={onRefresh} style={btnGhost} title="Yenile">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: isMobile ? 'flex' : 'grid',
        gridTemplateColumns: isMobile ? undefined : 'repeat(3, 1fr)',
        gap: '12px',
        ...(isMobile ? {
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: '12px',
          WebkitOverflowScrolling: 'touch',
          paddingInline: '12px',
          paddingBottom: '4px',
          marginInline: '-12px'
        } : {})
      }}>
        {cards.map((c, i) => (
          <div
            key={c.severity}
            style={isMobile ? {
              flex: '0 0 86%',
              scrollSnapAlign: 'start'
            } : undefined}
          >
            <CoPilotCard
              severity={c.severity}
              data={c.data}
              language={language}
              loading={loading}
              delay={i * 80}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function CoPilotCard({ severity, data, language, loading, delay }) {
  const navigate = useNavigate();
  const style = SEVERITY_STYLE[severity];
  const SeverityIcon = style.icon;

  const title       = data?.title       || (loading ? '...' : (severity === 'critical' ? 'Bugün acil bir sorun yok' : ''));
  const description = data?.description || (loading ? '' : (severity === 'critical' ? 'Uzun vadeli fırsata bak.' : 'Yakında öneriler hazır olacak.'));
  const actionLabel = data?.actionLabel || (loading ? '' : 'Aç');
  const actionRoute = data?.actionRoute || '/predictions/cash';

  const empty = !data && !loading;

  return (
    <div style={{
      background: empty ? CUSTOMER_PALETTE.bg.secondary : style.bg,
      border: `1px solid ${empty ? CUSTOMER_PALETTE.border.subtle : style.border}`,
      borderRadius: '14px',
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      animation: `fade-in ${500 + delay}ms cubic-bezier(0,0,0.2,1) both`,
      animationDelay: `${delay}ms`,
      minHeight: '160px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SeverityIcon size={14} color={style.iconColor} />
        <span style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
          color: style.badgeColor, textTransform: 'uppercase'
        }}>{style.badge[language] || style.badge.tr}</span>
      </div>

      <div style={{ flex: 1 }}>
        {loading ? (
          <SkeletonLines count={3} />
        ) : (
          <>
            <div style={{
              fontSize: '14px', fontWeight: 700, lineHeight: 1.35,
              color: CUSTOMER_PALETTE.text.primary, marginBottom: '4px'
            }}>{title}</div>
            <div style={{
              fontSize: '13px', lineHeight: 1.5,
              color: CUSTOMER_PALETTE.text.secondary
            }}>{description}</div>
          </>
        )}
      </div>

      {!loading && actionLabel && (
        <button
          onClick={() => navigate(actionRoute)}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px',
            background: style.badgeColor,
            color: '#FFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {actionLabel} <ArrowRight size={12} />
        </button>
      )}

      <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function SkeletonLines({ count = 2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height: '10px',
          width: i === 0 ? '60%' : i === count - 1 ? '40%' : '90%',
          background: 'linear-gradient(90deg, rgba(15,23,42,0.06) 25%, rgba(15,23,42,0.12) 50%, rgba(15,23,42,0.06) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite linear',
          borderRadius: '4px'
        }} />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

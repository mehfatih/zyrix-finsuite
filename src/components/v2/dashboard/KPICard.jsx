import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Minus, Pencil } from 'lucide-react';
import { useCountUp } from '@/hooks/v2/useCountUp';
import Sparkline from '@/components/v2/charts/Sparkline';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { KPI_DEFINITIONS, labelOf } from '@/config/v2/kpiLibrary';

const SLOT_TO_COLOR = {
  cyan:   { fg: CUSTOMER_PALETTE.accent.cyan,   bg: CUSTOMER_PALETTE.accent.cyanSoft   },
  amber:  { fg: CUSTOMER_PALETTE.accent.amber,  bg: CUSTOMER_PALETTE.accent.amberSoft  },
  mint:   { fg: CUSTOMER_PALETTE.accent.mint,   bg: CUSTOMER_PALETTE.accent.mintSoft   },
  violet: { fg: CUSTOMER_PALETTE.accent.violet, bg: CUSTOMER_PALETTE.accent.violetSoft },
  wine:   { fg: CUSTOMER_PALETTE.brand.wine,    bg: CUSTOMER_PALETTE.brand.wineSoft    }
};

const emptyCardStyle = {
  background: CUSTOMER_PALETTE.bg.secondary,
  border: `1px dashed ${CUSTOMER_PALETTE.border.default}`,
  borderRadius: '14px',
  padding: '20px',
  color: CUSTOMER_PALETTE.text.tertiary,
  fontSize: '13px',
  textAlign: 'center'
};

/**
 * Hero KPI card with animated number, sparkline, trend, drill-down.
 *
 * Props:
 *   - kpiId    string   key in KPI_DEFINITIONS
 *   - data     { value, trend, sparkline }
 *   - language 'tr'|'en'|'ar'
 *   - onSwap   () => void   opens the KPI swap drawer for THIS slot
 *   - delay    number (ms)  fade-in delay for staggered mount
 */
export default function KPICard({ kpiId, data, language = 'tr', onSwap, delay = 0 }) {
  const navigate = useNavigate();
  const def = KPI_DEFINITIONS[kpiId];
  const animatedValue = useCountUp(data?.value ?? 0, 800);

  if (!def) {
    return <div style={emptyCardStyle}>Unknown KPI: {kpiId}</div>;
  }

  const isCritical = def.critical && def.critical(data?.value);
  const slot = isCritical ? 'wine' : def.colorSlot;
  const palette = SLOT_TO_COLOR[slot];
  const Icon = def.icon;

  const trend = data?.trend ?? 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? CUSTOMER_PALETTE.status.healthy
                  : trend < 0 ? CUSTOMER_PALETTE.brand.wine
                  :             CUSTOMER_PALETTE.text.tertiary;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(def.drillRoute)}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(def.drillRoute); }}
      style={{
        position: 'relative',
        background: CUSTOMER_PALETTE.bg.secondary,
        border: `1px solid ${CUSTOMER_PALETTE.border.subtle}`,
        borderRadius: '14px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        animation: `kpi-fade ${400 + delay}ms cubic-bezier(0,0,0.2,1) both`,
        animationDelay: `${delay}ms`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${palette.bg}`;
        e.currentTarget.style.borderColor = palette.bg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = CUSTOMER_PALETTE.border.subtle;
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{
          width: '32px', height: '32px',
          borderRadius: '8px',
          background: palette.bg,
          color: palette.fg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} />
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: CUSTOMER_PALETTE.text.tertiary,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{labelOf(kpiId, language)}</span>
        {onSwap && (
          <button
            onClick={(e) => { e.stopPropagation(); onSwap(); }}
            title="KPI değiştir"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: CUSTOMER_PALETTE.text.tertiary,
              display: 'inline-flex',
              opacity: 0.5,
              transition: 'opacity 150ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; }}
          >
            <Pencil size={12} />
          </button>
        )}
        <ArrowRight size={14} color={CUSTOMER_PALETTE.text.tertiary} />
      </div>

      {/* Value + trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{
          fontSize: '34px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: CUSTOMER_PALETTE.text.primary,
          lineHeight: 1
        }}>{def.format(animatedValue)}</div>
        {trend !== 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: trendColor,
            fontSize: '13px',
            fontWeight: 700
          }}>
            <TrendIcon size={14} />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Sparkline + label */}
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{
          fontSize: '11px',
          color: CUSTOMER_PALETTE.text.tertiary,
          fontWeight: 500
        }}>vs. geçen ay</div>
        <Sparkline data={data?.sparkline} color={palette.fg} width={80} height={24} />
      </div>

      <style>{`@keyframes kpi-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

import { useMemo } from 'react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

/**
 * Custom mini Sankey: 3 income sources → net → 4 outflows.
 * Built as raw SVG; no external library needed.
 */
export default function CashFlowSankey() {
  const inflows = useMemo(() => [
    { name: 'Satışlar', value: 320000, color: CUSTOMER_PALETTE.accent.mint },
    { name: 'Hizmet',   value: 110000, color: CUSTOMER_PALETTE.accent.cyan },
    { name: 'Diğer',    value:  28000, color: CUSTOMER_PALETTE.text.tertiary }
  ], []);
  const outflows = useMemo(() => [
    { name: 'Maaş',       value: 140000, color: CUSTOMER_PALETTE.accent.violet },
    { name: 'Tedarik',    value:  88000, color: CUSTOMER_PALETTE.accent.amber },
    { name: 'Vergi',      value:  62000, color: CUSTOMER_PALETTE.accent.amber },
    { name: 'Diğer Gid.', value:  34000, color: CUSTOMER_PALETTE.text.tertiary }
  ], []);

  const totalIn  = inflows.reduce((s, x) => s + x.value, 0);
  const totalOut = outflows.reduce((s, x) => s + x.value, 0);
  const net = totalIn - totalOut;

  const W = 600;
  const H = 220;
  const COL_LEFT = 110;
  const COL_CENTER = W / 2;
  const COL_RIGHT = W - 110;

  const inPositions = useMemo(() => {
    let acc = 0;
    return inflows.map((f) => {
      const h = Math.max(20, (f.value / totalIn) * (H - 60));
      const y = 30 + acc;
      acc += h + 6;
      return { ...f, y, h };
    });
  }, [inflows, totalIn]);

  const outPositions = useMemo(() => {
    let acc = 0;
    return outflows.map((f) => {
      const h = Math.max(20, (f.value / totalOut) * (H - 60));
      const y = 30 + acc;
      acc += h + 6;
      return { ...f, y, h };
    });
  }, [outflows, totalOut]);

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: '8px'
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: '480px', maxHeight: '240px' }}>
        {inPositions.map((f, i) => (
          <g key={`in-${i}`}>
            <rect x={COL_LEFT - 70} y={f.y} width={70} height={f.h} fill={f.color} rx={4}
              style={{ animation: `flow-in 800ms ${i * 80}ms ease both`, transformOrigin: 'left center' }}
            />
            <text x={COL_LEFT - 76} y={f.y + f.h / 2 + 4} fontSize={11} textAnchor="end" fill={CUSTOMER_PALETTE.text.primary} fontWeight={700}>
              {f.name}
            </text>
            <text x={COL_LEFT - 76} y={f.y + f.h / 2 + 18} fontSize={10} textAnchor="end" fill={CUSTOMER_PALETTE.text.tertiary}>
              ₺{Math.round(f.value/1000)}K
            </text>
          </g>
        ))}

        <rect
          x={COL_CENTER - 50} y={50}
          width={100} height={H - 100}
          fill={net >= 0 ? CUSTOMER_PALETTE.accent.mintSoft : CUSTOMER_PALETTE.brand.wineSoft}
          stroke={net >= 0 ? CUSTOMER_PALETTE.accent.mint : CUSTOMER_PALETTE.brand.wine}
          rx={8}
          style={{ animation: 'flow-pop 600ms 240ms ease both' }}
        />
        <text x={COL_CENTER} y={H / 2 - 6} textAnchor="middle" fontSize={11} fill={CUSTOMER_PALETTE.text.tertiary} fontWeight={700}>
          NET
        </text>
        <text x={COL_CENTER} y={H / 2 + 14} textAnchor="middle" fontSize={18} fontWeight={800}
          fill={net >= 0 ? CUSTOMER_PALETTE.accent.mint : CUSTOMER_PALETTE.brand.wine}>
          ₺{Math.round(net/1000)}K
        </text>

        {outPositions.map((f, i) => (
          <g key={`out-${i}`}>
            <rect x={COL_RIGHT} y={f.y} width={70} height={f.h} fill={f.color} rx={4}
              style={{ animation: `flow-out 800ms ${i * 80 + 120}ms ease both`, transformOrigin: 'right center' }}
            />
            <text x={COL_RIGHT + 76} y={f.y + f.h / 2 + 4} fontSize={11} fill={CUSTOMER_PALETTE.text.primary} fontWeight={700}>
              {f.name}
            </text>
            <text x={COL_RIGHT + 76} y={f.y + f.h / 2 + 18} fontSize={10} fill={CUSTOMER_PALETTE.text.tertiary}>
              ₺{Math.round(f.value/1000)}K
            </text>
          </g>
        ))}

        {inPositions.map((f, i) => (
          <path
            key={`p-in-${i}`}
            d={`M${COL_LEFT},${f.y + f.h / 2} C${(COL_LEFT + COL_CENTER) / 2},${f.y + f.h / 2} ${(COL_LEFT + COL_CENTER) / 2},${H / 2} ${COL_CENTER - 50},${H / 2}`}
            fill="none"
            stroke={f.color}
            strokeWidth={Math.max(2, (f.value / totalIn) * 16)}
            strokeOpacity={0.35}
            strokeLinecap="round"
            style={{ animation: `flow-path 1000ms ${i * 80 + 200}ms ease both` }}
          />
        ))}
        {outPositions.map((f, i) => (
          <path
            key={`p-out-${i}`}
            d={`M${COL_CENTER + 50},${H / 2} C${(COL_CENTER + COL_RIGHT) / 2},${H / 2} ${(COL_CENTER + COL_RIGHT) / 2},${f.y + f.h / 2} ${COL_RIGHT},${f.y + f.h / 2}`}
            fill="none"
            stroke={f.color}
            strokeWidth={Math.max(2, (f.value / totalOut) * 16)}
            strokeOpacity={0.35}
            strokeLinecap="round"
            style={{ animation: `flow-path 1000ms ${i * 80 + 400}ms ease both` }}
          />
        ))}

        <style>{`
          @keyframes flow-in   { from { transform: scaleX(0); }   to { transform: scaleX(1); } }
          @keyframes flow-out  { from { transform: scaleX(0); }   to { transform: scaleX(1); } }
          @keyframes flow-pop  { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
          @keyframes flow-path { from { stroke-dasharray: 800; stroke-dashoffset: 800; } to { stroke-dasharray: 800; stroke-dashoffset: 0; } }
        `}</style>
      </svg>
    </div>
  );
}

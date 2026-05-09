import { useEffect, useState } from 'react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

const STAGES = [
  { key: 'draft',  label: 'Taslak',     count: 86, color: CUSTOMER_PALETTE.accent.violet },
  { key: 'sent',   label: 'Gönderildi', count: 78, color: CUSTOMER_PALETTE.accent.cyan   },
  { key: 'viewed', label: 'Görüldü',    count: 64, color: CUSTOMER_PALETTE.accent.amber  },
  { key: 'paid',   label: 'Ödendi',     count: 52, color: CUSTOMER_PALETTE.accent.mint   }
];

export default function InvoiceFunnel() {
  const { isMobile } = useViewport();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 100);
    return () => clearTimeout(t);
  }, []);

  const top = STAGES[0].count;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
      {STAGES.map((s, i) => {
        const widthPct = (s.count / top) * 100;
        const conversionFromPrev = i === 0 ? null : ((s.count / STAGES[i - 1].count) * 100);
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: CUSTOMER_PALETTE.text.tertiary,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              width: isMobile ? '60px' : '76px',
              flexShrink: 0,
              textAlign: 'end'
            }}>{s.label}</div>
            <div style={{ flex: 1, position: 'relative', height: '40px' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0,
                width: phase === 0 ? '0%' : `${widthPct}%`,
                background: `linear-gradient(90deg, ${s.color} 0%, ${s.color}88 100%)`,
                borderRadius: '6px',
                transition: `width 700ms ${i * 100}ms cubic-bezier(0.4,0,0.2,1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingInline: '12px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  {s.count}
                </span>
                {conversionFromPrev !== null && phase === 1 && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700, color: '#FFFFFFCC',
                    animation: `funnel-fade 400ms ${i * 100 + 700}ms both`
                  }}>
                    {conversionFromPrev.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes funnel-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

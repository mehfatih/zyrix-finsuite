import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

/**
 * AI-aware Tax Calendar.
 * Each day with a tax obligation gets a colored chip based on cash readiness:
 *   - Mint:   cash >= 1.5x of due
 *   - Amber:  cash 1.0–1.5x
 *   - Wine:   cash < 1.0x  (cash crisis)
 *   - Gray:   already paid
 */

const MOCK_EVENTS = [
  { date: '2026-05-12', type: 'KDV',     due: 28400, cashAvailable: 19200, suggestion: 'Atlas Tekstil\'den ₺12,400 alacağı var, hatırlatma maili gönder.' },
  { date: '2026-05-17', type: 'Stopaj',  due: 14200, cashAvailable: 22000, suggestion: null },
  { date: '2026-05-24', type: 'GV',      due: 38600, cashAvailable: 26000, suggestion: 'Sahra Trade ödemesini öne çek.' },
  { date: '2026-05-29', type: 'SGK',     due: 18400, cashAvailable: 31000, suggestion: null },
  { date: '2026-06-12', type: 'KDV',     due: 30100, cashAvailable: 28000, suggestion: null }
];

const dayKey = (date) => date.toISOString().slice(0, 10);

const chipColor = (event) => {
  if (!event) return null;
  if (event.paid) return { bg: 'rgba(148,163,184,0.18)', fg: CUSTOMER_PALETTE.text.tertiary, border: 'rgba(148,163,184,0.40)' };
  const ratio = event.cashAvailable / event.due;
  if (ratio >= 1.5) return { bg: CUSTOMER_PALETTE.accent.mintSoft,  fg: CUSTOMER_PALETTE.accent.mint,  border: 'rgba(45,212,191,0.40)' };
  if (ratio >= 1.0) return { bg: CUSTOMER_PALETTE.accent.amberSoft, fg: CUSTOMER_PALETTE.accent.amber, border: 'rgba(245,158,11,0.40)' };
  return { bg: CUSTOMER_PALETTE.brand.wineSoft, fg: CUSTOMER_PALETTE.brand.wine, border: CUSTOMER_PALETTE.brand.wineBorder };
};

const iconBtn = {
  width: '28px', height: '28px',
  background: 'transparent',
  border: `1px solid ${CUSTOMER_PALETTE.border.default}`,
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: CUSTOMER_PALETTE.text.secondary
};

function buildMonthGrid(monthStart) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function TaxIntelligenceCalendar() {
  const { isMobile } = useViewport();
  const [monthStart, setMonthStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [hovered, setHovered] = useState(null);

  const grid = useMemo(() => buildMonthGrid(monthStart), [monthStart]);
  const eventByDay = useMemo(() => {
    const m = {};
    MOCK_EVENTS.forEach((e) => { m[e.date] = e; });
    return m;
  }, []);

  const monthLabel = monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const next = () => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1));
  const prev = () => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1));

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={prev} style={iconBtn}><ChevronLeft size={16} /></button>
        <div style={{ fontSize: '14px', fontWeight: 800, textTransform: 'capitalize' }}>{monthLabel}</div>
        <button onClick={next} style={iconBtn}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {['P','S','Ç','P','C','C','P'].map((d, i) => (
          <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: CUSTOMER_PALETTE.text.tertiary, textAlign: 'center', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {grid.map((cell, i) => {
          const event = cell ? eventByDay[dayKey(cell)] : null;
          const chip = chipColor(event);

          return (
            <div
              key={i}
              onClick={() => event && setHovered({ date: dayKey(cell), event })}
              onMouseEnter={() => !isMobile && event && setHovered({ date: dayKey(cell), event })}
              onMouseLeave={() => !isMobile && setHovered(null)}
              style={{
                aspectRatio: '1',
                background: chip ? chip.bg : 'transparent',
                border: chip ? `1px solid ${chip.border}` : `1px solid ${CUSTOMER_PALETTE.border.subtle}`,
                borderRadius: '8px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: event ? 'pointer' : 'default',
                position: 'relative',
                opacity: cell ? 1 : 0
              }}
            >
              {cell && (
                <>
                  <div style={{ fontSize: '12px', fontWeight: chip ? 700 : 500, color: chip ? chip.fg : CUSTOMER_PALETTE.text.secondary }}>
                    {cell.getDate()}
                  </div>
                  {event && !isMobile && (
                    <div style={{ fontSize: '9px', fontWeight: 800, color: chip.fg, textTransform: 'uppercase', marginTop: '2px' }}>
                      {event.type}
                    </div>
                  )}
                  {event && isMobile && (
                    <div style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: chip.fg,
                      marginTop: '4px'
                    }} />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {hovered && (
        <div style={{
          marginTop: '12px',
          padding: '14px 16px',
          background: CUSTOMER_PALETTE.bg.secondary,
          border: `1px solid ${chipColor(hovered.event)?.border || CUSTOMER_PALETTE.border.default}`,
          borderRadius: '12px',
          animation: 'tax-fade 200ms ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800 }}>
              {new Date(hovered.event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} · {hovered.event.type}
            </div>
            <div style={{
              padding: '2px 8px',
              background: chipColor(hovered.event).bg,
              color: chipColor(hovered.event).fg,
              borderRadius: '999px',
              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
            }}>
              {hovered.event.cashAvailable >= hovered.event.due * 1.5 ? 'Hazır' :
               hovered.event.cashAvailable >= hovered.event.due       ? 'Sıkı'  : 'Risk'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <div style={{ color: CUSTOMER_PALETTE.text.tertiary, marginBottom: '2px' }}>Tutar</div>
              <div style={{ fontWeight: 800, color: CUSTOMER_PALETTE.text.primary }}>
                ₺{Math.round(hovered.event.due).toLocaleString('tr-TR')}
              </div>
            </div>
            <div>
              <div style={{ color: CUSTOMER_PALETTE.text.tertiary, marginBottom: '2px' }}>Hazır Nakit</div>
              <div style={{ fontWeight: 800, color: hovered.event.cashAvailable >= hovered.event.due ? CUSTOMER_PALETTE.accent.mint : CUSTOMER_PALETTE.brand.wine }}>
                ₺{Math.round(hovered.event.cashAvailable).toLocaleString('tr-TR')}
              </div>
            </div>
          </div>

          {hovered.event.suggestion && (
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              background: CUSTOMER_PALETTE.accent.violetSoft,
              border: `1px solid rgba(124,58,237,0.20)`,
              borderRadius: '8px',
              display: 'flex', gap: '8px', alignItems: 'flex-start'
            }}>
              <AlertTriangle size={14} color={CUSTOMER_PALETTE.accent.violet} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: CUSTOMER_PALETTE.text.primary, lineHeight: 1.5 }}>
                <strong style={{ color: CUSTOMER_PALETTE.accent.violet }}>AI Öneri:</strong> {hovered.event.suggestion}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes tax-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { KPI_DEFINITIONS, labelOf } from '@/config/v2/kpiLibrary';
import { useViewport } from '@/hooks/v2/useIsMobile';

const SLOT_LABELS = ['Pozisyon 1', 'Pozisyon 2', 'Pozisyon 3', 'Pozisyon 4'];
const CATEGORIES = [
  { key: 'operational',  label: 'Operasyonel', ids: ['mrr','cash_runway','cash_balance','customer_health_pct','tax_burden','overdue_receivables','pending_invoices','payable_30d','gross_margin','top_customer_revenue'] },
  { key: 'growth',       label: 'Büyüme',      ids: ['mrr_growth_pct','new_customers_30d','churn_rate','nrr','arpu'] },
  { key: 'intelligence', label: 'Zekâ',        ids: ['ai_actions_taken_today','predictions_accuracy_30d','automation_savings_hours','crisis_risk_score','hidden_cash_found_30d'] },
  { key: 'industry',     label: 'Sektörel',    ids: ['inventory_turnover','service_utilization','kdv_load','vat_load','zatca_compliance'] }
];

const subtitleStyle = {
  fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
  color: CUSTOMER_PALETTE.text.tertiary, textTransform: 'uppercase',
  marginBottom: '12px'
};
const iconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '6px', borderRadius: '6px', color: CUSTOMER_PALETTE.text.secondary
};
const btnSecondary = {
  padding: '8px 16px', background: 'transparent',
  border: `1px solid ${CUSTOMER_PALETTE.border.default}`,
  borderRadius: '8px', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', color: CUSTOMER_PALETTE.text.primary
};
const btnPrimary = (enabled) => ({
  padding: '8px 18px',
  background: enabled ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.text.tertiary,
  color: '#FFF', border: 'none', borderRadius: '8px',
  fontSize: '13px', fontWeight: 700,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontFamily: 'inherit',
  opacity: enabled ? 1 : 0.6
});

/**
 * Drawer for editing the 4 KPI slots.
 * Click a slot, then click a KPI from the library on the right.
 *
 * Props:
 *   - open                 boolean
 *   - onClose              () => void
 *   - currentSlots         string[4]
 *   - onSave               (newSlots: string[4]) => Promise<void>
 *   - language             'tr'|'en'|'ar'
 *   - initialSelectedSlot  number 0..3 — slot the user clicked from a card
 */
export default function KPISwapDrawer({ open, onClose, currentSlots, onSave, language = 'tr', initialSelectedSlot = 0 }) {
  const { isMobile } = useViewport();
  const [slots, setSlots] = useState(currentSlots);
  const [selectedSlot, setSelectedSlot] = useState(initialSelectedSlot);
  const [activeCategory, setActiveCategory] = useState('operational');
  const [saving, setSaving] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setSlots(currentSlots);
      setSelectedSlot(initialSelectedSlot);
    }
  }, [open, currentSlots, initialSelectedSlot]);

  if (!open) return null;

  const pickKpi = (kpiId) => {
    setSlots((prev) => {
      const next = [...prev];
      // If the same KPI is already in another slot, swap them
      const existingIdx = next.indexOf(kpiId);
      if (existingIdx >= 0 && existingIdx !== selectedSlot) {
        const wasInSelected = next[selectedSlot];
        next[existingIdx] = wasInSelected;
      }
      next[selectedSlot] = kpiId;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(slots);
      onClose();
    } catch (err) {
      console.error('Failed to save KPI slots:', err);
    } finally {
      setSaving(false);
    }
  };

  const dirty = JSON.stringify(slots) !== JSON.stringify(currentSlots);

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 10000 }}
      />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: isMobile ? '100vw' : 'min(720px, 100vw)',
        background: CUSTOMER_PALETTE.bg.primary,
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-12px 0 40px rgba(15,23,42,0.18)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        animation: 'drawer-slide-in 280ms cubic-bezier(0.4,0,0.2,1)'
      }}>
        <header style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${CUSTOMER_PALETTE.border.default}`,
          background: CUSTOMER_PALETTE.bg.secondary,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
              color: CUSTOMER_PALETTE.accent.violet, textTransform: 'uppercase'
            }}>KPI Düzenle</div>
            <h2 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800 }}>
              4 Pano KPI'ını Özelleştir
            </h2>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </header>

        <div style={{
          flex: 1,
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '280px 1fr',
          overflow: 'hidden'
        }}>
          {/* Slot picker — left column on desktop, horizontal scroller on mobile */}
          <div style={{
            padding: isMobile ? '12px' : '20px',
            borderInlineEnd: isMobile ? 'none' : `1px solid ${CUSTOMER_PALETTE.border.default}`,
            borderBottom: isMobile ? `1px solid ${CUSTOMER_PALETTE.border.default}` : 'none',
            overflow: isMobile ? 'visible' : 'auto',
            flexShrink: 0
          }}>
            {!isMobile && <div style={subtitleStyle}>Pozisyonlar</div>}
            <div style={{
              display: isMobile ? 'flex' : 'block',
              gap: isMobile ? '8px' : 0,
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: isMobile ? 'touch' : undefined
            }}>
              {SLOT_LABELS.map((label, idx) => {
                const id = slots[idx];
                const def = id && KPI_DEFINITIONS[id];
                const isActive = selectedSlot === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(idx)}
                    style={{
                      width: isMobile ? 'auto' : '100%',
                      flex: isMobile ? '0 0 auto' : undefined,
                      minWidth: isMobile ? '180px' : undefined,
                      minHeight: isMobile ? '44px' : undefined,
                      padding: '12px 14px',
                      marginBottom: isMobile ? 0 : '8px',
                      background: isActive ? CUSTOMER_PALETTE.accent.violetSoft : CUSTOMER_PALETTE.bg.secondary,
                      border: `1px solid ${isActive ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.border.subtle}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'start',
                      fontFamily: 'inherit'
                    }}
                  >
                    <div style={{
                      fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
                      color: isActive ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.text.tertiary,
                      textTransform: 'uppercase', marginBottom: '4px'
                    }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: CUSTOMER_PALETTE.text.primary }}>
                      {def ? labelOf(id, language) : 'Boş'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KPI library on right */}
          <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Category tabs */}
            <div style={{
              display: 'flex', gap: '4px', padding: '12px 20px 0',
              borderBottom: `1px solid ${CUSTOMER_PALETTE.border.subtle}`
            }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeCategory === c.key ? CUSTOMER_PALETTE.accent.violet : 'transparent'}`,
                    color: activeCategory === c.key ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.text.secondary,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginBottom: '-1px'
                  }}
                >{c.label}</button>
              ))}
            </div>

            {/* KPI cards */}
            <div style={{
              padding: '14px 20px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {(CATEGORIES.find((c) => c.key === activeCategory)?.ids || []).map((id) => {
                const def = KPI_DEFINITIONS[id];
                if (!def) return null;
                const Icon = def.icon;
                const isInUse = slots.includes(id);
                const isAtSelected = slots[selectedSlot] === id;
                return (
                  <button
                    key={id}
                    onClick={() => pickKpi(id)}
                    disabled={isAtSelected}
                    style={{
                      padding: '12px',
                      background: isAtSelected ? CUSTOMER_PALETTE.accent.violetSoft : CUSTOMER_PALETTE.bg.secondary,
                      border: `1px solid ${isAtSelected ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.border.subtle}`,
                      borderRadius: '10px',
                      cursor: isAtSelected ? 'default' : 'pointer',
                      textAlign: 'start',
                      fontFamily: 'inherit',
                      opacity: isInUse && !isAtSelected ? 0.55 : 1,
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                  >
                    <Icon size={18} color={CUSTOMER_PALETTE.text.secondary} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 700,
                        color: CUSTOMER_PALETTE.text.primary,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{labelOf(id, language)}</div>
                      {isInUse && (
                        <div style={{
                          fontSize: '10px',
                          color: isAtSelected ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.text.tertiary,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginTop: '2px'
                        }}>{isAtSelected ? 'Bu pozisyonda' : 'Başka pozisyonda'}</div>
                      )}
                    </div>
                    {isAtSelected && <Check size={14} color={CUSTOMER_PALETTE.accent.violet} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer style={{
          padding: '14px 20px',
          borderTop: `1px solid ${CUSTOMER_PALETTE.border.default}`,
          background: CUSTOMER_PALETTE.bg.secondary,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '12px', color: CUSTOMER_PALETTE.text.tertiary }}>
            {dirty ? 'Kaydedilmemiş değişiklikler var' : 'Değişiklik yok'}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={btnSecondary}>İptal</button>
            <button onClick={handleSave} disabled={!dirty || saving} style={btnPrimary(dirty && !saving)}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </footer>
      </aside>

      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

import { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

const FLAG_LABELS = {
  customerDashboardV2: 'Yeni Pano (V2 Dashboard)',
  newSidebarV2:        'Yeni Kenar Çubuğu (3 Tier Navy)',
  cmdKPalette:         'Cmd+K Komut Paleti',
  aiCoPilotStrip:      'AI Co-Pilot Şeridi',
  customizableKpis:    'Özelleştirilebilir KPI\'lar',
  taxIntelligenceCal:  'AI-Renkli Vergi Takvimi',
  universalUndo:       'Evrensel Geri Al (30sn)'
};

export default function FeatureFlagDrawer() {
  const { isMobile } = useViewport();
  const { flags, setFlag, resetAll } = useFeatureFlags();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Yeni Tasarım Ayarları"
        style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 9998,
          width: isMobile ? '48px' : '44px',
          height: isMobile ? '48px' : '44px',
          borderRadius: '50%',
          background: CUSTOMER_PALETTE.accent.violet, color: '#FFF',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Settings2 size={20} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 9999
            }}
          />
          <aside style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '360px',
            background: CUSTOMER_PALETTE.bg.secondary, zIndex: 10000,
            boxShadow: '-12px 0 40px rgba(15,23,42,0.16)',
            display: 'flex', flexDirection: 'column'
          }}>
            <header style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${CUSTOMER_PALETTE.border.default}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: CUSTOMER_PALETTE.accent.violet, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Beta Tasarım
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800 }}>Özellik Bayrakları</h3>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </header>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: '13px', color: CUSTOMER_PALETTE.text.secondary, lineHeight: 1.5, marginTop: 0 }}>
                Yeni tasarımı parça parça açıp kapatabilirsin. Bir sorun olursa eskiye dönmek için hepsini sıfırla.
              </p>

              {Object.entries(FLAG_LABELS).map(([key, label]) => (
                <label key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: `1px solid ${CUSTOMER_PALETTE.border.subtle}`,
                  cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: CUSTOMER_PALETTE.text.primary }}>
                    {label}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(flags[key])}
                    onChange={(e) => setFlag(key, e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: CUSTOMER_PALETTE.accent.violet }}
                  />
                </label>
              ))}

              <button
                onClick={resetAll}
                style={{
                  marginTop: '20px', width: '100%', padding: '10px',
                  background: CUSTOMER_PALETTE.brand.wineSoft,
                  color: CUSTOMER_PALETTE.brand.wine,
                  border: `1px solid ${CUSTOMER_PALETTE.brand.wineBorder}`,
                  borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Tüm Bayrakları Sıfırla (Eski Tasarım)
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

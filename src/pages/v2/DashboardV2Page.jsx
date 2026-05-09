import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2 } from 'lucide-react';

import { useFlag } from '@/contexts/FeatureFlagsContext';
import { useUndo } from '@/contexts/UndoContext';

import CustomerLayoutV2 from '@/components/v2/CustomerLayoutV2';
import KPICard from '@/components/v2/dashboard/KPICard';
import KPISwapDrawer from '@/components/v2/dashboard/KPISwapDrawer';
import AICoPilotStrip from '@/components/v2/dashboard/AICoPilotStrip';
import RevenueDonut from '@/components/v2/charts/RevenueDonut';
import CashFlowSankey from '@/components/v2/charts/CashFlowSankey';
import CustomerBubbleMap from '@/components/v2/charts/CustomerBubbleMap';
import InvoiceFunnel from '@/components/v2/charts/InvoiceFunnel';
import TaxIntelligenceCalendar from '@/components/v2/dashboard/TaxIntelligenceCalendar';

import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { fetchKpiValues } from '@/api/v2/kpiData';
import { getPreferences, updatePreferences } from '@/api/v2/dashboardPreferences';
import { getAIBrief, refreshAIBrief } from '@/api/v2/aiBrief';

const DEFAULT_KPIS = ['mrr', 'cash_runway', 'customer_health_pct', 'tax_burden'];

const editLayoutBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px',
  background: CUSTOMER_PALETTE.accent.violetSoft,
  color: CUSTOMER_PALETTE.accent.violet,
  border: `1px solid rgba(124,58,237,0.20)`,
  borderRadius: '8px',
  fontSize: '12px', fontWeight: 700,
  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: CUSTOMER_PALETTE.bg.secondary,
      border: `1px solid ${CUSTOMER_PALETTE.border.subtle}`,
      borderRadius: '14px',
      padding: '20px',
      animation: 'card-fade 600ms cubic-bezier(0,0,0.2,1) both'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: CUSTOMER_PALETTE.text.primary, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '12px', color: CUSTOMER_PALETTE.text.tertiary, margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
      <style>{`@keyframes card-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export default function DashboardV2Page() {
  const enabled       = useFlag('customerDashboardV2');
  const customizable  = useFlag('customizableKpis');
  const aiStripFlag   = useFlag('aiCoPilotStrip');
  const taxCalFlag    = useFlag('taxIntelligenceCal');
  const navigate = useNavigate();
  const { pushUndo } = useUndo();

  const [user, setUser] = useState({ name: '', email: '' });
  const [language] = useState('tr');
  const [kpiSlots, setKpiSlots] = useState(DEFAULT_KPIS);
  const [kpiData, setKpiData] = useState({});
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSlot, setDrawerSlot] = useState(0);

  // Redirect to legacy if flag off
  useEffect(() => {
    if (!enabled) navigate('/dashboard', { replace: true });
  }, [enabled, navigate]);

  // Hydrate user from zyrix_user (what AuthContext writes)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('zyrix_user');
      if (raw) {
        const u = JSON.parse(raw);
        setUser({
          name:  u.name || u.fullName || u.email || 'Kullanıcı',
          email: u.email || ''
        });
      }
    } catch { /* ignore */ }
  }, []);

  // Load preferences then KPI data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prefs = await getPreferences();
        if (cancelled) return;
        const slots = Array.isArray(prefs?.kpiSlots) && prefs.kpiSlots.length === 4
          ? prefs.kpiSlots
          : DEFAULT_KPIS;
        setKpiSlots(slots);
        const data = await fetchKpiValues(slots);
        if (!cancelled) setKpiData(data);
      } catch {
        // Fallback to defaults if prefs fetch fails (e.g. fresh login)
        const data = await fetchKpiValues(DEFAULT_KPIS);
        if (!cancelled) setKpiData(data);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load AI brief (non-blocking)
  useEffect(() => {
    if (!aiStripFlag) { setBriefLoading(false); return undefined; }
    let cancelled = false;
    setBriefLoading(true);
    (async () => {
      try {
        const b = await getAIBrief('all', language);
        if (!cancelled) setBrief(b);
      } catch {
        // Silent — UI shows skeleton then empty state
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [aiStripFlag, language]);

  const handleRefreshBrief = useCallback(async () => {
    setBriefLoading(true);
    try {
      const b = await refreshAIBrief();
      setBrief(b);
    } catch { /* silent */ } finally {
      setBriefLoading(false);
    }
  }, []);

  // Save KPI slots — push an undo toast that reverts both UI and backend
  const saveKpiSlots = useCallback(async (newSlots) => {
    const previousSlots = kpiSlots;
    setKpiSlots(newSlots);
    const data = await fetchKpiValues(newSlots);
    setKpiData(data);
    await updatePreferences({ kpiSlots: newSlots });
    pushUndo({
      label: 'KPI düzeni güncellendi',
      undo: async () => {
        setKpiSlots(previousSlots);
        const oldData = await fetchKpiValues(previousSlots);
        setKpiData(oldData);
        await updatePreferences({ kpiSlots: previousSlots });
      }
    });
  }, [kpiSlots, pushUndo]);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('zyrix_token');
      localStorage.removeItem('zyrix_user');
    } catch { /* ignore */ }
    navigate('/login');
  };

  if (!enabled) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  })();

  return (
    <CustomerLayoutV2 user={user} language={language} onSignOut={handleSignOut}>
      <div style={{ padding: '24px 28px 80px', maxWidth: '1480px', margin: '0 auto' }}>
        {/* Greeting */}
        <header style={{
          marginBottom: '20px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '20px', flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={{
              fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em',
              color: CUSTOMER_PALETTE.text.primary, margin: 0
            }}>
              {greeting}, {user.name?.split(' ')[0] || 'Kullanıcı'}
            </h1>
            <p style={{ fontSize: '13px', color: CUSTOMER_PALETTE.text.secondary, marginTop: '4px' }}>
              İşte sabah brifingin · {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {customizable && (
            <button
              onClick={() => { setDrawerSlot(0); setDrawerOpen(true); }}
              style={editLayoutBtn}
            >
              <Settings2 size={14} /> KPI'ları Özelleştir
            </button>
          )}
        </header>

        {/* KPI Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {kpiSlots.map((id, idx) => (
            <KPICard
              key={`${id}-${idx}`}
              kpiId={id}
              data={kpiData[id]}
              language={language}
              delay={idx * 80}
              onSwap={customizable ? () => { setDrawerSlot(idx); setDrawerOpen(true); } : undefined}
            />
          ))}
        </div>

        {/* AI Co-Pilot Strip */}
        {aiStripFlag && (
          <AICoPilotStrip
            brief={brief}
            loading={briefLoading}
            onRefresh={handleRefreshBrief}
            language={language}
          />
        )}

        {/* 4 Charts (2x2) */}
        <section style={{
          marginTop: '24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px'
        }}>
          <ChartCard title="Gelir Dağılımı" subtitle="Bu ay · İlk 5 müşteri">
            <RevenueDonut />
          </ChartCard>
          <ChartCard title="Nakit Akışı" subtitle="Geçen 30 gün · ₺'ye dönüştürüldü">
            <CashFlowSankey />
          </ChartCard>
          <ChartCard title="Coğrafi Dağılım" subtitle="Şehir bazında müşteri geliri">
            <CustomerBubbleMap />
          </ChartCard>
          <ChartCard title="Fatura → Tahsilat Hunisi" subtitle="Son 30 gün dönüşüm oranları">
            <InvoiceFunnel />
          </ChartCard>
        </section>

        {/* Tax Intelligence Calendar */}
        {taxCalFlag && (
          <section style={{ marginTop: '24px' }}>
            <ChartCard title="Vergi Takvimi" subtitle="AI hazırlık değerlendirmesi · Renkli çipler nakit yeterliliğini gösterir">
              <TaxIntelligenceCalendar />
            </ChartCard>
          </section>
        )}
      </div>

      {/* KPI swap drawer */}
      {customizable && (
        <KPISwapDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentSlots={kpiSlots}
          onSave={saveKpiSlots}
          language={language}
          initialSelectedSlot={drawerSlot}
        />
      )}
    </CustomerLayoutV2>
  );
}

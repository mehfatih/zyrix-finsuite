// ================================================================
// ChartsShowcase — Sprint D-1 internal demo of the cinematic chart
// library. Mounted at /v2/_dev/charts.
//
// Sample data is mocked — every chart is rendered with realistic-shape
// inputs so the visual system can be evaluated end-to-end without the
// backend.
// ================================================================
import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { GradientMesh, NeonBadge, GlassCard, AuroraButton } from '@/components/foundation';
import {
  AuroraChart,
  LiquidKPICard,
  PulseSparkline,
  HolographicDonut,
  FlowStream,
  ConstellationMap,
  AIInsightCard,
  ConstellationKPIGrid
} from '@/components/charts/cinematic';

const sectionStyle = {
  position: 'relative',
  marginBottom: SPACE['4xl'],
  padding: SPACE['2xl'],
  borderRadius: 18,
  overflow: 'hidden'
};

const labelStyle = {
  ...TYPE_SCALE.caption,
  fontFamily: TYPE_STACK.body,
  textTransform: 'uppercase',
  color: CINEMATIC.text.pearlFaint,
  marginBottom: SPACE.lg,
  display: 'block'
};

const sectionTitle = {
  ...TYPE_SCALE.headingMd,
  fontFamily: TYPE_STACK.display,
  color: CINEMATIC.text.pearlWhite,
  marginBottom: SPACE.md
};

export default function ChartsShowcase() {
  const [auroraState, setAuroraState] = useState('data'); // data | loading | empty | error

  // Sample data — kept inline so the showcase has zero external deps.
  const auroraData = useMemo(
    () => [
      { x: 'Jun', y: 18000 }, { x: 'Jul', y: 24000 }, { x: 'Aug', y: 17000 },
      { x: 'Sep', y: 25000 }, { x: 'Oct', y: 18500 }, { x: 'Nov', y: 26000 },
      { x: 'Dec', y: 19000 }, { x: 'Jan', y: 27000 }, { x: 'Feb', y: 13000 },
      { x: 'Mar', y: 28500 }, { x: 'Apr', y: 19500 }, { x: 'May', y: 30500 }
    ],
    []
  );

  const sparklineData = [12, 18, 14, 22, 20, 28, 24, 32, 28, 36, 30, 42, 38, 46];

  const donutData = [
    { name: 'Yılmaz Holding',    value: 30500, tone: 'cyan' },
    { name: 'Kaya Tekstil Ltd.', value: 20500, tone: 'violet' },
    { name: 'Öztürk Group',      value: 14000, tone: 'mint' }
  ];

  const flowInflows  = [
    { name: 'Sales',    value: 95000 },
    { name: 'Service',  value: 36000 },
    { name: 'Other',    value: 11000 }
  ];
  const flowOutflows = [
    { name: 'Salaries',  value: 56000 },
    { name: 'Suppliers', value: 28000 },
    { name: 'Tax',       value: 18000 },
    { name: 'Other',     value: 12000 }
  ];

  const scatter = [
    { x: 0.15, y: 0.30, value: 5,  label: 'Customer A',  tone: 'cyan'   },
    { x: 0.35, y: 0.20, value: 8,  label: 'Customer B',  tone: 'violet' },
    { x: 0.55, y: 0.40, value: 12, label: 'Customer C',  tone: 'mint'   },
    { x: 0.75, y: 0.60, value: 6,  label: 'Customer D',  tone: 'amber'  },
    { x: 0.30, y: 0.70, value: 10, label: 'Customer E',  tone: 'cyan'   },
    { x: 0.50, y: 0.55, value: 4,  label: 'Customer F',  tone: 'mint'   },
    { x: 0.65, y: 0.25, value: 7,  label: 'Customer G',  tone: 'violet' },
    { x: 0.80, y: 0.45, value: 9,  label: 'Customer H',  tone: 'amber'  },
    { x: 0.20, y: 0.55, value: 3,  label: 'Customer I',  tone: 'cyan'   }
  ];

  const kpis = [
    { id: 'mrr',           label: 'MRR',                 value: 36600, tone: 'cyan',   delta: 48.8, sparkline: sparklineData, format: (n) => `₺${Math.round(n).toLocaleString()}` },
    { id: 'cash_runway',   label: 'Cash Runway',         value: 142,   tone: 'mint',   delta:  5.4, sparkline: [120, 125, 130, 135, 138, 140, 142], format: (n) => `${Math.round(n)} d` },
    { id: 'overdue',       label: 'Overdue Receivables', value: 75500, tone: 'amber',  delta:  -8.1, sparkline: [80000, 78000, 76000, 75500].map((v, i) => v + i * 200), format: (n) => `₺${Math.round(n).toLocaleString()}` },
    { id: 'tax_burden',    label: 'Tax Burden (30d)',    value: 6700,  tone: 'crimson', delta: 0,    format: (n) => `₺${Math.round(n).toLocaleString()}` }
  ];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: CINEMATIC.bg.deepSpace1,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        padding: `${SPACE['3xl']}px ${SPACE['2xl']}px`,
        overflow: 'hidden'
      }}
    >
      <GradientMesh palette="aurora" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: SPACE['4xl'] }}>
          <NeonBadge tone="cyan" size="sm" leading={<Sparkles size={11} />}>Sprint D-1 · Internal</NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            Cinematic Charts
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 660 }}>
            Eight chart specs realised. Every chart accepts a clean, library-agnostic data shape and ships with loading / empty / error states.
          </p>
        </header>

        {/* AuroraChart */}
        <section style={sectionStyle}>
          <span style={labelStyle}>AuroraChart · line/area</span>
          <h2 style={sectionTitle}>Aurora</h2>
          <div style={{ display: 'flex', gap: SPACE.md, marginBottom: SPACE.lg, flexWrap: 'wrap' }}>
            {['data', 'loading', 'empty', 'error'].map((s) => (
              <AuroraButton key={s} variant={auroraState === s ? 'glow' : 'ghost'} size="sm" glow="cyan"
                            onClick={() => setAuroraState(s)}>{s}</AuroraButton>
            ))}
          </div>
          <GlassCard variant="standard">
            <AuroraChart
              data={auroraState === 'data' ? auroraData : []}
              loading={auroraState === 'loading'}
              empty={auroraState === 'empty'}
              error={auroraState === 'error'}
              tone="cyan"
              label="Monthly revenue"
              width={820}
              height={260}
            />
          </GlassCard>
        </section>

        {/* LiquidKPICard row */}
        <section style={sectionStyle}>
          <span style={labelStyle}>LiquidKPICard</span>
          <h2 style={sectionTitle}>Liquid KPI tiles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: SPACE.lg }}>
            {kpis.map((k) => (
              <LiquidKPICard key={k.id} {...k} />
            ))}
          </div>
        </section>

        {/* PulseSparkline severity row */}
        <section style={sectionStyle}>
          <span style={labelStyle}>PulseSparkline · severity</span>
          <h2 style={sectionTitle}>Pulse sparklines</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE['2xl'], alignItems: 'center' }}>
            {['normal', 'warning', 'critical'].map((sev) => (
              <span key={sev} style={{ display: 'inline-flex', alignItems: 'center', gap: SPACE.md }}>
                <PulseSparkline data={sparklineData} severity={sev} width={120} height={36} />
                <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sev}</span>
              </span>
            ))}
          </div>
        </section>

        {/* HolographicDonut */}
        <section style={sectionStyle}>
          <span style={labelStyle}>HolographicDonut</span>
          <h2 style={sectionTitle}>Holographic donut</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE['2xl'] }}>
            <GlassCard variant="standard" style={{ minWidth: 320 }}>
              <HolographicDonut data={donutData} centerSub="Top customer" format={(n) => `₺${Math.round(n).toLocaleString()}`} />
            </GlassCard>
            <GlassCard variant="standard" style={{ minWidth: 320 }}>
              <HolographicDonut data={[]} loading />
            </GlassCard>
          </div>
        </section>

        {/* FlowStream */}
        <section style={sectionStyle}>
          <span style={labelStyle}>FlowStream</span>
          <h2 style={sectionTitle}>Cash flow stream</h2>
          <GlassCard variant="standard">
            <FlowStream inflows={flowInflows} outflows={flowOutflows} width={820} height={300} />
          </GlassCard>
        </section>

        {/* ConstellationMap */}
        <section style={sectionStyle}>
          <span style={labelStyle}>ConstellationMap</span>
          <h2 style={sectionTitle}>Constellation scatter</h2>
          <GlassCard variant="standard">
            <ConstellationMap points={scatter} width={820} height={340} linkRadius={0.30} />
          </GlassCard>
        </section>

        {/* AIInsightCards */}
        <section style={sectionStyle}>
          <span style={labelStyle}>AIInsightCard · severity</span>
          <h2 style={sectionTitle}>AI insight cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: SPACE.lg }}>
            <AIInsightCard
              severity="critical"
              title="Gecikmiş alacaklar yüksek"
              description="3 müşteriden ₺75.500 gecikmiş alacak. En büyük risk Yılmaz Holding (Temmuz)."
              actionLabel="Faturaları aç"
              onAction={() => alert('navigate /sales/invoices?filter=overdue')}
              language="tr"
            />
            <AIInsightCard
              severity="attention"
              title="KDV beyannamesi 17 gün içinde"
              description="₺5.200 KDV ödemesi bekliyor. Hazırlık başlatılmamış."
              actionLabel="Vergi takvimi"
              onAction={() => alert('navigate /tax/calendar')}
              language="tr"
              delay={120}
            />
            <AIInsightCard
              severity="opportunity"
              title="Müşteri sağlığı %67"
              description="2/3 müşteri sağlık skoru ≥70. Yılmaz portföyünde upsell şansı yüksek."
              actionLabel="Skorları gör"
              onAction={() => alert('navigate /customers/score')}
              language="tr"
              delay={240}
            />
          </div>
        </section>

        {/* ConstellationKPIGrid */}
        <section style={sectionStyle}>
          <span style={labelStyle}>ConstellationKPIGrid</span>
          <h2 style={sectionTitle}>Constellation KPI grid</h2>
          <ConstellationKPIGrid kpis={kpis} onSelect={(id) => alert(`select ${id}`)} />
        </section>

        <footer style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textAlign: 'center', padding: SPACE['2xl'] }}>
          /v2/_dev/charts · Sprint D-1 · {new Date().toISOString().slice(0, 10)}
        </footer>
      </div>
    </div>
  );
}

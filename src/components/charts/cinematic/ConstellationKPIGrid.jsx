// ================================================================
// ConstellationKPIGrid — replacement KPI strip rendered as a parallax
// constellation. Each card is a LiquidKPICard, but the grid adds:
//   1. Subtle 3D tilt-on-hover (transform: rotateX/Y based on cursor)
//   2. Per-card stagger via useStagger
//   3. Constellation "thread" lines connecting adjacent cards
//
// Props
//   kpis    Array<{ id, label, value, tone, sparkline?, delta? }>
//   onSelect (id) => void
//   loading boolean
//
// Mobile: stacks single-column; tilt is disabled below 768px (perf +
// no hover state). Threads collapse vertically.
// ================================================================
import { useState, useEffect } from 'react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, toneRgb } from '@/design-system-v2/cinematic/tokens';
import { useStagger } from '@/lib/animations/spring';
import LiquidKPICard from './LiquidKPICard';

export default function ConstellationKPIGrid({
  kpis = [],
  onSelect,
  loading = false
}) {
  const delays = useStagger(kpis.length, 100);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (kpis.length === 0 && !loading) {
    return (
      <div style={{
        padding: 24,
        background: CINEMATIC.glass.tint1,
        border: `1px dashed ${CINEMATIC.glass.border}`,
        borderRadius: RADIUS.xl,
        color: CINEMATIC.text.pearlFaint,
        fontFamily: TYPE_STACK.body,
        textAlign: 'center'
      }}>
        <span style={{ ...TYPE_SCALE.caption, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Henüz KPI yapılandırılmadı
        </span>
      </div>
    );
  }

  // Use a CSS grid with up to 4 columns; rendered cards are LiquidKPICards.
  // The parallax tilt is implemented per-card via onMouseMove on the wrapper.
  return (
    <div style={{ position: 'relative' }}>
      {/* Constellation thread underlay (decorative, on desktop only) */}
      {!isMobile && kpis.length > 1 && (
        <ConstellationThreads count={kpis.length} />
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fit, minmax(220px, 1fr))`,
        gap: 16,
        position: 'relative',
        zIndex: 1
      }}>
        {(loading ? Array.from({ length: 4 }) : kpis).map((k, i) => (
          <TiltWrapper key={k?.id ?? i} disabled={isMobile} delay={delays[i] || 0}>
            {loading ? (
              <LiquidKPICard loading />
            ) : (
              <LiquidKPICard
                value={k.value}
                label={k.label}
                tone={k.tone}
                delta={k.delta}
                sparkline={k.sparkline}
                onClick={onSelect ? () => onSelect(k.id) : undefined}
                format={k.format}
              />
            )}
          </TiltWrapper>
        ))}
      </div>
    </div>
  );
}

function TiltWrapper({ children, disabled, delay = 0 }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top)  / rect.height;  // 0..1
    setTilt({ x: (x - 0.5) * 8, y: (y - 0.5) * -8 }); // up to ±4deg
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        animation: `cn-fade-up 600ms ease ${delay}ms both`,
        perspective: 800
      }}
    >
      <div
        style={{
          transform: `rotateX(${tilt.y.toFixed(2)}deg) rotateY(${tilt.x.toFixed(2)}deg)`,
          transition: 'transform 200ms ease-out',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ConstellationThreads({ count }) {
  // Pure decorative — diagonal pattern between cards.
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      width="100%" height="100%"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="thread-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={`rgba(${toneRgb('cyan')}, 0)`} />
          <stop offset="50%"  stopColor={`rgba(${toneRgb('cyan')}, 0.18)`} />
          <stop offset="100%" stopColor={`rgba(${toneRgb('cyan')}, 0)`} />
        </linearGradient>
      </defs>
      <line x1="10%" y1="50%" x2="90%" y2="50%"
            stroke="url(#thread-grad)" strokeWidth="1" strokeDasharray="4 8" />
    </svg>
  );
}

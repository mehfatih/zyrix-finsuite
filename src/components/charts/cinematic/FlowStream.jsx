// ================================================================
// FlowStream — cash-flow visualization rendered as flowing particle
// rivers between sources and sinks. Inflows = mint, outflows =
// crimson, neutral = cyan.
//
// Props
//   inflows    Array<{ name: string, value: number }>
//   outflows   Array<{ name: string, value: number }>
//   width      number  default 640
//   height     number  default 280
//   loading    boolean
//   empty      boolean
//
// Visual:
//   Left column = inflows, right column = outflows, centre node =
//   net. Each flow is a curved SVG path; particles ride the path
//   left→right (inflow) or top→down→right (outflow). The curves'
//   thickness scales with value share.
// ================================================================
import { useEffect, useMemo, useRef } from 'react';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, toneColor, toneRgb } from '@/design-system-v2/cinematic/tokens';

const PARTICLE_COUNT_PER_FLOW = 6;
const PARTICLE_DT = 0.0028;

export default function FlowStream({
  inflows = [],
  outflows = [],
  width = 640,
  height = 280,
  loading = false,
  empty = false
}) {
  const canvasRef = useRef(null);
  const flowsRef  = useRef([]);

  const layout = useMemo(() => buildLayout(inflows, outflows, width, height), [inflows, outflows, width, height]);

  useEffect(() => {
    if (loading || empty || layout.flows.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    flowsRef.current = layout.flows.map((flow) => ({
      ...flow,
      particles: Array.from({ length: PARTICLE_COUNT_PER_FLOW }, () => ({ t: Math.random() }))
    }));

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw curves first
      for (const f of flowsRef.current) {
        ctx.beginPath();
        const [p0, p1, p2] = f.curve;
        ctx.moveTo(p0[0], p0[1]);
        ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
        ctx.strokeStyle = `rgba(${toneRgb(f.tone)}, 0.18)`;
        ctx.lineWidth = f.thickness;
        ctx.stroke();
      }

      // Draw particles
      for (const f of flowsRef.current) {
        for (const p of f.particles) {
          p.t += PARTICLE_DT;
          if (p.t > 1) p.t -= 1;
          const [x, y] = quadAt(f.curve[0], f.curve[1], f.curve[2], p.t);
          const rgb = toneRgb(f.tone);
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${(0.5 + 0.5 * Math.sin(p.t * Math.PI)).toFixed(3)})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [layout, width, height, loading, empty]);

  if (loading || empty || layout.flows.length === 0) {
    return (
      <div style={{
        width, height,
        display: 'grid', placeItems: 'center',
        background: CINEMATIC.glass.tint1,
        border: `1px dashed ${CINEMATIC.glass.border}`,
        borderRadius: 14,
        color: CINEMATIC.text.pearlFaint,
        fontFamily: TYPE_STACK.body, fontSize: TYPE_SCALE.bodyMd.fontSize
      }}>
        <span style={{ ...TYPE_SCALE.caption, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {loading ? 'Yükleniyor…' : 'Henüz akış verisi yok'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />

      {/* Source / sink labels */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
           style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
           role="img" aria-label="cash flow stream">
        {layout.inflowNodes.map((n, i) => (
          <NodeLabel key={`in-${i}`} x={n.x} y={n.y} name={n.name} value={n.value}
                     tone="mint" align="left" />
        ))}
        <NodeLabel x={layout.center.x} y={layout.center.y}
                   name="Net" value={layout.net} tone="cyan" align="center" big />
        {layout.outflowNodes.map((n, i) => (
          <NodeLabel key={`out-${i}`} x={n.x} y={n.y} name={n.name} value={n.value}
                     tone="crimson" align="right" />
        ))}
      </svg>
    </div>
  );
}

function NodeLabel({ x, y, name, value, tone, align, big }) {
  const fg = toneColor(tone);
  return (
    <g>
      <circle cx={x} cy={y} r={big ? 8 : 5} fill={fg}
              filter={`drop-shadow(0 0 ${big ? 10 : 6}px ${fg})`} />
      <text x={align === 'left' ? x - 14 : align === 'right' ? x + 14 : x}
            y={y - 12}
            textAnchor={align === 'left' ? 'end' : align === 'right' ? 'start' : 'middle'}
            fontFamily={TYPE_STACK.body} fontSize={11}
            fill={CINEMATIC.text.pearlDim}
            letterSpacing="0.04em">{name}</text>
      <text x={align === 'left' ? x - 14 : align === 'right' ? x + 14 : x}
            y={y + (big ? 22 : 18)}
            textAnchor={align === 'left' ? 'end' : align === 'right' ? 'start' : 'middle'}
            fontFamily={TYPE_STACK.display} fontSize={big ? 16 : 12}
            fontWeight={700}
            fill={CINEMATIC.text.pearlWhite}>{formatNum(value)}</text>
    </g>
  );
}

function buildLayout(inflows, outflows, width, height) {
  const totalIn  = inflows.reduce((s, x) => s + x.value, 0);
  const totalOut = outflows.reduce((s, x) => s + x.value, 0);
  const max = Math.max(totalIn, totalOut, 1);

  const inflowNodes = inflows.map((d, i) => ({
    ...d, x: 70, y: 50 + (i * (height - 100)) / Math.max(inflows.length - 1, 1)
  }));
  const outflowNodes = outflows.map((d, i) => ({
    ...d, x: width - 70, y: 50 + (i * (height - 100)) / Math.max(outflows.length - 1, 1)
  }));
  const center = { x: width / 2, y: height / 2 };

  const flows = [
    ...inflowNodes.map((n) => ({
      tone: 'mint',
      thickness: Math.max(2, (n.value / max) * 12),
      curve: [[n.x, n.y], [center.x - 60, n.y], [center.x, center.y]]
    })),
    ...outflowNodes.map((n) => ({
      tone: 'crimson',
      thickness: Math.max(2, (n.value / max) * 12),
      curve: [[center.x, center.y], [center.x + 60, n.y], [n.x, n.y]]
    }))
  ];

  return { flows, inflowNodes, outflowNodes, center, net: totalIn - totalOut };
}

function quadAt(p0, p1, p2, t) {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
  ];
}

function formatNum(n) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

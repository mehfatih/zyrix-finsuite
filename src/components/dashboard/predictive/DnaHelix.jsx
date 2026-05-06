// ================================================================
// DnaHelix — animated double-helix that pulses by trait colors
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getCustomerPalette, getMoneyPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function DnaHelix({ traits = [], height = 220, width = 140 }) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  // Map first 5 traits to colors (one per "rung")
  const palettes = [ai, customer, money, success, alert];
  const colors = traits.slice(0, 5).map((tr, i) => palettes[i % palettes.length]);

  const [t, setT] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => (prev + dt) % 9999);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // 3D helix → 2D projection
  const turns = 3;
  const pointsPerTurn = 22;
  const total = turns * pointsPerTurn;
  const cx = width / 2;
  const amplitude = width * 0.32;

  const helix = (offset) => {
    const pts = [];
    for (let i = 0; i <= total; i++) {
      const y = (i / total) * height;
      const angle = (i / pointsPerTurn) * Math.PI * 2 + t * 1.4 + offset;
      const x = cx + amplitude * Math.sin(angle);
      const z = Math.cos(angle); // -1..1, used for opacity
      pts.push({ x, y, z });
    }
    return pts;
  };

  const strandA = helix(0);
  const strandB = helix(Math.PI);

  const path = (pts) =>
    pts
      .map((p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`))
      .join(" ");

  // Rungs every 6th sample
  const rungs = [];
  for (let i = 0; i < strandA.length; i += 6) {
    const a = strandA[i];
    const b = strandB[i];
    const colorIdx = Math.floor(i / 6) % colors.length;
    const color = colors[colorIdx]?.base || ai.base;
    const opacity = (a.z + 1) / 2;
    rungs.push({ a, b, color, opacity });
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block", maxWidth: width, marginInline: "auto" }}>
      <defs>
        <linearGradient id="dna-strand-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ai.base} />
          <stop offset="100%" stopColor={customer.base} />
        </linearGradient>
        <linearGradient id="dna-strand-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={money.base} />
          <stop offset="100%" stopColor={ai.dark} />
        </linearGradient>
        <radialGradient id="dna-glow">
          <stop offset="0%" stopColor={ai.base} stopOpacity="0.18" />
          <stop offset="100%" stopColor={ai.base} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width={width} height={height} fill="url(#dna-glow)" />
      {/* Rungs */}
      {rungs.map((r, i) => (
        <line
          key={`r-${i}`}
          x1={r.a.x}
          y1={r.a.y}
          x2={r.b.x}
          y2={r.b.y}
          stroke={r.color}
          strokeWidth="2.4"
          opacity={0.35 + r.opacity * 0.55}
          strokeLinecap="round"
        />
      ))}
      {/* Strands */}
      <path d={path(strandA)} fill="none" stroke="url(#dna-strand-a)" strokeWidth="2.8" strokeLinecap="round" />
      <path d={path(strandB)} fill="none" stroke="url(#dna-strand-b)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

// ================================================================
// MoneyCounter — animated ₺ counter with glow + size variant
// Eases from 0 to target on mount and when value changes.
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getBrandPalette, getMoneyPalette } from "../../../utils/dashboardPalette";

export default function MoneyCounter({
  value,
  prefix = "₺",
  suffix = "",
  size = "hero",
  palette,
  lang = "TR",
  durationMs = 2200,
  glow = true,
}) {
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const p = palette || (size === "hero" ? brand : money);

  const [n, setN] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const tick = (t) => {
      const pr = Math.min((t - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - pr, 4);
      setN(target * eased);
      if (pr < 1) rafRef.current = requestAnimationFrame(tick);
      else setN(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs]);

  const sizes = {
    hero: { fontSize: 72, weight: 900, letter: "-0.04em" },
    big:  { fontSize: 48, weight: 900, letter: "-0.03em" },
    mid:  { fontSize: 32, weight: 800, letter: "-0.02em" },
    sm:   { fontSize: 22, weight: 800, letter: "-0.02em" },
  };
  const s = sizes[size] || sizes.mid;

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: s.fontSize,
        fontWeight: s.weight,
        color: p.base,
        letterSpacing: s.letter,
        fontFamily: "monospace",
        lineHeight: 1,
        textShadow: glow ? `0 0 24px ${p.base}40` : "none",
      }}
    >
      {prefix}{Math.round(n).toLocaleString()}{suffix}
    </span>
  );
}

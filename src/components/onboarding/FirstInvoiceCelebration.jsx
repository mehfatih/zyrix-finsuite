// ================================================================
// FirstInvoiceCelebration — confetti burst + outcome summary
// ================================================================
import React, { useEffect, useRef } from "react";
import { getBrandPalette, getSuccessPalette, getAIPalette } from "../../utils/dashboardPalette";

const COLORS = ["#E30A17", "#10B981", "#F59E0B", "#6C3AFF", "#0EA5E9", "#F43F5E", "#FBBF24"];

export default function FirstInvoiceCelebration({
  onDashboard,
  onTour,
  lang = "tr",
  t = (s) => s,
}) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 60,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 12 - 4,
      g: 0.32,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.005;
        if (p.life > 0 && p.y < canvas.height + 30) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "relative", textAlign: "center", padding: "30px 16px", animation: "fcFadeIn .4s ease" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: 360, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 56, marginBottom: 14, animation: "fcBounce 1s ease-out" }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: brand.dark, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          {t("ready.celebration")}
        </h1>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 28px" }}>
          {t("ready.summary")}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={onTour} style={{ background: ai.bg, color: ai.dark, border: `1.5px solid ${ai.base}40`, padding: "14px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {t("ready.cta.tour")}
          </button>
          <button type="button" onClick={onDashboard} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 22px ${success.base}50` }}>
            ⚡ {t("ready.cta.dashboard")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fcFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fcBounce { 0% { transform: translateY(0) scale(1); } 30% { transform: translateY(-30px) scale(1.2); } 60% { transform: translateY(-8px) scale(0.95); } 100% { transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

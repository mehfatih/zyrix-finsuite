// ================================================================
// AdminKpiCard — admin-flavoured KPI tile (smaller, denser)
// ================================================================
import React from "react";

export default function AdminKpiCard({ label, value, delta, trend, palette, icon, sparkline = null, size = "md" }) {
  const p = palette || { bg: "#F1F5F9", base: "#475569", dark: "#0F172A" };
  const isPositive = (delta || 0) >= 0;
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: size === "lg" ? 22 : 16, boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 18 }}>{icon}</div>
        )}
        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      </div>
      <div style={{ fontSize: size === "lg" ? 28 : 22, fontWeight: 900, color: p.dark, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      {delta != null && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, color: isPositive ? "#047857" : "#9F1239" }}>
          {isPositive ? "▲" : "▼"} {Math.abs(delta)}% {trend || ""}
        </div>
      )}
    </div>
  );
}

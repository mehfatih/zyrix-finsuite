// ================================================================
// AdminPagePlaceholder — shared scaffold for admin pages.
// Used by ~50 lower-priority pages so all routes are navigable while
// the deep implementation lands in a follow-up phase.
// ================================================================
import React from "react";
import { ADMIN_BRAND, TRUST_BLUE } from "../../utils/admin/adminPalette";

export default function AdminPagePlaceholder({
  title,
  subtitle,
  icon = "🚧",
  cluster,
  permission,
  features = [],
  status = "scaffold",
}) {
  const brand = ADMIN_BRAND;
  const trust = TRUST_BLUE;

  const statusColor = status === "live" ? { bg: "#DCFCE7", base: "#10B981", dark: "#047857", label: "LIVE" }
                    : status === "beta" ? { bg: "#DBEAFE", base: "#1E40AF", dark: "#1E3A8A", label: "BETA" }
                    : { bg: "#FEF3C7", base: "#F59E0B", dark: "#B45309", label: "SCAFFOLD" };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${brand.bg}, ${brand.base}30)`, color: brand.dark, display: "grid", placeItems: "center", fontSize: 28, border: `1px solid ${brand.base}25` }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>{title}</h1>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999, background: statusColor.bg, color: statusColor.dark, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {statusColor.label}
            </span>
          </div>
          {subtitle && <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{subtitle}</div>}
        </div>
      </div>

      {(cluster || permission) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {cluster && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: "5px 12px", borderRadius: 999, background: brand.bg, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {cluster}
            </span>
          )}
          {permission && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 999, background: trust.bg, color: trust.dark, fontFamily: "ui-monospace, monospace" }}>
              🔑 {permission}
            </span>
          )}
        </div>
      )}

      {features.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <h2 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
            Planned features
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 16, color: brand.dark }}>•</span>
                <span style={{ fontSize: 12, color: "#0F172A", lineHeight: 1.5, fontWeight: 600 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: trust.bg, border: `1px solid ${trust.base}30`, borderRadius: 12, fontSize: 12, color: trust.dark, fontWeight: 700, textAlign: "center" }}>
        ℹ This page is a navigable scaffold. Deep implementation queued for Phase 14b based on your priorities.
      </div>
    </div>
  );
}

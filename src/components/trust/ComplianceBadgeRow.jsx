// ================================================================
// ComplianceBadgeRow — KVKK + GDPR + SOC2 + ISO + PCI badges
// ================================================================
import React from "react";
import { COMPLIANCE_BADGES } from "../../utils/trustPalette";

const ICON = { kvkk: "🇹🇷", gdpr: "🇪🇺", soc2: "📋", iso27001: "🏅", pci: "💳" };

export default function ComplianceBadgeRow({ items = ["kvkk", "gdpr", "soc2", "iso27001"], t = (s) => s, lang = "TR" }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      {items.map((id) => {
        const p = COMPLIANCE_BADGES[id];
        if (!p) return null;
        return (
          <div
            key={id}
            style={{
              background: p.bg,
              border: `1.5px solid ${p.base}40`,
              borderRadius: 14,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 180,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 18 }}>
              {ICON[id]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: p.dark }}>{p.label}</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{t(`trust.compliance.${id}`)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// CertificateBadge — gold trophy badge with skill + level + share
// ================================================================
import React from "react";
import { getWarningPalette, getReportsPalette } from "../../../utils/dashboardPalette";

export default function CertificateBadge({ cert, onShare, t = (s) => s }) {
  const warn = getWarningPalette(); // amber/gold
  const reports = getReportsPalette();
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${warn.bg}, #fff, ${warn.bg})`,
        border: `1.5px solid ${warn.base}50`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        boxShadow: `0 6px 18px ${warn.base}25`,
      }}
      className="cb-row"
    >
      <div
        style={{
          width: 54, height: 54, borderRadius: 14,
          background: `linear-gradient(135deg, ${warn.base}, ${warn.dark})`,
          display: "grid", placeItems: "center",
          fontSize: 26, color: "#fff",
          boxShadow: `0 0 18px ${warn.base}50, inset 0 -4px 8px rgba(0,0,0,0.18)`,
        }}
      >
        🏆
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
          {t(`education.skill.${cert.skill}`)} · Level {cert.level}
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
          Awarded {new Date(cert.awardedAt).toLocaleDateString()}
        </div>
      </div>
      {onShare && (
        <button
          type="button"
          onClick={() => onShare(cert)}
          style={{ background: reports.base, color: "#fff", border: "none", padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}
        >
          🔗 {t("education.certificates.share")}
        </button>
      )}
      <style>{`@media (max-width: 540px) { .cb-row { grid-template-columns: auto 1fr !important; } .cb-row > button { grid-column: span 2; } }`}</style>
    </div>
  );
}

// ================================================================
// TrustFooterStrip — small persistent footer for the dashboard
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";

export default function TrustFooterStrip() {
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  return (
    <div
      style={{
        padding: "10px 16px",
        background: p.bg,
        borderTop: `1px solid ${p.base}30`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        fontSize: 11,
        fontWeight: 700,
        color: p.dark,
        flexWrap: "wrap",
      }}
    >
      <span>🔒 {t("signal.footer")}</span>
      <Link to="/trust" style={{ color: p.dark, textDecoration: "none", fontWeight: 800, borderBottom: `1px solid ${p.dark}50` }}>
        {t("trust.title")} →
      </Link>
    </div>
  );
}

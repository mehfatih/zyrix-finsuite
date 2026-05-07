// ================================================================
// AccountStatusBanner — "🛡 Secured" or "⚠ Enable 2FA" banner
// Dismissible; reappears every 30 days.
// ================================================================
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getSuccessPalette, getWarningPalette } from "../../utils/dashboardPalette";
import { get2FAStatus } from "../../pages/settings/securityApi";

const DISMISS_KEY = "zyrix_2fa_banner_dismissed_at";

export default function AccountStatusBanner() {
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();
  const warn = getWarningPalette();

  const [enabled, setEnabled] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    get2FAStatus().then((s) => setEnabled(!!s?.enabled));
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (at && Date.now() - at < 30 * 86400000) setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  if (enabled === null) return null;

  if (enabled) {
    return (
      <div role="status" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: success.bg, color: success.dark, border: `1px solid ${success.base}40`, borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
        {t("banner.secured")}
      </div>
    );
  }

  if (dismissed) return null;

  const onDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setDismissed(true);
  };

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: warn.bg,
        color: warn.dark,
        border: `1.5px solid ${warn.base}40`,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
        flexWrap: "wrap",
      }}
    >
      <span>{t("banner.enable2fa")}</span>
      <Link to="/settings/2fa" style={{ background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", textDecoration: "none", padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 800, marginInlineStart: "auto" }}>
        {t("banner.enable2fa.action")}
      </Link>
      <button type="button" onClick={onDismiss} aria-label="dismiss" style={{ background: "transparent", color: warn.dark, border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
        {t("banner.dismiss")}
      </button>
    </div>
  );
}

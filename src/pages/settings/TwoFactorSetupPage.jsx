// ================================================================
// /settings/2fa — 2FA enrollment + management
// ================================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import TwoFactorWizard from "../../components/trust/TwoFactorWizard";
import { get2FAStatus, disable2FA } from "./securityApi";

export default function TwoFactorSetupPage() {
  const t = useDashboardI18n("security");
  const navigate = useNavigate();
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const [status, setStatus] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { get2FAStatus().then(setStatus); }, []);

  const onComplete = () => {
    setShowWizard(false);
    get2FAStatus().then(setStatus);
  };

  const onDisable = async () => {
    if (!window.confirm(t("twofa.disable.confirm"))) return;
    setBusy(true);
    await disable2FA();
    setStatus({ enabled: false });
    setBusy(false);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("twofa.title")} subtitle={t("twofa.subtitle")} icon="🛡" palette={p} />

      {!status ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading") || "…"}</div>
      ) : status.enabled && !showWizard ? (
        <div style={{ background: "#fff", border: `1.5px solid ${success.base}40`, borderRadius: 16, padding: 24, maxWidth: 540, margin: "0 auto", boxShadow: `0 4px 14px ${success.base}15` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: success.bg, color: success.dark, display: "grid", placeItems: "center", fontSize: 28 }}>✓</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: success.dark, margin: "0 0 2px" }}>{t("twofa.success.title")}</h2>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>{t(`twofa.method.${status.method || "totp"}`)}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#0F172A", margin: "0 0 18px", lineHeight: 1.6 }}>{t("twofa.success.body")}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setShowWizard(true)} style={{ background: p.bg, color: p.dark, border: `1px solid ${p.base}40`, padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
              ↻ Re-configure
            </button>
            <button type="button" onClick={onDisable} disabled={busy} style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}>
              {t("twofa.disable.button")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <TwoFactorWizard onComplete={onComplete} t={t} />
        </div>
      )}
    </div>
  );
}

// ================================================================
// TrustSignalBanner — above-fold trust signals for the trust hero
// ================================================================
import React from "react";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import SecurityBadge from "./SecurityBadge";

export default function TrustSignalBanner({ t = (s) => s }) {
  const p = TRUST_PALETTE;
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
      <SecurityBadge icon="🔒" size="lg">{t("signal.encrypted")}</SecurityBadge>
      <SecurityBadge icon="✓" size="lg">{t("signal.kvkk")}</SecurityBadge>
      <SecurityBadge icon="✓" size="lg">{t("signal.gdpr")}</SecurityBadge>
      <SecurityBadge icon="🛡" size="lg">{t("signal.bankgrade")}</SecurityBadge>
    </div>
  );
}

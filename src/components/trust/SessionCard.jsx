// ================================================================
// SessionCard — single device row with last-seen + revoke
// ================================================================
import React from "react";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";
import { fmtRelativeTime, fmtDate } from "../../utils/format";

const ICON = { desktop: "🖥", mobile: "📱", tablet: "📱" };

export default function SessionCard({ session, onRevoke, t = (s) => s, lang = "TR" }) {
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const isCurrent = session.current;
  const dev = session.deviceInfo || {};

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
        padding: 16,
        background: "#fff",
        border: `1.5px solid ${isCurrent ? success.base + "60" : "#E2E8F0"}`,
        borderRadius: 14,
        marginBottom: 10,
        boxShadow: isCurrent ? `0 4px 14px ${success.base}20` : "0 2px 6px rgba(15,23,42,0.04)",
      }}
      className="sc-row"
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 22 }}>
        {ICON[dev.deviceType] || "🖥"}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 13, color: "#0F172A" }}>{dev.browser} · {dev.os}</strong>
          {isCurrent && (
            <span style={{ fontSize: 9, fontWeight: 800, color: success.dark, background: success.bg, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("sessions.current")}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#64748B" }}>
          📍 {session.location || "—"} · {session.ipAddress || "—"} · {t("sessions.lastActive", { time: fmtRelativeTime(session.lastActiveAt, { lang }) })}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
          Started: {fmtDate(session.createdAt, { lang })}
        </div>
      </div>
      {!isCurrent && (
        <button type="button" onClick={() => onRevoke?.(session)} style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
          {t("sessions.revoke")}
        </button>
      )}
      <style>{`@media (max-width: 540px) { .sc-row { grid-template-columns: 1fr !important; text-align: start; } }`}</style>
    </div>
  );
}

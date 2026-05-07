// ================================================================
// AuditLogTable — filterable + exportable activity log
// ================================================================
import React, { useState } from "react";
import { fmtDateTime } from "../../utils/format";
import { TRUST_PALETTE } from "../../utils/trustPalette";

const ACTION_PALETTE = {
  "invoice.created":    { bg: "#DCFCE7", dark: "#047857" },
  "invoice.updated":    { bg: "#DBEAFE", dark: "#1E40AF" },
  "invoice.deleted":    { bg: "#FFE4E6", dark: "#9F1239" },
  "customer.created":   { bg: "#DCFCE7", dark: "#047857" },
  "customer.updated":   { bg: "#DBEAFE", dark: "#1E40AF" },
  "customer.deleted":   { bg: "#FFE4E6", dark: "#9F1239" },
  "login.success":      { bg: "#DBEAFE", dark: "#1E40AF" },
  "login.failed":       { bg: "#FFE4E6", dark: "#9F1239" },
  "security.2fa.enabled": { bg: "#DBEAFE", dark: "#1E3A8A" },
  "export.created":     { bg: "#FFF8E5", dark: "#B45309" },
  "bank.connected":     { bg: "#DCFCE7", dark: "#047857" },
  "profile.updated":    { bg: "#F3EFFF", dark: "#5B21B6" },
  "support.ticket.created": { bg: "#FFE4E6", dark: "#9F1239" },
};

export default function AuditLogTable({ items = [], t = (s) => s, lang = "TR" }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = items.filter((i) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      i.action.toLowerCase().includes(term) ||
      String(i.resourceType || "").toLowerCase().includes(term) ||
      String(i.resourceId || "").toLowerCase().includes(term) ||
      String(i.ipAddress || "").toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("audit.search")}
          style={{ flex: 1, minWidth: 240, padding: "10px 14px", border: `1px solid ${TRUST_PALETTE.base}30`, borderRadius: 10, fontSize: 13, fontFamily: "inherit" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 36, textAlign: "center", color: "#94A3B8", background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0" }}>{t("audit.empty")}</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, padding: "10px 16px", background: "#F8FAFC", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }} className="alt-head">
            <span>{t("audit.col.time")}</span>
            <span>{t("audit.col.action")}</span>
            <span>{t("audit.col.resource")}</span>
            <span>{t("audit.col.ip")}</span>
          </div>
          {filtered.map((i, idx) => {
            const p = ACTION_PALETTE[i.action] || { bg: "#F1F5F9", dark: "#334155" };
            const isExpanded = expanded === i.id;
            return (
              <div key={i.id || idx}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : i.id)}
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 16px",
                    background: idx % 2 ? "#F8FAFC" : "#fff",
                    border: "none",
                    borderTop: idx > 0 ? "1px solid #F1F5F9" : "none",
                    cursor: "pointer",
                    textAlign: "start",
                  }}
                  className="alt-row"
                >
                  <span style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap", fontFamily: "ui-monospace, monospace" }}>
                    {fmtDateTime(i.createdAt, { lang })}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: p.dark, background: p.bg, padding: "3px 8px", borderRadius: 999, justifySelf: "start" }}>
                    {i.action}
                  </span>
                  <span style={{ fontSize: 11, color: "#0F172A", fontFamily: "ui-monospace, monospace" }}>
                    {i.resourceId || i.resourceType || "—"}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748B", fontFamily: "ui-monospace, monospace" }}>
                    {i.ipAddress || "—"}
                  </span>
                </button>
                {isExpanded && (
                  <pre style={{ margin: 0, padding: "12px 16px", background: "#0F172A", color: "#A5F3FC", fontSize: 10, fontFamily: "ui-monospace, monospace", borderTop: "1px solid #1E293B", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {JSON.stringify(i, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@media (max-width: 720px) {
        .alt-head, .alt-row { grid-template-columns: 1fr auto !important; }
        .alt-head > *:nth-child(3), .alt-head > *:nth-child(4),
        .alt-row > *:nth-child(3), .alt-row > *:nth-child(4) { display: none !important; }
      }`}</style>
    </div>
  );
}

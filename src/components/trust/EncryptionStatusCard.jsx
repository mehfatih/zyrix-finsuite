// ================================================================
// EncryptionStatusCard — visible "AES-256 / TLS 1.3" status grid
// ================================================================
import React from "react";
import { TRUST_PALETTE } from "../../utils/trustPalette";

const ROWS = [
  { id: "atRest",    icon: "🔒" },
  { id: "inTransit", icon: "📡" },
  { id: "passwords", icon: "🔑" },
  { id: "2fa",       icon: "🛡" },
];

export default function EncryptionStatusCard({ t = (s) => s }) {
  const p = TRUST_PALETTE;
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 16, padding: 22 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: p.dark, margin: "0 0 14px" }}>
        {t("trust.encryption.title")}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {ROWS.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: p.bg, borderRadius: 10, border: `1px solid ${p.base}30` }}>
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: p.dark }}>{t(`trust.encryption.${r.id}`)}</div>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>{t(`trust.encryption.${r.id}.desc`)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

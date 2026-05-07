// ================================================================
// FieldMappingTable — source col → FinSuite field with confidence
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette } from "../../utils/dashboardPalette";
import { flatFieldList } from "../../utils/migration/fieldMatcher";

const CONF_PALETTE = (success, warn, alert) => ({
  high: success, medium: warn, low: alert,
});

export default function FieldMappingTable({ mappings, onChange, t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const palettes = CONF_PALETTE(success, warn, alert);
  const allFields = flatFieldList();

  const update = (idx, patch) => {
    const next = mappings.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    onChange?.(next);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 500, fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            <Th>{t("mapping.source")}</Th>
            <Th>{t("mapping.target")}</Th>
            <Th>Confidence</Th>
            <Th>Include</Th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m, i) => {
            const p = palettes[m.level] || alert;
            return (
              <tr key={m.sourceHeader + i} style={{ background: i % 2 ? "#F8FAFC" : "#fff" }}>
                <Td><strong style={{ color: "#0F172A" }}>{m.sourceHeader}</strong></Td>
                <Td>
                  <select
                    value={m.finsuiteKey || ""}
                    onChange={(e) => update(i, { finsuiteKey: e.target.value || null, level: e.target.value ? "high" : "low", confidence: e.target.value ? 1 : 0 })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }}
                  >
                    <option value="">— {t("mapping.skip")} —</option>
                    {allFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </Td>
                <Td>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {t(`mapping.confidence.${m.level}`)}
                  </span>
                </Td>
                <Td>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={m.include} onChange={(e) => update(i, { include: e.target.checked })} />
                  </label>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ padding: "10px 12px", textAlign: "start", color: "#64748B", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E2E8F0" }}>{children}</th>;
}
function Td({ children }) {
  return <td style={{ padding: "10px 12px", color: "#0F172A", borderBottom: "1px solid #F1F5F9" }}>{children}</td>;
}

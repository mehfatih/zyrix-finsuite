// ================================================================
// ValidationErrorList — row-level validation issue table
// ================================================================
import React from "react";
import { getAlertPalette, getWarningPalette, getSuccessPalette } from "../../utils/dashboardPalette";
import { ERROR_LABELS } from "../../utils/migration/validator";

export default function ValidationErrorList({ result, lang = "TR", t = (s) => s }) {
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const success = getSuccessPalette();
  const labels = ERROR_LABELS[lang] || ERROR_LABELS.EN;

  if (!result) return null;
  const { issues, errorCount, warningCount, canImport, rowCount } = result;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Stat label={t("validate.errors", { n: errorCount })}   value={errorCount}   palette={alert} icon="🚨" />
        <Stat label={t("validate.warnings", { n: warningCount })} value={warningCount} palette={warn} icon="⚠️" />
        <Stat label={`${rowCount} rows`} value={rowCount} palette={success} icon="📊" />
      </div>

      <div style={{ background: canImport ? success.bg : alert.bg, color: canImport ? success.dark : alert.dark, border: `1.5px solid ${canImport ? success.base : alert.base}40`, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, fontWeight: 800, textAlign: "center" }}>
        {canImport ? `✓ ${t("validate.canImport")}` : `⚠ ${t("validate.cantImport")}`}
      </div>

      {issues.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", color: "#94A3B8", background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0" }}>
          🎉 No issues
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", maxHeight: 360, overflowY: "auto" }}>
          {issues.slice(0, 100).map((iss, i) => {
            const p = iss.kind === "error" ? alert : warn;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: "8px 14px", borderBottom: i < issues.length - 1 ? "1px solid #F1F5F9" : "none", background: i % 2 ? "#F8FAFC" : "#fff" }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: p.bg, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {iss.kind}
                </span>
                <div style={{ fontSize: 12, color: "#0F172A" }}>
                  <strong>{t("validate.row", { n: iss.rowIndex })}</strong> · <code style={{ background: "#F1F5F9", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{iss.column}</code> · {labels[iss.code] || iss.code}
                  {iss.detail && <span style={{ color: "#94A3B8", marginInlineStart: 6 }}>({iss.detail})</span>}
                </div>
              </div>
            );
          })}
          {issues.length > 100 && (
            <div style={{ padding: 14, textAlign: "center", color: "#94A3B8", fontSize: 11 }}>
              + {issues.length - 100} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, palette, icon }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "10px 12px", borderRadius: 12 }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{icon} {label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: palette.dark, marginTop: 4, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

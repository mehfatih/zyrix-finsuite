// ================================================================
// CommandSuggestionCard — toggle-able voice command with example
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette, resolvePalette } from "../../../utils/dashboardPalette";

export default function CommandSuggestionCard({
  command,
  enabled = false,
  onToggle,
  onCustomize,
  palette,
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const p = resolvePalette(palette || ai);

  return (
    <div
      style={{
        background: enabled ? `linear-gradient(135deg, ${success.bg}, #fff)` : "#fff",
        border: `1.5px solid ${enabled ? success.base + "50" : "#E2E8F0"}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        transition: "all .2s",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }} className="cmd-row">
        <div
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: enabled ? `linear-gradient(135deg, ${success.bg}, ${success.base}30)` : "#F1F5F9",
            color: enabled ? success.dark : "#64748B",
            display: "grid", placeItems: "center", fontSize: 20,
            border: `1px solid ${enabled ? success.base + "30" : "#E2E8F0"}`,
          }}
        >
          {command.icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>
            {t(command.titleKey)}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>
            {t(command.exampleKey)}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("voice.cmd.languages")}:
            </span>
            {(command.languages || ["TR", "EN", "AR"]).map((l) => (
              <span key={l} style={{ fontSize: 9, fontWeight: 800, background: ai.bg, color: ai.dark, padding: "2px 6px", borderRadius: 999, letterSpacing: "0.04em" }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }} className="cmd-actions">
          <button
            type="button"
            onClick={() => onToggle?.(command)}
            role="switch"
            aria-checked={enabled}
            style={{
              width: 48, height: 26, borderRadius: 999,
              background: enabled ? `linear-gradient(135deg, ${success.base}, ${success.dark})` : "#CBD5E1",
              border: "none", position: "relative", cursor: "pointer",
              transition: "all .2s",
            }}
          >
            <span
              style={{
                position: "absolute", top: 3, [enabled ? "right" : "left"]: 3,
                width: 20, height: 20, borderRadius: "50%",
                background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                transition: "all .2s",
              }}
            />
          </button>
          {onCustomize && enabled && (
            <button
              type="button"
              onClick={() => onCustomize(command)}
              style={{ background: "transparent", color: p.dark, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "2px 4px" }}
            >
              {t("voice.cmd.customize")}
            </button>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 540px) { .cmd-row { grid-template-columns: auto 1fr !important; } .cmd-actions { grid-column: span 2; flex-direction: row !important; justify-content: flex-end; } }`}</style>
    </div>
  );
}

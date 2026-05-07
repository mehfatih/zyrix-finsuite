// ================================================================
// NudgeABTest — winner combinations bar chart (top-N)
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette, getReportsPalette, paletteSequence } from "../../../utils/dashboardPalette";

export default function NudgeABTest({
  results = [],
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();

  if (!results || results.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
        {t("nudge.ab.empty")}
      </div>
    );
  }

  const max = Math.max(...results.map((r) => r.responseRate), 0.01);
  const palettes = paletteSequence(results.length, { exclude: ["wine"], startIdx: 4 });

  return (
    <div>
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("nudge.ab.winner")}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: success.dark, marginTop: 2 }}>
            {results[0].label} — {Math.round(results[0].responseRate * 100)}%
          </div>
        </div>
        <span style={{ fontSize: 10, color: ai.dark, fontWeight: 800, background: ai.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {results.length} {t("nudge.ab.tested")}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((r, i) => {
          const w = (r.responseRate / max) * 100;
          const p = palettes[i] || reports;
          const winner = i === 0;
          return (
            <div key={r.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {winner && <span title="winner" style={{ fontSize: 12 }}>🏆</span>}
                  <span style={{ background: p.bg, color: p.dark, padding: "2px 6px", borderRadius: 6, fontWeight: 800, fontSize: 10 }}>#{r.rank}</span>
                  {r.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: p.dark, fontFamily: "monospace" }}>
                  {Math.round(r.responseRate * 100)}%
                </span>
              </div>
              <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${w}%`, height: "100%",
                    background: `linear-gradient(90deg, ${p.base}, ${p.dark})`,
                    borderRadius: 999,
                    boxShadow: winner ? `0 0 12px ${p.base}80` : "none",
                    transition: "width .8s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                {r.sample} samples
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

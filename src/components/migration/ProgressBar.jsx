// ================================================================
// ProgressBar — migration progress with done/total + ETA
// ================================================================
import React from "react";
import { getBrandPalette, getSuccessPalette } from "../../utils/dashboardPalette";

export default function ProgressBar({ done, total, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = done >= total && total > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>
          {t("run.progress", { done, total })}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: complete ? success.dark : brand.dark, fontFamily: "monospace" }}>{pct}%</span>
      </div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 14, background: "#F1F5F9", borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(15,23,42,0.06)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: complete ? `linear-gradient(90deg, ${success.base}, ${success.dark})` : `linear-gradient(90deg, ${brand.base}, ${brand.dark})`,
            borderRadius: 999,
            transition: "width .25s ease",
            boxShadow: complete ? `0 0 16px ${success.base}80` : `0 0 12px ${brand.base}60`,
          }}
        />
      </div>
    </div>
  );
}

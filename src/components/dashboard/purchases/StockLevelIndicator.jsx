// ================================================================
// StockLevelIndicator — pill: Out / Low / Healthy / Excess
// Logic: out=qty<=0, low=qty<=min, excess=qty>=min*5, else healthy.
// ================================================================
import React from "react";
import { getPaletteById } from "../../../utils/dashboardPalette";

export function classifyStock(qty, min) {
  const q = Number(qty) || 0;
  const m = Number(min) || 0;
  if (q <= 0) return "OUT";
  if (m > 0 && q <= m) return "LOW";
  if (m > 0 && q >= m * 5) return "EXCESS";
  return "HEALTHY";
}

const LEVEL_PALETTE = {
  OUT:     "rose",
  LOW:     "amber",
  HEALTHY: "emerald",
  EXCESS:  "indigo",
};

const LEVEL_LABEL = {
  OUT:     { TR: "Tükendi", EN: "Out",     AR: "نفد" },
  LOW:     { TR: "Düşük",   EN: "Low",     AR: "منخفض" },
  HEALTHY: { TR: "Sağlıklı",EN: "Healthy", AR: "صحي" },
  EXCESS:  { TR: "Fazla",   EN: "Excess",  AR: "زائد" },
};

export default function StockLevelIndicator({ qty, min, lang = "TR", showQty = true, size = "normal" }) {
  const level = classifyStock(qty, min);
  const p = getPaletteById(LEVEL_PALETTE[level]);
  const labelMap = LEVEL_LABEL[level];
  const label = labelMap[lang] || labelMap.EN;
  const padding = size === "compact" ? "2px 8px" : "4px 10px";
  const fontSize = size === "compact" ? 10 : 11;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: `${p.base}15`,
        color: p.dark,
        border: `1px solid ${p.base}30`,
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: p.base,
          flexShrink: 0,
        }}
      />
      {label}
      {showQty && <span style={{ opacity: 0.65 }}>· {Number(qty) || 0}</span>}
    </span>
  );
}

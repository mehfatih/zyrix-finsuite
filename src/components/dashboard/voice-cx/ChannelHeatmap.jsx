// ================================================================
// ChannelHeatmap — channel × time-slot response rate matrix
// ================================================================
import React from "react";
import { getAIPalette, getSuccessPalette } from "../../../utils/dashboardPalette";

export default function ChannelHeatmap({
  data,
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const success = getSuccessPalette();

  if (!data || !data.matrix?.length) return null;
  const { channels, slots, matrix } = data;

  const cellColor = (v) => {
    // 0 → light, 1 → success.base
    const a = Math.max(0.05, v);
    return `rgba(16, 185, 129, ${a})`;
  };

  return (
    <div>
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 4, fontSize: 11, fontFamily: "system-ui, sans-serif", minWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ padding: 6 }}></th>
              {slots.map((s) => (
                <th key={s} style={{ padding: "4px 6px", color: "#64748B", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((ch, i) => (
              <tr key={ch}>
                <td style={{ padding: "4px 8px", color: ai.dark, fontWeight: 800, fontSize: 11, textAlign: "right" }}>
                  {t(`nudge.channel.${ch}`)}
                </td>
                {matrix[i].map((v, j) => {
                  const pct = Math.round(v * 100);
                  const isMax = pct >= 85;
                  return (
                    <td
                      key={j}
                      title={`${ch} — ${slots[j]}: ${pct}%`}
                      style={{
                        background: cellColor(v),
                        width: 38, height: 30,
                        borderRadius: 6,
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: pct > 50 ? "#fff" : "#0F172A",
                        cursor: "default",
                        boxShadow: isMax ? `0 0 0 2px ${success.base}` : "none",
                      }}
                    >
                      {pct}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 10, color: "#64748B", fontWeight: 700 }}>
        <span>0%</span>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: "linear-gradient(90deg, rgba(16,185,129,0.05), rgba(16,185,129,1))" }} />
        <span>100%</span>
      </div>
    </div>
  );
}

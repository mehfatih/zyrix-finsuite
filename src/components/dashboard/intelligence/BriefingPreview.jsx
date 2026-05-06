// ================================================================
// BriefingPreview — WhatsApp-style message bubble preview
// ================================================================
import React from "react";
import { getPaletteById, getAIPalette } from "../../../utils/dashboardPalette";

export default function BriefingPreview({
  greeting,
  lines = [],
  closer,
  channel = "WHATSAPP",
}) {
  const wa = getPaletteById("emerald");
  const email = getPaletteById("cyan");
  const sms = getPaletteById("purple");
  const palette = channel === "EMAIL" ? email : channel === "SMS" ? sms : wa;
  const ai = getAIPalette();

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #ECE5DD, ${palette.bg})`,
        borderRadius: 18,
        padding: "20px 22px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: palette.base,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 18,
          }}
        >
          {channel === "EMAIL" ? "✉️" : channel === "SMS" ? "📱" : "💬"}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
            {channel === "EMAIL" ? "Email Preview" : channel === "SMS" ? "SMS Preview" : "WhatsApp Preview"}
          </div>
          <div style={{ fontSize: 10, color: ai.dark, fontWeight: 700 }}>🤖 AI-generated</div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px 16px 16px 4px",
          padding: "14px 16px",
          boxShadow: `0 2px 8px rgba(0,0,0,.05)`,
          maxWidth: 480,
          fontSize: 13,
          color: "#0F172A",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          position: "relative",
        }}
      >
        {greeting && (
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{greeting}</div>
        )}
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            {line}
          </div>
        ))}
        {closer && (
          <div style={{ marginTop: 8, fontWeight: 600, color: palette.dark }}>{closer}</div>
        )}
        <div style={{ marginTop: 10, fontSize: 10, color: "#94A3B8", textAlign: "end" }}>
          08:00 · ✓✓
        </div>
      </div>
    </div>
  );
}

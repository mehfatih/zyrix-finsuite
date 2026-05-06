// ================================================================
// ConversationBubble — channel-colored chat message
// ================================================================
import React from "react";
import { getPaletteById, getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export const CHANNEL_PALETTE = {
  WHATSAPP:  "emerald",
  EMAIL:     "cyan",
  PHONE:     "amber",
  SMS:       "purple",
  INSTAGRAM: "rose",
  TRENDYOL:  "orange",
  PORTAL:    "indigo",
};

export const CHANNEL_ICON = {
  WHATSAPP: "💬",
  EMAIL: "✉️",
  PHONE: "📞",
  SMS: "📱",
  INSTAGRAM: "📷",
  TRENDYOL: "🛒",
  PORTAL: "🌐",
};

export default function ConversationBubble({ message, channel = "WHATSAPP", lang = "TR" }) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const palette = getPaletteById(CHANNEL_PALETTE[channel] || "emerald");
  const isCustomer = message.from === "customer";
  const isAi = message.from === "ai";
  const align = isCustomer ? "flex-start" : "flex-end";

  let bubbleStyles;
  if (isCustomer) {
    bubbleStyles = {
      background: "#fff",
      color: "#0F172A",
      border: `1px solid ${palette.base}30`,
      borderRadius: "16px 16px 16px 4px",
    };
  } else if (isAi) {
    bubbleStyles = {
      background: `linear-gradient(135deg, ${ai.bg}, ${ai.base}25)`,
      color: ai.dark,
      border: `1px solid ${ai.base}40`,
      borderRadius: "16px 16px 4px 16px",
    };
  } else {
    bubbleStyles = {
      background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
      color: "#fff",
      borderRadius: "16px 16px 4px 16px",
    };
  }

  const time = message.at ? new Date(message.at).toLocaleTimeString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div style={{ display: "flex", justifyContent: align, marginBottom: 10 }}>
      {isCustomer && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: palette.base,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            marginInlineEnd: 8,
            flexShrink: 0,
            alignSelf: "flex-end",
          }}
        >
          {CHANNEL_ICON[channel]}
        </div>
      )}
      <div style={{ maxWidth: "78%" }}>
        <div
          style={{
            ...bubbleStyles,
            padding: "10px 14px",
            fontSize: 13,
            lineHeight: 1.5,
            boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            wordBreak: "break-word",
          }}
        >
          {isAi && (
            <div style={{ fontSize: 9, fontWeight: 800, color: ai.dark, opacity: 0.8, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🤖 AI Agent
            </div>
          )}
          {message.text}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, textAlign: isCustomer ? "start" : "end" }}>
          {time}
          {message.aiHandled && (
            <span style={{ marginInlineStart: 6, color: ai.base, fontWeight: 700 }}>· AI handled ✓</span>
          )}
        </div>
      </div>
      {!isCustomer && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isAi ? ai.base : brand.base,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            marginInlineStart: 8,
            flexShrink: 0,
            alignSelf: "flex-end",
          }}
        >
          {isAi ? "🤖" : "👤"}
        </div>
      )}
    </div>
  );
}

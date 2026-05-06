// ================================================================
// ChannelInbox — sidebar list of conversations across channels
// ================================================================
import React from "react";
import { getPaletteById, getCustomerPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import { CHANNEL_PALETTE, CHANNEL_ICON } from "./ConversationBubble";

const SENTIMENT_PALETTE = { positive: "emerald", neutral: "indigo", negative: "rose" };

export default function ChannelInbox({
  conversations = [],
  activeId,
  onSelect,
  lang = "TR",
  t = (s) => s,
}) {
  const customer = getCustomerPalette();
  const alert = getAlertPalette();

  if (conversations.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
        {t("list.empty")}
      </div>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 600, overflowY: "auto" }}>
      {conversations.map((c) => {
        const palette = getPaletteById(CHANNEL_PALETTE[c.channel] || "indigo");
        const sentPalette = getPaletteById(SENTIMENT_PALETTE[c.sentiment] || "indigo");
        const active = c.id === activeId;
        const minsAgo = Math.max(0, Math.round((Date.now() - new Date(c.timestamp).getTime()) / 60000));
        const ago = minsAgo < 60 ? `${minsAgo}m` : minsAgo < 1440 ? `${Math.round(minsAgo / 60)}h` : `${Math.round(minsAgo / 1440)}d`;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect && onSelect(c)}
              style={{
                width: "100%",
                background: active ? `${palette.base}10` : "transparent",
                borderInlineStart: active ? `3px solid ${palette.base}` : "3px solid transparent",
                border: "none",
                borderBottom: "1px solid #F1F5F9",
                padding: "10px 12px",
                cursor: "pointer",
                textAlign: "start",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                position: "relative",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: palette.base,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {c.avatar || (c.customerName || "?")[0].toUpperCase()}
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    insetInlineEnd: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    border: `2px solid ${palette.base}`,
                    color: palette.dark,
                    fontSize: 9,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {CHANNEL_ICON[c.channel] || "•"}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: c.unread ? 800 : 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    {c.customerName}
                  </span>
                  <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>{ago}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                  {c.lastMessage}
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                  {c.tag && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: customer.bg, color: customer.dark }}>
                      {t(`tag.${c.tag}`)}
                    </span>
                  )}
                  {c.urgency >= 4 && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: alert.base, color: "#fff" }}>
                      ⚡ {c.urgency}/5
                    </span>
                  )}
                  {c.sentiment && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: sentPalette.base,
                        marginInlineStart: 2,
                      }}
                      title={t(`sentiment.${c.sentiment}`)}
                    />
                  )}
                </div>
              </div>
              {c.unread && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    insetInlineEnd: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: palette.base,
                  }}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

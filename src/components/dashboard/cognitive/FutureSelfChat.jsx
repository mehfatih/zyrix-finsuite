// ================================================================
// FutureSelfChat — conversation UI with future-self bubbles
// ================================================================
import React, { useEffect, useRef } from "react";
import { getAIPalette, getCustomerPalette } from "../../../utils/dashboardPalette";

export default function FutureSelfChat({ messages = [], lang = "TR" }) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const fmtTime = (d) => {
    if (!d) return "";
    try {
      const locale = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
      return new Date(d).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  return (
    <div style={{ maxHeight: 480, overflowY: "auto", padding: 4 }}>
      {messages.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
          Start the conversation by asking a question above.
        </div>
      ) : (
        messages.map((m, i) => {
          const isYou = m.from === "you";
          const palette = isYou ? customer : ai;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isYou ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{ maxWidth: "78%", textAlign: "start" }}>
                <div
                  style={{
                    background: isYou ? "#fff" : `linear-gradient(135deg, ${ai.bg}, ${ai.base}25)`,
                    color: "#0F172A",
                    border: `1.5px solid ${palette.base}30`,
                    borderRadius: isYou ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "12px 16px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    boxShadow: `0 4px 14px ${palette.base}15`,
                  }}
                >
                  {!isYou && (
                    <div style={{ fontSize: 9, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      🔮 Future Self
                    </div>
                  )}
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, textAlign: isYou ? "end" : "start" }}>
                  {fmtTime(m.at)}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}

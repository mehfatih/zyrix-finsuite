// ================================================================
// StrategyRecommendations — chat-style AI strategic moves
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export default function StrategyRecommendations({
  messages = [],
  onSend,
  thinking = false,
  starters = [],
  onStarter,
  lang = "tr",
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput("");
  };

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${ai.base}30`, borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", height: 460 }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, background: `linear-gradient(180deg, ${ai.bg} 0%, #fff 30%)` }}>
        {messages.length === 0 && starters.length > 0 && (
          <div style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
              {t("cofounder.chat.starter")}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {starters.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onStarter?.(s)}
                  style={{
                    background: ai.bg, color: ai.dark, border: `1px solid ${ai.base}40`,
                    padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} message={m} ai={ai} brand={brand} />
        ))}

        {thinking && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: ai.bg, border: `1px solid ${ai.base}30`, borderRadius: 14, marginBottom: 10 }}>
            <Dots color={ai.base} />
            <span style={{ fontSize: 12, color: ai.dark, fontWeight: 700 }}>{t("cofounder.chat.thinking")}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, padding: 14, borderTop: "1px solid #F1F5F9", background: "#fff", alignItems: "center" }} className="sr-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("cofounder.chat.placeholder")}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <button type="button" title="voice" style={{ background: ai.bg, color: ai.dark, border: `1px solid ${ai.base}40`, padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
          🎙
        </button>
        <button
          type="button"
          onClick={send}
          style={{ background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${ai.base}40` }}
        >
          {t("cofounder.chat.send")}
        </button>
      </div>
      <style>{`@media (max-width: 540px) { .sr-input-row { grid-template-columns: 1fr auto !important; } .sr-input-row button:nth-of-type(1) { display: none; } }`}</style>
    </div>
  );
}

function Bubble({ message, ai, brand }) {
  const isAI = message.role === "ai";
  return (
    <div style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end", marginBottom: 10 }}>
      <div
        style={{
          maxWidth: "82%",
          background: isAI ? "#fff" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          color: isAI ? "#0F172A" : "#fff",
          border: isAI ? `1px solid ${ai.base}25` : "none",
          padding: "10px 14px",
          borderRadius: isAI ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
          fontSize: 13,
          lineHeight: 1.55,
          boxShadow: isAI ? "0 2px 8px rgba(15,23,42,0.04)" : `0 6px 14px ${brand.base}40`,
          whiteSpace: "pre-wrap",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

function Dots({ color }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `srDot 1.2s ${i * 0.15}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes srDot { 0%,80%,100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }`}</style>
    </div>
  );
}

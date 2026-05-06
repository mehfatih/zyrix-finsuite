// ================================================================
// AISearchBar — natural language input with typing animation + chips
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette } from "../../../utils/dashboardPalette";

export default function AISearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "",
  examples = [],
  loading = false,
  interpretation,
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const inputRef = useRef(null);
  const [hint, setHint] = useState("");

  // Cycle the placeholder hint through examples when input is empty
  useEffect(() => {
    if (value || examples.length === 0) return;
    let i = 0;
    setHint(examples[0]);
    const id = setInterval(() => {
      i = (i + 1) % examples.length;
      setHint(examples[i]);
    }, 3500);
    return () => clearInterval(id);
  }, [value, examples]);

  return (
    <div>
      <div
        style={{
          position: "relative",
          background: "#fff",
          border: `2px solid ${ai.base}40`,
          borderRadius: 18,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: `0 8px 28px ${ai.base}15`,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 18,
            flexShrink: 0,
            animation: loading ? "asbPulse 1.4s ease-in-out infinite" : "none",
          }}
        >
          {loading ? "🧠" : "🔍"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && onSearch) onSearch(value); }}
          placeholder={value ? placeholder : (hint || placeholder)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            background: "transparent",
            color: "#0F172A",
            fontWeight: 500,
            minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={() => onSearch && onSearch(value)}
          disabled={loading}
          style={{
            background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            boxShadow: `0 4px 12px ${ai.base}40`,
            flexShrink: 0,
          }}
        >
          {loading ? "..." : t("vault.search.examples").includes("Examples") || t("vault.search.examples").includes("Örnek") ? "Ask AI" : "AI"}
        </button>
      </div>

      {interpretation && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: ai.bg,
            border: `1px solid ${ai.base}30`,
            borderRadius: 12,
            fontSize: 12,
            color: ai.dark,
          }}
        >
          <strong style={{ color: ai.dark }}>🤖 {t("vault.aiInterpretation")}:</strong> {interpretation}
        </div>
      )}

      {!value && examples.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {t("vault.search.examples")}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange && onChange(ex);
                  onSearch && onSearch(ex);
                  inputRef.current?.focus();
                }}
                style={{
                  background: ai.bg,
                  color: ai.dark,
                  border: `1px solid ${ai.base}30`,
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontStyle: "italic",
                }}
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes asbPulse {
          0%,100% { box-shadow: 0 0 0 0 ${ai.base}80; }
          70% { box-shadow: 0 0 0 12px ${ai.base}00; }
        }
      `}</style>
    </div>
  );
}

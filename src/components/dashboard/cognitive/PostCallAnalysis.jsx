// ================================================================
// PostCallAnalysis — talking-time + sentiment + key moments + actions
// ================================================================
import React from "react";
import { getAIPalette, getAlertPalette, getSuccessPalette, getCustomerPalette, getMoneyPalette } from "../../../utils/dashboardPalette";

export default function PostCallAnalysis({ analysis, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();

  if (!analysis) return null;

  const verdict = analysis.verdict;
  const verdictPalette = verdict === "balanced" ? success : verdict === "tooMuch" ? alert : customer;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Duration + verdict */}
      <div
        style={{
          background: `linear-gradient(135deg, ${verdictPalette.bg}, ${ai.bg})`,
          border: `2px solid ${verdictPalette.base}40`,
          borderRadius: 18,
          padding: 18,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            {t("post.duration")}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: ai.base, fontFamily: "monospace", lineHeight: 1 }}>
            {Math.floor(analysis.durationSec / 60)}m
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: verdictPalette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {t("post.talkingTime")}
          </div>
          <Stack label={t("post.you")}     pct={analysis.youPct}      palette={verdictPalette} />
          <Stack label={t("post.customer")} pct={analysis.customerPct} palette={customer} />
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, fontStyle: "italic" }}>
            {t("post.recommended")}: {analysis.recommended} · {t(`post.${verdict}`)}
          </div>
        </div>
      </div>

      {/* Sentiment timeline */}
      <div style={{ background: "#fff", border: `1px solid ${customer.base}25`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: customer.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          {t("post.sentiment")}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
          <SentimentBar label={t("post.sentiment.start")}  value={analysis.sentiment.start}  />
          <SentimentBar label={t("post.sentiment.middle")} value={analysis.sentiment.middle} />
          <SentimentBar label={t("post.sentiment.end")}    value={analysis.sentiment.end}    />
        </div>
      </div>

      {/* Key moments */}
      <div style={{ background: "#fff", border: `1px solid ${ai.base}25`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          🔑 {t("post.keyMoments")}
        </div>
        {analysis.keyMoments.map((km, i) => {
          const palette = km.kind === "warning" ? alert : success;
          const mins = Math.floor(km.atSec / 60);
          const secs = String(km.atSec % 60).padStart(2, "0");
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < analysis.keyMoments.length - 1 ? "1px dashed #E2E8F0" : "none",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: palette.base }}>
                <div style={{ fontSize: 14 }}>{km.kind === "warning" ? "⚠️" : "✅"}</div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: palette.dark, fontWeight: 800 }}>{mins}:{secs}</div>
              </div>
              <div style={{ fontSize: 12, color: "#0F172A" }}>{km.note}</div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div style={{ background: ai.bg, border: `1px solid ${ai.base}30`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          🎯 {t("post.recommendations")}
        </div>
        <ol style={{ paddingInlineStart: 18, margin: 0, color: "#0F172A", fontSize: 13, lineHeight: 1.8 }}>
          {analysis.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
      </div>

      {/* Action items */}
      <div style={{ background: success.bg, border: `1px solid ${success.base}30`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: success.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          ☑ {t("post.actions")}
        </div>
        {analysis.actions.map((a) => (
          <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", cursor: "pointer", fontSize: 13, color: "#0F172A" }}>
            <input type="checkbox" style={{ width: 16, height: 16, accentColor: success.base, cursor: "pointer" }} />
            {a.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function Stack({ label, pct, palette }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <span style={{ width: 70, fontSize: 11, color: "#475569", fontWeight: 700 }}>{label}</span>
      <div style={{ flex: 1, height: 14, background: `${palette.base}15`, borderRadius: 7, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
            transition: "width .8s ease",
          }}
        />
      </div>
      <span style={{ minWidth: 36, fontSize: 12, fontWeight: 800, color: palette.dark, fontFamily: "monospace", textAlign: "end" }}>{pct}%</span>
    </div>
  );
}

function SentimentBar({ label, value }) {
  const palette =
    value >= 70 ? { base: "#10B981", dark: "#047857", chart: "#34D399" } :
    value >= 50 ? { base: "#F59E0B", dark: "#B45309", chart: "#FBBF24" } :
                  { base: "#F43F5E", dark: "#9F1239", chart: "#FB7185" };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: "100%", height: 60, background: `${palette.base}15`, borderRadius: 6, position: "relative", display: "flex", flexDirection: "column-reverse" }}>
        <div
          style={{
            height: `${value}%`,
            background: `linear-gradient(180deg, ${palette.dark}, ${palette.base})`,
            borderRadius: 6,
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 800, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
          {value}%
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}

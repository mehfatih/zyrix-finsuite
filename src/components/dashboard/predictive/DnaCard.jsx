// ================================================================
// DnaCard — signature customer DNA card with helix + traits + LTV
// ================================================================
import React from "react";
import { getAIPalette, getCustomerPalette, getMoneyPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import DnaHelix from "./DnaHelix";
import PersonalityWheel from "./PersonalityWheel";
import { fmtCurrency } from "../../../pages/dashboard/predictive/predictiveApi";

export default function DnaCard({ dna, lang = "TR", t = (s) => s, onRefresh }) {
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  if (!dna) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
        {t("common.empty")}
      </div>
    );
  }

  const trajectoryPalette = dna.trajectory === "growing" ? success : dna.trajectory === "flat" ? customer : alert;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)`,
        borderRadius: 22,
        padding: 24,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 20px 50px ${ai.base}50`,
      }}
    >
      {/* Decorative animated background */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 20% 20%, ${ai.base}30, transparent 50%), radial-gradient(circle at 80% 80%, ${customer.base}30, transparent 50%)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 22, alignItems: "center", marginBottom: 24 }} className="dna-hero-grid">
        {/* DNA Helix */}
        <div style={{ flexShrink: 0 }}>
          <DnaHelix traits={dna.traits || []} height={200} width={120} />
        </div>

        {/* Identity + personality */}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
            🧬 Customer DNA
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
            {dna.customerName}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <span
              style={{
                background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                color: "#fff",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                boxShadow: `0 4px 12px ${ai.base}50`,
              }}
            >
              {t(`dna.personality.${dna.personality}`)}
            </span>
            <span style={{ fontSize: 11, color: ai.chart, fontWeight: 700 }}>
              {t("dna.confidence").replace("{pct}", dna.confidence)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#CBD5E1", fontStyle: "italic", marginBottom: 6 }}>
            "{t(`dna.personality.${dna.personality}.tag`)}"
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>
            {t("dna.based.on").replace("{n}", dna.count * 11)} · {t("dna.similar").replace("{n}", dna.similarCount)}
          </div>
        </div>

        {/* LTV badge + refresh */}
        <div style={{ textAlign: "end", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            {t("dna.ltv.predicted")}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: money.chart, fontFamily: "monospace", letterSpacing: "-0.02em" }}>
            {fmtCurrency(dna.ltv3yr)}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: trajectoryPalette.chart,
              marginTop: 4,
              padding: "3px 10px",
              background: `${trajectoryPalette.base}25`,
              borderRadius: 999,
              display: "inline-block",
            }}
          >
            {dna.trajectory === "growing" ? "↑" : dna.trajectory === "flat" ? "→" : "↓"}{" "}
            {dna.trajectory === "growing"
              ? t("dna.ltv.growing").replace("{pct}", dna.growthPct)
              : dna.trajectory === "flat"
              ? t("dna.ltv.flat")
              : t("dna.ltv.declining")}
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: `1px solid rgba(255,255,255,0.25)`,
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⟳ {t("dna.refresh")}
            </button>
          )}
        </div>
      </div>

      {/* Personality wheel section */}
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 14,
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          {t("dna.traits.title")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }} className="dna-wheel-grid">
          <PersonalityWheel
            traits={dna.traits || []}
            size={220}
            labels={{
              analytical: t("dna.traits.analytical"),
              driver:     t("dna.traits.driver"),
              expressive: t("dna.traits.expressive"),
              amiable:    t("dna.traits.amiable"),
              patient:    t("dna.traits.patient"),
            }}
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(dna.traits || []).map((tr, i) => {
              const palettes = [ai, customer, money, success, alert];
              const palette = palettes[i % palettes.length];
              return (
                <li key={tr.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{t(`dna.traits.${tr.id}`)}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: palette.chart, fontFamily: "monospace" }}>{tr.value}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${tr.value}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${palette.base}, ${palette.chart})`,
                        transition: "width .8s ease",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .dna-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .dna-wheel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// ScenarioRunner — twin scenario builder + dual-timeline result
// ================================================================
import React, { useState } from "react";
import { getPaletteById, getAIPalette, getMoneyPalette, getCustomerPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency, simulateScenario, twinVerdict } from "../../../pages/dashboard/ecosystem/ecosystemApi";

const TEMPLATES = ["hire", "pricing", "location", "product", "supplier", "marketing"];
const DURATIONS = [30, 60, 90, 180];
const CONFIDENCE = ["standard", "conservative", "aggressive"];

export default function ScenarioRunner({
  invoices = [],
  lang = "TR",
  onSimulated,
  t = (s) => s,
}) {
  const violet = getPaletteById("violet");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const [template, setTemplate] = useState("hire");
  const [days, setDays] = useState(90);
  const [confidence, setConfidence] = useState("standard");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const r = simulateScenario({ template, days, confidence, invoices });
      setResult(r);
      setRunning(false);
      onSimulated?.(r);
    }, 1300);
  };

  const reset = () => {
    setResult(null);
  };

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${violet.base}30`, borderRadius: 18, padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 14 }}>{t("twin.builder.title")}</div>

      {/* Template grid */}
      <div style={{ marginBottom: 14 }}>
        <Field label={t("twin.builder.template")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
            {TEMPLATES.map((tpl) => {
              const active = template === tpl;
              return (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setTemplate(tpl)}
                  style={{
                    background: active ? `linear-gradient(135deg, ${violet.base}, ${violet.dark})` : violet.bg,
                    color: active ? "#fff" : violet.dark,
                    border: `1px solid ${active ? violet.base : violet.base + "30"}`,
                    padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer",
                  }}
                >
                  {t(`twin.template.${tpl}`)}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="sr-grid">
        <Field label={t("twin.builder.simulateFor")}>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={inp}>
            {DURATIONS.map((d) => <option key={d} value={d}>{t(`twin.duration.${d}`)}</option>)}
          </select>
        </Field>
        <Field label={t("twin.builder.confidence")}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CONFIDENCE.map((c) => {
              const active = confidence === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfidence(c)}
                  style={{
                    background: active ? ai.dark : ai.bg, color: active ? "#fff" : ai.dark,
                    border: `1px solid ${ai.base}40`, padding: "6px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer",
                  }}
                >
                  {t(`twin.confidence.${c}`)}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      {!result && (
        <button
          type="button"
          onClick={run}
          disabled={running}
          style={{
            width: "100%",
            background: running ? "#CBD5E1" : `linear-gradient(135deg, ${violet.base}, ${violet.dark})`,
            color: "#fff", border: "none",
            padding: "14px 18px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: running ? "not-allowed" : "pointer",
            boxShadow: running ? "none" : `0 8px 20px ${violet.base}50`,
          }}
        >
          {running ? `⚙ ${t("twin.simulating")}` : `${t("twin.builder.run")}`}
        </button>
      )}

      {result && (
        <div style={{ marginTop: 18, animation: "fadeIn .35s ease" }}>
          <div style={{ fontSize: 11, color: violet.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            {t("twin.result.title")} · {t(`twin.duration.${result.days}`)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="sr-result-grid">
            {/* WITHOUT */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                {t("twin.result.without")}
              </div>
              <Metric label={t("twin.metric.profit")} value={fmtCurrency(result.without.profit)} palette={money} />
              <Metric label={t("twin.metric.hours")}  value={`${Math.round(result.without.hours)}`} palette={customer} />
              <Metric label={t("twin.metric.churn")}  value={`${(result.without.churn * 100).toFixed(1)}%`} palette={alert} />
              <Metric label={t("twin.metric.nps")}    value={`${Math.round(result.without.nps)}`} palette={ai} />
            </div>
            {/* WITH */}
            <div style={{ background: `linear-gradient(135deg, ${violet.bg}, #fff)`, border: `1.5px solid ${violet.base}50`, borderRadius: 14, padding: 14, boxShadow: `0 6px 18px ${violet.base}25` }}>
              <div style={{ fontSize: 10, color: violet.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                {t("twin.result.with")}
              </div>
              <Metric label={t("twin.metric.profit")} value={fmtCurrency(result.with.profit)} palette={success} delta={pctDelta(result.without.profit, result.with.profit)} />
              <Metric label={t("twin.metric.hours")}  value={`${Math.round(result.with.hours)}`} palette={customer} delta={pctDelta(result.without.hours,  result.with.hours,  true)} />
              <Metric label={t("twin.metric.churn")}  value={`${(result.with.churn * 100).toFixed(1)}%`} palette={success} delta={pctDelta(result.without.churn, result.with.churn, true)} />
              <Metric label={t("twin.metric.nps")}    value={`${Math.round(result.with.nps)}`} palette={ai} delta={pctDelta(result.without.nps, result.with.nps)} />
            </div>
          </div>

          <div style={{ background: ai.bg, border: `1px solid ${ai.base}30`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              {t("twin.result.verdict")} · {Math.round(result.aiConfidence * 100)}% {t("cofounder.confidence")}
            </div>
            <div style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.6 }}>
              {twinVerdict(result.verdictKey, lang)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" onClick={reset} style={btnGhost}>{t("twin.result.reset")}</button>
            <button type="button" style={btnGhost}>{t("twin.result.save")}</button>
            <button type="button" style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
              {t("twin.result.implement")}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .sr-grid { grid-template-columns: 1fr !important; }
          .sr-result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Metric({ label, value, palette, delta }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: palette.dark, fontFamily: "monospace" }}>{value}</span>
        {delta != null && (
          <span style={{ fontSize: 10, color: delta > 0 ? "#166534" : "#9F1239", fontWeight: 800 }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

function pctDelta(a, b, inverseGood = false) {
  if (!a) return 0;
  const d = ((b - a) / Math.abs(a)) * 100;
  return inverseGood ? -d : d;
}

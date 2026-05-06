// ================================================================
// DiscountCalculator — what-if discount tool with AI counter-offer
// ================================================================
import React, { useMemo } from "react";
import { getMoneyPalette, getAlertPalette, getSuccessPalette, getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/intelligence/intelligenceApi";

export default function DiscountCalculator({
  data,
  onChange,
  onAccept,
  onCounter,
  onReject,
  lang = "TR",
  t = (s) => s,
}) {
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const calc = useMemo(() => {
    const order = Number(data.orderAmount) || 0;
    const cost = Number(data.cogs) || 0;
    const discountPct = Number(data.discountPct) || 0;
    const ltv = Number(data.ltv) || 0;
    const profitNow = order - cost;
    const profitNowPct = order > 0 ? (profitNow / order) * 100 : 0;
    const newOrder = order * (1 - discountPct / 100);
    const profitAfter = newOrder - cost;
    const profitAfterPct = newOrder > 0 ? (profitAfter / newOrder) * 100 : 0;
    const profitLoss = profitNow - profitAfter;
    const marginEatenPct = profitNow > 0 ? (profitLoss / profitNow) * 100 : 0;
    return { order, cost, profitNow, profitNowPct, newOrder, profitAfter, profitAfterPct, profitLoss, marginEatenPct, ltv };
  }, [data]);

  const aiRecommendation = useMemo(() => {
    if (calc.marginEatenPct > 60) {
      return {
        kind: "tooMuch",
        message: t("discount.rec.tooMuch").replace("{pct}", calc.marginEatenPct.toFixed(0)),
        counter: Math.max(3, Math.round(Number(data.discountPct) * 0.5)),
        bundle: "free shipping",
        palette: alert,
      };
    }
    if (calc.profitAfter < 0) {
      return {
        kind: "tooMuch",
        message: t("discount.rec.tooMuch").replace("{pct}", "100+"),
        counter: 0,
        bundle: null,
        palette: alert,
      };
    }
    return {
      kind: "ok",
      message: t("discount.rec.ok").replace("{amount}", fmtCurrency(calc.profitAfter)),
      counter: Math.round(Number(data.discountPct) * 0.7),
      bundle: "free shipping",
      palette: success,
    };
  }, [calc, data.discountPct, t]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Field label={t("discount.field.customer")}>
          <input type="text" value={data.customer || ""} onChange={(e) => onChange({ ...data, customer: e.target.value })} style={input(money)} />
        </Field>
        <Field label={t("discount.field.order")}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.orderAmount}
            onChange={(e) => onChange({ ...data, orderAmount: Number(e.target.value) })}
            style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label={t("discount.field.cost")}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.cogs}
            onChange={(e) => onChange({ ...data, cogs: Number(e.target.value) })}
            style={{ ...input(alert), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label={t("discount.field.requested")}>
          <input
            type="number"
            min="0"
            max="100"
            value={data.discountPct}
            onChange={(e) => onChange({ ...data, discountPct: Number(e.target.value) })}
            style={{ ...input(brand), fontFamily: "monospace", textAlign: "center" }}
          />
        </Field>
        <Field label={t("discount.field.ltv")}>
          <input
            type="number"
            min="0"
            value={data.ltv}
            onChange={(e) => onChange({ ...data, ltv: Number(e.target.value) })}
            style={{ ...input(success), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
      </div>

      {/* Analysis grid */}
      <div
        style={{
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: 16,
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          {t("discount.analysis.title")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <Tile label={t("discount.analysis.cogs")} value={fmtCurrency(calc.cost)} palette={alert} />
          <Tile label={t("discount.analysis.profitNow")} value={fmtCurrency(calc.profitNow)} sub={`${calc.profitNowPct.toFixed(0)}%`} palette={success} />
          <Tile label={t("discount.analysis.profitAfter")} value={fmtCurrency(calc.profitAfter)} sub={`${calc.profitAfterPct.toFixed(0)}%`} palette={calc.profitAfter > 0 ? money : alert} />
          <Tile label={t("discount.analysis.profitLoss")} value={`-${fmtCurrency(calc.profitLoss)}`} sub={`${calc.marginEatenPct.toFixed(0)}% of margin`} palette={alert} />
          {calc.ltv > 0 && <Tile label={t("discount.analysis.ltv")} value={fmtCurrency(calc.ltv)} palette={ai} />}
        </div>
      </div>

      {/* AI Recommendation */}
      <div
        style={{
          background: `linear-gradient(135deg, ${ai.bg}, ${aiRecommendation.palette.bg})`,
          border: `2px solid ${aiRecommendation.palette.base}40`,
          borderRadius: 14,
          padding: 16,
          marginBottom: 14,
          boxShadow: `0 6px 20px ${aiRecommendation.palette.base}20`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: ai.base,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
            }}
          >
            🤖
          </div>
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {t("discount.rec.title")}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: aiRecommendation.palette.dark, marginBottom: 8 }}>
          {aiRecommendation.message}
        </div>
        {aiRecommendation.counter !== Number(data.discountPct) && (
          <div style={{ fontSize: 13, color: "#0F172A", padding: "8px 12px", background: "#fff", borderRadius: 10, marginBottom: 10 }}>
            💡 <strong>{t("discount.rec.counter")}:</strong>{" "}
            {t("discount.rec.bundle").replace("{pct}", aiRecommendation.counter)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {onReject && (
            <button type="button" onClick={onReject} style={btn(alert, "secondary")}>
              {t("discount.action.reject")}
            </button>
          )}
          {onCounter && (
            <button type="button" onClick={() => onCounter(aiRecommendation.counter)} style={btn(brand, "primary")}>
              ⚡ {t("discount.action.counter")}
            </button>
          )}
          {onAccept && (
            <button type="button" onClick={onAccept} style={btn(success, "secondary")}>
              ✓ {t("discount.action.accept")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

function Tile({ label, value, sub, palette }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${palette.base}25` }}>
      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: palette.base, fontFamily: "monospace" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

// ================================================================
// ★ Smart Pricing Recommendations — heatmap + AI per-product suggestions
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
  getCustomerPalette,
  getAIPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import MoneyCounter from "../../../components/dashboard/intelligence/MoneyCounter";
import PricingHeatmap from "../../../components/dashboard/intelligence/PricingHeatmap";
import { api, localStore, KEYS, fmtCurrency } from "./intelligenceApi";

function buildRecommendations(stock) {
  if (!stock || stock.length === 0) {
    return [
      { id: "rec-x", productId: "demo-x", name: "Product X", current: 100, suggested: 108, deltaPct: 8,  direction: "up", reason: "Demand high · competitor avg ₺115", monthlyImpact: 3200, riskPct: 3, demand: "high",   competitor: 115 },
      { id: "rec-y", productId: "demo-y", name: "Product Y", current: 250, suggested: 235, deltaPct: -6, direction: "down", reason: "Slow movers · -6% may lift volume +18%", monthlyImpact: 1450, riskPct: 0,  demand: "low",    competitor: 240 },
      { id: "rec-z", productId: "demo-z", name: "Product Z", current: 80,  suggested: 85,  deltaPct: 6,  direction: "up", reason: "Low elasticity, can absorb +6%",       monthlyImpact: 980,  riskPct: 2, demand: "medium", competitor: 90 },
    ];
  }
  return (Array.isArray(stock) ? stock : []).slice(0, 6).map((p, i) => {
    const direction = i % 3 === 1 ? "down" : "up";
    const deltaPct = direction === "up" ? 5 + (i % 3) * 3 : -(4 + (i % 2) * 3);
    const current = Number(p.salePrice || p.price || 100);
    const suggested = Math.round(current * (1 + deltaPct / 100));
    return {
      id: `rec-${p.id}`,
      productId: p.id,
      name: p.name,
      current,
      suggested,
      deltaPct,
      direction,
      reason: direction === "up" ? "Demand strong · competitor higher" : "Slow mover · price drop should lift volume",
      monthlyImpact: Math.round(Math.abs(suggested - current) * 30),
      riskPct: direction === "up" ? 3 + (i % 3) : 0,
      demand: ["high", "medium", "low"][i % 3],
      competitor: Math.round(current * 1.08),
    };
  });
}

export default function SmartPricingPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [stock, setStock] = useState([]);
  const [applied, setApplied] = useState([]);
  const [tests, setTests] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/api/stock?limit=200").then((r) => setStock(r?.data?.items || r?.data?.products || []));
    setApplied(localStore.list(KEYS.pricingApplied));
    setTests(localStore.list(KEYS.pricingTests));
    setDismissed(new Set(localStore.list(KEYS.pricingDismiss).map((d) => d.id)));
  }, []);

  const recs = useMemo(() => buildRecommendations(stock).filter((r) => !dismissed.has(r.id)), [stock, dismissed]);
  const lift = useMemo(() => recs.reduce((s, r) => s + (r.monthlyImpact || 0), 0), [recs]);

  const apply = (rec) => {
    localStore.add(KEYS.pricingApplied, { ...rec, appliedAt: new Date().toISOString() });
    setApplied(localStore.list(KEYS.pricingApplied));
    dismiss(rec.id);
    setToast({ kind: "success", msg: t("pricing.toast.applied") });
    setTimeout(() => setToast(null), 2400);
  };

  const test = (rec) => {
    localStore.add(KEYS.pricingTests, { ...rec, startedAt: new Date().toISOString(), durationDays: 14 });
    setTests(localStore.list(KEYS.pricingTests));
    dismiss(rec.id);
    setToast({ kind: "success", msg: t("pricing.toast.test") });
    setTimeout(() => setToast(null), 2800);
  };

  const dismiss = (id) => {
    localStore.add(KEYS.pricingDismiss, { id, at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, id]));
  };

  const grouped = useMemo(() => ({
    up: recs.filter((r) => r.direction === "up"),
    down: recs.filter((r) => r.direction === "down"),
  }), [recs]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("pricing.title")} subtitle={t("pricing.subtitle")} icon="💎" palette={money} />

      {/* Hero — projected lift */}
      <div
        style={{
          background: `linear-gradient(135deg, ${money.bg}, ${ai.bg})`,
          border: `2px solid ${money.base}40`,
          borderRadius: 22,
          padding: "26px 22px",
          marginBottom: 18,
          textAlign: "center",
          boxShadow: `0 12px 36px ${money.base}25`,
        }}
      >
        <div style={{ fontSize: 11, color: money.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12 }}>
          🤖 AI Pricing Engine
        </div>
        <MoneyCounter value={lift} suffix="/ay" size="big" palette={money} lang={lang} />
        <div style={{ fontSize: 14, color: money.dark, fontWeight: 700, marginTop: 8 }}>
          {t("pricing.hero.lift").replace("{amount}", Math.round(lift).toLocaleString())}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="intel-kpi-grid"
      >
        <KpiCard label={t("pricing.recs.title")} value={recs.length} palette={ai} icon="💡" />
        <KpiCard label="Applied" value={applied.length} palette={success} icon="✓" />
        <KpiCard label="A/B Tests" value={tests.length} palette={customer} icon="🧪" />
        <KpiCard label="Dismissed" value={dismissed.size} palette={reports} icon="🗑" />
      </div>

      {/* Heatmap */}
      <Card palette={money} title={t("pricing.heatmap.title")} subtitle={t("pricing.heatmap.subtitle")} icon="🗺️" style={{ marginBottom: 18 }}>
        <PricingHeatmap palette={money} t={t} />
      </Card>

      {/* Recommendations */}
      <Card palette={ai} title={t("pricing.recs.title")} icon="💡" style={{ marginBottom: 18 }}>
        {recs.length === 0 ? (
          <EmptyState title="No pricing recommendations" icon="🎉" palette={success} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {grouped.up.length > 0 && (
              <div style={{ fontSize: 11, color: success.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ⬆ {t("pricing.rec.up")}
              </div>
            )}
            {grouped.up.map((rec) => (
              <RecCard key={rec.id} rec={rec} t={t} palette={success} ai={ai} brand={brand} onApply={apply} onTest={test} onDismiss={() => dismiss(rec.id)} />
            ))}
            {grouped.down.length > 0 && (
              <div style={{ fontSize: 11, color: reports.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ⬇ {t("pricing.rec.down")}
              </div>
            )}
            {grouped.down.map((rec) => (
              <RecCard key={rec.id} rec={rec} t={t} palette={reports} ai={ai} brand={brand} onApply={apply} onTest={test} onDismiss={() => dismiss(rec.id)} />
            ))}
          </div>
        )}
      </Card>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: success.bg,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`@media (max-width: 720px) { .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function RecCard({ rec, t, palette, ai, brand, onApply, onTest, onDismiss }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${palette.base}30`,
        borderRadius: 14,
        padding: 14,
        boxShadow: `0 2px 10px ${palette.base}10`,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 14,
        alignItems: "center",
      }}
      className="rec-card-grid"
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{rec.name}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>
            {t("pricing.rec.current")}: <strong style={{ color: "#0F172A", fontFamily: "monospace" }}>{fmtCurrency(rec.current)}</strong>
          </span>
          <span style={{ fontSize: 16, color: palette.base }}>→</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: palette.base, fontFamily: "monospace" }}>
            {t("pricing.rec.suggested")}: {fmtCurrency(rec.suggested)} ({rec.deltaPct > 0 ? "+" : ""}{rec.deltaPct}%)
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
          <strong style={{ color: ai.dark }}>{t("pricing.rec.reason")}:</strong> {rec.reason}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, flexWrap: "wrap" }}>
          <span>
            <strong style={{ color: palette.dark }}>{t("pricing.rec.impact")}:</strong>{" "}
            <span style={{ color: palette.base, fontFamily: "monospace", fontWeight: 700 }}>
              +{fmtCurrency(rec.monthlyImpact)}/mo
            </span>
          </span>
          {rec.riskPct > 0 && (
            <span style={{ color: "#9F1239", fontWeight: 700 }}>
              {t("pricing.rec.risk").replace("{pct}", rec.riskPct)}
            </span>
          )}
          <span style={{ color: "#64748B" }}>
            {t("pricing.rec.demand").replace("{label}", t(`pricing.rec.demand.${rec.demand === "high" ? "high" : rec.demand === "low" ? "low" : "med"}`))}
          </span>
          <span style={{ color: "#64748B" }}>
            {t("pricing.rec.competitor").replace("{amount}", fmtCurrency(rec.competitor))}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button type="button" onClick={() => onApply(rec)} style={btn(brand, "primary")}>
          ⚡ {t("pricing.rec.action.apply")}
        </button>
        <button type="button" onClick={() => onTest(rec)} style={btn(palette, "secondary")}>
          🧪 {t("pricing.rec.action.test")}
        </button>
        <button type="button" onClick={onDismiss} style={btn(palette, "ghost")}>
          {t("pricing.rec.action.dismiss")}
        </button>
      </div>
      <style>{`@media (max-width: 720px) { .rec-card-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
      whiteSpace: "nowrap",
    };
  }
  if (variant === "secondary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
  }
  return {
    background: "transparent",
    color: "#94A3B8",
    border: "1px solid transparent",
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

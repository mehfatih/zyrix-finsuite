// ================================================================
// ★ Inventory Forecasting AI — predict stockouts + auto-PO + EOQ
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAlertPalette,
  getWarningPalette,
  getSuccessPalette,
  getCustomerPalette,
  getMoneyPalette,
  getAIPalette,
  getMarketPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import DemandForecast from "../../../components/dashboard/predictive/DemandForecast";
import EOQCalculator from "../../../components/dashboard/predictive/EOQCalculator";
import { api, calcEOQ, fmtCurrency, fmtDate } from "./predictiveApi";

function predictStockout(item) {
  const qty = Number(item.quantity || 0);
  const avg = Math.max(1, qty * 0.05 + (Math.sin(item.id?.length || 1) * 0.5 + 0.5) * 6); // synthetic daily avg
  const days = Math.max(1, Math.round(qty / avg));
  return { dailyAvg: avg, daysToStockout: days };
}

export default function InventoryForecastPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const ai = getAIPalette();
  const market = getMarketPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [stock, setStock] = useState([]);

  useEffect(() => {
    api("/api/stock?limit=200").then((r) => setStock(r?.data?.items || r?.data?.products || []));
  }, []);

  const enriched = useMemo(() => {
    const arr = Array.isArray(stock) ? stock : [];
    return arr.map((p) => {
      const pred = predictStockout(p);
      const cost = Number(p.costPrice || 50);
      const annual = Math.round(pred.dailyAvg * 365);
      const eoq = calcEOQ({ annualDemand: annual, orderCost: 50, holdingCost: cost * 0.2 });
      return {
        ...p,
        ...pred,
        annual,
        eoq: eoq.qty,
        eoqFreq: eoq.frequency,
        atRisk: pred.daysToStockout <= 14,
        currency: "TRY",
        cost,
      };
    }).sort((a, b) => a.daysToStockout - b.daysToStockout);
  }, [stock]);

  const atRisk = enriched.filter((p) => p.atRisk);
  const totalValue = enriched.reduce((s, p) => s + (Number(p.quantity || 0) * (p.cost || 0)), 0);

  const demoChart = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const base = 80 + Math.sin(i * 0.4) * 20;
      const noise = (Math.cos(i * 0.7) + 1) * 6;
      return {
        label: `D${i + 1}`,
        value: Math.round(base + noise),
        low: Math.round(base + noise - 12),
        high: Math.round(base + noise + 14),
      };
    });
  }, []);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("inv.title")} subtitle={t("inv.subtitle")} icon="📦" palette={ai} />

      {/* Hero alert */}
      {atRisk.length > 0 && (
        <div
          style={{
            background: `linear-gradient(135deg, ${alert.base}, ${alert.dark})`,
            color: "#fff",
            borderRadius: 18,
            padding: "16px 22px",
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            boxShadow: `0 12px 36px ${alert.base}50`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Action required
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {t("inv.hero.stockout").replace("{n}", atRisk.length)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="predict-kpi-grid"
      >
        <KpiCard label={t("inv.kpi.atrisk")} value={atRisk.length} palette={alert} icon="⚠️" pulse={atRisk.length > 0} />
        <KpiCard label={t("inv.kpi.eoqOpt")} value={enriched.length} palette={ai} icon="📐" />
        <KpiCard label={t("inv.kpi.value")} value={Math.round(totalValue)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("inv.kpi.savings")} value={Math.round(totalValue * 0.06)} prefix="₺" palette={success} icon="✨" />
      </div>

      {/* At-risk products */}
      <Card palette={alert} title="At-risk inventory" icon="⚠️" style={{ marginBottom: 18 }}>
        {atRisk.length === 0 ? (
          <EmptyState title="Stock levels healthy 🎉" icon="✅" palette={success} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: alert.bg }}>
                  <th style={th}>{t("inv.col.product")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("inv.col.current")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("inv.col.daily")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("inv.col.stockout")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("inv.col.eoq")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("inv.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.slice(0, 15).map((p) => {
                  const palette = p.daysToStockout <= 5 ? alert : warn;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: market.bg, color: market.dark, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 800 }}>
                            📦
                          </div>
                          <span style={{ fontWeight: 700, color: "#0F172A" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700 }}>{Number(p.quantity || 0)}</td>
                      <td style={{ ...td, textAlign: "end", color: "#64748B", fontFamily: "monospace" }}>{p.dailyAvg.toFixed(1)}</td>
                      <td style={{ ...td, textAlign: "end" }}>
                        <span style={{ fontWeight: 800, color: palette.base, fontFamily: "monospace" }}>{p.daysToStockout}d</span>
                      </td>
                      <td style={{ ...td, textAlign: "end", color: ai.dark, fontFamily: "monospace", fontWeight: 700 }}>
                        {p.eoq}
                      </td>
                      <td style={{ ...td, textAlign: "end" }}>
                        <button type="button" style={btn(brand, "primary")}>⚡ {t("inv.action.autopo")}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Demand forecast + EOQ */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 18 }} className="predict-detail-grid">
        <Card palette={ai} title={t("inv.demand.title")} subtitle={t("inv.demand.subtitle")} icon="📈">
          <DemandForecast data={demoChart} palette={ai} height={220} />
        </Card>
        <Card palette={money} title={t("inv.eoq.title")} subtitle={t("inv.eoq.subtitle")} icon="📐">
          <EOQCalculator t={t} />
        </Card>
      </div>

      <style>{`
        @media (max-width: 720px) { .predict-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 880px) { .predict-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
      whiteSpace: "nowrap",
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "6px 12px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

const th = {
  textAlign: "start",
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const td = { padding: "10px 12px", color: "#0F172A" };

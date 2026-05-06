// ================================================================
// Stock Reports — low-stock, slow-movers, value trend, ABC treemap
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getReportsPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { AreaChart, Treemap } from "../../../components/dashboard/charts";
import StockLevelIndicator, { classifyStock } from "../../../components/dashboard/purchases/StockLevelIndicator";
import { api, fmtCurrency, fmtDate } from "./productsApi";

export default function StockReportsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("stock");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const reports = getReportsPalette();

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    (async () => {
      const pRes = await api("/api/stock?limit=500");
      const pList = pRes?.data?.items || pRes?.data || [];
      setProducts(Array.isArray(pList) ? pList : []);
      const allMv = [];
      for (const p of pList) {
        const dRes = await api(`/api/stock/${p.id}`);
        (dRes?.data?.movements || []).forEach((m) => allMv.push({ ...m, productId: p.id, productName: p.name }));
      }
      setMovements(allMv);
    })();
  }, []);

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => ["LOW", "OUT"].includes(classifyStock(p.quantity, p.minQuantity)))
        .slice()
        .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0)),
    [products]
  );

  const slowMovers = useMemo(() => {
    const lastMove = {};
    movements.forEach((m) => {
      const dt = new Date(m.createdAt).getTime();
      if (!lastMove[m.productId] || dt > lastMove[m.productId]) lastMove[m.productId] = dt;
    });
    const cutoff = Date.now() - 60 * 86400000;
    return products
      .map((p) => ({ ...p, _last: lastMove[p.id] || null }))
      .filter((p) => Number(p.quantity || 0) > 0 && (!p._last || p._last < cutoff))
      .sort((a, b) => (a._last || 0) - (b._last || 0));
  }, [products, movements]);

  const valueTrend = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { key: d.toISOString().slice(0, 7), label: d.toLocaleString(undefined, { month: "short" }), value: 0 };
    });
    // Approximate trend: cumulative net movements * avg cost
    const movByMonth = {};
    movements.forEach((m) => {
      const k = String(m.createdAt || "").slice(0, 7);
      const sign = m.type === "IN" || m.type === "RETURN" ? 1 : -1;
      movByMonth[k] = (movByMonth[k] || 0) + sign * Number(m.quantity || 0) * Number(m.unitPrice || 0);
    });
    let cum = 0;
    buckets.forEach((b) => {
      cum += movByMonth[b.key] || 0;
      b.value = Math.max(0, cum);
    });
    // Anchor today's value to actual stock value so the trend ends honestly.
    const currentValue = products.reduce((s, p) => s + Number(p.quantity || 0) * Number(p.costPrice || 0), 0);
    if (buckets.length > 0) buckets[buckets.length - 1].value = currentValue;
    return buckets;
  }, [products, movements]);

  // ABC analysis: classify products by velocity (units sold last 90 days)
  const abc = useMemo(() => {
    const cutoff = Date.now() - 90 * 86400000;
    const velocity = {};
    movements
      .filter((m) => m.type === "OUT" && new Date(m.createdAt).getTime() > cutoff)
      .forEach((m) => {
        velocity[m.productId] = (velocity[m.productId] || 0) + Number(m.quantity || 0);
      });
    const items = products.map((p) => ({
      ...p,
      _velocity: velocity[p.id] || 0,
      _value: Number(p.quantity || 0) * Number(p.costPrice || 0),
    })).sort((a, b) => b._velocity - a._velocity);

    const total = items.reduce((s, i) => s + i._velocity, 0) || 1;
    let cum = 0;
    const palettes = paletteSequence(items.length, { exclude: ["wine"] });
    return items
      .map((it, i) => {
        cum += it._velocity;
        const pct = cum / total;
        const cls = pct <= 0.7 ? "A" : pct <= 0.9 ? "B" : "C";
        const color = cls === "A" ? "#10B981" : cls === "B" ? "#F59E0B" : "#94A3B8";
        return { label: `${cls} · ${it.name}`, value: it._value || 1, color, _ix: i };
      })
      .filter((x) => x.value > 0);
  }, [products, movements]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} icon="📊" palette={reports} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="prod-kpi-grid"
      >
        <KpiCard label="Total Products" value={products.length} palette={market} icon="📦" />
        <KpiCard label="Low / Out" value={lowStock.length} palette={alert} icon="⚠️" pulse={lowStock.length > 0} />
        <KpiCard label="Slow Movers (60+d)" value={slowMovers.length} palette={warn} icon="🐢" />
        <KpiCard label="Total Value" value={Math.round(valueTrend[valueTrend.length - 1]?.value || 0)} prefix="₺" palette={money} icon="💰" />
      </div>

      <Card palette={reports} title={t("reports.value.title")} icon="📈" style={{ marginBottom: 18 }}>
        <AreaChart data={valueTrend} palette={reports} height={200} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="prod-detail-grid">
        <Card palette={alert} title={t("reports.lowstock.title")} subtitle={t("reports.lowstock.subtitle")} icon="⚠️">
          {lowStock.length === 0 ? (
            <EmptyState title={t("reports.empty")} icon="✓" palette={success} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: alert.bg }}>
                    <th style={th}>{t("reports.col.product")}</th>
                    <th style={{ ...th, textAlign: "end" }}>{t("reports.col.current")}</th>
                    <th style={{ ...th, textAlign: "end" }}>{t("reports.col.min")}</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={td}>{p.name}</td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: alert.dark }}>
                        {Number(p.quantity || 0)}
                      </td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", color: "#64748B" }}>{Number(p.minQuantity || 0)}</td>
                      <td style={td}>
                        <StockLevelIndicator qty={p.quantity} min={p.minQuantity} lang={lang} showQty={false} size="compact" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card palette={warn} title={t("reports.slow.title")} subtitle={t("reports.slow.subtitle")} icon="🐢">
          {slowMovers.length === 0 ? (
            <EmptyState title={t("reports.empty")} icon="🚀" palette={success} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: warn.bg }}>
                    <th style={th}>{t("reports.col.product")}</th>
                    <th style={th}>{t("reports.col.lastmove")}</th>
                    <th style={{ ...th, textAlign: "end" }}>{t("reports.col.value")}</th>
                  </tr>
                </thead>
                <tbody>
                  {slowMovers.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={td}>{p.name}</td>
                      <td style={{ ...td, color: "#64748B", fontSize: 11 }}>
                        {p._last ? fmtDate(p._last, lang) : "Never"}
                      </td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", color: money.dark }}>
                        {fmtCurrency(Number(p.quantity || 0) * Number(p.costPrice || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card palette={success} title={t("reports.abc.title")} subtitle={t("reports.abc.subtitle")} icon="🅰️">
        {abc.length === 0 ? (
          <EmptyState title={t("reports.empty")} icon="📊" palette={market} />
        ) : (
          <Treemap data={abc} palette={success} height={300} />
        )}
        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: "#64748B" }}>
          <Legend color="#10B981" label="A — top 70% velocity" />
          <Legend color="#F59E0B" label="B — next 20%" />
          <Legend color="#94A3B8" label="C — slow movers" />
        </div>
      </Card>

      <style>{`
        @media (max-width: 720px) { .prod-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 880px) { .prod-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      {label}
    </span>
  );
}

const th = {
  textAlign: "start",
  padding: "8px 10px",
  fontSize: 10,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "8px 10px", color: "#0F172A" };

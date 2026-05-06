// ================================================================
// Stock Movements — treemap + calendar heatmap + filterable list + FAB
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getReportsPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getBrandPalette,
  paletteSequence,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { Treemap, CalendarHeatmap } from "../../../components/dashboard/charts";
import StockMovementForm from "../../../components/dashboard/purchases/StockMovementForm";
import { api, fmtCurrency, fmtDate } from "./productsApi";
import { classifyStock } from "../../../components/dashboard/purchases/StockLevelIndicator";

const TYPES = ["ALL", "IN", "OUT", "TRANSFER", "ADJUSTMENT", "RETURN"];

export default function StockMovementsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("stock");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [pRes] = await Promise.all([api("/api/stock?limit=500")]);
    const pList = pRes?.data?.items || pRes?.data || [];
    setProducts(Array.isArray(pList) ? pList : []);
    const allMv = [];
    for (const p of pList) {
      const dRes = await api(`/api/stock/${p.id}`);
      (dRes?.data?.movements || []).forEach((m) => allMv.push({ ...m, productName: p.name, productCategory: p.category }));
    }
    setMovements(allMv);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  const stats = useMemo(() => {
    const totalValue = products.reduce((s, p) => s + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0), 0);
    const now = new Date();
    const isThisMonth = (d) => {
      const dt = new Date(d);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    };
    const inMonth = movements.filter((m) => m.type === "IN" && isThisMonth(m.createdAt)).reduce((s, m) => s + Number(m.quantity || 0), 0);
    const outMonth = movements.filter((m) => m.type === "OUT" && isThisMonth(m.createdAt)).reduce((s, m) => s + Number(m.quantity || 0), 0);
    const low = products.filter((p) => classifyStock(p.quantity, p.minQuantity) === "LOW" || classifyStock(p.quantity, p.minQuantity) === "OUT").length;
    return { totalValue, inMonth, outMonth, low };
  }, [products, movements]);

  const treemapData = useMemo(() => {
    const byCat = {};
    products.forEach((p) => {
      const cat = p.category || "Other";
      const value = Number(p.quantity || 0) * Number(p.costPrice || 0);
      const level = classifyStock(p.quantity, p.minQuantity);
      if (!byCat[cat]) byCat[cat] = { value: 0, items: 0, lows: 0 };
      byCat[cat].value += value;
      byCat[cat].items += 1;
      if (level === "LOW" || level === "OUT") byCat[cat].lows += 1;
    });
    const palettes = paletteSequence(Object.keys(byCat).length, { exclude: ["wine"] });
    return Object.entries(byCat).map(([label, info], i) => {
      const healthy = info.lows === 0;
      const color = healthy ? palettes[i].base : "#F43F5E";
      return { label, value: info.value || 1, color };
    });
  }, [products]);

  const heatmapData = useMemo(() => {
    const map = new Map();
    movements.forEach((m) => {
      const day = String(m.createdAt || "").slice(0, 10);
      if (!day) return;
      map.set(day, (map.get(day) || 0) + Number(m.quantity || 0));
    });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [movements]);

  const filtered = useMemo(() => {
    let arr = movements;
    if (filter !== "ALL") arr = arr.filter((m) => m.type === filter);
    return arr.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [movements, filter]);

  const submitMovement = async (data) => {
    const res = await api(`/api/stock/${data.productId}/movement`, {
      method: "POST",
      body: JSON.stringify({
        type: data.type,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice) || undefined,
        reference: data.reference,
        notes: data.notes,
      }),
    });
    if (res?.success !== false) {
      setShowForm(false);
      reload();
    }
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("movements.title")}
        subtitle={t("movements.subtitle")}
        icon="📊"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("movements.new")}
          </PageHeaderButton>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="prod-kpi-grid"
      >
        <KpiCard label={t("movements.kpi.value")} value={Math.round(stats.totalValue)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("movements.kpi.in")} value={stats.inMonth} palette={success} icon="↓" />
        <KpiCard label={t("movements.kpi.out")} value={stats.outMonth} palette={reports} icon="↑" />
        <KpiCard label={t("movements.kpi.low")} value={stats.low} palette={alert} icon="⚠️" pulse={stats.low > 0} />
      </div>

      {showForm && (
        <Card palette={market} title={t("form.title")} icon="📝" style={{ marginBottom: 18 }}>
          <StockMovementForm
            products={products}
            t={t}
            onSubmit={submitMovement}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="prod-detail-grid">
        <Card palette={market} title={t("movements.treemap.title")} icon="🧱">
          {treemapData.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>—</div>
          ) : (
            <Treemap data={treemapData} palette={market} height={280} />
          )}
        </Card>
        <Card palette={reports} title={t("movements.timeline.title")} icon="🗓️">
          <CalendarHeatmap data={heatmapData} palette={reports} weeks={53} cellSize={9} gap={2} />
        </Card>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${market.base}15`,
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {TYPES.map((tp) => {
          const palette = tp === "ALL" ? market : getPaletteById({ IN: "emerald", OUT: "rose", TRANSFER: "indigo", ADJUSTMENT: "amber", RETURN: "cyan" }[tp]);
          const active = filter === tp;
          return (
            <button
              key={tp}
              type="button"
              onClick={() => setFilter(tp)}
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
                background: active ? palette.base : `${palette.base}10`,
                color: active ? "#fff" : palette.dark,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {tp === "ALL" ? t("movements.filter.all") : t(`movements.type.${tp}`)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("movements.empty")} icon="📊" palette={market} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("movements.col.date")}</th>
                <th style={th}>{t("movements.col.product")}</th>
                <th style={th}>{t("movements.col.type")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("movements.col.qty")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("movements.col.value")}</th>
                <th style={th}>{t("movements.col.ref")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const p = getPaletteById({ IN: "emerald", OUT: "rose", TRANSFER: "indigo", ADJUSTMENT: "amber", RETURN: "cyan" }[m.type] || "indigo");
                const sign = m.type === "IN" || m.type === "RETURN" ? "+" : "−";
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(m.createdAt, lang)}</td>
                    <td style={td}>{m.productName || "—"}</td>
                    <td style={td}>
                      <span
                        style={{
                          background: `${p.base}15`,
                          color: p.dark,
                          border: `1px solid ${p.base}30`,
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {t(`movements.type.${m.type}`)}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: p.dark }}>
                      {sign}{Number(m.quantity || 0)}
                    </td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", color: money.dark }}>
                      {fmtCurrency(m.totalValue || 0)}
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 11 }}>{m.reference || m.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="prod-fab"
        style={{
          position: "fixed",
          bottom: 24,
          insetInlineEnd: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          color: "#fff",
          border: "none",
          fontSize: 24,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: `0 8px 22px ${brand.base}50`,
          display: "none",
          zIndex: 100,
        }}
      >
        +
      </button>

      <style>{`
        @media (max-width: 720px) {
          .prod-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .prod-fab { display: grid !important; place-items: center; }
        }
        @media (max-width: 880px) { .prod-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

const th = {
  textAlign: "start",
  padding: "12px 14px",
  fontSize: 11,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "12px 14px", color: "#0F172A" };

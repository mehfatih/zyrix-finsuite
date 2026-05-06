// ================================================================
// Products Catalog — grid + table view, filters, KPIs, low-stock pulse
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
  getBrandPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import ProductCatalogCard from "../../../components/dashboard/purchases/ProductCatalogCard";
import StockLevelIndicator, { classifyStock } from "../../../components/dashboard/purchases/StockLevelIndicator";
import { api, fmtCurrency } from "./productsApi";

export default function ProductsListPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("products");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    api("/api/stock?limit=500").then((res) => {
      const list = res?.data?.items || res?.data || [];
      setProducts(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const value = products.reduce((s, p) => s + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0), 0);
    const low = products.filter((p) => classifyStock(p.quantity, p.minQuantity) === "LOW").length;
    const out = products.filter((p) => classifyStock(p.quantity, p.minQuantity) === "OUT").length;
    return { total, value, low, out };
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const filtered = useMemo(() => {
    let arr = products;
    if (category !== "ALL") arr = arr.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.sku || "").toLowerCase().includes(q) ||
          String(p.barcode || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [products, category, search]);

  const palettes = paletteSequence(filtered.length, { exclude: ["wine"] });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        icon="📦"
        palette={market}
        actions={
          <PageHeaderButton
            palette={brand}
            variant="primary"
            icon="＋"
            onClick={() => onNavigate && onNavigate("prod-new")}
          >
            {t("products.new")}
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
        <KpiCard label={t("products.kpi.total")} value={stats.total} palette={market} icon="📦" />
        <KpiCard label={t("products.kpi.value")} value={Math.round(stats.value)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("products.kpi.low")} value={stats.low} palette={warn} icon="⚠️" pulse={stats.low > 0} />
        <KpiCard label={t("products.kpi.outofstock")} value={stats.out} palette={alert} icon="🚫" pulse={stats.out > 0} />
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${market.base}15`,
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("products.search")}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${market.base}25`,
            background: "#fff",
            fontSize: 13,
            outline: "none",
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${market.base}25`,
            background: "#fff",
            fontSize: 13,
            outline: "none",
            fontWeight: 600,
          }}
        >
          <option value="ALL">{t("products.filter.all")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 4, padding: 4, background: market.bg, borderRadius: 10 }}>
          {[
            { id: "grid",  label: t("products.view.grid"),  icon: "▦" },
            { id: "table", label: t("products.view.table"), icon: "▤" },
          ].map((v) => {
            const active = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: active ? "#fff" : "transparent",
                  color: active ? market.dark : "#64748B",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: active ? `0 2px 8px ${market.base}25` : "none",
                }}
              >
                {v.icon} {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("products.empty")} icon="📦" palette={market} />
      ) : view === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((p, i) => (
            <ProductCatalogCard
              key={p.id}
              product={p}
              palette={palettes[i] || market}
              lang={lang}
              onClick={() => onNavigate && onNavigate("prod-detail", { id: p.id })}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("products.col.name")}</th>
                <th style={th}>{t("products.col.sku")}</th>
                <th style={th}>{t("products.col.cat")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("products.col.price")}</th>
                <th style={th}>{t("products.col.stock")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const palette = palettes[i] || market;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onNavigate && onNavigate("prod-detail", { id: p.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = market.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
                            color: palette.dark,
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {(p.name || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: "#64748B", fontSize: 12 }}>{p.sku || "—"}</td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{p.category || "—"}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(p.salePrice ?? 0)}
                    </td>
                    <td style={td}>
                      <StockLevelIndicator qty={p.quantity} min={p.minQuantity} lang={lang} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .prod-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
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
const td = { padding: "12px 14px" };

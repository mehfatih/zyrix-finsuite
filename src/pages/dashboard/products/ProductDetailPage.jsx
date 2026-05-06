// ================================================================
// Product Detail — gallery + variants + warehouses + movements + velocity
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
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import { AreaChart } from "../../../components/dashboard/charts";
import StockLevelIndicator from "../../../components/dashboard/purchases/StockLevelIndicator";
import { api, fmtCurrency, fmtDate, localList, localSave, PRODUCT_IMAGES_KEY, PRODUCT_VARIANTS_KEY } from "./productsApi";

export default function ProductDetailPage({ productId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("products");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const refresh = async () => {
    if (!productId) return;
    const res = await api(`/api/stock/${productId}`);
    setProduct(res?.data || null);
    setMovements(res?.data?.movements || []);
    const allImages = localList(PRODUCT_IMAGES_KEY);
    setImages(allImages.filter((img) => img.productId === productId));
    const allVariants = localList(PRODUCT_VARIANTS_KEY);
    setVariants(allVariants.filter((v) => v.productId === productId));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const velocity = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { key: d.toISOString().slice(0, 7), label: d.toLocaleString(undefined, { month: "short" }), value: 0 };
    });
    movements
      .filter((m) => m.type === "OUT")
      .forEach((m) => {
        const k = String(m.createdAt || "").slice(0, 7);
        const b = buckets.find((x) => x.key === k);
        if (b) b.value += Number(m.quantity || 0);
      });
    return buckets;
  }, [movements]);

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const arr = localList(PRODUCT_IMAGES_KEY);
      const next = [...arr, { id: `img-${Date.now()}`, productId, data: reader.result }];
      localSave(PRODUCT_IMAGES_KEY, next);
      setImages(next.filter((img) => img.productId === productId));
    };
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    const name = window.prompt("Variant name (size/color):");
    if (!name) return;
    const arr = localList(PRODUCT_VARIANTS_KEY);
    const next = [...arr, { id: `var-${Date.now()}`, productId, name, qty: 0 }];
    localSave(PRODUCT_VARIANTS_KEY, next);
    setVariants(next.filter((v) => v.productId === productId));
  };

  if (!product) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={product.name}
        subtitle={product.sku ? `SKU ${product.sku}` : ""}
        icon="📦"
        palette={market}
        breadcrumb={[
          { label: t("products.title"), href: "#prod-list" },
          { label: product.name },
        ]}
        actions={
          <PageHeaderButton palette={market} variant="ghost" onClick={() => onNavigate && onNavigate("prod-list")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${market.bg}, ${reports.bg})`,
          border: `1px solid ${market.base}25`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 18,
            background: images[0]?.data
              ? `url(${images[0].data}) center/cover`
              : `linear-gradient(135deg, ${market.base}, ${market.dark})`,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 36,
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: `0 8px 24px ${market.base}40`,
          }}
        >
          {!images[0]?.data && (product.name || "?")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 10 }}>
            {product.category || "Uncategorized"} · {product.unit || "adet"}
          </div>
          <StockLevelIndicator qty={product.quantity} min={product.minQuantity} lang={lang} />
        </div>
        <div style={{ textAlign: "end" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Price</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
            {fmtCurrency(product.salePrice)}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>
            cost {fmtCurrency(product.costPrice)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="prod-detail-grid">
        {/* Gallery */}
        <Card palette={market} title={t("detail.gallery")} icon="🖼️">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, marginBottom: 12 }}>
            {images.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>—</div>
            ) : (
              images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 10,
                    background: `url(${img.data}) center/cover`,
                    border: `1px solid ${market.base}20`,
                  }}
                />
              ))
            )}
          </div>
          <label
            style={{
              display: "block",
              padding: "10px 14px",
              borderRadius: 10,
              border: `2px dashed ${market.base}40`,
              background: market.bg,
              color: market.dark,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⬆ {t("detail.uploadImage")}
            <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
          </label>
        </Card>

        {/* Variants */}
        <Card palette={reports} title={t("detail.variants")} icon="🎨">
          {variants.length === 0 ? (
            <div style={{ padding: 14, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>{t("detail.variants.empty")}</div>
          ) : (
            variants.map((v) => (
              <div
                key={v.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: reports.bg,
                  borderRadius: 8,
                  marginBottom: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: reports.dark,
                }}
              >
                <span>{v.name}</span>
                <span style={{ fontFamily: "monospace" }}>{v.qty}</span>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={addVariant}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: 10,
              border: `1px dashed ${reports.base}40`,
              background: "transparent",
              color: reports.dark,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {t("detail.variants.add")}
          </button>
        </Card>
      </div>

      {/* Sales velocity */}
      <Card palette={success} title={t("detail.velocity")} icon="📈" style={{ marginBottom: 18 }}>
        <AreaChart data={velocity} palette={success} height={180} />
      </Card>

      {/* Warehouses */}
      <Card palette={market} title={t("detail.warehouses")} icon="🏢" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <WarehouseTile palette={market}  name={product.location || "Main"} qty={product.quantity} />
        </div>
      </Card>

      {/* Movements */}
      <Card palette={alert} title={t("detail.movements")} icon="📋">
        {movements.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: alert.bg }}>
                  <th style={th}>Date</th>
                  <th style={th}>Type</th>
                  <th style={{ ...th, textAlign: "end" }}>Qty</th>
                  <th style={{ ...th, textAlign: "end" }}>Value</th>
                  <th style={th}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ ...td, color: "#64748B" }}>{fmtDate(m.createdAt, lang)}</td>
                    <td style={td}>{m.type}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700 }}>
                      {m.type === "IN" || m.type === "RETURN" ? "+" : "−"}
                      {Number(m.quantity || 0)}
                    </td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace" }}>{fmtCurrency(m.totalValue || 0)}</td>
                    <td style={{ ...td, color: "#64748B", fontSize: 11 }}>{m.reference || m.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <style>{`@media (max-width: 880px) { .prod-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function WarehouseTile({ palette, name, qty }) {
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.base}30`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, color: palette.dark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: palette.base, fontFamily: "monospace" }}>{qty}</div>
    </div>
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

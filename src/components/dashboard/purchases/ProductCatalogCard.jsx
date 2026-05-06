// ================================================================
// ProductCatalogCard — grid view card with image, price, stock pill
// ================================================================
import React from "react";
import { resolvePalette, getMoneyPalette } from "../../../utils/dashboardPalette";
import StockLevelIndicator from "./StockLevelIndicator";

export default function ProductCatalogCard({ product, palette, lang = "TR", onClick }) {
  const p = resolvePalette(palette);
  const money = getMoneyPalette();
  const initial = (product.name || "?")[0].toUpperCase();
  const price = product.salePrice ?? product.price ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${p.base}25`,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        textAlign: "start",
        transition: "transform .15s, box-shadow .15s",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 10px 26px ${p.base}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          aspectRatio: "1.2",
          background: `linear-gradient(135deg, ${p.bg}, ${p.base}25)`,
          display: "grid",
          placeItems: "center",
          fontSize: 56,
          fontWeight: 900,
          color: p.dark,
          letterSpacing: "-0.02em",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initial
        )}
        <div style={{ position: "absolute", top: 8, insetInlineEnd: 8 }}>
          <StockLevelIndicator qty={product.quantity} min={product.minQuantity} lang={lang} size="compact" showQty={false} />
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 4,
          }}
        >
          {product.name || "—"}
        </div>
        {product.sku && (
          <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "monospace", marginBottom: 6 }}>
            {product.sku}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: money.base,
              fontFamily: "monospace",
            }}
          >
            ₺{Number(price).toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
            {Number(product.quantity) || 0} {product.unit || ""}
          </span>
        </div>
      </div>
    </button>
  );
}

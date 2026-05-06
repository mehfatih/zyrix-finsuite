// ================================================================
// InvoiceLineItems — editable line items grid with running totals
// ================================================================
import React from "react";
import { getMoneyPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import ProductSelect from "./ProductSelect";

export default function InvoiceLineItems({
  items = [],
  onChange,
  products = [],
  currency = "TRY",
  defaultVat = 20,
}) {
  const money = getMoneyPalette();
  const customer = getCustomerPalette();

  const update = (idx, patch) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const add = () =>
    onChange([
      ...items,
      { name: "", quantity: 1, unitPrice: 0, vatRate: defaultVat },
    ]);

  const lineTotal = (it) => (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
  const subtotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const vatTotal = items.reduce(
    (s, it) => s + lineTotal(it) * ((Number(it.vatRate) || 0) / 100),
    0
  );
  const grandTotal = subtotal + vatTotal;

  const fmt = (n) => `${currency === "TRY" ? "₺" : currency + " "}${Number(n).toFixed(2)}`;

  return (
    <div>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${customer.base}20`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(180px,3fr) 70px 110px 70px 110px 36px",
            gap: 8,
            padding: "10px 14px",
            background: customer.bg,
            color: customer.dark,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
          className="sales-line-head"
        >
          <span>Product</span>
          <span style={{ textAlign: "center" }}>Qty</span>
          <span style={{ textAlign: "right" }}>Price</span>
          <span style={{ textAlign: "center" }}>VAT %</span>
          <span style={{ textAlign: "right" }}>Total</span>
          <span />
        </div>
        {items.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
            No line items yet
          </div>
        )}
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px,3fr) 70px 110px 70px 110px 36px",
              gap: 8,
              padding: "10px 14px",
              borderTop: `1px solid ${customer.bg}`,
              alignItems: "center",
            }}
            className="sales-line-row"
          >
            <ProductSelect
              products={products}
              value={it.name}
              onChange={(v) => update(idx, { name: v })}
              onPriceSuggest={(price) => update(idx, { unitPrice: price })}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={it.quantity}
              onChange={(e) => update(idx, { quantity: e.target.value })}
              style={inputStyle("center")}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={it.unitPrice}
              onChange={(e) => update(idx, { unitPrice: e.target.value })}
              style={inputStyle("right")}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={it.vatRate}
              onChange={(e) => update(idx, { vatRate: e.target.value })}
              style={inputStyle("center")}
            />
            <div
              style={{
                textAlign: "right",
                fontWeight: 700,
                color: money.dark,
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              {fmt(lineTotal(it))}
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                fontSize: 18,
              }}
              aria-label="Remove line"
            >
              ×
            </button>
          </div>
        ))}
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${customer.bg}` }}>
          <button
            type="button"
            onClick={add}
            style={{
              background: customer.bg,
              color: customer.dark,
              border: `1px dashed ${customer.base}40`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Add line
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          background: money.bg,
          border: `1px solid ${money.base}25`,
          borderRadius: 14,
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          rowGap: 6,
          maxWidth: 360,
          marginInlineStart: "auto",
        }}
      >
        <span style={{ color: money.dark, fontSize: 13 }}>Subtotal</span>
        <span style={{ textAlign: "right", color: money.dark, fontFamily: "monospace", fontSize: 13 }}>
          {fmt(subtotal)}
        </span>
        <span style={{ color: money.dark, fontSize: 13 }}>VAT</span>
        <span style={{ textAlign: "right", color: money.dark, fontFamily: "monospace", fontSize: 13 }}>
          {fmt(vatTotal)}
        </span>
        <span style={{ color: money.dark, fontSize: 14, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${money.base}30` }}>
          Grand Total
        </span>
        <span style={{ textAlign: "right", color: money.base, fontFamily: "monospace", fontSize: 16, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${money.base}30` }}>
          {fmt(grandTotal)}
        </span>
      </div>
    </div>
  );
}

function inputStyle(align = "left") {
  return {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    fontSize: 13,
    textAlign: align,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "monospace",
  };
}

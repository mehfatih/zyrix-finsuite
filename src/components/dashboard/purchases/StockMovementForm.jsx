// ================================================================
// StockMovementForm — modal/inline form for adding stock movement
// ================================================================
import React, { useMemo, useState } from "react";
import { getPaletteById, getMoneyPalette } from "../../../utils/dashboardPalette";

const TYPES = [
  { id: "IN",         icon: "↓", palette: "emerald" },
  { id: "OUT",        icon: "↑", palette: "rose" },
  { id: "TRANSFER",   icon: "⇄", palette: "indigo" },
  { id: "ADJUSTMENT", icon: "✎", palette: "amber" },
  { id: "RETURN",     icon: "↩", palette: "cyan" },
];

export default function StockMovementForm({
  products = [],
  defaultProductId,
  onSubmit,
  onCancel,
  t = (s) => s,
}) {
  const money = getMoneyPalette();
  const [data, setData] = useState({
    productId: defaultProductId || (products[0]?.id || ""),
    type: "IN",
    quantity: 1,
    unitPrice: 0,
    reference: "",
    notes: "",
  });

  const total = useMemo(
    () => (Number(data.quantity) || 0) * (Number(data.unitPrice) || 0),
    [data.quantity, data.unitPrice]
  );

  const submit = (e) => {
    e?.preventDefault?.();
    if (!data.productId || !data.quantity) return;
    onSubmit && onSubmit(data);
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <Field label={t("form.field.product")}>
        <select
          value={data.productId}
          onChange={(e) => setData({ ...data, productId: e.target.value })}
          style={input()}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.sku ? `· ${p.sku}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("form.field.type")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
          {TYPES.map((tp) => {
            const palette = getPaletteById(tp.palette);
            const active = data.type === tp.id;
            return (
              <button
                key={tp.id}
                type="button"
                onClick={() => setData({ ...data, type: tp.id })}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
                  background: active ? palette.bg : "#fff",
                  color: active ? palette.dark : "#475569",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{tp.icon}</span>
                <span>{t(`movements.type.${tp.id}`)}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label={t("form.field.qty")}>
          <input
            type="number"
            min="0"
            step="1"
            value={data.quantity}
            onChange={(e) => setData({ ...data, quantity: e.target.value })}
            style={{ ...input(), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
        <Field label={t("form.field.unitprice")}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={data.unitPrice}
            onChange={(e) => setData({ ...data, unitPrice: e.target.value })}
            style={{ ...input(), fontFamily: "monospace", textAlign: "end" }}
          />
        </Field>
      </div>

      <Field label={t("form.field.reference")}>
        <input
          type="text"
          value={data.reference}
          onChange={(e) => setData({ ...data, reference: e.target.value })}
          placeholder="PO #, supplier ref…"
          style={input()}
        />
      </Field>

      <Field label={t("form.field.notes")}>
        <textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          rows={2}
          style={{ ...input(), fontFamily: "inherit", resize: "vertical" }}
        />
      </Field>

      <div
        style={{
          background: money.bg,
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1px solid ${money.base}30`,
        }}
      >
        <span style={{ fontSize: 12, color: money.dark, fontWeight: 700 }}>Total Value</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: money.base, fontFamily: "monospace" }}>
          ₺{total.toLocaleString()}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: `linear-gradient(135deg, ${money.base}, ${money.dark})`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: `0 6px 16px ${money.base}40`,
          }}
        >
          {t("form.save")}
        </button>
      </div>
    </form>
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

function input() {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}

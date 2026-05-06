// ================================================================
// Product Create — basic info + initial stock + barcode scanner
// ================================================================
import React, { useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMarketPalette, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import BarcodeScanner from "../../../components/dashboard/purchases/BarcodeScanner";
import { api } from "./productsApi";

export default function ProductCreatePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("products");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    unit: "adet",
    quantity: 0,
    minQuantity: 0,
    costPrice: 0,
    salePrice: 0,
    vatRate: 20,
    location: "",
    description: "",
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const margin = (() => {
    const c = Number(form.costPrice) || 0;
    const s = Number(form.salePrice) || 0;
    if (c <= 0 || s <= 0) return null;
    return Math.round(((s - c) / s) * 100);
  })();

  const submit = async () => {
    if (!form.name) {
      setToast({ kind: "error", msg: t("common.error") });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    const res = await api("/api/stock", { method: "POST", body: JSON.stringify(form) });
    if (res?.success === false) {
      setToast({ kind: "error", msg: res.error || t("common.error") });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    setToast({ kind: "success", msg: t("common.success") });
    setTimeout(() => onNavigate && onNavigate("prod-list"), 600);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("create.title")}
        subtitle={t("create.subtitle")}
        icon="📦"
        palette={market}
        breadcrumb={[
          { label: t("products.title"), href: "#prod-list" },
          { label: t("create.title") },
        ]}
        actions={
          <PageHeaderButton palette={market} variant="ghost" onClick={() => onNavigate && onNavigate("prod-list")}>
            ← {t("products.title")}
          </PageHeaderButton>
        }
      />

      <Card palette={market} title="Basic Info" icon="📝" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Field label={t("create.field.name")}>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input(market)} />
          </Field>
          <Field label={t("create.field.sku")}>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={input(market)} />
          </Field>
          <Field label={t("create.field.barcode")}>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                style={{ ...input(market), flex: 1, fontFamily: "monospace" }}
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                style={{
                  background: market.base,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "0 14px",
                  fontSize: 18,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                title={t("create.scan")}
              >
                📷
              </button>
            </div>
          </Field>
          <Field label={t("create.field.category")}>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={input(market)} />
          </Field>
          <Field label={t("create.field.unit")}>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={input(market)}>
              <option value="adet">adet</option>
              <option value="kg">kg</option>
              <option value="lt">lt</option>
              <option value="m">m</option>
              <option value="m2">m²</option>
              <option value="m3">m³</option>
              <option value="pkt">paket</option>
            </select>
          </Field>
          <Field label={t("create.field.location")}>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={input(market)} />
          </Field>
        </div>
      </Card>

      <Card palette={money} title="Pricing & Stock" icon="💰" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <Field label={t("create.field.cost")}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
            />
          </Field>
          <Field label={t("create.field.price")}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
            />
          </Field>
          <Field label={t("create.field.vat")}>
            <input
              type="number"
              min="0"
              max="100"
              value={form.vatRate}
              onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
              style={{ ...input(money), fontFamily: "monospace", textAlign: "center" }}
            />
          </Field>
          <Field label={t("create.field.qty")}>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
            />
          </Field>
          <Field label={t("create.field.minqty")}>
            <input
              type="number"
              min="0"
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
              style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }}
            />
          </Field>
          {margin != null && (
            <div
              style={{
                background: money.bg,
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                border: `1px solid ${money.base}30`,
              }}
            >
              <span style={{ fontSize: 10, color: money.dark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Margin</span>
              <span style={{ fontSize: 18, color: money.base, fontWeight: 900, fontFamily: "monospace" }}>{margin}%</span>
            </div>
          )}
        </div>
      </Card>

      <Card palette={market} title={t("create.field.description")} icon="📄" style={{ marginBottom: 18 }}>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          style={{ ...input(market), fontFamily: "inherit", resize: "vertical" }}
        />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={submit}
          style={{
            background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
            color: "#fff",
            border: "none",
            padding: "12px 22px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: `0 6px 18px ${brand.base}35`,
          }}
        >
          ✓ {t("create.save")}
        </button>
      </div>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetect={(code) => setForm((f) => ({ ...f, barcode: code }))}
      />

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: toast.kind === "error" ? "#FFE4E6" : "#ECFDF5",
            color: toast.kind === "error" ? "#9F1239" : "#047857",
            border: `1px solid ${toast.kind === "error" ? "#F43F5E" : "#10B981"}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 250,
          }}
        >
          {toast.kind === "error" ? "⚠ " : "✓ "} {toast.msg}
        </div>
      )}
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

// ================================================================
// Purchase Invoice Create — supplier + line items + save (single page)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMarketPalette, getMoneyPalette, getBrandPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import SupplierSelect from "../../../components/dashboard/purchases/SupplierSelect";
import InvoiceLineItems from "../../../components/dashboard/sales/InvoiceLineItems";
import { localStore, KEYS, ensureSupplierSeed, fmtCurrency, api } from "./purchasesApi";

export default function PurchaseInvoiceCreatePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [data, setData] = useState({
    supplierId: null,
    supplierName: "",
    supplierTaxId: "",
    items: [],
    currency: "TRY",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    notes: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    ensureSupplierSeed();
    setSuppliers(localStore.list(KEYS.suppliers));
    api("/api/stock?limit=200").then((res) => {
      const list = res?.data?.items || res?.data?.products || [];
      setProducts((Array.isArray(list) ? list : []).map((p) => ({ name: p.name, price: p.costPrice ?? p.salePrice })));
    });
  }, []);

  useEffect(() => {
    if (!data.supplierId) return;
    const s = suppliers.find((x) => x.id === data.supplierId);
    if (s) setData((d) => ({ ...d, supplierName: s.name, supplierTaxId: s.taxId || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.supplierId]);

  const totals = useMemo(() => {
    const subtotal = data.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const vatTotal = data.items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0) * ((Number(it.vatRate) || 0) / 100),
      0
    );
    return { subtotal, vatTotal, grand: subtotal + vatTotal };
  }, [data.items]);

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 2400);
  };

  const save = (status) => {
    if (!data.supplierName || data.items.length === 0) {
      showToast("error", t("common.error"));
      return;
    }
    const created = localStore.add(KEYS.purchases, {
      number: `PINV-${new Date().getFullYear()}-${String(localStore.list(KEYS.purchases).length + 1).padStart(4, "0")}`,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierTaxId: data.supplierTaxId,
      direction: "OUTGOING",
      items: data.items,
      currency: data.currency,
      subtotal: totals.subtotal,
      vatAmount: totals.vatTotal,
      total: totals.grand,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      status,
      createdAt: new Date().toISOString(),
    });
    showToast("success", t("common.success"));
    setTimeout(() => onNavigate && onNavigate("purch-invoice-detail", { id: created.id }), 350);
  };

  const createSupplier = (name) => {
    const created = localStore.add(KEYS.suppliers, { name: name || "Yeni Tedarikçi", category: "Diğer" });
    setSuppliers(localStore.list(KEYS.suppliers));
    setData((d) => ({ ...d, supplierId: created.id, supplierName: created.name }));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("create.title")}
        subtitle={t("create.subtitle")}
        icon="📥"
        palette={market}
        breadcrumb={[
          { label: t("invoices.title"), href: "#purch-invoices" },
          { label: t("create.title") },
        ]}
        actions={
          <PageHeaderButton palette={market} variant="ghost" onClick={() => onNavigate && onNavigate("purch-invoices")}>
            ← {t("invoices.title")}
          </PageHeaderButton>
        }
      />

      <Card palette={market} title={t("create.step1")} icon="🏭" style={{ marginBottom: 14 }}>
        <SupplierSelect
          suppliers={suppliers}
          value={data.supplierId}
          onChange={(id) => setData({ ...data, supplierId: id })}
          onCreateNew={createSupplier}
          placeholder={t("create.supplier.search")}
        />
      </Card>

      <Card palette={market} title={t("create.step2")} icon="📋" style={{ marginBottom: 14 }}>
        <InvoiceLineItems
          items={data.items}
          onChange={(items) => setData({ ...data, items })}
          products={products}
          currency={data.currency}
        />
      </Card>

      <Card palette={market} title={t("create.step3")} icon="📅" style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <Field label="Issue Date">
            <input type="date" value={data.issueDate} onChange={(e) => setData({ ...data, issueDate: e.target.value })} style={input(market)} />
          </Field>
          <Field label="Due Date">
            <input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} style={input(market)} />
          </Field>
          <Field label="Currency">
            <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} style={input(market)}>
              <option value="TRY">TRY ₺</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Notes">
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              rows={2}
              style={{ ...input(market), fontFamily: "inherit", resize: "vertical" }}
            />
          </Field>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, color: money.dark, fontWeight: 700, marginInlineEnd: "auto" }}>
          Total: <span style={{ fontFamily: "monospace", color: money.base, fontSize: 16, fontWeight: 800 }}>
            {fmtCurrency(totals.grand, data.currency)}
          </span>
        </span>
        <button type="button" onClick={() => save("ACCEPTED")} style={btn(market, "secondary")}>
          {t("create.save")}
        </button>
        <button type="button" onClick={() => save("PAID")} style={btn(brand, "primary")}>
          {t("create.savePay")}
        </button>
      </div>

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
function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}35`,
    };
  }
  return {
    background: "#fff",
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

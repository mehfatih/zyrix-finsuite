// ================================================================
// e-Fatura Create — supplier/customer selection + line items + sign+send
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import CustomerSelect from "../../../components/dashboard/sales/CustomerSelect";
import InvoiceLineItems from "../../../components/dashboard/sales/InvoiceLineItems";
import GibSubmitDialog from "../../../components/dashboard/efatura/GibSubmitDialog";
import { api, localStore, KEYS, fmtCurrency } from "./efaturaApi";

function nextSerial() {
  const arr = localStore.list(KEYS.outgoing);
  const year = new Date().getFullYear();
  const next = String(arr.length + 1).padStart(9, "0");
  return `ZYR${year}${next}`;
}

export default function EFaturaCreatePage({ onNavigate, archive = false }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [data, setData] = useState({
    serial: nextSerial(),
    customerId: null,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerTaxId: "",
    items: [],
    currency: "TRY",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    notes: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api("/api/customers").then((res) => {
      const list = res?.data?.customers || res?.data?.items || res?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    });
    api("/api/stock?limit=200").then((res) => {
      const list = res?.data?.items || res?.data?.products || [];
      setProducts((Array.isArray(list) ? list : []).map((p) => ({ name: p.name, price: p.salePrice ?? p.price })));
    });
  }, []);

  useEffect(() => {
    if (!data.customerId) return;
    const c = customers.find((x) => x.id === data.customerId);
    if (c) setData((d) => ({ ...d, customerName: c.name, customerEmail: c.email || "", customerPhone: c.phone || "", customerTaxId: c.taxId || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.customerId]);

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

  const saveDraft = () => {
    if (!data.customerName || data.items.length === 0) {
      showToast("error", t("common.error"));
      return;
    }
    const created = localStore.add(archive ? KEYS.archive : KEYS.outgoing, {
      ...data,
      uuid: `ETTN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      total: totals.grand,
      subtotal: totals.subtotal,
      vatAmount: totals.vatTotal,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    });
    showToast("success", t("common.success"));
    setTimeout(() => onNavigate && onNavigate(archive ? "efatura-archive" : "efatura-detail", { id: created.id }), 400);
  };

  const signAndSubmit = async (signer) => {
    if (!data.customerName || data.items.length === 0) {
      showToast("error", t("common.error"));
      setDialogOpen(false);
      return;
    }
    const now = new Date().toISOString();
    const created = localStore.add(KEYS.outgoing, {
      ...data,
      uuid: `ETTN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      total: totals.grand,
      subtotal: totals.subtotal,
      vatAmount: totals.vatTotal,
      status: "SUBMITTED",
      signer,
      signedAt: now,
      submittedAt: now,
      createdAt: now,
    });
    setDialogOpen(false);
    showToast("success", t("gib.success"));
    setTimeout(() => onNavigate && onNavigate("efatura-detail", { id: created.id }), 500);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={archive ? t("archive.new") : t("create.title")}
        subtitle={t("create.subtitle")}
        icon="📤"
        palette={brand}
        breadcrumb={[
          { label: archive ? t("archive.title") : t("outgoing.title"), href: archive ? "#efatura-archive" : "#efatura-outgoing" },
          { label: t("create.title") },
        ]}
        actions={
          <PageHeaderButton palette={brand} variant="ghost" onClick={() => onNavigate && onNavigate(archive ? "efatura-archive" : "efatura-outgoing")}>
            ←
          </PageHeaderButton>
        }
      />

      <Card palette={brand} title={t("create.serial")} icon="🔢" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={data.serial}
            onChange={(e) => setData({ ...data, serial: e.target.value })}
            style={{
              flex: 1,
              minWidth: 240,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${brand.base}25`,
              background: "#fff",
              fontSize: 14,
              color: brand.dark,
              fontFamily: "monospace",
              fontWeight: 700,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setData({ ...data, serial: nextSerial() })}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: `1px solid ${brand.base}30`,
              background: brand.bg,
              color: brand.dark,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ⟳ {t("create.serial.auto")}
          </button>
        </div>
      </Card>

      <Card palette={customer} title={t("create.title")} icon="👤" style={{ marginBottom: 14 }}>
        <CustomerSelect
          customers={customers}
          value={data.customerId}
          onChange={(id) => setData({ ...data, customerId: id })}
          onCreateNew={(name) => setData({ ...data, customerId: null, customerName: name || "" })}
          placeholder="Search customer…"
        />
      </Card>

      <Card palette={brand} title="Line Items" icon="📋" style={{ marginBottom: 14 }}>
        <InvoiceLineItems
          items={data.items}
          onChange={(items) => setData({ ...data, items })}
          products={products}
          currency={data.currency}
        />
      </Card>

      <Card palette={brand} title="Details" icon="📅" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <Field label="Issue Date">
            <input type="date" value={data.issueDate} onChange={(e) => setData({ ...data, issueDate: e.target.value })} style={input(brand)} />
          </Field>
          <Field label="Due Date">
            <input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} style={input(brand)} />
          </Field>
          <Field label="Currency">
            <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} style={input(brand)}>
              <option value="TRY">TRY ₺</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </Field>
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: money.dark, fontWeight: 700, marginInlineEnd: "auto" }}>
          Total:{" "}
          <span style={{ fontFamily: "monospace", color: money.base, fontSize: 16, fontWeight: 800 }}>
            {fmtCurrency(totals.grand, data.currency)}
          </span>
        </span>
        <button type="button" onClick={saveDraft} style={btn(brand, "secondary")}>
          {t("create.save")}
        </button>
        {!archive && (
          <button type="button" onClick={() => setDialogOpen(true)} style={btn(brand, "primary")}>
            ✍️ {t("create.signSubmit")}
          </button>
        )}
      </div>

      <GibSubmitDialog
        open={dialogOpen}
        lang={lang}
        t={t}
        onCancel={() => setDialogOpen(false)}
        onConfirm={signAndSubmit}
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
      boxShadow: `0 6px 16px ${palette.base}40`,
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

// ================================================================
// InvoiceForm — multi-step invoice builder (customer → items → details → preview)
// Reusable across Create and Edit pages
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { getBrandPalette, getCustomerPalette, getMoneyPalette, getMarketPalette } from "../../../utils/dashboardPalette";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import CustomerSelect from "./CustomerSelect";
import InvoiceLineItems from "./InvoiceLineItems";

const STEPS = [
  { key: "customer", labelKey: "create.step1" },
  { key: "items",    labelKey: "create.step2" },
  { key: "details",  labelKey: "create.step3" },
  { key: "preview",  labelKey: "create.step4" },
];

export default function InvoiceForm({
  initial = {},
  customers = [],
  products = [],
  onSaveDraft,
  onSendNow,
  onSignGib,
}) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const customerP = getCustomerPalette();
  const money = getMoneyPalette();

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    customerId: initial.customerId || null,
    customerName: initial.customerName || "",
    customerEmail: initial.customerEmail || "",
    customerPhone: initial.customerPhone || "",
    customerTaxId: initial.customerTaxId || "",
    items: initial.items || [],
    currency: initial.currency || "TRY",
    issueDate: initial.issueDate || new Date().toISOString().slice(0, 10),
    dueDate: initial.dueDate || addDays(new Date(), 30).toISOString().slice(0, 10),
    paymentTerms: initial.paymentTerms || "Net 30",
    internalNotes: initial.internalNotes || "",
    customerNotes: initial.customerNotes || "",
    sendChannel: initial.sendChannel || "email",
  });
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  useEffect(() => {
    if (data.customerId) {
      const c = customers.find((x) => x.id === data.customerId);
      if (c) {
        setData((d) => ({
          ...d,
          customerName: c.name || d.customerName,
          customerEmail: c.email || d.customerEmail,
          customerPhone: c.phone || d.customerPhone,
          customerTaxId: c.taxId || d.customerTaxId,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.customerId]);

  useEffect(() => {
    const id = setInterval(() => {
      if (onSaveDraft && data.items.length > 0) {
        onSaveDraft(data, true);
        setAutoSavedAt(new Date());
      }
    }, 30000);
    return () => clearInterval(id);
  }, [data, onSaveDraft]);

  const totals = useMemo(() => {
    const subtotal = data.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const vatTotal = data.items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0) * ((Number(it.vatRate) || 0) / 100),
      0
    );
    return { subtotal, vatTotal, grandTotal: subtotal + vatTotal };
  }, [data.items]);

  const fmt = (n) => `${data.currency === "TRY" ? "₺" : data.currency + " "}${Number(n).toFixed(2)}`;

  const canNext =
    step === 0
      ? !!(data.customerName || data.customerId)
      : step === 1
      ? data.items.length > 0 && data.items.every((it) => it.name && Number(it.quantity) > 0)
      : true;

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      {/* Step indicator */}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: `1px solid ${brand.base}20`,
          padding: "14px 18px",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div
                key={s.key}
                onClick={() => i <= step && setStep(i)}
                style={{
                  flex: "1 1 130px",
                  minWidth: 100,
                  cursor: i <= step ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: active ? brand.base : done ? `${brand.base}20` : "#F1F5F9",
                    color: active ? "#fff" : done ? brand.dark : "#94A3B8",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: active ? brand.dark : done ? "#475569" : "#94A3B8",
                    }}
                  >
                    {t(s.labelKey)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: `${brand.base}15`, borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${brand.base}, ${brand.dark})`,
              transition: "width .25s ease",
            }}
          />
        </div>
      </div>

      {/* Step body */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: `1px solid ${customerP.base}1A`,
          padding: 22,
          minHeight: 320,
        }}
      >
        {step === 0 && (
          <Step1
            data={data}
            setData={setData}
            customers={customers}
            t={t}
            brand={brand}
            customerP={customerP}
          />
        )}
        {step === 1 && (
          <Step2
            data={data}
            setData={setData}
            products={products}
            t={t}
          />
        )}
        {step === 2 && (
          <Step3 data={data} setData={setData} t={t} brand={brand} />
        )}
        {step === 3 && (
          <Step4 data={data} totals={totals} fmt={fmt} brand={brand} t={t} setData={setData} />
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 11, color: "#94A3B8" }}>
          {autoSavedAt && (
            <>
              ✓ {t("create.autosave")} —{" "}
              {autoSavedAt.toLocaleTimeString(lang.toLowerCase(), { hour: "2-digit", minute: "2-digit" })}
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {step > 0 && (
            <button type="button" onClick={back} style={btn("ghost", brand)}>
              ← {t("create.back")}
            </button>
          )}
          {onSaveDraft && (
            <button type="button" onClick={() => onSaveDraft(data, false)} style={btn("secondary", brand)}>
              {t("create.save.draft")}
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              style={{ ...btn("primary", brand), opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed" }}
            >
              {t("create.next")} →
            </button>
          )}
          {step === STEPS.length - 1 && (
            <>
              {onSendNow && (
                <button type="button" onClick={() => onSendNow(data)} style={btn("primary", brand)}>
                  📤 {t("create.send.now")}
                </button>
              )}
              {onSignGib && (
                <button type="button" onClick={() => onSignGib(data)} style={btn("primary", brand)}>
                  ✍️ {t("create.sign.gib")}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Customer ────────────────────────────────────
function Step1({ data, setData, customers, t, brand, customerP }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <SectionLabel palette={customerP}>{t("create.step1")}</SectionLabel>
        <CustomerSelect
          customers={customers}
          value={data.customerId}
          onChange={(id) => setData({ ...data, customerId: id })}
          onCreateNew={(name) => setData({ ...data, customerId: null, customerName: name || "" })}
          placeholder={t("create.customer.search")}
        />
      </div>

      {!data.customerId && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }} className="sales-form-grid">
          <Field label={t("create.customer.name")}>
            <input
              type="text"
              value={data.customerName}
              onChange={(e) => setData({ ...data, customerName: e.target.value })}
              style={inputCss(brand)}
            />
          </Field>
          <Field label={t("create.customer.taxId")}>
            <input
              type="text"
              value={data.customerTaxId}
              onChange={(e) => setData({ ...data, customerTaxId: e.target.value })}
              style={inputCss(brand)}
            />
          </Field>
          <Field label={t("create.customer.email")}>
            <input
              type="email"
              value={data.customerEmail}
              onChange={(e) => setData({ ...data, customerEmail: e.target.value })}
              style={inputCss(brand)}
            />
          </Field>
          <Field label={t("create.customer.phone")}>
            <input
              type="tel"
              value={data.customerPhone}
              onChange={(e) => setData({ ...data, customerPhone: e.target.value })}
              style={inputCss(brand)}
            />
          </Field>
        </div>
      )}

      {data.customerId && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: customerP.bg,
            borderRadius: 12,
            fontSize: 12,
            color: customerP.dark,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>
            🧬 <strong>{t("create.dna.preview")}:</strong> Analytical · High LTV · Score 87/100
          </span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>Auto-filled from customer record</span>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Line Items ───────────────────────────────────
function Step2({ data, setData, products, t }) {
  return (
    <div>
      <SectionLabel>{t("create.step2")}</SectionLabel>
      <div style={{ marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{t("create.currency")}:</label>
        <select
          value={data.currency}
          onChange={(e) => setData({ ...data, currency: e.target.value })}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            background: "#fff",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <option value="TRY">TRY ₺</option>
          <option value="USD">USD $</option>
          <option value="EUR">EUR €</option>
        </select>
      </div>
      <InvoiceLineItems
        items={data.items}
        onChange={(items) => setData({ ...data, items })}
        products={products}
        currency={data.currency}
      />
    </div>
  );
}

// ── Step 3: Details ────────────────────────────────────
function Step3({ data, setData, t, brand }) {
  return (
    <div>
      <SectionLabel>{t("create.step3")}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }} className="sales-form-grid">
        <Field label={t("create.issuedate")}>
          <input
            type="date"
            value={data.issueDate}
            onChange={(e) => setData({ ...data, issueDate: e.target.value })}
            style={inputCss(brand)}
          />
        </Field>
        <Field label={t("create.duedate")}>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => setData({ ...data, dueDate: e.target.value })}
            style={inputCss(brand)}
          />
        </Field>
        <Field label={t("create.terms")}>
          <input
            type="text"
            value={data.paymentTerms}
            onChange={(e) => setData({ ...data, paymentTerms: e.target.value })}
            style={inputCss(brand)}
          />
        </Field>
      </div>
      <Field label={t("create.notes.internal")}>
        <textarea
          value={data.internalNotes}
          onChange={(e) => setData({ ...data, internalNotes: e.target.value })}
          rows={2}
          style={{ ...inputCss(brand), resize: "vertical", fontFamily: "inherit" }}
        />
      </Field>
      <div style={{ height: 12 }} />
      <Field label={t("create.notes.customer")}>
        <textarea
          value={data.customerNotes}
          onChange={(e) => setData({ ...data, customerNotes: e.target.value })}
          rows={2}
          style={{ ...inputCss(brand), resize: "vertical", fontFamily: "inherit" }}
        />
      </Field>
    </div>
  );
}

// ── Step 4: Preview ──────────────────────────────────────
function Step4({ data, totals, fmt, brand, t, setData }) {
  return (
    <div>
      <SectionLabel>{t("create.preview.title")}</SectionLabel>
      <div
        style={{
          background: "#fff",
          border: `1.5px solid ${brand.base}25`,
          borderRadius: 14,
          padding: 24,
          boxShadow: `0 4px 18px ${brand.base}15`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              Z
            </div>
            <div style={{ color: "#0F172A", fontWeight: 800, fontSize: 18 }}>Zyrix FinSuite</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>Your Company GmbH</div>
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ color: brand.dark, fontWeight: 800, fontSize: 22 }}>INVOICE</div>
            <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
              <div>Issue: {data.issueDate}</div>
              <div>Due: {data.dueDate}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Bill To
            </div>
            <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 14 }}>{data.customerName || "—"}</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>
              {data.customerEmail && <div>{data.customerEmail}</div>}
              {data.customerPhone && <div>{data.customerPhone}</div>}
              {data.customerTaxId && <div>VKN: {data.customerTaxId}</div>}
            </div>
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Payment Terms
            </div>
            <div style={{ color: "#0F172A", fontWeight: 600, fontSize: 13 }}>{data.paymentTerms}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: `${brand.base}10` }}>
              <th style={{ textAlign: "start", padding: "8px 10px", color: brand.dark, fontWeight: 700 }}>Description</th>
              <th style={{ textAlign: "center", padding: "8px 10px", color: brand.dark, fontWeight: 700 }}>Qty</th>
              <th style={{ textAlign: "end", padding: "8px 10px", color: brand.dark, fontWeight: 700 }}>Price</th>
              <th style={{ textAlign: "center", padding: "8px 10px", color: brand.dark, fontWeight: 700 }}>VAT</th>
              <th style={{ textAlign: "end", padding: "8px 10px", color: brand.dark, fontWeight: 700 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "8px 10px", color: "#0F172A" }}>{it.name || "—"}</td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.quantity}</td>
                <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                  {fmt(Number(it.unitPrice) || 0)}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>{it.vatRate}%</td>
                <td style={{ padding: "8px 10px", textAlign: "end", fontFamily: "monospace" }}>
                  {fmt((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 6,
            maxWidth: 320,
            marginInlineStart: "auto",
            fontSize: 13,
          }}
        >
          <span style={{ color: "#475569" }}>{t("create.subtotal")}</span>
          <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmt(totals.subtotal)}</span>
          <span style={{ color: "#475569" }}>{t("create.vat")}</span>
          <span style={{ textAlign: "end", fontFamily: "monospace" }}>{fmt(totals.vatTotal)}</span>
          <span style={{ color: brand.dark, fontWeight: 800, paddingTop: 8, borderTop: `1px solid ${brand.base}30` }}>
            {t("create.grandtotal")}
          </span>
          <span
            style={{
              textAlign: "end",
              fontFamily: "monospace",
              fontWeight: 800,
              color: brand.base,
              fontSize: 15,
              paddingTop: 8,
              borderTop: `1px solid ${brand.base}30`,
            }}
          >
            {fmt(totals.grandTotal)}
          </span>
        </div>

        {data.customerNotes && (
          <div style={{ marginTop: 18, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#475569" }}>
            <strong style={{ color: brand.dark }}>Notes:</strong> {data.customerNotes}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["email", "whatsapp", "sms", "portal"].map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setData({ ...data, sendChannel: ch })}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: data.sendChannel === ch ? `2px solid ${brand.base}` : `1px solid #E2E8F0`,
              background: data.sendChannel === ch ? brand.bg : "#fff",
              color: data.sendChannel === ch ? brand.dark : "#475569",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t(`create.send.${ch}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────
function SectionLabel({ children, palette }) {
  return (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 800,
        color: palette?.dark || "#475569",
        marginBottom: 12,
      }}
    >
      {children}
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

function inputCss(brand) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${brand.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}

function btn(variant, brand) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${brand.base}35`,
    };
  }
  if (variant === "secondary") {
    return {
      background: "#fff",
      color: brand.dark,
      border: `1px solid ${brand.base}40`,
      padding: "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    background: "transparent",
    color: "#475569",
    border: "1px solid transparent",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

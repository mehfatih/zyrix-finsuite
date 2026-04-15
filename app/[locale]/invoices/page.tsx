"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://zyrix-backend-production.up.railway.app";
const font = "'DM Sans', 'Outfit', system-ui, sans-serif";
const C = {
  primary: "#D4820A", primaryDark: "#A85F00", primaryLight: "#F0A030",
  bg: "#FDF3E3", bgAlt: "#FFF8F0", bgCard: "#FFFFFF",
  border: "#F5D5A0", text: "#1A0E00", textMid: "#4A3010", textLight: "#7A5828",
  success: "#059669", successBg: "#ECFDF5",
  warning: "#D97706", warningBg: "#FFFBEB",
  danger: "#DC2626", dangerBg: "#FEF2F2",
  gray: "#6B7280", grayBg: "#F9FAFB",
};

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "draft";
  dueDate: string;
  createdAt: string;
}

const DEMO_INVOICES: Invoice[] = [
  { id: "1", invoiceNumber: "INV-0001", customerName: "Ahmed Al-Rashid", amount: 12500, currency: "SAR", status: "paid", dueDate: "2025-01-10", createdAt: "2024-12-28" },
  { id: "2", invoiceNumber: "INV-0002", customerName: "Fatima Hassan", amount: 3200, currency: "AED", status: "pending", dueDate: "2025-01-20", createdAt: "2025-01-05" },
  { id: "3", invoiceNumber: "INV-0003", customerName: "Mehmet Yilmaz", amount: 48000, currency: "TRY", status: "overdue", dueDate: "2025-01-08", createdAt: "2024-12-20" },
  { id: "4", invoiceNumber: "INV-0004", customerName: "Sara Al-Otaibi", amount: 850, currency: "KWD", status: "draft", dueDate: "2025-02-01", createdAt: "2025-01-12" },
  { id: "5", invoiceNumber: "INV-0005", customerName: "Khalid Ibrahim", amount: 7800, currency: "SAR", status: "paid", dueDate: "2025-01-15", createdAt: "2025-01-02" },
  { id: "6", invoiceNumber: "INV-0006", customerName: "Layla Karimi", amount: 2100, currency: "USD", status: "pending", dueDate: "2025-01-25", createdAt: "2025-01-08" },
];

const statusCfg = {
  paid:    { label: "Paid",    color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  pending: { label: "Pending", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  overdue: { label: "Overdue", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
  draft:   { label: "Draft",   color: "#6B7280", bg: "#F9FAFB", border: "#D1D5DB" },
};

const sym: Record<string, string> = { SAR: "﷼", AED: "د.إ", TRY: "₺", KWD: "د.ك", USD: "$", EUR: "€" };

export default function InvoicesPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  function L(en: string, ar: string, tr: string): string {
    return locale === "ar" ? ar : locale === "tr" ? tr : en;
  }

  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ customerName: "", amount: "", currency: "SAR", dueDate: "" });

  useEffect(() => {
    const token = localStorage.getItem("zyrix_merchant_token");
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/invoices?status=${filter === "all" ? "" : filter}&search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d?.data) setInvoices(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, search]);

  const filtered = invoices.filter(inv => {
    const matchFilter = filter === "all" || inv.status === filter;
    const matchSearch = !search || inv.customerName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(i => i.id));

  const createInvoice = async () => {
    const token = localStorage.getItem("zyrix_merchant_token");
    const body = { ...newInvoice, amount: parseFloat(newInvoice.amount), status: "draft" };
    try {
      const res = await fetch(`${API}/api/invoices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d?.data) setInvoices(p => [d.data, ...p]);
    } catch {
      const mock: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-${String(invoices.length + 1).padStart(4, "0")}`,
        customerName: newInvoice.customerName,
        amount: parseFloat(newInvoice.amount) || 0,
        currency: newInvoice.currency,
        status: "draft",
        dueDate: newInvoice.dueDate,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setInvoices(p => [mock, ...p]);
    }
    setShowModal(false);
    setNewInvoice({ customerName: "", amount: "", currency: "SAR", dueDate: "" });
  };

  const filters = [
    ["all",     L("All",     "الكل",   "Tümü")],
    ["paid",    L("Paid",    "مدفوعة", "Ödendi")],
    ["pending", L("Pending", "معلقة",  "Beklemede")],
    ["overdue", L("Overdue", "متأخرة", "Gecikmiş")],
    ["draft",   L("Draft",   "مسودة",  "Taslak")],
  ];

  const inputStyle: React.CSSProperties = {
    padding: "9px 12px", borderRadius: 8,
    border: `1.5px solid ${C.border}`,
    fontFamily: font, fontSize: 13,
    color: C.text, outline: "none",
    backgroundColor: C.bgCard,
  };

  return (
    <div style={{ fontFamily: font, backgroundColor: C.bg, minHeight: "100vh" }} dir={dir}>

      <header style={{ backgroundColor: C.bgCard, borderBottom: `1.5px solid ${C.border}`, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href={`/${locale}/dashboard`} style={{ fontSize: 13, color: C.primary, fontWeight: 700, textDecoration: "none" }}>
            {dir === "rtl" ? "→" : "←"} {L("Dashboard", "اللوحة", "Panel")}
          </a>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
            📄 {L("Invoices", "الفواتير", "Faturalar")}
          </span>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 10, border: "none", backgroundColor: C.primary, color: "#FFFFFF", fontFamily: font, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          + {L("Create Invoice", "إنشاء فاتورة", "Fatura Oluştur")}
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* KPI Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: L("Total",   "الإجمالي", "Toplam"),    value: invoices.length, color: C.primary },
            { label: L("Paid",    "مدفوعة",   "Ödendi"),    value: invoices.filter(i => i.status === "paid").length,    color: C.success },
            { label: L("Pending", "معلقة",    "Beklemede"), value: invoices.filter(i => i.status === "pending").length, color: C.warning },
            { label: L("Overdue", "متأخرة",   "Gecikmiş"),  value: invoices.filter(i => i.status === "overdue").length, color: C.danger },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bgCard, borderRadius: 12, padding: "16px 18px", border: `1.5px solid ${C.border}` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
            {filters.map(([val, label], i) => (
              <button key={i} onClick={() => setFilter(val)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: font, fontSize: 12, fontWeight: 700,
                backgroundColor: filter === val ? C.primary : "transparent",
                color: filter === val ? "#FFFFFF" : C.textLight,
              }}>{label}</button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={L("Search invoices...", "بحث في الفواتير...", "Fatura ara...")}
            style={{ ...inputStyle, width: 220 }}
          />
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", backgroundColor: `${C.primary}14`, border: `1px solid ${C.primary}44`, borderRadius: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{selected.length} {L("selected", "محددة", "seçili")}</span>
            <button style={{ padding: "4px 12px", borderRadius: 8, border: `1px solid ${C.primary}`, backgroundColor: "transparent", color: C.primary, fontFamily: font, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {L("Mark as Paid", "تعليم كمدفوعة", "Ödendi Olarak İşaretle")}
            </button>
            <button style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #FECACA", backgroundColor: "transparent", color: C.danger, fontFamily: font, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {L("Delete", "حذف", "Sil")}
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ backgroundColor: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }}>
            <thead>
              <tr style={{ backgroundColor: C.bgAlt }}>
                <th style={{ padding: "12px 16px", textAlign: "center", width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    style={{ accentColor: C.primary, cursor: "pointer" }}
                  />
                </th>
                {[
                  L("Invoice #",    "رقم الفاتورة",      "Fatura #"),
                  L("Customer",     "العميل",             "Müşteri"),
                  L("Amount",       "المبلغ",             "Tutar"),
                  L("Status",       "الحالة",             "Durum"),
                  L("Due Date",     "تاريخ الاستحقاق",   "Vade Tarihi"),
                  L("Actions",      "الإجراءات",          "İşlemler"),
                ].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: dir === "rtl" ? "right" : "left", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: C.textLight, fontSize: 14 }}>
                    {L("Loading...", "جاري التحميل...", "Yükleniyor...")}
                  </td>
                </tr>
              ) : filtered.map((inv, i) => {
                const sc = statusCfg[inv.status];
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}`, backgroundColor: selected.includes(inv.id) ? `${C.primary}08` : "transparent" }}>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} style={{ accentColor: C.primary, cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.primary }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.text }}>{inv.customerName}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 800, color: C.text, fontFamily: "monospace" }}>{sym[inv.currency] || inv.currency}{inv.amount.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, backgroundColor: sc.bg, border: `1px solid ${sc.border}`, padding: "3px 9px", borderRadius: 20 }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: inv.status === "overdue" ? C.danger : C.textLight, fontWeight: inv.status === "overdue" ? 700 : 400 }}>{inv.dueDate}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${C.border}`, backgroundColor: "transparent", fontFamily: font, fontSize: 11, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
                          {L("View", "عرض", "Görüntüle")}
                        </button>
                        <button style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${C.primary}44`, backgroundColor: "transparent", fontFamily: font, fontSize: 11, fontWeight: 700, color: C.primary, cursor: "pointer" }}>
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: C.textLight, fontSize: 14 }}>
              {L("No invoices found", "لا توجد فواتير", "Fatura bulunamadı")}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: "28px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }} dir={dir}>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 20 }}>
              {L("Create Invoice", "إنشاء فاتورة", "Fatura Oluştur")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                [L("Customer Name", "اسم العميل", "Müşteri Adı"), "customerName", "text"],
                [L("Amount",        "المبلغ",     "Tutar"),        "amount",       "number"],
                [L("Due Date",      "تاريخ الاستحقاق", "Vade Tarihi"), "dueDate", "date"],
              ] as [string, string, string][]).map(([label, key, type], i) => (
                <div key={i}>
                  <label style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                  <input
                    type={type}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: font, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box" }}
                    value={newInvoice[key as keyof typeof newInvoice]}
                    onChange={e => setNewInvoice(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {L("Currency", "العملة", "Para Birimi")}
                </label>
                <select
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontFamily: font, fontSize: 14, color: C.text, outline: "none", appearance: "none", backgroundColor: C.bgCard }}
                  value={newInvoice.currency}
                  onChange={e => setNewInvoice(p => ({ ...p, currency: e.target.value }))}
                >
                  {["SAR", "AED", "TRY", "KWD", "QAR", "USD", "EUR"].map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`, backgroundColor: "transparent", fontFamily: font, fontSize: 13, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
                {L("Cancel", "إلغاء", "İptal")}
              </button>
              <button onClick={createInvoice} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", backgroundColor: C.primary, color: "#FFFFFF", fontFamily: font, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {L("Create Invoice", "إنشاء الفاتورة", "Fatura Oluştur")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ================================================================
// Quotes & Proposals — list with template gallery + win-rate KPIs
// (Backend lacks a /api/quotes route — we maintain quote state in
// localStorage for now. The shape mirrors invoices for easy promotion.)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getMoneyPalette,
  getCustomerPalette,
  getReportsPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { fmtCurrency, fmtDate, daysBetween } from "./salesApi";

const STORAGE_KEY = "zyrix_quotes_v1";

const TEMPLATES = [
  { id: "modern",  icon: "✨", labelKey: "quotes.template.modern",  accent: "#6C3AFF" },
  { id: "classic", icon: "📜", labelKey: "quotes.template.classic", accent: "#92400E" },
  { id: "minimal", icon: "◻", labelKey: "quotes.template.minimal", accent: "#0F172A" },
  { id: "elegant", icon: "❦", labelKey: "quotes.template.elegant", accent: "#A8081A" },
  { id: "bold",    icon: "▶", labelKey: "quotes.template.bold",    accent: "#F97316" },
];

const STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return seedQuotes();
}

function saveQuotes(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

function seedQuotes() {
  const today = new Date();
  return [
    {
      id: "q1",
      number: `QT-${today.getFullYear()}-0001`,
      customerName: "Demo Müşteri A.Ş.",
      total: 18500,
      currency: "TRY",
      status: "SENT",
      template: "modern",
      validUntil: new Date(today.getTime() + 25 * 86400000).toISOString(),
      createdAt: today.toISOString(),
    },
    {
      id: "q2",
      number: `QT-${today.getFullYear()}-0002`,
      customerName: "Acme Yapı Ltd.",
      total: 42000,
      currency: "TRY",
      status: "ACCEPTED",
      template: "elegant",
      validUntil: new Date(today.getTime() + 5 * 86400000).toISOString(),
      createdAt: new Date(today.getTime() - 12 * 86400000).toISOString(),
    },
  ];
}

export default function QuotesPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();

  const [quotes, setQuotes] = useState(() => loadQuotes());
  const [tab, setTab] = useState("ALL");
  const [tplPicker, setTplPicker] = useState(false);

  useEffect(() => saveQuotes(quotes), [quotes]);

  const stats = useMemo(() => {
    const open = quotes.filter((q) => q.status === "SENT" || q.status === "DRAFT").length;
    const accepted = quotes.filter((q) => q.status === "ACCEPTED").length;
    const expired = quotes.filter((q) => q.status === "EXPIRED" || (q.validUntil && new Date(q.validUntil) < new Date() && q.status !== "ACCEPTED")).length;
    const completed = accepted + quotes.filter((q) => q.status === "REJECTED").length;
    const winrate = completed > 0 ? Math.round((accepted / completed) * 100) : 0;
    return { open, accepted, expired, winrate };
  }, [quotes]);

  const filtered = useMemo(() => {
    if (tab === "ALL") return quotes;
    return quotes.filter((q) => q.status === tab);
  }, [quotes, tab]);

  const createDemo = (templateId) => {
    const next = {
      id: `q${Date.now()}`,
      number: `QT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(4, "0")}`,
      customerName: "New Quote",
      total: 0,
      currency: "TRY",
      status: "DRAFT",
      template: templateId,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setQuotes([next, ...quotes]);
    setTplPicker(false);
    if (onNavigate) onNavigate("sales-quote-detail", { id: next.id });
  };

  const convertToInvoice = (q) => {
    setQuotes((arr) => arr.map((x) => (x.id === q.id ? { ...x, status: "ACCEPTED" } : x)));
    if (onNavigate) onNavigate("sales-invoice-new", { quoteId: q.id });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("quotes.title")}
        subtitle={t("quotes.subtitle")}
        icon="📄"
        palette={reports}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setTplPicker(true)}>
            {t("quotes.new")}
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
        className="sales-kpi-grid"
      >
        <KpiCard label={t("quotes.kpi.open")} value={stats.open} palette={reports} icon="📋" />
        <KpiCard label={t("quotes.kpi.accepted")} value={stats.accepted} palette={success} icon="✅" />
        <KpiCard label={t("quotes.kpi.expired")} value={stats.expired} palette={alert} icon="⏰" />
        <KpiCard label={t("quotes.kpi.winrate")} value={stats.winrate} suffix="%" palette={money} icon="🏆" />
      </div>

      {tplPicker && (
        <Card palette={customer} title="Choose a template" icon="🎨" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => createDemo(tpl.id)}
                style={{
                  background: "#fff",
                  border: `2px solid ${tpl.accent}30`,
                  borderRadius: 14,
                  padding: 18,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 10px 24px ${tpl.accent}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{ fontSize: 30, color: tpl.accent }}>{tpl.icon}</div>
                <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13 }}>{t(tpl.labelKey)}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div
        style={{
          background: "#fff",
          border: `1px solid ${reports.base}15`,
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {["ALL", ...STATUSES].map((s) => {
          const active = tab === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: active ? `2px solid ${reports.base}` : `1px solid ${reports.base}30`,
                background: active ? reports.base : `${reports.base}10`,
                color: active ? "#fff" : reports.dark,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {s === "ALL" ? t("invoices.filter.all") : t(`quotes.status.${s}`)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("quotes.empty")} icon="📄" palette={reports} />
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `1px solid ${reports.base}15`,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: reports.bg }}>
                <th style={th}>{t("invoices.col.status")}</th>
                <th style={th}>{t("quotes.col.number")}</th>
                <th style={th}>{t("invoices.col.customer")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.amount")}</th>
                <th style={th}>{t("quotes.col.validity")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const validDays = daysBetween(new Date(), q.validUntil);
                return (
                  <tr
                    key={q.id}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                    onClick={() => onNavigate && onNavigate("sales-quote-detail", { id: q.id })}
                    onMouseEnter={(e) => (e.currentTarget.style.background = reports.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <InvoiceStatusPill status={q.status} label={t(`quotes.status.${q.status}`)} />
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: reports.dark, fontWeight: 700 }}>{q.number}</td>
                    <td style={td}>{q.customerName}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(q.total, q.currency)}
                    </td>
                    <td style={{ ...td, color: validDays < 0 ? alert.base : "#64748B", fontSize: 12 }}>
                      {fmtDate(q.validUntil, lang)} {validDays > 0 && <span style={{ color: warn.base }}>· {validDays}d</span>}
                    </td>
                    <td style={{ ...td, textAlign: "end" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => convertToInvoice(q)}
                        style={{
                          background: success.bg,
                          color: success.dark,
                          border: `1px solid ${success.base}40`,
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        → {t("quotes.action.toinvoice")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .sales-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
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
const td = { padding: "12px 14px", color: "#0F172A" };

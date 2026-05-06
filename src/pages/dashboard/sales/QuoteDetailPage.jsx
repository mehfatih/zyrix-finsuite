// ================================================================
// Quote Detail — preview + accept/reject + convert actions
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getSuccessPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { fmtCurrency, fmtDate } from "./salesApi";

const STORAGE_KEY = "zyrix_quotes_v1";

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveQuotes(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

export default function QuoteDetailPage({ quoteId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const all = loadQuotes();
    setQuote(all.find((q) => q.id === quoteId) || null);
  }, [quoteId]);

  if (!quote) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const updateStatus = (status) => {
    const all = loadQuotes();
    const next = all.map((q) => (q.id === quoteId ? { ...q, status } : q));
    saveQuotes(next);
    setQuote({ ...quote, status });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={quote.number}
        subtitle={quote.customerName}
        icon="📄"
        palette={reports}
        breadcrumb={[
          { label: t("quotes.title"), href: "#sales-quotes" },
          { label: quote.number },
        ]}
        actions={
          <PageHeaderButton palette={reports} variant="ghost" onClick={() => onNavigate && onNavigate("sales-quotes")}>
            ← {t("quotes.title")}
          </PageHeaderButton>
        }
      />

      <div
        style={{
          background: "#fff",
          border: `1px solid ${reports.base}20`,
          borderRadius: 16,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          boxShadow: `0 4px 14px ${reports.base}10`,
        }}
      >
        <InvoiceStatusPill status={quote.status} label={t(`quotes.status.${quote.status}`)} />
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => updateStatus("ACCEPTED")} style={btn(success)}>
          ✓ {t("quotes.status.ACCEPTED")}
        </button>
        <button type="button" onClick={() => updateStatus("REJECTED")} style={btn(alert)}>
          ✗ {t("quotes.status.REJECTED")}
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate("sales-invoice-new", { quoteId: quote.id })}
          style={btn(brand, true)}
        >
          → {t("quotes.action.toinvoice")}
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1.5px solid ${reports.base}25`,
          borderRadius: 16,
          padding: 28,
          maxWidth: 720,
          marginInline: "auto",
          boxShadow: `0 8px 28px ${reports.base}15`,
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
          </div>
          <div style={{ textAlign: "end" }}>
            <div style={{ color: reports.dark, fontWeight: 800, fontSize: 22 }}>QUOTE</div>
            <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
              <div>#{quote.number}</div>
              <div>Valid until {fmtDate(quote.validUntil, lang)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>For</div>
          <div style={{ color: "#0F172A", fontWeight: 700, fontSize: 16, marginTop: 2 }}>{quote.customerName}</div>
        </div>

        <div
          style={{
            background: reports.bg,
            borderRadius: 14,
            padding: 24,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 11, color: reports.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {t("create.grandtotal")}
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: reports.base, fontFamily: "monospace" }}>
            {fmtCurrency(quote.total, quote.currency)}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
          This proposal is valid until {fmtDate(quote.validUntil, lang)}. Acceptance constitutes a binding agreement
          subject to standard terms.
        </div>
      </div>
    </div>
  );
}

function btn(palette, primary = false) {
  return primary
    ? {
        background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
        color: "#fff",
        border: "none",
        padding: "8px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: `0 4px 12px ${palette.base}30`,
      }
    : {
        background: palette.bg,
        color: palette.dark,
        border: `1px solid ${palette.base}40`,
        padding: "8px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
      };
}

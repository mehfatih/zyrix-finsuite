// ================================================================
// One-Click Recurring Setup — AI detects repeating customers + suggests
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { api, localStore, KEYS, fmtCurrency } from "./autopilotsApi";

// Detect recurring patterns in invoices
function detectPatterns(invoices) {
  const byCustomer = {};
  invoices.forEach((inv) => {
    const key = inv.customerId || inv.customerName;
    if (!key) return;
    if (!byCustomer[key]) byCustomer[key] = [];
    byCustomer[key].push(inv);
  });
  const patterns = [];
  Object.entries(byCustomer).forEach(([key, list]) => {
    if (list.length < 2) return;
    // Sort and compute typical interval
    const sorted = list.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((new Date(sorted[i].createdAt) - new Date(sorted[i - 1].createdAt)) / 86400000);
    }
    const avgInterval = intervals.reduce((s, x) => s + x, 0) / intervals.length;
    const avgAmount = list.reduce((s, x) => s + Number(x.total || 0), 0) / list.length;
    let frequency = "MONTHLY";
    if (avgInterval <= 2) frequency = "DAILY";
    else if (avgInterval <= 10) frequency = "WEEKLY";
    else if (avgInterval <= 45) frequency = "MONTHLY";
    else if (avgInterval <= 100) frequency = "QUARTERLY";
    else frequency = "YEARLY";
    patterns.push({
      id: `pat-${key}`,
      customerName: list[0].customerName,
      count: list.length,
      avgAmount: Math.round(avgAmount),
      currency: list[0].currency || "TRY",
      frequency,
      avgInterval: Math.round(avgInterval),
    });
  });
  // Add a couple of demo patterns when there's nothing to suggest
  if (patterns.length === 0) {
    patterns.push(
      { id: "pat-demo-1", customerName: "Demo Müşteri A.Ş.",  count: 3, avgAmount: 4500,  currency: "TRY", frequency: "MONTHLY", avgInterval: 30 },
      { id: "pat-demo-2", customerName: "Acme Yapı Ltd.",     count: 4, avgAmount: 1200,  currency: "TRY", frequency: "WEEKLY",  avgInterval: 7 },
      { id: "pat-demo-3", customerName: "Beta İnşaat",         count: 2, avgAmount: 18900, currency: "TRY", frequency: "QUARTERLY", avgInterval: 90 },
    );
  }
  return patterns;
}

const FREQ_LABEL = { DAILY: "Günlük", WEEKLY: "Haftalık", MONTHLY: "Aylık", QUARTERLY: "Üç Aylık", YEARLY: "Yıllık" };

export default function RecurringSetupPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [invoices, setInvoices] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [savedToast, setSavedToast] = useState(null);

  useEffect(() => {
    api("/api/invoices?limit=500").then((r) => {
      setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []);
    });
    setDismissed(localStore.list(KEYS.recurringDismiss).map((d) => d.id));
  }, []);

  const patterns = useMemo(() => detectPatterns(invoices), [invoices]);
  const visible = patterns.filter((p) => !dismissed.includes(p.id));

  const dismiss = (id, kind = "later") => {
    localStore.add(KEYS.recurringDismiss, { id, kind, at: new Date().toISOString() });
    setDismissed((arr) => [...arr, id]);
  };

  const setup = (pattern) => {
    // Persist a recurring plan (matches Phase 4 store)
    localStore.add("zyrix_recurring_plans_v1", {
      customerName: pattern.customerName,
      amount: pattern.avgAmount,
      currency: pattern.currency,
      frequency: pattern.frequency,
      autoSend: true,
      startDate: new Date().toISOString().slice(0, 10),
      nextRunDate: new Date(Date.now() + pattern.avgInterval * 86400000).toISOString(),
      status: "ACTIVE",
      template: `Auto-detected from ${pattern.count} invoices`,
      createdAt: new Date().toISOString(),
    });
    setDismissed((arr) => [...arr, pattern.id]);
    setSavedToast(t("recurring.cta.setup"));
    setTimeout(() => setSavedToast(null), 2400);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("recurring.title")} subtitle={t("recurring.subtitle")} icon="🔁" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label="Detected Patterns" value={patterns.length} palette={ai} icon="🤖" />
        <KpiCard label="Awaiting Decision" value={visible.length} palette={customer} icon="⏳" pulse={visible.length > 0} />
        <KpiCard label="Avg Annual Value" value={Math.round(visible.reduce((s, p) => s + p.avgAmount * (365 / Math.max(1, p.avgInterval)), 0))} prefix="₺" palette={money} icon="📈" />
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("recurring.empty")} icon="🎉" palette={success} />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {visible.map((p) => (
            <Card key={p.id} palette={ai}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" }} className="rec-grid">
                <div>
                  <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    🤖 {t("recurring.detected.title")}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
                    {t("recurring.detected.subtitle")
                      .replace("{count}", p.count)
                      .replace("{customer}", p.customerName)}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#64748B" }}>
                    <span>
                      <strong style={{ color: ai.dark }}>{t("recurring.suggested.freq")}:</strong> {FREQ_LABEL[p.frequency] || p.frequency}
                    </span>
                    <span>
                      <strong style={{ color: ai.dark }}>{t("recurring.suggested.amount")}:</strong>{" "}
                      <span style={{ fontFamily: "monospace", color: money.dark, fontWeight: 700 }}>
                        {fmtCurrency(p.avgAmount, p.currency)}
                      </span>
                    </span>
                    <span style={{ fontStyle: "italic", color: "#94A3B8" }}>
                      Avg interval: ~{p.avgInterval} days
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => dismiss(p.id, "later")} style={btn(reports, "secondary")}>
                    {t("recurring.cta.dismiss")}
                  </button>
                  <button type="button" onClick={() => dismiss(p.id, "never")} style={btn(reports, "secondary")}>
                    {t("recurring.cta.never")}
                  </button>
                  <button type="button" onClick={() => setup(p)} style={btn(brand, "primary")}>
                    ⚡ {t("recurring.cta.setup")}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: `linear-gradient(135deg, ${success.bg}, ${ai.bg})`,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 14,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            boxShadow: `0 10px 32px ${success.base}40`,
            zIndex: 250,
          }}
        >
          ✓ {savedToast}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

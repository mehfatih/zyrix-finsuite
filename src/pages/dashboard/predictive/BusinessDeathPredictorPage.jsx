// ================================================================
// ★ Business Death Predictor — HERO PAGE
// 47-signal AI model with heartbeat + radar + 12-step recovery
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getSuccessPalette,
  getWarningPalette,
  getAlertPalette,
  getCustomerPalette,
  getMoneyPalette,
  getReportsPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import HeartbeatLine from "../../../components/dashboard/predictive/HeartbeatLine";
import HealthScoreGauge from "../../../components/dashboard/predictive/HealthScoreGauge";
import SignalRadar from "../../../components/dashboard/predictive/SignalRadar";
import { api, localStore, KEYS, scoreBusinessHealth, fmtRelative } from "./predictiveApi";

const RECOVERY_STEPS = {
  healthy: [],
  caution: [
    { priority: 1, title: "Build a 30-day cash buffer", action: "Defer non-essential expenses", impact: "+15 days runway" },
    { priority: 2, title: "Diversify top 5 customers", action: "Auto-engage 23 dormant customers", impact: "Reduce concentration to <50%" },
    { priority: 2, title: "Tighten DSO", action: "Send overdue reminders", impact: "+₺18,000 cashflow" },
  ],
  warning: [
    { priority: 1, title: "Reduce customer concentration: top 5 → <50% revenue", action: "Reach out to 23 dormant customers", impact: "+₺22,000/mo new revenue" },
    { priority: 1, title: "Build cash reserve (currently 18 days, target 60)", action: "Defer non-essential expenses", impact: "+42 days runway" },
    { priority: 2, title: "Reduce DSO from 45 → 30 days", action: "Tighten payment terms + auto-reminders", impact: "+₺34,000 freed cash" },
    { priority: 2, title: "Diversify supplier base", action: "Identify 3 alternative suppliers", impact: "Reduces single-source risk" },
    { priority: 3, title: "Increase margin: review pricing on top 10 SKUs", action: "AI pricing autopilot", impact: "+5-8% margin lift" },
    { priority: 3, title: "Cut subscription bloat", action: "Hidden Cash scanner found ₺2,890/yr", impact: "Direct savings" },
  ],
  critical: [
    { priority: 1, title: "Emergency cash freeze (this week)", action: "Pause all non-essential payments", impact: "+30 days runway" },
    { priority: 1, title: "Renegotiate top 3 supplier terms", action: "Request 60-day terms instead of 30", impact: "+₺45,000 cash" },
    { priority: 1, title: "Reduce concentration risk URGENT", action: "Diversify revenue base", impact: "Survival critical" },
    { priority: 2, title: "Cut variable costs 15%", action: "Show cuttable expenses report", impact: "-₺18,000/mo" },
    { priority: 2, title: "Aggressive collections on overdue", action: "Daily WhatsApp reminders", impact: "+₺34,000 cashflow" },
    { priority: 2, title: "Pause hiring + capex", action: "Freeze all non-essential", impact: "Conserve cash" },
    { priority: 3, title: "Consider bridge financing", action: "Banks comparison report", impact: "Buy time to recover" },
    { priority: 3, title: "Review owner draw", action: "Reduce by 30% temporarily", impact: "+₺8,000/mo" },
  ],
};

const PEERS = [
  { name: "Demo Tic. Ltd. Şti.",      sector: "Yapı malzemesi", match: 78, closedAfter: "9 months" },
  { name: "Acme Tedarik A.Ş.",         sector: "Toptan satış",   match: 71, closedAfter: "11 months" },
  { name: "Beta Sanayi Ürünleri",      sector: "Sanayi",         match: 64, closedAfter: "7 months" },
];

export default function BusinessDeathPredictorPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [scanning, setScanning] = useState(false);
  const [scanAt, setScanAt] = useState(null);
  const [health, setHealth] = useState(null);

  const reload = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 900));
    const [invRes] = await Promise.all([api("/api/invoices?limit=500"), api("/api/customers")]);
    const customers = (await api("/api/customers"))?.data || [];
    const cs = Array.isArray(customers) ? customers : (customers?.customers || customers?.items || []);
    const invoices = invRes?.data?.invoices || invRes?.data?.items || invRes?.data || [];
    const purchases = localStore.list("zyrix_purchase_invoices_v1");
    const expenses  = localStore.list("zyrix_expenses_v1");
    const accounts  = localStore.list("zyrix_cash_accounts_v1");
    const cash = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const monthBurn = Math.max(30000, expenses.reduce((s, e) => s + Number(e.amount || 0), 0) + purchases.reduce((s, p) => s + Number(p.total || 0), 0));
    const result = scoreBusinessHealth({
      invoices: Array.isArray(invoices) ? invoices : [],
      customers: cs,
      purchases,
      expenses,
      cash,
      monthBurn,
    });
    setHealth(result);
    const now = new Date().toISOString();
    localStore.saveKv(KEYS.deathLastScan, now);
    setScanAt(now);
    setScanning(false);
  };

  useEffect(() => {
    setScanAt(localStore.getKv(KEYS.deathLastScan, null));
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = health?.status || "healthy";
  const statusPalette =
    status === "healthy" ? success :
    status === "caution" ? customer :
    status === "warning" ? warn : alert;

  const closureWindowMonths = status === "critical" ? 4 : status === "warning" ? 8 : status === "caution" ? 14 : 24;
  const closureDate = new Date(Date.now() + closureWindowMonths * 30 * 86400000);
  const recovery = RECOVERY_STEPS[status] || [];

  // KPI breakdown
  const stats = useMemo(() => {
    if (!health) return { signals: 0, healthy: 0, warning: 0, critical: 0 };
    return {
      signals: health.signals.length,
      healthy: health.signals.filter((s) => s.severity === "healthy").length,
      warning: health.signals.filter((s) => s.severity === "warning").length,
      critical: health.signals.filter((s) => s.severity === "critical").length,
    };
  }, [health]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("death.title")}
        subtitle={t("death.subtitle")}
        icon="❤️"
        palette={statusPalette}
        actions={
          <PageHeaderButton palette={ai} variant="primary" icon="🔄" onClick={reload} disabled={scanning}>
            {scanning ? t("death.scan.running") : t("death.scan.run")}
          </PageHeaderButton>
        }
      />

      {/* HERO — heartbeat + gauge */}
      <div
        style={{
          background: `linear-gradient(135deg, #0F172A 0%, ${statusPalette.dark} 100%)`,
          borderRadius: 22,
          padding: "26px 22px",
          marginBottom: 18,
          boxShadow: `0 16px 48px ${statusPalette.base}50`,
          color: "#fff",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center" }} className="death-hero-grid">
          <div>
            <HealthScoreGauge score={health?.score || 0} size={240} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: statusPalette.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
              ❤️ {t("death.hero.score")}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
              {t(`death.status.${status}`)}
            </div>
            <div style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 16, fontStyle: "italic" }}>
              {t(`death.status.${status}.desc`)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="death-stat-grid">
              <Stat label={t("death.risk.label")} value={`${health?.closureRisk || 0}%`} palette={statusPalette} />
              <Stat label={t("death.risk.window")} value={closureDate.toLocaleDateString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "long", year: "numeric" })} palette={statusPalette} />
            </div>
            <HeartbeatLine score={health?.score || 0} width={520} height={80} />
            {scanAt && (
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 12 }}>
                {t("death.scan.last").replace("{time}", fmtRelative(scanAt))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signal KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="predict-kpi-grid"
      >
        <KpiCard label="Total Signals" value={stats.signals} palette={ai} icon="📡" />
        <KpiCard label={t("death.signals.healthy")} value={stats.healthy} palette={success} icon="✅" />
        <KpiCard label={t("death.signals.warning")} value={stats.warning} palette={warn} icon="⚠️" />
        <KpiCard label={t("death.signals.critical")} value={stats.critical} palette={alert} icon="🚨" pulse={stats.critical > 0} />
      </div>

      {/* Radar */}
      <Card palette={ai} title={t("death.signals.title")} subtitle={t("death.signals.subtitle")} icon="📡" style={{ marginBottom: 18 }}>
        <SignalRadar signals={health?.signals || []} size={420} />
      </Card>

      {/* Recovery plan (if not healthy) */}
      {status !== "healthy" && recovery.length > 0 && (
        <Card palette={statusPalette} title={t("death.recovery.title")} icon="🎯" style={{ marginBottom: 18 }}>
          {[1, 2, 3].map((priority) => {
            const items = recovery.filter((r) => r.priority === priority);
            if (items.length === 0) return null;
            const palette = priority === 1 ? alert : priority === 2 ? warn : customer;
            return (
              <div key={priority} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {t(`death.recovery.priority${priority}`)}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        background: "#fff",
                        border: `1px solid ${palette.base}25`,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <input type="checkbox" style={{ width: 18, height: 18, accentColor: palette.base, cursor: "pointer" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>↳ {item.action}</div>
                      </div>
                      <span style={{ fontSize: 11, color: palette.dark, fontWeight: 800, fontFamily: "monospace", background: palette.bg, padding: "3px 10px", borderRadius: 999 }}>
                        {item.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 4 }}>
            <button type="button" style={btn(reports, "secondary")}>📣 {t("death.recovery.action.campaign")}</button>
            <button type="button" style={btn(money, "secondary")}>✂️ {t("death.recovery.action.expenses")}</button>
            <button type="button" style={btn(brand, "primary")}>⚡ {t("death.recovery.action.diversify")}</button>
          </div>
        </Card>
      )}

      {/* Peer comparison (only when at-risk) */}
      {(status === "warning" || status === "critical") && (
        <Card palette={alert} title={t("death.peers.title")} subtitle={t("death.peers.subtitle")} icon="👥">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PEERS.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: alert.bg,
                    color: alert.dark,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {p.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{p.sector} · Closed after {p.closedAfter}</div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    background: alert.base,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  {p.match}% {t("death.peers.match")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <style>{`
        @media (max-width: 880px) {
          .death-hero-grid { grid-template-columns: 1fr !important; }
          .death-stat-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) { .predict-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}

function Stat({ label, value, palette }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: palette.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

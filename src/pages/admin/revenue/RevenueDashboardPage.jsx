// ================================================================
// /admin/revenue — MRR / ARR / churn / LTV / CAC dashboard (deep)
// ================================================================
import React from "react";
import AdminKpiCard from "../../../components/admin/AdminKpiCard";
import { ADMIN_BRAND, ADMIN_INDIGO, CRITICAL_RED, TRUST_BLUE } from "../../../utils/admin/adminPalette";
import { fmtCurrency } from "../../../utils/format";

const MRR_HISTORY = [
  { month: "Jun", mrr: 248000 }, { month: "Jul", mrr: 289000 }, { month: "Aug", mrr: 311000 },
  { month: "Sep", mrr: 348000 }, { month: "Oct", mrr: 372000 }, { month: "Nov", mrr: 391000 },
  { month: "Dec", mrr: 412000 }, { month: "Jan", mrr: 432000 }, { month: "Feb", mrr: 459000 },
  { month: "Mar", mrr: 481000 }, { month: "Apr", mrr: 508000 }, { month: "May", mrr: 542000 },
];

const SOURCE_BREAKDOWN = [
  { source: "New",       value: 41000, color: "#10B981" },
  { source: "Expansion", value: 22000, color: "#3B82F6" },
  { source: "Reactivation", value: 8000, color: "#8B5CF6" },
  { source: "Contraction", value: -12000, color: "#F59E0B" },
  { source: "Churn",     value: -25000, color: "#DC2626" },
];

export default function RevenueDashboardPage() {
  const brand = ADMIN_BRAND;
  const trust = TRUST_BLUE;
  const crit = CRITICAL_RED;
  const indigo = ADMIN_INDIGO;
  const success = { bg: "#DCFCE7", base: "#10B981", dark: "#047857" };
  const money = { bg: "#DEFAF6", base: "#14B8A6", dark: "#115E59" };
  const amber = { bg: "#FEF3C7", base: "#F59E0B", dark: "#B45309" };

  const maxMrr = Math.max(...MRR_HISTORY.map((m) => m.mrr));

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Revenue Dashboard</h1>
        <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>MRR · ARR · churn · LTV · CAC · forecast — last 12 months</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 22 }}>
        <AdminKpiCard label="MRR (current)"   value={fmtCurrency(542000)} delta={6.7}  palette={money}   icon="💰" size="lg" />
        <AdminKpiCard label="ARR"             value={fmtCurrency(6504000)} delta={28.4} palette={success} icon="📈" size="lg" />
        <AdminKpiCard label="Net new MRR"     value={fmtCurrency(34000)}  delta={12.1} palette={trust}   icon="➕" />
        <AdminKpiCard label="Churn rate"      value="2.1%"                delta={-0.6} palette={crit}    icon="📉" />
        <AdminKpiCard label="LTV"             value={fmtCurrency(8420)}   delta={4.2}  palette={indigo}  icon="💎" />
        <AdminKpiCard label="CAC"             value={fmtCurrency(890)}    delta={-3.1} palette={amber}   icon="🎯" />
        <AdminKpiCard label="LTV/CAC"         value="9.5x"                delta={7.4}  palette={success} icon="⚖" />
        <AdminKpiCard label="Avg revenue/cust" value={fmtCurrency(434)}    delta={2.8}  palette={brand}   icon="👤" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 22, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: 0 }}>MRR — last 12 months</h3>
          <span style={{ fontSize: 11, color: "#64748B" }}>+118% vs same period last year</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 220, paddingTop: 10 }}>
          {MRR_HISTORY.map((m, i) => (
            <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", height: `${(m.mrr / maxMrr) * 100}%`, background: `linear-gradient(180deg, ${money.base}, ${money.dark})`, borderRadius: "8px 8px 0 0", minHeight: 8, position: "relative" }}>
                {i === MRR_HISTORY.length - 1 && (
                  <span style={{ position: "absolute", top: -22, insetInlineStart: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: money.dark, whiteSpace: "nowrap" }}>
                    {fmtCurrency(m.mrr)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="rev-bottom">
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>This month — MRR movement</h3>
          {SOURCE_BREAKDOWN.map((s) => {
            const isNeg = s.value < 0;
            return (
              <div key={s.source} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: s.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{s.source}</span>
                <strong style={{ fontSize: 14, color: isNeg ? "#9F1239" : "#047857", fontFamily: "monospace" }}>
                  {isNeg ? "" : "+"}{fmtCurrency(s.value)}
                </strong>
              </div>
            );
          })}
          <div style={{ marginTop: 14, padding: 14, background: success.bg, borderRadius: 10, fontSize: 13, fontWeight: 800, color: success.dark, textAlign: "center" }}>
            Net new MRR: +{fmtCurrency(SOURCE_BREAKDOWN.reduce((s, x) => s + x.value, 0))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>Quick actions</h3>
          {[
            { label: "View subscriptions",    icon: "🔁", to: "/admin/revenue/subscriptions" },
            { label: "Failed payments queue", icon: "⚠",  to: "/admin/revenue/failed-payments" },
            { label: "Issue refund",          icon: "↩",  to: "/admin/revenue/refunds" },
            { label: "Create coupon",         icon: "🎟",  to: "/admin/revenue/coupons" },
            { label: "Run cohort analysis",   icon: "📐", to: "/admin/revenue/cohorts" },
            { label: "Forecast next 90 days", icon: "🔮", to: "/admin/revenue/forecast" },
          ].map((a) => (
            <a key={a.to} href={a.to} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "10px 14px", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 10, marginBottom: 6, textDecoration: "none", color: "#0F172A", fontSize: 12, fontWeight: 700, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span>{a.label}</span>
              <span>→</span>
            </a>
          ))}
        </div>
        <style>{`@media (max-width: 900px) { .rev-bottom { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  );
}

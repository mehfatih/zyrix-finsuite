// ================================================================
// /admin/customers/overview — Customer KPI hero + distribution charts
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import AdminKpiCard from "../../../components/admin/AdminKpiCard";
import { ADMIN_BRAND, ADMIN_INDIGO, CRITICAL_RED, TRUST_BLUE } from "../../../utils/admin/adminPalette";
import { fmtCurrency } from "../../../utils/format";

const TIER_DIST = [
  { tier: "Lite",       count: 412, mrr: 40788,  palette: { bg: "#F1F5F9", base: "#64748B", dark: "#334155" } },
  { tier: "Pro",        count: 538, mrr: 268362, palette: { bg: "#DBEAFE", base: "#1E40AF", dark: "#1E3A8A" } },
  { tier: "Business",   count: 247, mrr: 370253, palette: { bg: "#F3EFFF", base: "#8B5CF6", dark: "#5B21B6" } },
  { tier: "Enterprise", count: 50,  mrr: 249950, palette: { bg: "#FEE2E2", base: "#DC2626", dark: "#991B1B" } },
];

const COUNTRIES = [
  { code: "TR", name: "Turkey", count: 942, flag: "🇹🇷" },
  { code: "AE", name: "UAE",    count: 124, flag: "🇦🇪" },
  { code: "SA", name: "Saudi",  count: 98,  flag: "🇸🇦" },
  { code: "EG", name: "Egypt",  count: 56,  flag: "🇪🇬" },
  { code: "QA", name: "Qatar",  count: 27,  flag: "🇶🇦" },
];

const AT_RISK = Array.from({ length: 6 }).map((_, i) => ({
  id: `cus-${950 - i}`,
  name: ["Bursa Gıda", "Konya Tekstil", "İzmir Cafe", "Eskişehir IT", "Antalya Tour", "Mersin Logistik"][i],
  reason: ["Payment failed", "Login drop", "Support escalation", "Trial ending", "Feature regression", "NPS detractor"][i],
  churnProb: 78 - i * 4,
}));

const TOP_MRR = Array.from({ length: 6 }).map((_, i) => ({
  id: `cus-${10 + i}`,
  name: ["Levana İlaç Holding", "Aydın Ova Üretim", "Beyoğlu Restoran Grup", "Cairo Imports", "MENA Trading Co", "Marmara Sigorta"][i],
  mrr: 12500 - i * 1200,
  tier: i < 2 ? "Enterprise" : "Business",
}));

export default function CustomerOverviewPage() {
  const brand = ADMIN_BRAND;
  const indigo = ADMIN_INDIGO;
  const crit = CRITICAL_RED;
  const trust = TRUST_BLUE;

  const totalCustomers = TIER_DIST.reduce((s, t) => s + t.count, 0);
  const totalMrr = TIER_DIST.reduce((s, t) => s + t.mrr, 0);
  const maxBar = Math.max(...TIER_DIST.map((t) => t.count));

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>Customer Overview</h1>
        <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Live snapshot · updates every 30s</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 22 }}>
        <AdminKpiCard label="Total customers" value={totalCustomers.toLocaleString()} delta={8.4} palette={indigo} icon="👥" />
        <AdminKpiCard label="Total MRR"        value={fmtCurrency(totalMrr)}            delta={12.1} palette={{ bg: "#DCFCE7", base: "#10B981", dark: "#047857" }} icon="💰" />
        <AdminKpiCard label="Churn (30d)"      value="2.1%"                              delta={-0.6} palette={crit} icon="📉" />
        <AdminKpiCard label="Growth (30d)"     value="+8.4%"                             delta={4.0} palette={trust} icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 22 }} className="cov-grid">
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Distribution by tier</h3>
          {TIER_DIST.map((t) => (
            <div key={t.tier} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: t.palette.dark }}>{t.tier}</span>
                <span style={{ color: "#64748B" }}>{t.count} · {fmtCurrency(t.mrr)} MRR</span>
              </div>
              <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(t.count / maxBar) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${t.palette.base}, ${t.palette.dark})`, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>Geographic distribution</h3>
          {COUNTRIES.map((c) => (
            <div key={c.code} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F5F9", fontSize: 12 }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>{c.name}</span>
              <strong style={{ color: indigo.dark, fontFamily: "monospace" }}>{c.count}</strong>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 900px) { .cov-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="cov-bottom">
        <div style={{ background: "#fff", border: `1.5px solid ${crit.base}30`, borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: crit.dark, margin: "0 0 14px" }}>⚠ At-risk customers</h3>
          {AT_RISK.map((c) => (
            <Link key={c.id} to={`/admin/customers/${c.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F5F9", textDecoration: "none", color: "inherit" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.reason}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: crit.dark, background: crit.bg, padding: "3px 10px", borderRadius: 999, alignSelf: "center", whiteSpace: "nowrap" }}>{c.churnProb}%</span>
            </Link>
          ))}
        </div>
        <div style={{ background: "#fff", border: `1.5px solid ${{ bg: "#DCFCE7", base: "#10B981", dark: "#047857" }.base}30`, borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#047857", margin: "0 0 14px" }}>🏆 Top customers by MRR</h3>
          {TOP_MRR.map((c) => (
            <Link key={c.id} to={`/admin/customers/${c.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F5F9", textDecoration: "none", color: "inherit" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#5B21B6" }}>{c.tier.toUpperCase()}</div>
              </div>
              <strong style={{ fontSize: 13, color: "#047857", fontFamily: "monospace", alignSelf: "center" }}>{fmtCurrency(c.mrr)}</strong>
            </Link>
          ))}
        </div>
        <style>{`@media (max-width: 900px) { .cov-bottom { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  );
}

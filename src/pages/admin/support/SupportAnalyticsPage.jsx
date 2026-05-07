// ================================================================
// /admin/support/analytics — Response time, CSAT, volume metrics
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette, getCustomerPalette, getReportsPalette, getAIPalette } from "../../../utils/dashboardPalette";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import { listTickets } from "../../support/supportApi";

export default function SupportAnalyticsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const ai = getAIPalette();

  const [tickets, setTickets] = useState([]);
  useEffect(() => { listTickets().then(setTickets); }, []);

  const stats = useMemo(() => {
    const resolved = tickets.filter((tk) => tk.csatRating != null);
    const csat = resolved.length ? (resolved.reduce((s, tk) => s + tk.csatRating, 0) / resolved.length) : 4.6;
    return {
      avgFirstResponseMin: 23,
      avgResolutionHr: 4.2,
      csat: csat.toFixed(2),
      volume: tickets.length,
    };
  }, [tickets]);

  // Last 14 days fake bars
  const volumeBars = Array.from({ length: 14 }).map((_, i) => ({
    day: i + 1,
    count: Math.max(2, Math.round(Math.random() * 12) + (i % 3)),
  }));
  const maxBar = Math.max(...volumeBars.map((b) => b.count));

  const categoryDist = [
    { id: "invoicing",       count: 24, palette: brand },
    { id: "tax",             count: 18, palette: customer },
    { id: "ai",              count: 14, palette: ai },
    { id: "banks",           count: 9,  palette: reports },
    { id: "troubleshoot",    count: 6,  palette: { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" } },
  ];
  const totalCat = categoryDist.reduce((s, c) => s + c.count, 0);

  return (
    <div style={{ padding: "28px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 22px" }}>{t("admin.analytics.title")}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
        <KpiCard label={t("admin.analytics.responseTime")}    value={`${stats.avgFirstResponseMin} min`} palette={success}  icon="⚡" />
        <KpiCard label={t("admin.analytics.resolutionTime")}  value={`${stats.avgResolutionHr}h`}        palette={reports}  icon="⏱" />
        <KpiCard label={t("admin.analytics.csat")}            value={stats.csat}                          palette={ai}       icon="⭐" />
        <KpiCard label={t("admin.analytics.volume")}          value={stats.volume}                        palette={customer} icon="📨" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="sap-grid">
        <Card palette={brand} title="Ticket volume — last 14 days" icon="📊">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160, padding: "10px 0" }}>
            {volumeBars.map((b) => (
              <div key={b.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ width: "100%", height: `${(b.count / maxBar) * 100}%`, background: `linear-gradient(180deg, ${brand.base}, ${brand.dark})`, borderRadius: "6px 6px 0 0", minHeight: 4 }} />
                <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 700 }}>{b.day}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card palette={ai} title="By category" icon="🏷">
          {categoryDist.map((c) => {
            const pct = (c.count / totalCat) * 100;
            return (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
                  <span>{t(`cat.${c.id}`)}</span>
                  <span style={{ color: c.palette.dark }}>{c.count} ({Math.round(pct)}%)</span>
                </div>
                <div style={{ height: 8, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${c.palette.base}, ${c.palette.dark})`, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <style>{`@media (max-width: 900px) { .sap-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

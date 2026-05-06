// ================================================================
// ★ Customer Score (A-F) — distribution + scatter + per-customer
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getSuccessPalette,
  getCustomerPalette,
  getWarningPalette,
  getAlertPalette,
  getAIPalette,
  getMoneyPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import { GradeHistogram, ScoreScatter } from "../../../components/dashboard/predictive/ScoreDistribution";
import { api, gradeCustomer, fmtCurrency } from "./predictiveApi";

const GRADE_PALETTES = { A: "emerald", B: "indigo", C: "amber", D: "rose", F: "wine" };

const RECOMMEND_BY_GRADE = {
  A: { icon: "🎁", labelKey: "score.recommend.A" },
  B: { icon: "🚀", labelKey: "score.recommend.B" },
  C: { icon: "💬", labelKey: "score.recommend.C" },
  D: { icon: "⚠️", labelKey: "score.recommend.D" },
  F: { icon: "👋", labelKey: "score.recommend.F" },
};

export default function CustomerScorePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();
  const money = getMoneyPalette();

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeGrade, setActiveGrade] = useState(null);

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    api("/api/invoices?limit=500").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
  }, []);

  const scored = useMemo(() => {
    const arr = (customers || []).map((c) => ({ ...c, ...gradeCustomer({ customer: c, invoices }) }));
    return arr.filter((c) => c.invoiceCount > 0);
  }, [customers, invoices]);

  const buckets = useMemo(() => {
    const out = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    scored.forEach((c) => {
      out[c.grade] = (out[c.grade] || 0) + 1;
    });
    return out;
  }, [scored]);

  const filtered = useMemo(
    () => (activeGrade ? scored.filter((c) => c.grade === activeGrade) : scored),
    [scored, activeGrade]
  );

  const scatterItems = scored.map((c) => ({ name: c.name, score: c.score, totalRev: c.totalRev, grade: c.grade }));

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("score.title")} subtitle={t("score.subtitle")} icon="🎓" palette={ai} />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
        className="predict-kpi-grid"
      >
        <KpiCard label={t("score.kpi.totalA")} value={buckets.A} palette={success} icon="A" />
        <KpiCard label={t("score.kpi.totalB")} value={buckets.B} palette={customer} icon="B" />
        <KpiCard label={t("score.kpi.totalC")} value={buckets.C} palette={ai} icon="C" />
        <KpiCard label={t("score.kpi.totalD")} value={buckets.D} palette={warn} icon="D" />
        <KpiCard label={t("score.kpi.totalF")} value={buckets.F} palette={alert} icon="F" pulse={buckets.F > 0} />
      </div>

      {/* Distribution + Scatter */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 18, marginBottom: 18 }} className="predict-detail-grid">
        <Card palette={ai} title={t("score.distribution.title")} icon="📊">
          <GradeHistogram buckets={buckets} onSelect={(g) => setActiveGrade((cur) => (cur === g ? null : g))} t={t} />
        </Card>
        <Card palette={customer} title={t("score.scatter.title")} icon="🎯">
          <ScoreScatter items={scatterItems} />
        </Card>
      </div>

      {/* Filtered customer list */}
      <Card palette={ai} title={activeGrade ? `Grade ${activeGrade} customers` : "All customers"} icon="👥">
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>—</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filtered.slice(0, 20).map((c) => {
              const palette = getPaletteById(GRADE_PALETTES[c.grade] || "indigo");
              const recommend = RECOMMEND_BY_GRADE[c.grade];
              return (
                <li
                  key={c.id || c.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                      fontWeight: 900,
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${palette.base}40`,
                    }}
                  >
                    {c.grade}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      {recommend ? `${recommend.icon} ${t(recommend.labelKey)}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: palette.dark, fontFamily: "monospace" }}>
                      {c.score}/100
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>{c.invoiceCount} invoices</div>
                  </div>
                  <div style={{ textAlign: "end", minWidth: 100 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: money.base, fontFamily: "monospace" }}>
                      {fmtCurrency(c.totalRev)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <style>{`
        @media (max-width: 880px) { .predict-detail-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .predict-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  );
}

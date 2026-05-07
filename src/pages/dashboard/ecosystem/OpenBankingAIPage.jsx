// ================================================================
// ★ Open Banking AI — savings, earnings, and FX optimization
// ================================================================
import React, { useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getPaletteById, getMoneyPalette, getSuccessPalette, getAIPalette, getReportsPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import BankFeeComparator from "../../../components/dashboard/ecosystem/BankFeeComparator";
import { localStore, KEYS, buildBankingInsights, bankFeeComparison, fmtCurrency } from "./ecosystemApi";

const KIND_ICONS = { fees: "💸", interest: "💹", fx: "💱" };

export default function OpenBankingAIPage() {
  const t = useDashboardI18n("ecosystem");
  const sky = getPaletteById("sky");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const reports = getReportsPalette();

  const [actions, setActions] = useState(localStore.list(KEYS.bankingActions));
  const data = buildBankingInsights();
  const compareRows = bankFeeComparison();

  const review = (insight) => {
    localStore.add(KEYS.bankingActions, { insightId: insight.id, action: "review", at: new Date().toISOString() });
    setActions(localStore.list(KEYS.bankingActions));
  };

  const totalSavings = data.insights.filter((i) => i.kind === "fees").reduce((s, i) => s + i.savingsTRY, 0);
  const totalEarnings = data.insights.filter((i) => i.kind === "interest").reduce((s, i) => s + i.savingsTRY, 0);
  const totalFx = data.insights.filter((i) => i.kind === "fx").reduce((s, i) => s + i.savingsTRY, 0);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("banking.title")} subtitle={t("banking.subtitle")} icon="🏦" palette={sky} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }} className="ob-kpis">
        <KpiCard label={t("banking.kpi.banks")}    value={data.bankCount}        palette={sky}     icon="🏦" />
        <KpiCard label={t("banking.kpi.savings")}  value={fmtCurrency(totalSavings)} palette={success} icon="💸" />
        <KpiCard label={t("banking.kpi.earnings")} value={fmtCurrency(totalEarnings)} palette={money}  icon="📈" />
        <KpiCard label={t("banking.kpi.fxLoss")}   value={fmtCurrency(totalFx)}     palette={reports} icon="💱" />
      </div>

      <Card palette={ai} title="AI insights" icon="🧠" style={{ marginBottom: 16 }}>
        {data.insights.map((insight) => (
          <div
            key={insight.id}
            style={{
              background: "#fff", border: `1.5px solid ${success.base}30`,
              borderRadius: 14, padding: 16, marginBottom: 12,
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center",
              boxShadow: `0 4px 14px ${success.base}15`,
            }}
            className="ob-row"
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${success.bg}, ${success.base}30)`, color: success.dark, display: "grid", placeItems: "center", fontSize: 22 }}>
              {KIND_ICONS[insight.kind]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{insight.title}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{insight.details}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: success.dark, marginTop: 4 }}>
                {insight.from} → {insight.to}
              </div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: success.dark, fontFamily: "monospace" }}>
                {fmtCurrency(insight.savingsTRY)}
              </div>
              <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>/year</div>
              <button type="button" onClick={() => review(insight)} style={{ marginTop: 8, background: success.bg, color: success.dark, border: `1px solid ${success.base}40`, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                {t("banking.opportunity.action")}
              </button>
            </div>
          </div>
        ))}
      </Card>

      <Card palette={reports} title={t("banking.compare.title")} icon="📋">
        <BankFeeComparator rows={compareRows} t={t} />
      </Card>

      <style>{`
        @media (max-width: 720px) {
          .ob-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .ob-row { grid-template-columns: auto 1fr !important; }
          .ob-row > div:nth-child(3) { grid-column: span 2; text-align: start; }
        }
      `}</style>
    </div>
  );
}

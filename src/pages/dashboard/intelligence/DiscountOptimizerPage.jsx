// ================================================================
// Discount Optimizer — what-if calculator + AI counter-offer + history
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getCustomerPalette,
  getAIPalette,
  getReportsPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import DiscountCalculator from "../../../components/dashboard/intelligence/DiscountCalculator";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./intelligenceApi";

export default function DiscountOptimizerPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const reports = getReportsPalette();

  const [data, setData] = useState({
    customer: "Ahmed Yıldız",
    orderAmount: 5000,
    cogs: 3000,
    discountPct: 15,
    ltv: 47000,
  });
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => setHistory(localStore.list(KEYS.discountHist)), []);

  const log = (decision, finalDiscount) => {
    const entry = { ...data, decision, finalDiscount, decidedAt: new Date().toISOString() };
    localStore.add(KEYS.discountHist, entry);
    setHistory(localStore.list(KEYS.discountHist));
    setToast({ kind: "success", msg: `✓ ${decision}` });
    setTimeout(() => setToast(null), 2200);
  };

  const stats = {
    total: history.length,
    accepted: history.filter((h) => h.decision === "ACCEPT").length,
    counter: history.filter((h) => h.decision === "COUNTER").length,
    rejected: history.filter((h) => h.decision === "REJECT").length,
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("discount.title")} subtitle={t("discount.subtitle")} icon="🎫" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="intel-kpi-grid"
      >
        <KpiCard label="Calculations" value={stats.total} palette={ai} icon="🧮" />
        <KpiCard label="Accepted" value={stats.accepted} palette={success} icon="✓" />
        <KpiCard label="Counter-offered" value={stats.counter} palette={customer} icon="↔" />
        <KpiCard label="Rejected" value={stats.rejected} palette={alert} icon="✗" />
      </div>

      <Card palette={ai} title={t("discount.title")} icon="🧮" style={{ marginBottom: 18 }}>
        <DiscountCalculator
          data={data}
          onChange={setData}
          onAccept={() => log("ACCEPT", data.discountPct)}
          onCounter={(pct) => log("COUNTER", pct)}
          onReject={() => log("REJECT", 0)}
          lang={lang}
          t={t}
        />
      </Card>

      <Card palette={reports} title={t("discount.history.title")} icon="📜">
        {history.length === 0 ? (
          <EmptyState title={t("discount.history.empty")} icon="📜" palette={reports} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: reports.bg }}>
                  <th style={th}>Date</th>
                  <th style={th}>Customer</th>
                  <th style={{ ...th, textAlign: "end" }}>Order</th>
                  <th style={{ ...th, textAlign: "center" }}>Requested</th>
                  <th style={{ ...th, textAlign: "center" }}>Final</th>
                  <th style={th}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((h) => {
                  const palette = h.decision === "ACCEPT" ? success : h.decision === "COUNTER" ? customer : alert;
                  return (
                    <tr key={h.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ ...td, color: "#64748B" }}>{fmtDate(h.decidedAt, lang)}</td>
                      <td style={td}>{h.customer || "—"}</td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", color: money.dark, fontWeight: 700 }}>
                        {fmtCurrency(h.orderAmount)}
                      </td>
                      <td style={{ ...td, textAlign: "center", color: "#64748B" }}>{h.discountPct}%</td>
                      <td style={{ ...td, textAlign: "center", fontWeight: 700, color: palette.dark }}>
                        {h.finalDiscount}%
                      </td>
                      <td style={td}>
                        <span
                          style={{
                            background: palette.bg,
                            color: palette.dark,
                            border: `1px solid ${palette.base}40`,
                            padding: "2px 10px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {h.decision}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: success.bg,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`@media (max-width: 720px) { .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

const th = {
  textAlign: "start",
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "10px 12px", color: "#0F172A" };

// ================================================================
// ★ AI Review Optimizer — NPS prediction + send/skip recommendations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getAIPalette, getSuccessPalette, getAlertPalette, getReportsPalette, getCustomerPalette, getWarningPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import ReviewProbabilityGauge from "../../../components/dashboard/voice-cx/ReviewProbabilityGauge";
import { api, localStore, KEYS, buildReviewQueue, generateReviewMessage, fmtCurrency } from "./voiceCxApi";

export default function ReviewOptimizerPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("voice-cx");
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const warn = getWarningPalette();

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [history, setHistory] = useState(localStore.list(KEYS.reviewHistory));

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
  }, []);

  const queue = useMemo(() => buildReviewQueue({ customers, invoices }), [customers, invoices]);
  const handledIds = new Set(history.map((h) => h.queueId));
  const visible = queue.filter((q) => !handledIds.has(q.id));

  const promoters = queue.filter((q) => q.bucket === "promoter").length;
  const detractors = queue.filter((q) => q.bucket === "detractor").length;
  const npsAvg = queue.length ? (queue.reduce((s, q) => s + q.nps, 0) / queue.length) : 0;
  const requestedToday = history.filter((h) => h.action === "sent" && new Date(h.at).toDateString() === new Date().toDateString()).length;

  const send = (q) => {
    localStore.add(KEYS.reviewHistory, { queueId: q.id, action: "sent", message: generateReviewMessage(q.customer, lang), at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.reviewHistory));
  };
  const skip = (q) => {
    localStore.add(KEYS.reviewHistory, { queueId: q.id, action: "skipped", at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.reviewHistory));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("review.title")} subtitle={t("review.subtitle")} icon="⭐" palette={ai} />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="ro-kpis"
      >
        <KpiCard label={t("review.kpi.requestedToday")} value={requestedToday}   palette={ai}      icon="📨" />
        <KpiCard label={t("review.kpi.npsAvg")}         value={npsAvg.toFixed(1)} palette={reports} icon="🎯" />
        <KpiCard label={t("review.kpi.promoters")}      value={promoters}        palette={success} icon="😍" />
        <KpiCard label={t("review.kpi.detractors")}     value={detractors}       palette={alert}   icon="😡" />
      </div>

      <Card palette={ai} title={t("review.queue.title")} icon="🧠">
        {visible.length === 0 ? (
          <EmptyState icon="🌟" title={t("review.queue.empty")} palette={success} />
        ) : (
          visible.slice(0, 6).map((q) => {
            const palette = q.bucket === "promoter" ? success : q.bucket === "passive" ? warn : alert;
            const message = generateReviewMessage(q.customer, lang);
            const isDetractor = q.bucket === "detractor";
            return (
              <div
                key={q.id}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${palette.base}40`,
                  borderRadius: 14, padding: 16, marginBottom: 12,
                  boxShadow: `0 4px 14px ${palette.base}15`,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", marginBottom: 12 }} className="ro-row-head">
                  <ReviewProbabilityGauge nps={q.nps} bucket={q.bucket} t={t} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                      {q.customer.companyName || q.customer.fullName || q.customer.name || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: customer.dark, marginTop: 4 }}>
                      {q.lastInvoice ? t("review.context.justPaid", { amount: fmtCurrency(q.lastInvoice.totalAmount || q.lastInvoice.total || 0) }) : t("review.context.repeatCustomer")}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 999,
                        background: palette.bg, color: palette.dark,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {q.recommendation === "sendNow"      && `✓ ${t("review.recommended.sendNow")}`}
                        {q.recommendation === "doNotAsk"     && t("review.recommended.doNotAsk")}
                        {q.recommendation === "resolveFirst" && t("review.recommended.resolveFirst")}
                        {q.recommendation === "adjust"       && t("review.action.adjust")}
                      </span>
                    </div>
                  </div>
                </div>

                {!isDetractor && (
                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      {t("review.message.generated")}
                    </div>
                    <div style={{ fontSize: 12, color: "#0F172A", lineHeight: 1.55 }}>{message}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {!isDetractor && q.recommendation === "sendNow" && (
                    <>
                      <button type="button" onClick={() => skip(q)} style={btnGhost}>{t("review.action.skip")}</button>
                      <button type="button" onClick={() => send(q)} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
                        {t("review.action.send")}
                      </button>
                    </>
                  )}
                  {!isDetractor && q.recommendation === "adjust" && (
                    <>
                      <button type="button" onClick={() => skip(q)} style={btnGhost}>{t("review.action.skip")}</button>
                      <button type="button" style={btnGhost}>{t("review.action.adjust")}</button>
                    </>
                  )}
                  {isDetractor && (
                    <button type="button" style={{ background: `linear-gradient(135deg, ${alert.base}, ${alert.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${alert.base}40` }}>
                      ⚠️ {t("review.action.address")}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      <style>{`
        @media (max-width: 720px) {
          .ro-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .ro-row-head { grid-template-columns: 1fr !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };

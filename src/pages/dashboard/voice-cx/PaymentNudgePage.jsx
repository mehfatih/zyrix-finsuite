// ================================================================
// ★ Proactive Payment Nudge AI — channel/time/tone optimization
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getAIPalette, getMoneyPalette, getSuccessPalette, getAlertPalette, getReportsPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import NudgeABTest from "../../../components/dashboard/voice-cx/NudgeABTest";
import ChannelHeatmap from "../../../components/dashboard/voice-cx/ChannelHeatmap";
import { api, localStore, KEYS, buildNudgeQueue, buildNudgeAnalysis, buildAbResults, buildHeatmap, fmtCurrency } from "./voiceCxApi";

export default function PaymentNudgePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("voice-cx");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setHistory(localStore.list(KEYS.nudgeHistory));
  }, []);

  const queue = useMemo(() => buildNudgeQueue({ invoices, customers }), [invoices, customers]);
  const handledIds = new Set(history.filter((h) => h.action !== "skipped").map((h) => h.queueId));
  const visible = queue.filter((q) => !handledIds.has(q.id));
  const ab = buildAbResults();
  const heatmap = buildHeatmap();

  const stats = {
    optimized: history.length,
    responseRate: history.length > 0 ? Math.round((history.filter((h) => h.action === "sent").length / history.length) * 100) : 87,
    recovered: history.reduce((s, h) => s + (Number(h.amount) || 0), 0),
    queue: visible.length,
  };

  const send = (q) => {
    const a = buildNudgeAnalysis({ customer: q.customer, invoice: q.invoice, daysOverdue: q.daysOverdue, lang });
    localStore.add(KEYS.nudgeHistory, { queueId: q.id, action: "sent", amount: q.invoice?.totalAmount || q.invoice?.total || 0, channel: a.channel, at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.nudgeHistory));
  };
  const skip = (q) => {
    localStore.add(KEYS.nudgeHistory, { queueId: q.id, action: "skipped", at: new Date().toISOString() });
    setHistory(localStore.list(KEYS.nudgeHistory));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("nudge.title")} subtitle={t("nudge.subtitle")} icon="💸" palette={ai} />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="pn-kpis"
      >
        <KpiCard label={t("nudge.kpi.optimized")}    value={stats.optimized}                palette={ai}      icon="🎯" />
        <KpiCard label={t("nudge.kpi.responseRate")} value={`${stats.responseRate}%`}       palette={success} icon="📈" />
        <KpiCard label={t("nudge.kpi.recovered")}    value={fmtCurrency(stats.recovered)}   palette={money}   icon="💰" />
        <KpiCard label={t("nudge.kpi.queue")}        value={stats.queue}                    palette={alert}   icon="📨" pulse={stats.queue > 0} />
      </div>

      <Card palette={ai} title={t("nudge.queue.title")} icon="📋" style={{ marginBottom: 16 }}>
        {visible.length === 0 ? (
          <EmptyState icon="🎉" title={t("nudge.queue.empty")} palette={success} />
        ) : (
          visible.slice(0, 6).map((q) => {
            const a = buildNudgeAnalysis({ customer: q.customer, invoice: q.invoice, daysOverdue: q.daysOverdue, lang });
            return (
              <div
                key={q.id}
                style={{
                  background: "#fff", border: `1.5px solid ${ai.base}30`,
                  borderRadius: 14, padding: 16, marginBottom: 12,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }} className="pn-row-head">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                      {q.customer.companyName || q.customer.fullName || q.customer.name || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      Invoice #{q.invoice?.invoiceNumber || q.invoice?.id} · {fmtCurrency(q.invoice?.totalAmount || q.invoice?.total || 0)} · {q.daysOverdue}d overdue
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: alert.dark, fontFamily: "monospace" }}>
                      {fmtCurrency(q.invoice?.totalAmount || q.invoice?.total || 0)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }} className="pn-analysis">
                  <Tile label={t("nudge.analysis.bestChannel")} value={t(`nudge.channel.${a.channel}`)} confidence={a.channelConfidence} palette={ai} />
                  <Tile label={t("nudge.analysis.bestTime")}    value={a.time.label}                      confidence={a.time.conf}        palette={reports} />
                  <Tile label={t("nudge.analysis.bestTone")}    value={t(`nudge.tone.${a.tone.tone}`)}    confidence={a.tone.confidence} palette={success} />
                </div>

                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    {t("nudge.message.generated")}
                  </div>
                  <div style={{ fontSize: 12, color: "#0F172A", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{a.message}</div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => skip(q)} style={btnGhost}>{t("nudge.message.skip")}</button>
                  <button type="button" style={btnGhost}>{t("nudge.message.customize")}</button>
                  <button type="button" onClick={() => send(q)} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
                    {t("nudge.message.sendNow")}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pn-bottom">
        <Card palette={reports} title={t("nudge.ab.title")} icon="🥇">
          <NudgeABTest results={ab} t={t} />
        </Card>
        <Card palette={success} title={t("nudge.heatmap.title")} subtitle={t("nudge.heatmap.subtitle")} icon="🔥">
          <ChannelHeatmap data={heatmap} t={t} />
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) { .pn-bottom { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) {
          .pn-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .pn-row-head { grid-template-columns: 1fr !important; }
          .pn-analysis { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };

function Tile({ label, value, confidence, palette }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "8px 12px", borderRadius: 10 }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: palette.dark, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{Math.round((confidence || 0) * 100)}% confidence</div>
    </div>
  );
}

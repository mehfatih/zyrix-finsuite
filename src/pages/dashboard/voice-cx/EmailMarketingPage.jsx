// ================================================================
// Email Marketing Hub — visual builder + segments + recent sends
// ================================================================
import React, { useEffect, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getReportsPalette, getAIPalette, getSuccessPalette, getCustomerPalette, getMoneyPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import EmailEditor from "../../../components/dashboard/voice-cx/EmailEditor";
import { api, localStore, KEYS, emailSegments, emailKpis } from "./voiceCxApi";

export default function EmailMarketingPage() {
  const t = useDashboardI18n("marketing");
  const reports = getReportsPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const alert = getAlertPalette();

  const [draft, setDraft] = useState({ subject: "", body: "", fromName: "", templateId: "blank" });
  const [audience, setAudience] = useState("all");
  const [history, setHistory] = useState(localStore.list(KEYS.emailHistory));
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
  }, []);

  const segments = emailSegments(customers);
  const selected = segments.find((s) => s.id === audience) || segments[0];
  const kpis = emailKpis();

  const send = () => {
    localStore.add(KEYS.emailHistory, {
      subject: draft.subject || "(no subject)",
      from: draft.fromName,
      audience,
      recipients: selected?.recipients || 0,
      sentAt: new Date().toISOString(),
      opens: 0, clicks: 0,
    });
    setHistory(localStore.list(KEYS.emailHistory));
  };

  const saveDraft = () => {
    localStore.add(KEYS.emailDrafts, { ...draft, savedAt: new Date().toISOString() });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("email.title")} subtitle={t("email.subtitle")} icon="✉" palette={reports} />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="em-kpis"
      >
        <KpiCard label={t("email.kpi.sent")}      value={kpis.sent}                      palette={reports} icon="📨" />
        <KpiCard label={t("email.kpi.openRate")}  value={`${Math.round(kpis.openRate * 100)}%`}  palette={success} icon="📂" />
        <KpiCard label={t("email.kpi.clickRate")} value={`${Math.round(kpis.clickRate * 100)}%`} palette={ai}      icon="🖱" />
        <KpiCard label={t("email.kpi.unsub")}     value={`${(kpis.unsub * 100).toFixed(2)}%`}    palette={alert}   icon="✗" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }} className="em-grid">
        <div>
          <EmailEditor
            draft={draft}
            onChange={setDraft}
            onSend={send}
            onSchedule={() => { /* future */ }}
            onSaveDraft={saveDraft}
            onTest={() => { /* future */ }}
            t={t}
          />

          <div style={{ marginTop: 16 }}>
            <Card palette={success} title={t("email.recent.title")} icon="📮">
              {history.length === 0 ? (
                <EmptyState icon="📭" title={t("email.recent.empty")} palette={success} />
              ) : (
                history.slice(0, 6).map((h) => (
                  <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, padding: "10px 12px", borderBottom: "1px solid #F1F5F9", alignItems: "center" }} className="em-history-row">
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{h.subject}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{new Date(h.sentAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: success.dark }}>{h.recipients} 📨</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ai.dark }}>{h.opens || 0} 📂</div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>

        <div>
          <Card palette={customer} title={t("email.audience.title")} icon="👥">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {segments.map((s) => {
                const active = audience === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setAudience(s.id)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: 10,
                      background: active ? `linear-gradient(135deg, ${customer.base}, ${customer.dark})` : "#F8FAFC",
                      color: active ? "#fff" : "#0F172A",
                      border: `1px solid ${active ? customer.base : "#E2E8F0"}`,
                      cursor: "pointer", fontWeight: 700, fontSize: 12,
                    }}
                  >
                    <span>{s.id === "all" ? t("email.audience.all") : t(`email.segment.${s.id}`)}</span>
                    <span style={{ fontSize: 11, opacity: 0.85 }}>{t("email.audience.recipients", { n: s.recipients })}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card palette={money} title={t("email.ab.title")} icon="🆎">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="text" placeholder={t("email.ab.subjectA")} style={inp} />
                <input type="text" placeholder={t("email.ab.subjectB")} style={inp} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748B" }}>
                  <span>{t("email.ab.split")}</span>
                  <span style={{ fontWeight: 800, color: money.dark }}>50 / 50</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#0F172A", fontWeight: 700 }}>
                  <input type="checkbox" defaultChecked /> {t("email.ab.winner")}
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .em-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) {
          .em-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .em-history-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" };

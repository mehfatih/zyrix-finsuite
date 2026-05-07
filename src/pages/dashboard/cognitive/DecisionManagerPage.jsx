// ================================================================
// ★ Decision Fatigue Manager — 5 daily decisions + auto-rules
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getCustomerPalette,
  getReportsPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import DecisionStack from "../../../components/dashboard/cognitive/DecisionStack";
import AutoRuleSuggestion from "../../../components/dashboard/cognitive/AutoRuleSuggestion";
import { api, buildTodayDecisions, detectAutoRules, localStore, KEYS } from "./cognitiveApi";

export default function DecisionManagerPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [decisionsLog, setDecisionsLog] = useState([]);
  const [autoRules, setAutoRules] = useState([]);
  const [activeDecisions, setActiveDecisions] = useState([]);
  const [decided, setDecided] = useState(new Set());

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
    const log = localStore.list(KEYS.decisionsLog);
    setDecisionsLog(log);
    setAutoRules(localStore.list(KEYS.autoRules));
  }, []);

  useEffect(() => {
    setActiveDecisions(buildTodayDecisions({ invoices, customers, purchases }));
  }, [invoices, customers, purchases]);

  const visible = activeDecisions.filter((d) => !decided.has(d.id));

  const decide = (decision, action) => {
    const log = localStore.add(KEYS.decisionsLog, {
      decisionId: decision.id,
      kind: decision.kind,
      decision: action,
      decidedAt: new Date().toISOString(),
    });
    setDecisionsLog(localStore.list(KEYS.decisionsLog));
    setDecided((s) => new Set([...s, decision.id]));
  };

  const enableRule = (rule) => {
    localStore.add(KEYS.autoRules, { kind: rule.kind, decision: rule.decision, enabledAt: new Date().toISOString() });
    setAutoRules(localStore.list(KEYS.autoRules));
  };

  const detected = useMemo(() => detectAutoRules({ decisionsLog }), [decisionsLog]);
  const newRules = detected.filter((r) => !autoRules.find((ar) => ar.kind === r.kind && ar.decision === r.decision));

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("decisions.title")} subtitle={t("decisions.subtitle")} icon="🧠" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cog-kpi-grid"
      >
        <KpiCard label={t("decisions.kpi.today")} value={activeDecisions.length} palette={ai} icon="🎯" />
        <KpiCard label={t("decisions.kpi.pending")} value={visible.length} palette={customer} icon="⏳" pulse={visible.length > 0} />
        <KpiCard label={t("decisions.kpi.completed")} value={decided.size} palette={success} icon="✅" />
        <KpiCard label={t("decisions.kpi.automated")} value={autoRules.length} palette={reports} icon="⚙️" />
      </div>

      <Card palette={ai} title={t("decisions.todayTitle")} icon="🎯" style={{ marginBottom: 18 }}>
        <DecisionStack decisions={visible} onDecide={decide} lang={lang} t={t} />
      </Card>

      <Card palette={ai} title={t("decisions.autoRule.title")} icon="🤖">
        <AutoRuleSuggestion rules={newRules} onEnable={enableRule} lang={lang} t={t} />
      </Card>

      <style>{`@media (max-width: 720px) { .cog-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

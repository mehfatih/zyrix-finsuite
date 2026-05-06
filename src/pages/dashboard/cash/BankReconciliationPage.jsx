// ================================================================
// Bank Reconciliation — split-pane matcher with CSV upload + wow moment
// ================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getAlertPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import BankStatementUpload from "../../../components/dashboard/cash/BankStatementUpload";
import ReconciliationMatcher from "../../../components/dashboard/cash/ReconciliationMatcher";
import { api, localStore, KEYS } from "./cashApi";

export default function BankReconciliationPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cash");
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [statementRows, setStatementRows] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [matchEvents, setMatchEvents] = useState([]);
  const [wow, setWow] = useState(null);
  const startRef = useRef(null);

  useEffect(() => {
    setStatementRows(localStore.list(KEYS.bankStatement));
    api("/api/invoices?limit=200").then((res) => {
      const list = res?.data?.invoices || res?.data?.items || res?.data || [];
      setInvoices((Array.isArray(list) ? list : []).filter((i) => i.status !== "PAID" && i.status !== "CANCELLED"));
    });
  }, []);

  const onParsed = (rows) => {
    setStatementRows(rows);
    localStore.save(KEYS.bankStatement, rows);
    startRef.current = Date.now();
  };

  const stats = useMemo(() => {
    const matched = matchEvents.length;
    const unmatched = statementRows.length - matched;
    const conf = matched > 0 ? Math.round(matchEvents.reduce((s, m) => s + (m.score || 0), 0) / matched) : 0;
    const time = startRef.current ? Math.max(1, Math.round((Date.now() - startRef.current) / 1000)) : 0;
    return { matched, unmatched, conf, time };
  }, [matchEvents, statementRows]);

  const pct = statementRows.length > 0 ? Math.round((stats.matched / statementRows.length) * 100) : 0;

  const onMatch = (m) => {
    setMatchEvents((arr) => {
      const next = [...arr, m];
      if (next.length > 0 && next.length === statementRows.length) {
        const time = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
        setWow({ pct: Math.round((next.length / statementRows.length) * 100), count: next.length, time });
        setTimeout(() => setWow(null), 4500);
      }
      return next;
    });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("recon.title")} subtitle={t("recon.subtitle")} icon="🔄" palette={customer} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cash-kpi-grid"
      >
        <KpiCard label={t("recon.kpi.matched")} value={stats.matched} palette={success} icon="✅" />
        <KpiCard label={t("recon.kpi.unmatched")} value={stats.unmatched} palette={alert} icon="⚠️" pulse={stats.unmatched > 0} />
        <KpiCard label={t("recon.kpi.confidence")} value={stats.conf} suffix="%" palette={reports} icon="🎯" />
        <KpiCard label={t("recon.kpi.time")} value={stats.time} palette={brand} icon="⏱" />
      </div>

      {/* Reconciliation progress bar */}
      {statementRows.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${customer.base}25`,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontWeight: 700, color: customer.dark }}>
            <span>{stats.matched} / {statementRows.length} matched</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 8, background: customer.bg, borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${success.base}, ${customer.base})`,
                transition: "width .8s ease",
              }}
            />
          </div>
        </div>
      )}

      <Card palette={customer} title={t("recon.upload")} icon="📁" style={{ marginBottom: 18 }}>
        <BankStatementUpload onParsed={onParsed} t={t} />
      </Card>

      <ReconciliationMatcher
        statementRows={statementRows}
        invoices={invoices}
        onMatch={onMatch}
        lang={lang}
        t={t}
      />

      {wow && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: `linear-gradient(135deg, ${success.bg}, ${money.bg})`,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 16,
            padding: "16px 22px",
            fontSize: 14,
            fontWeight: 800,
            zIndex: 250,
            boxShadow: `0 16px 40px ${success.base}50`,
            animation: "wowIn .3s ease",
            maxWidth: 360,
          }}
        >
          <div style={{ fontSize: 22 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: success.base, marginTop: 4 }}>
            {t("recon.wow.title").replace("{pct}", wow.pct)}
          </div>
          <div style={{ fontSize: 12, color: success.dark, fontWeight: 700, marginTop: 2 }}>
            {t("recon.wow.subtitle").replace("{count}", wow.count).replace("{time}", wow.time)}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) { .cash-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @keyframes wowIn { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

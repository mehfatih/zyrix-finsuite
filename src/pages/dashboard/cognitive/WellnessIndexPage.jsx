// ================================================================
// ★ Business Wellness Index — mood ring + 5-dim radar + daily note
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { useAuth } from "../../../context/AuthContext";
import {
  getAIPalette,
  getMoneyPalette,
  getCustomerPalette,
  getSuccessPalette,
  getAlertPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import MoodRing from "../../../components/dashboard/cognitive/MoodRing";
import WellnessRing from "../../../components/dashboard/cognitive/WellnessRing";
import { api, computeWellness, localStore, KEYS } from "./cognitiveApi";

export default function WellnessIndexPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const { user } = useAuth();
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api("/api/invoices?limit=500").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
    setHistory(localStore.list(KEYS.wellnessHistory));
  }, []);

  const wellness = useMemo(() => {
    const accounts = localStore.list("zyrix_cash_accounts_v1");
    const cash = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const expenses = localStore.list("zyrix_expenses_v1");
    const monthBurn = Math.max(20000, expenses.reduce((s, e) => s + Number(e.amount || 0), 0) + purchases.reduce((s, p) => s + Number(p.total || 0), 0));
    return computeWellness({ invoices, customers, purchases, cash, monthBurn });
  }, [invoices, customers, purchases]);

  // Save today's reading once per day
  useEffect(() => {
    if (!wellness) return;
    const today = new Date().toISOString().slice(0, 10);
    if (history.find((h) => h.date === today)) return;
    localStore.add(KEYS.wellnessHistory, { date: today, score: wellness.score, status: wellness.status });
    setHistory(localStore.list(KEYS.wellnessHistory));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellness?.score]);

  const sortedDims = wellness.dimensions.slice().sort((a, b) => b.value - a.value);
  const strongest = sortedDims[0];
  const weakest = sortedDims[sortedDims.length - 1];

  const dimLabels = {
    customerSentiment: t("wellness.dim.customerSentiment"),
    cashAnxiety:       t("wellness.dim.cashAnxiety"),
    burnout:           t("wellness.dim.burnout"),
    growth:            t("wellness.dim.growth"),
    opStress:          t("wellness.dim.opStress"),
  };

  const note =
    t("wellness.note.greeting")
      .replace("{name}", user?.name || "Mehmet")
      .replace("{status}", t(`wellness.status.${wellness.status}`))
      .replace("{score}", wellness.score) + " " +
    t("wellness.note.strength").replace("{area}", dimLabels[strongest.id]) + ". " +
    t("wellness.note.challenge").replace("{area}", dimLabels[weakest.id]) + ". " +
    t("wellness.note.suggestion").replace("{action}", "Reach out to 3 overdue customers");

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("wellness.title")} subtitle={t("wellness.subtitle")} icon="💚" palette={ai} />

      {/* Hero — mood ring + strongest/weakest */}
      <div
        style={{
          background: `linear-gradient(135deg, ${ai.bg}, ${customer.bg})`,
          border: `2px solid ${ai.base}30`,
          borderRadius: 22,
          padding: 26,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 26,
          alignItems: "center",
          boxShadow: `0 12px 36px ${ai.base}25`,
        }}
        className="cog-hero-grid"
      >
        <MoodRing score={wellness.score} size={240} label={t(`wellness.status.${wellness.status}`)} />
        <div>
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 6 }}>
            {t("wellness.indexLabel")}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: success.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("wellness.strongest")}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: success.base }}>
              {dimLabels[strongest.id]} ({strongest.value}/100)
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: alert.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("wellness.weakest")}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: alert.base }}>
              {dimLabels[weakest.id]} ({weakest.value}/100)
            </div>
          </div>
        </div>
      </div>

      {/* 5-dim radar */}
      <Card palette={ai} title={t("wellness.dim.title")} icon="📡" style={{ marginBottom: 18 }}>
        <WellnessRing dimensions={wellness.dimensions} size={320} labels={dimLabels} />
      </Card>

      {/* Daily wellness note */}
      <div
        style={{
          background: `linear-gradient(135deg, ${success.bg}, ${ai.bg})`,
          border: `2px solid ${success.base}30`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          boxShadow: `0 8px 28px ${success.base}25`,
        }}
      >
        <div style={{ fontSize: 11, color: success.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          💚 {t("wellness.note.title")}
        </div>
        <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
          {note}
        </div>
        <div style={{ fontSize: 12, color: ai.dark, fontWeight: 700, padding: "10px 14px", background: ai.bg, borderRadius: 12 }}>
          {t("wellness.note.acknowledge").replace("{n}", 47)}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card palette={customer} title={t("wellness.history")} icon="📈">
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80, padding: "0 4px" }}>
            {history.slice(0, 30).reverse().map((h) => {
              const palette =
                h.score >= 80 ? success :
                h.score >= 60 ? customer :
                h.score >= 40 ? { base: "#F59E0B", dark: "#B45309" } : alert;
              return (
                <div
                  key={h.date}
                  title={`${h.date}: ${h.score}/100`}
                  style={{
                    flex: 1,
                    height: `${h.score}%`,
                    background: `linear-gradient(180deg, ${palette.dark}, ${palette.base})`,
                    borderRadius: 4,
                    minWidth: 4,
                    transition: "height .6s ease",
                  }}
                />
              );
            })}
          </div>
        </Card>
      )}

      <style>{`
        @media (max-width: 720px) {
          .cog-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}

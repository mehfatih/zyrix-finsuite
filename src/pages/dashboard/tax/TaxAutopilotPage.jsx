// ================================================================
// AI Tax Autopilot — HERO PAGE
// Animated stage tracker + AI-detected missed deductions + summary
// ================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import TaxAutopilotProgressBar from "../../../components/dashboard/tax/TaxAutopilotProgressBar";
import DeductionFinderCard from "../../../components/dashboard/tax/DeductionFinderCard";
import VatBreakdownDonut from "../../../components/dashboard/tax/VatBreakdownDonut";
import { api } from "../efatura/efaturaApi";
import { localStore, KEYS } from "../efatura/efaturaApi";

const STAGES = ["collect", "categorize", "verify", "generate"];

function periodLabel(date, lang) {
  return date.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", {
    month: "long",
    year: "numeric",
  });
}

export default function TaxAutopilotPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("tax");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [period, setPeriod] = useState(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const [stage, setStage] = useState(null); // null=idle, otherwise stage id
  const [eta, setEta] = useState(0);
  const [paused, setPaused] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState(null);
  const stageTimer = useRef(null);

  const reload = async () => {
    const [inv] = await Promise.all([api("/api/invoices?limit=200")]);
    const list = inv?.data?.invoices || inv?.data?.items || inv?.data || [];
    setInvoices(Array.isArray(list) ? list : []);
    setPurchases(localStore.list(KEYS.outgoing));
  };
  useEffect(() => {
    reload();
  }, []);

  const monthInvoices = useMemo(
    () =>
      invoices.filter((i) => {
        const d = new Date(i.createdAt || 0);
        return d.getMonth() === period.getMonth() && d.getFullYear() === period.getFullYear();
      }),
    [invoices, period]
  );

  const summary = useMemo(() => {
    const collected = monthInvoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + Number(i.vatAmount || 0), 0);
    const purchasesMonth = localStore.list("zyrix_purchase_invoices_v1").filter((p) => {
      const d = new Date(p.createdAt || 0);
      return d.getMonth() === period.getMonth() && d.getFullYear() === period.getFullYear();
    });
    const paid = purchasesMonth.reduce((s, p) => s + Number(p.vatAmount || 0), 0);
    return { collected, paid, net: collected - paid };
  }, [monthInvoices, period]);

  // Run a fake (but well-paced) AI workflow that ticks through stages.
  const startAutopilot = () => {
    if (stage !== null) return;
    setPaused(false);
    setDeductions([]);
    let i = 0;
    const advance = () => {
      if (paused) return;
      if (i >= STAGES.length) {
        setStage(null);
        setEta(0);
        scanForDeductions();
        return;
      }
      setStage(STAGES[i]);
      setEta((STAGES.length - i) * 6);
      i += 1;
      stageTimer.current = setTimeout(advance, 1800);
    };
    advance();
  };

  useEffect(() => () => clearTimeout(stageTimer.current), []);

  const scanForDeductions = async () => {
    setScanning(true);
    // Pull AI-suggested categories from incoming e-Faturas + purchase invoices
    // and surface ones that have no matching expense category yet.
    const incoming = localStore.list("zyrix_efatura_incoming_v1");
    const dismissed = new Set(localStore.list(KEYS.dismissedDeds).map((d) => d.id));
    const candidates = incoming
      .filter((i) => i.suggestedCategory && i.status !== "REJECTED" && !dismissed.has(i.id))
      .map((i) => ({
        id: i.id,
        invoiceNumber: i.number,
        suggestedCategory: i.suggestedCategory,
        amount: Math.round(Number(i.total || 0) * 0.18 * 100) / 100, // VAT recoverable
      }));
    // Add a couple from outgoing purchase invoices that are uncategorized
    localStore.list("zyrix_purchase_invoices_v1")
      .filter((p) => !p.notes || !/(office|rent|utility|fuel|marketing)/i.test(p.notes || ""))
      .slice(0, 2)
      .forEach((p) => {
        if (Number(p.vatAmount) > 0) {
          candidates.push({
            id: `p-${p.id}`,
            invoiceNumber: p.number,
            suggestedCategory: "office",
            amount: Math.round(Number(p.vatAmount || 0) * 100) / 100,
          });
        }
      });
    await new Promise((r) => setTimeout(r, 700));
    setDeductions(candidates);
    setScanning(false);
    if (candidates.length > 0) {
      const total = candidates.reduce((s, d) => s + d.amount, 0);
      setToast({ kind: "success", msg: t("deductions.recovered.toast").replace("{amount}", Math.round(total).toLocaleString()) });
      setTimeout(() => setToast(null), 3500);
    }
  };

  const totalRecovered = deductions.reduce((s, d) => s + d.amount, 0);

  const dismissOne = (id) => {
    localStore.add(KEYS.dismissedDeds, { id, dismissedAt: new Date().toISOString() });
    setDeductions((arr) => arr.filter((d) => d.id !== id));
  };

  const applyAll = () => {
    deductions.forEach((d) => localStore.add(KEYS.dismissedDeds, { id: d.id, applied: true, at: new Date().toISOString() }));
    setToast({ kind: "success", msg: `✓ ${deductions.length} deductions applied` });
    setTimeout(() => setToast(null), 2500);
    setDeductions([]);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("autopilot.title")}
        subtitle={t("autopilot.subtitle")}
        icon="🤖"
        palette={ai}
        actions={
          <>
            <select
              value={period.toISOString().slice(0, 7)}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setPeriod(new Date(y, m - 1, 1));
              }}
              style={{
                padding: "9px 12px",
                borderRadius: 10,
                border: `1px solid ${ai.base}30`,
                background: "#fff",
                fontSize: 13,
                fontWeight: 700,
                color: ai.dark,
                outline: "none",
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                d.setDate(1);
                return (
                  <option key={i} value={d.toISOString().slice(0, 7)}>
                    {periodLabel(d, lang)}
                  </option>
                );
              })}
            </select>
            {stage === null ? (
              <PageHeaderButton palette={ai} variant="primary" icon="▶" onClick={startAutopilot}>
                {t("autopilot.cta.start")}
              </PageHeaderButton>
            ) : (
              <PageHeaderButton palette={ai} variant="secondary" icon={paused ? "▶" : "⏸"} onClick={() => setPaused((p) => !p)}>
                {paused ? t("autopilot.cta.start") : t("autopilot.cta.pause")}
              </PageHeaderButton>
            )}
          </>
        }
      />

      {/* HERO — animated progress */}
      <Card palette={ai} title={`${t("autopilot.period")} · ${periodLabel(period, lang)}`} icon="🔮" style={{ marginBottom: 18 }}>
        <TaxAutopilotProgressBar stage={stage} etaSeconds={eta} lang={lang} t={t} />
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={stage !== null}
            style={{ ...btn(ai, "secondary"), opacity: stage !== null ? 0.5 : 1 }}
          >
            📄 {t("autopilot.cta.draft")}
          </button>
          <button
            type="button"
            disabled={stage !== null || deductions.length === 0}
            onClick={applyAll}
            style={{ ...btn(brand, "primary"), opacity: stage !== null ? 0.5 : 1 }}
          >
            📤 {t("autopilot.cta.submit")}
          </button>
        </div>
      </Card>

      {/* KPI summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ef-kpi-grid"
      >
        <KpiCard label={t("autopilot.summary.collected")} value={Math.round(summary.collected)} prefix="₺" palette={success} icon="↓" />
        <KpiCard label={t("autopilot.summary.paid")} value={Math.round(summary.paid)} prefix="₺" palette={reports} icon="↑" />
        <KpiCard
          label={t("autopilot.summary.netPayable")}
          value={Math.round(summary.net)}
          prefix="₺"
          palette={money}
          icon="💰"
        />
      </div>

      {/* VAT Donut */}
      <Card palette={money} title={t("vat.donut.title")} icon="🍩" style={{ marginBottom: 18 }}>
        <VatBreakdownDonut collected={summary.collected} paid={summary.paid} t={t} />
      </Card>

      {/* AI Deductions Finder */}
      <Card palette={ai} title="🔍 AI Deduction Finder" icon="✨" style={{ marginBottom: 18 }}>
        <DeductionFinderCard
          deductions={deductions}
          totalRecovered={totalRecovered}
          loading={scanning}
          onReview={() => {}}
          onApplyAll={applyAll}
          onDismissOne={dismissOne}
          t={t}
        />
      </Card>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: toast.kind === "error" ? "#FFE4E6" : "#ECFDF5",
            color: toast.kind === "error" ? "#9F1239" : "#047857",
            border: `1px solid ${toast.kind === "error" ? "#F43F5E" : "#10B981"}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 250,
            animation: "fadeIn .25s ease",
            maxWidth: 360,
          }}
        >
          {toast.kind === "error" ? "⚠ " : "🎉 "} {toast.msg}
        </div>
      )}
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 6px 16px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

// ================================================================
// ★ Hidden Cash Detector — HERO PAGE
// AI scans accounts for forgotten subs, tax errors, bank fees, dupes, pricing
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getMoneyPalette,
  getAlertPalette,
  getSuccessPalette,
  getReportsPalette,
  getCustomerPalette,
  getAIPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import MoneyCounter from "../../../components/dashboard/intelligence/MoneyCounter";
import FoundCashCard from "../../../components/dashboard/intelligence/FoundCashCard";
import { localStore, KEYS, scanHiddenCash, fmtCurrency, fmtRelative } from "./intelligenceApi";

const CATEGORIES = ["subscriptions", "tax", "bank", "duplicate", "pricing"];

export default function HiddenCashPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();

  const [findings, setFindings] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanAt, setScanAt] = useState(null);
  const [recovered, setRecovered] = useState(0);
  const [dismissed, setDismissed] = useState(new Set());
  const [confetti, setConfetti] = useState(null);
  const [toast, setToast] = useState(null);

  const reload = () => {
    const stored = localStore.list(KEYS.hiddenFindings);
    setFindings(stored);
    setScanAt(localStore.getKv(KEYS.hiddenScanAt, null));
    setRecovered(Number(localStore.getKv(KEYS.hiddenRecover, 0)) || 0);
    setDismissed(new Set(localStore.list(KEYS.hiddenDismiss).map((d) => d.id)));
  };

  useEffect(() => {
    reload();
  }, []);

  const runScan = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 1200));
    const fresh = await scanHiddenCash();
    fresh.forEach((f) => {
      if (!findings.find((x) => x.id === f.id)) {
        localStore.add(KEYS.hiddenFindings, f);
      }
    });
    const now = new Date().toISOString();
    localStore.saveKv(KEYS.hiddenScanAt, now);
    setScanAt(now);
    setScanning(false);
    reload();
  };

  // First-time scan
  useEffect(() => {
    if (findings.length === 0 && !scanning) {
      runScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => findings.filter((f) => !dismissed.has(f.id)), [findings, dismissed]);

  const totals = useMemo(() => {
    const totalFound = visible.reduce((s, f) => s + Number(f.recoverable || f.amount || 0), 0);
    const byCategory = {};
    CATEGORIES.forEach((c) => { byCategory[c] = 0; });
    visible.forEach((f) => {
      byCategory[f.category] = (byCategory[f.category] || 0) + Number(f.recoverable || f.amount || 0);
    });
    return { totalFound, byCategory };
  }, [visible]);

  const dismiss = (finding) => {
    localStore.add(KEYS.hiddenDismiss, { id: finding.id, at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, finding.id]));
  };

  const recover = (finding) => {
    const amount = Number(finding.recoverable || finding.amount || 0);
    const newTotal = recovered + amount;
    localStore.saveKv(KEYS.hiddenRecover, newTotal);
    setRecovered(newTotal);
    dismiss(finding);
    setConfetti(true);
    setToast({ kind: "success", msg: t("hidden.recover.toast").replace("{amount}", Math.round(amount).toLocaleString()) });
    setTimeout(() => setConfetti(false), 2500);
    setTimeout(() => setToast(null), 3500);
  };

  const groupedByCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c] = visible.filter((f) => f.category === c)));
    return map;
  }, [visible]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("hidden.title")}
        subtitle={t("hidden.subtitle")}
        icon="💰"
        palette={brand}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="🔄" onClick={runScan} disabled={scanning}>
            {scanning ? t("hidden.hero.scanning") : t("hidden.hero.scan")}
          </PageHeaderButton>
        }
      />

      {/* HERO — animated counter */}
      <div
        style={{
          background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          borderRadius: 22,
          padding: "32px 24px",
          marginBottom: 18,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 16px 48px ${brand.base}50`,
          color: "#fff",
        }}
      >
        {/* Decorative coins */}
        <div style={{ position: "absolute", top: -20, insetInlineStart: -20, fontSize: 80, opacity: 0.15, transform: "rotate(-15deg)" }}>💰</div>
        <div style={{ position: "absolute", bottom: -10, insetInlineEnd: -10, fontSize: 60, opacity: 0.15, transform: "rotate(20deg)" }}>💎</div>

        <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 12 }}>
          🤖 AI Hidden Cash Scanner
        </div>
        <div style={{ marginBottom: 10 }}>
          <MoneyCounter
            value={totals.totalFound}
            size="hero"
            palette={{ base: "#fff", dark: "#fff", bg: "transparent" }}
            glow={false}
            lang={lang}
          />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.9, marginBottom: 6 }}>
          {t("hidden.hero.found").replace("{amount}", Math.round(totals.totalFound).toLocaleString())}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
          {t("hidden.hero.subtitle").replace("{count}", visible.length)}
        </div>
        {scanAt && (
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 12 }}>
            {t("hidden.scan.last").replace("{time}", fmtRelative(scanAt, lang))}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="intel-kpi-grid"
      >
        <KpiCard label={t("hidden.kpi.found")} value={Math.round(totals.totalFound)} prefix="₺" palette={brand} icon="💰" />
        <KpiCard label={t("hidden.kpi.recovered")} value={Math.round(recovered)} prefix="₺" palette={success} icon="✅" />
        <KpiCard label={t("hidden.kpi.findings")} value={visible.length} palette={ai} icon="🔍" />
        <KpiCard label={t("hidden.kpi.dismissed")} value={dismissed.size} palette={reports} icon="🗑" />
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("hidden.empty")} icon="🎉" palette={success} />
      ) : (
        CATEGORIES.map((cat) => {
          const items = groupedByCategory[cat];
          if (items.length === 0) return null;
          const palette = getPaletteById(items[0].severity || "indigo");
          const total = totals.byCategory[cat];
          return (
            <Card
              key={cat}
              palette={palette}
              icon={cat === "subscriptions" ? "🔁" : cat === "tax" ? "🧾" : cat === "bank" ? "🏦" : cat === "duplicate" ? "🔴" : "💰"}
              title={
                <span>
                  {t(`hidden.cat.${cat}`)}{" "}
                  <span style={{ fontSize: 12, color: palette.base, fontWeight: 800, fontFamily: "monospace" }}>
                    · +{fmtCurrency(total)}
                  </span>
                </span>
              }
              style={{ marginBottom: 16 }}
            >
              {items.map((f, i) => {
                const actions = buildActions(f, t, recover, dismiss);
                return (
                  <FoundCashCard
                    key={f.id}
                    finding={f}
                    lang={lang}
                    t={t}
                    delay={i * 90}
                    primaryAction={actions.primary}
                    secondaryActions={actions.secondary}
                    onDismiss={() => dismiss(f)}
                  />
                );
              })}
            </Card>
          );
        })
      )}

      {confetti && <Confetti palette={brand} />}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: `linear-gradient(135deg, ${success.bg}, ${money.bg})`,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 14,
            padding: "14px 22px",
            fontSize: 14,
            fontWeight: 800,
            boxShadow: `0 12px 36px ${success.base}40`,
            zIndex: 250,
            animation: "tIn .25s ease",
            maxWidth: 360,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) { .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @keyframes tIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function buildActions(finding, t, recover, dismiss) {
  const cat = finding.category;
  if (cat === "subscriptions") {
    return {
      primary: { label: t("hidden.subs.action.cancel"), onClick: () => recover(finding) },
      secondary: [
        { label: t("hidden.subs.action.keep"), palette: getPaletteById("emerald"), onClick: () => dismiss(finding) },
        { label: t("hidden.subs.action.snooze"), palette: getPaletteById("amber"), onClick: () => dismiss(finding) },
      ],
    };
  }
  if (cat === "tax") {
    return {
      primary: { label: t("hidden.tax.action.applyAll"), onClick: () => recover(finding) },
      secondary: [
        { label: t("hidden.tax.action.review"), palette: getPaletteById("indigo"), onClick: () => {} },
      ],
    };
  }
  if (cat === "bank") {
    return {
      primary: { label: t("hidden.bank.action.switch"), onClick: () => recover(finding) },
      secondary: [
        { label: t("hidden.bank.action.compare"), palette: getPaletteById("indigo"), onClick: () => {} },
      ],
    };
  }
  if (cat === "duplicate") {
    return {
      primary: { label: t("hidden.dup.action.refund"), onClick: () => recover(finding) },
      secondary: [
        { label: t("hidden.dup.action.investigate"), palette: getPaletteById("indigo"), onClick: () => {} },
        { label: t("hidden.dup.action.resolve"), palette: getPaletteById("emerald"), onClick: () => dismiss(finding) },
      ],
    };
  }
  if (cat === "pricing") {
    return {
      primary: { label: t("hidden.price.action.update"), onClick: () => recover(finding) },
      secondary: [
        { label: t("hidden.price.action.confirm"), palette: getPaletteById("amber"), onClick: () => dismiss(finding) },
      ],
    };
  }
  return { primary: null, secondary: [] };
}

// Small confetti that bursts above the viewport
function Confetti({ palette }) {
  const colors = [palette?.base || "#E30A17", "#10B981", "#F59E0B", "#6C3AFF", "#0EA5E9"];
  const pieces = Array.from({ length: 50 });
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 400, overflow: "hidden" }}
    >
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const dur = 1.4 + Math.random() * 1.2;
        const delay = Math.random() * 0.3;
        const size = 6 + Math.random() * 8;
        const c = colors[i % colors.length];
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: -20,
              left: `${left}%`,
              width: size,
              height: size * 1.3,
              background: c,
              borderRadius: 2,
              animation: `confetti-fall ${dur}s linear ${delay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

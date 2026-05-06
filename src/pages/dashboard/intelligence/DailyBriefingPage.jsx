// ================================================================
// ★ AI Daily Briefing — schedule + WhatsApp preview + test send
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { useAuth } from "../../../context/AuthContext";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getCustomerPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import ScheduleConfigurator from "../../../components/dashboard/intelligence/ScheduleConfigurator";
import BriefingPreview from "../../../components/dashboard/intelligence/BriefingPreview";
import { localStore, KEYS, fmtCurrency } from "./intelligenceApi";

const DEFAULT_CONFIG = {
  time: "08:00",
  channels: ["WHATSAPP"],
  frequency: "daily",
  topics: { revenue: true, overdue: true, calendar: true, cash: true, priorities: true, stock: true, birthday: false, marketplace: false },
};

export default function DailyBriefingPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const { user } = useAuth();
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [config, setConfig] = useState(() => localStore.getKv(KEYS.briefingCfg, DEFAULT_CONFIG));
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => setHistory(localStore.list(KEYS.briefingHistory)), []);

  const topics = [
    { id: "revenue",     label: t("briefing.include.revenue") },
    { id: "overdue",     label: t("briefing.include.overdue") },
    { id: "calendar",    label: t("briefing.include.calendar") },
    { id: "cash",        label: t("briefing.include.cash") },
    { id: "priorities",  label: t("briefing.include.priorities") },
    { id: "stock",       label: t("briefing.include.stock") },
    { id: "birthday",    label: t("briefing.include.birthday") },
    { id: "marketplace", label: t("briefing.include.marketplace") },
  ];

  const previewLines = useMemo(() => {
    const lines = [];
    if (config.topics?.revenue) {
      lines.push(t("briefing.preview.revenue").replace("{amount}", "₺12,500").replace("{count}", "5"));
    }
    if (config.topics?.overdue) {
      lines.push(t("briefing.preview.overdue").replace("{count}", "3").replace("{amount}", "₺8,400"));
    }
    if (config.topics?.priorities) {
      lines.push("");
      lines.push(t("briefing.preview.priorities"));
      lines.push(t("briefing.preview.priority1"));
      lines.push(t("briefing.preview.priority2"));
      lines.push(t("briefing.preview.priority3"));
    }
    if (config.topics?.cash) {
      lines.push("");
      lines.push(t("briefing.preview.cash").replace("{days}", "47"));
    }
    if (config.topics?.stock) {
      lines.push("📦 3 stock items below reorder point");
    }
    return lines;
  }, [config.topics, t]);

  const greeting = t("briefing.preview.greeting").replace("{name}", user?.name || "Mehmet");
  const closer = t("briefing.preview.closer");

  const stats = useMemo(() => ({
    sent: history.filter((h) => h.kind === "scheduled").length,
    tests: history.filter((h) => h.kind === "test").length,
    nextRun: config.time || "08:00",
    channels: (config.channels || []).length,
  }), [history, config]);

  const save = () => {
    localStore.saveKv(KEYS.briefingCfg, config);
    setToast({ kind: "success", msg: t("briefing.toast.saved") });
    setTimeout(() => setToast(null), 2400);
  };

  const sendTest = () => {
    localStore.add(KEYS.briefingHistory, { kind: "test", channels: config.channels, sentAt: new Date().toISOString() });
    setHistory(localStore.list(KEYS.briefingHistory));
    setToast({ kind: "success", msg: t("briefing.toast.sent") });
    setTimeout(() => setToast(null), 2800);
  };

  const previewChannel = (config.channels || ["WHATSAPP"])[0] || "WHATSAPP";

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("briefing.title")} subtitle={t("briefing.subtitle")} icon="☀️" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="intel-kpi-grid"
      >
        <KpiCard label="Next Run" value={stats.nextRun} palette={brand} icon="⏰" />
        <KpiCard label="Channels" value={stats.channels} palette={success} icon="📡" />
        <KpiCard label="Briefings Sent" value={stats.sent} palette={ai} icon="📨" />
        <KpiCard label="Test Sends" value={stats.tests} palette={reports} icon="🧪" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="intel-detail-grid">
        <Card palette={ai} title={t("briefing.config.include")} icon="⚙️">
          <ScheduleConfigurator config={config} onChange={setConfig} topics={topics} t={t} />
        </Card>

        <Card palette={customer} title={t("briefing.preview")} icon="📱">
          <BriefingPreview greeting={greeting} lines={previewLines} closer={closer} channel={previewChannel} />
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <button type="button" onClick={sendTest} style={btn(reports, "secondary")}>
          🧪 {t("briefing.action.test")}
        </button>
        <button type="button" onClick={save} style={btn(brand, "primary")}>
          ✓ {t("briefing.action.save")}
        </button>
      </div>

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

      <style>{`
        @media (max-width: 720px) {
          .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 880px) {
          .intel-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "12px 22px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 6px 18px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "12px 22px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

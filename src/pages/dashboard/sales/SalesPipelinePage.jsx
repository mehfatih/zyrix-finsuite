// ================================================================
// Sales Pipeline — Kanban with drag/drop, optional confetti on Won
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getCustomerPalette,
  getMoneyPalette,
  getReportsPalette,
  getSuccessPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import PipelineStage from "../../../components/dashboard/sales/PipelineStage";
import { api } from "./salesApi";

const STAGES = [
  { id: "LEAD",         palette: "cyan" },
  { id: "QUALIFIED",    palette: "amber" },
  { id: "PROPOSAL",     palette: "orange" },
  { id: "NEGOTIATION",  palette: "violet" },
  { id: "WON",          palette: "emerald" },
  { id: "LOST",         palette: "rose" },
];

export default function SalesPipelinePage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("sales");
  const brand = getBrandPalette(lang.toLowerCase());
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    api("/api/deals").then((res) => {
      const list = res?.data?.deals || res?.data?.items || res?.data || [];
      setDeals(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.id, []]));
    deals.forEach((d) => {
      const stage = STAGES.find((s) => s.id === (d.stage || "").toUpperCase()) ? d.stage.toUpperCase() : "LEAD";
      map[stage] = map[stage] || [];
      map[stage].push(d);
    });
    return map;
  }, [deals]);

  const stats = useMemo(() => {
    const totalValue = deals.reduce((s, d) => s + Number(d.value || 0), 0);
    const won = deals.filter((d) => (d.stage || "").toUpperCase() === "WON");
    const wonThisMonth = won.filter((d) => {
      const dt = new Date(d.updatedAt || d.createdAt);
      const now = new Date();
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;
    const completed = deals.filter((d) => ["WON", "LOST"].includes((d.stage || "").toUpperCase())).length;
    const winrate = completed > 0 ? Math.round((won.length / completed) * 100) : 0;
    return { count: deals.length, totalValue, wonThisMonth, winrate };
  }, [deals]);

  const moveDeal = async (dealId, newStage) => {
    setDeals((arr) =>
      arr.map((d) => (d.id === dealId ? { ...d, stage: newStage, updatedAt: new Date().toISOString() } : d))
    );
    if (newStage === "WON") {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
    await api(`/api/deals/${dealId}`, { method: "PUT", body: JSON.stringify({ stage: newStage }) });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("pipeline.title")}
        subtitle={t("pipeline.subtitle")}
        icon="🤝"
        palette={customer}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋">
            {t("pipeline.new")}
          </PageHeaderButton>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="sales-kpi-grid"
      >
        <KpiCard label={t("pipeline.kpi.total")} value={stats.count} palette={customer} icon="🤝" />
        <KpiCard label={t("pipeline.kpi.value")} value={Math.round(stats.totalValue)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("pipeline.kpi.won")} value={stats.wonThisMonth} palette={success} icon="🏆" />
        <KpiCard label={t("pipeline.kpi.winrate")} value={stats.winrate} suffix="%" palette={reports} icon="📈" />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 8,
          }}
          className="sales-pipeline-scroll"
        >
          {STAGES.map((stage) => (
            <PipelineStage
              key={stage.id}
              stageId={stage.id}
              label={t(`pipeline.stage.${stage.id}`)}
              palette={getPaletteById(stage.palette)}
              deals={grouped[stage.id] || []}
              emptyText={t("pipeline.empty")}
              onCardClick={(d) => onNavigate && onNavigate("sales-customer-detail", { id: d.customerId })}
              onCardDragStart={(d) => setDraggingId(d.id)}
              onDrop={(stageId) => {
                if (draggingId) {
                  moveDeal(draggingId, stageId);
                  setDraggingId(null);
                }
              }}
            />
          ))}
        </div>
      )}

      {confetti && <Confetti />}

      <style>{`
        @media (max-width: 720px) {
          .sales-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .sales-pipeline-scroll::-webkit-scrollbar { height: 8px; }
        .sales-pipeline-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>
    </div>
  );
}

function Confetti() {
  const colors = ["#E30A17", "#10B981", "#F59E0B", "#6C3AFF", "#0EA5E9", "#F43F5E"];
  const pieces = Array.from({ length: 60 });
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 400,
        overflow: "hidden",
      }}
    >
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const dur = 1.5 + Math.random() * 1.4;
        const delay = Math.random() * 0.4;
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

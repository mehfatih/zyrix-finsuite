// ================================================================
// Campaigns Manager — multi-step, multi-channel campaign builder
// ================================================================
import React, { useEffect, useState } from "react";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getMarketPalette, getAIPalette, getSuccessPalette, getReportsPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import CampaignBuilder from "../../../components/dashboard/voice-cx/CampaignBuilder";
import { listCampaigns, saveCampaign, deleteCampaign } from "./voiceCxApi";

const STATUS_PALETTE = {
  active:    "success",
  draft:     "reports",
  paused:    "warn",
  completed: "customer",
};

export default function CampaignsPage() {
  const t = useDashboardI18n("marketing");
  const market = getMarketPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();

  const [campaigns, setCampaigns] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setCampaigns(listCampaigns());
  }, []);

  const stats = {
    active:    campaigns.filter((c) => c.status === "active").length,
    converted: campaigns.reduce((s, c) => s + (c.metrics?.converted || 0), 0),
    running:   campaigns.filter((c) => c.status === "active").reduce((s, c) => s + (c.steps?.length || 0), 0),
    revenue:   campaigns.reduce((s, c) => s + (c.metrics?.converted || 0) * 320, 0),
  };

  const newCampaign = () => setEditing({ id: `cmp-${Date.now()}`, name: "", trigger: "purchase", status: "draft", steps: [], metrics: { sent: 0, opened: 0, clicked: 0, converted: 0 } });
  const onSaveBuilder = () => {
    if (!editing) return;
    saveCampaign(editing);
    setCampaigns(listCampaigns());
    setEditing(null);
  };
  const onDelete = (id) => {
    deleteCampaign(id);
    setCampaigns(listCampaigns());
  };
  const toggleActive = (c) => {
    const next = { ...c, status: c.status === "active" ? "paused" : "active" };
    saveCampaign(next);
    setCampaigns(listCampaigns());
  };

  if (editing) {
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <PageHeader
          title={t("campaigns.builder.title")} subtitle={t("campaigns.subtitle")} icon="🛠" palette={market}
          actions={
            <button type="button" onClick={() => setEditing(null)} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ← {t("common.cancel")}
            </button>
          }
        />
        <CampaignBuilder
          campaign={editing}
          onChange={setEditing}
          onSave={onSaveBuilder}
          onCancel={() => setEditing(null)}
          t={t}
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("campaigns.title")} subtitle={t("campaigns.subtitle")} icon="📣" palette={market}
        actions={
          <button type="button" onClick={newCampaign} style={{ background: `linear-gradient(135deg, ${market.base}, ${market.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${market.base}40` }}>
            {t("campaigns.create")}
          </button>
        }
      />

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}
        className="cm-kpis"
      >
        <KpiCard label={t("campaigns.kpi.active")}    value={stats.active}    palette={market}  icon="📣" />
        <KpiCard label={t("campaigns.kpi.converted")} value={stats.converted} palette={success} icon="✓" />
        <KpiCard label={t("campaigns.kpi.running")}   value={stats.running}   palette={ai}      icon="⚙️" />
        <KpiCard label={t("campaigns.kpi.revenue")}   value={`₺${stats.revenue.toLocaleString()}`} palette={reports} icon="💰" />
      </div>

      <Card palette={market} title={t("campaigns.list.title")} icon="📋">
        {campaigns.length === 0 ? (
          <EmptyState icon="📭" title={t("campaigns.list.empty")} palette={market} />
        ) : (
          campaigns.map((c) => {
            const statusKey = STATUS_PALETTE[c.status] || "reports";
            const sp = statusKey === "success" ? success : statusKey === "reports" ? reports : statusKey === "warn" ? { bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309" } : customer;
            return (
              <div
                key={c.id}
                style={{
                  background: "#fff", border: `1.5px solid ${market.base}30`,
                  borderRadius: 14, padding: 14, marginBottom: 10,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }} className="cm-row-head">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{c.name || "(untitled)"}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, background: sp.bg, color: sp.dark, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {t(`campaigns.status.${c.status}`)}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 800, background: ai.bg, color: ai.dark, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {t(`campaigns.trigger.${c.trigger}`)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      {(c.steps?.length || 0)} step(s) · {c.steps?.map((s) => t(`campaigns.channel.${s.channel}`)).join(" → ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" onClick={() => toggleActive(c)} style={smBtn(c.status === "active" ? { bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309" } : success)}>
                      {c.status === "active" ? t("campaigns.action.pause") : t("campaigns.action.activate")}
                    </button>
                    <button type="button" onClick={() => setEditing({ ...c })} style={smBtn(market)}>{t("campaigns.step.edit")}</button>
                    <button type="button" onClick={() => onDelete(c.id)} style={smBtn({ bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" }, "ghost")}>
                      ✗
                    </button>
                  </div>
                </div>

                {c.metrics && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }} className="cm-metrics">
                    <Metric label={t("campaigns.metric.sent")}      value={c.metrics.sent}      palette={reports} />
                    <Metric label={t("campaigns.metric.opened")}    value={c.metrics.opened}    palette={ai} />
                    <Metric label={t("campaigns.metric.clicked")}   value={c.metrics.clicked}   palette={market} />
                    <Metric label={t("campaigns.metric.converted")} value={c.metrics.converted} palette={success} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </Card>

      <style>{`
        @media (max-width: 720px) {
          .cm-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .cm-row-head { grid-template-columns: 1fr !important; }
          .cm-metrics { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function smBtn(palette, variant = "secondary") {
  if (variant === "ghost") {
    return {
      background: "transparent", color: palette.dark, border: `1px solid ${palette.base}30`,
      padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
    };
  }
  return {
    background: palette.bg, color: palette.dark, border: `1px solid ${palette.base}40`,
    padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
  };
}

function Metric({ label, value, palette }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, padding: "6px 10px", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: palette.dark, marginTop: 2 }}>{Number(value || 0).toLocaleString()}</div>
    </div>
  );
}

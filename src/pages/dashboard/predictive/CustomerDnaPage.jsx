// ================================================================
// ★ Customer DNA — HERO PAGE
// Pick a customer → animated helix + personality + triggers + LTV
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import DnaCard from "../../../components/dashboard/predictive/DnaCard";
import { api, buildCustomerDna, fmtCurrency } from "./predictiveApi";

export default function CustomerDnaPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("predictive");
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api("/api/customers").then((r) => {
      const list = r?.data?.customers || r?.data?.items || r?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setCustomers(arr);
      if (arr.length > 0) setSelectedId(arr[0].id || arr[0].name);
    });
    api("/api/invoices?limit=500").then((r) => {
      setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []);
    });
  }, []);

  const selected = customers.find((c) => (c.id || c.name) === selectedId);
  const dna = useMemo(
    () => (selected ? buildCustomerDna({ customer: selected, invoices }) : null),
    [selected, invoices, refreshKey]
  );

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("dna.title")} subtitle={t("dna.subtitle")} icon="🧬" palette={ai} />

      {/* Customer picker */}
      <Card palette={ai} style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          {t("dna.select")}
        </div>
        {customers.length === 0 ? (
          <EmptyState title={t("common.empty")} icon="🧬" palette={ai} />
        ) : (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {customers.slice(0, 12).map((c) => {
              const id = c.id || c.name;
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  style={{
                    background: active ? `linear-gradient(135deg, ${ai.base}, ${ai.dark})` : "#fff",
                    color: active ? "#fff" : ai.dark,
                    border: active ? `2px solid ${ai.base}` : `1px solid ${ai.base}30`,
                    borderRadius: 14,
                    padding: "10px 14px",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: active ? `0 6px 18px ${ai.base}40` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: active ? "rgba(255,255,255,0.25)" : ai.base,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* DNA Card */}
      {dna && (
        <div style={{ marginBottom: 18 }}>
          <DnaCard dna={dna} lang={lang} t={t} onRefresh={() => setRefreshKey((k) => k + 1)} />
        </div>
      )}

      {dna && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, marginBottom: 18 }} className="predict-detail-grid">
          {/* Triggers */}
          <Card palette={money} title={t("dna.triggers.title")} icon="🎯">
            <Bullet color={money.base} label={t("dna.triggers.salary")} />
            <Bullet color={ai.base} label={t("dna.triggers.holiday")} />
            <Bullet color={success.base} label={t("dna.triggers.discount")} />
          </Card>

          {/* Pain points */}
          <Card palette={alert} title={t("dna.pain.title")} icon="🌡️">
            <Bullet color={alert.base} label={t("dna.pain.price")} />
            <Bullet color={customer.base} label={t("dna.pain.phone")} />
            <Bullet color={reports.base} label={t("dna.pain.detailed")} />
          </Card>
        </div>
      )}

      {dna && (
        <Card palette={customer} title={t("dna.comm.title")} icon="📡">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <CommTile palette={success} label={t("dna.comm.bestChannel")} value={dna.bestChannel} sub={t("dna.comm.openRate").replace("{pct}", `${dna.bestChannelOpenRate}%`)} />
            <CommTile palette={customer} label={t("dna.comm.bestTime")} value={t("dna.comm.tuesday")} />
            <CommTile palette={ai} label={t("dna.comm.bestLanguage")} value={t("dna.comm.tr.formal")} />
            <CommTile palette={alert} label={t("dna.comm.avoid")} value={t("dna.comm.weekends")} />
          </div>
        </Card>
      )}

      <style>{`@media (max-width: 880px) { .predict-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Bullet({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }} />
      <span style={{ fontSize: 13, color: "#0F172A" }}>{label}</span>
    </div>
  );
}

function CommTile({ palette, label, value, sub }) {
  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.base}30`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 10, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: palette.base }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

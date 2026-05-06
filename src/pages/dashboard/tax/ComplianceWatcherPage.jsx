// ================================================================
// ★ Compliance Watcher — AI-detected Turkish tax law changes
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getAlertPalette,
  getReportsPalette,
  getCustomerPalette,
  getBrandPalette,
  getSuccessPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ComplianceAlertCard from "../../../components/dashboard/tax/ComplianceAlertCard";
import { localStore, KEYS, fmtDate } from "../efatura/efaturaApi";

// Mock alert data (in production, AI scrapes GİB announcements daily and
// cross-references with the merchant's product/service catalog).
function buildAlerts() {
  const today = new Date();
  return [
    {
      id: "ca-2026-01",
      severity: "HIGH",
      title: "GİB increased VAT rate for software services from 18% to 20%",
      description: "Effective March 1, 2026 — applies to all software-as-a-service subscriptions billed after the effective date.",
      effectiveDate: new Date(today.getFullYear(), 2, 1).toISOString(),
      affectedCount: 3,
      affectedKind: "software products",
      suggestedAction: "Update product VAT rates and notify affected customers.",
    },
    {
      id: "ca-2026-02",
      severity: "MEDIUM",
      title: "New e-Fatura threshold lowered to ₺3M annual revenue",
      description: "Starting January 2026, businesses with annual revenue ≥ ₺3M must issue e-Faturas instead of paper invoices.",
      effectiveDate: new Date(today.getFullYear(), 0, 1).toISOString(),
      affectedCount: 1,
      affectedKind: "tax category",
      suggestedAction: "Review your annual revenue and switch to e-Fatura if applicable.",
    },
    {
      id: "ca-2026-03",
      severity: "LOW",
      title: "Q1 KDV deadline extended by 7 days for natural disasters",
      description: "Businesses in declared disaster zones get a one-time 7-day extension on Q1 KDV filing.",
      effectiveDate: new Date(today.getFullYear(), 2, 26).toISOString(),
      affectedCount: 0,
      affectedKind: "regions",
      suggestedAction: "If applicable, request the extension via İnteraktif Vergi Dairesi.",
    },
  ];
}

export default function ComplianceWatcherPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("tax");
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const success = getSuccessPalette();

  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [appliedToast, setAppliedToast] = useState(null);

  useEffect(() => {
    setAlerts(buildAlerts());
    const ack = localStore.list(KEYS.complianceAck);
    setDismissed(new Set(ack.map((a) => a.id)));
  }, []);

  const visible = useMemo(() => alerts.filter((a) => !dismissed.has(a.id)), [alerts, dismissed]);

  const stats = useMemo(() => ({
    newAlerts: visible.length,
    affecting: visible.filter((a) => a.affectedCount > 0).length,
    actions: visible.filter((a) => a.affectedCount > 0).length,
    scanned: 142,
  }), [visible]);

  const dismissOne = (id) => {
    localStore.add(KEYS.complianceAck, { id, dismissedAt: new Date().toISOString() });
    setDismissed((s) => new Set([...s, id]));
  };

  const applyAll = (id) => {
    localStore.add(KEYS.complianceAck, { id, applied: true, at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, id]));
    setAppliedToast({ kind: "success", msg: "✓ Updates applied to affected items" });
    setTimeout(() => setAppliedToast(null), 2500);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("compliance.title")} subtitle={t("compliance.subtitle")} icon="🛡️" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ef-kpi-grid"
      >
        <KpiCard label={t("compliance.kpi.alerts")} value={stats.newAlerts} palette={alert} icon="🚨" pulse={stats.newAlerts > 0} />
        <KpiCard label={t("compliance.kpi.affecting")} value={stats.affecting} palette={brand} icon="⚡" />
        <KpiCard label={t("compliance.kpi.actions")} value={stats.actions} palette={customer} icon="🔧" />
        <KpiCard label={t("compliance.kpi.scanned")} value={stats.scanned} palette={success} icon="🔍" />
      </div>

      {visible.length === 0 ? (
        <Card palette={success} icon="🎉">
          <div style={{ padding: 20, textAlign: "center", color: success.dark, fontSize: 14, fontWeight: 700 }}>
            {t("compliance.empty")}
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
          {visible.map((al) => (
            <ComplianceAlertCard
              key={al.id}
              alert={al}
              lang={lang}
              t={t}
              onViewProducts={() => onNavigate && onNavigate("prod-list")}
              onApplyAll={() => applyAll(al.id)}
              onDismiss={() => dismissOne(al.id)}
            />
          ))}
        </div>
      )}

      {/* Timeline of all alerts (including dismissed) */}
      <Card palette={reports} title={t("compliance.timeline.title")} icon="📜">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {alerts.map((al) => {
            const palette = al.severity === "HIGH" ? alert : al.severity === "MEDIUM" ? customer : reports;
            const isDismissed = dismissed.has(al.id);
            return (
              <li
                key={al.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderBottom: "1px solid #F1F5F9",
                  opacity: isDismissed ? 0.55 : 1,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: palette.bg,
                    color: palette.dark,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {al.severity === "HIGH" ? "🚨" : al.severity === "MEDIUM" ? "⚠️" : "ℹ️"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{al.title}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>
                    {fmtDate(al.effectiveDate, lang)} · {al.affectedCount > 0 ? `${al.affectedCount} affected` : "no impact"}
                  </div>
                </div>
                {isDismissed && (
                  <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Acknowledged
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {appliedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: "#ECFDF5",
            color: "#047857",
            border: `1px solid #10B981`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 250,
          }}
        >
          {appliedToast.msg}
        </div>
      )}

      <style>{`@media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

// ================================================================
// Cash Crisis Alerts (POLISH) — days-of-cash hero + active alerts + history
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAlertPalette,
  getSuccessPalette,
  getWarningPalette,
  getMoneyPalette,
  getReportsPalette,
  getCustomerPalette,
  getPaletteById,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { Gauge } from "../../../components/dashboard/charts";
import { api, localStore, KEYS, fmtCurrencyExact, convertFx, fmtDate } from "../cash/cashApi";

const SEV_PALETTE = { LOW: "cyan", MEDIUM: "amber", CRITICAL: "rose" };

export default function CashCrisisAlertsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("ai-finance");
  const alert = getAlertPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [accounts, setAccounts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    setAccounts(localStore.list(KEYS.cashAccounts));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    setDismissed(new Set(localStore.list(KEYS.crisisDismiss).map((d) => d.id)));
  }, []);

  const cashTry = useMemo(
    () => accounts.reduce((s, a) => s + convertFx(a.balance, a.currency, "TRY"), 0),
    [accounts]
  );
  const monthBurn = useMemo(() => {
    const now = new Date();
    return Math.max(
      30000,
      purchases
        .filter((p) => {
          const d = new Date(p.createdAt || 0);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((s, p) => s + Number(p.total || 0), 0)
    );
  }, [purchases]);
  const days = Math.round((cashTry / Math.max(1, monthBurn)) * 30);

  const health = days < 15 ? "CRITICAL" : days < 30 ? "WARNING" : "HEALTHY";
  const healthPalette = health === "CRITICAL" ? alert : health === "WARNING" ? warn : success;

  // Build alerts from real data
  const alerts = useMemo(() => {
    const out = [];
    const overdue = (invoices || []).filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date());
    if (days < 15) {
      out.push({
        id: "alert-runway-critical",
        severity: "CRITICAL",
        cause: `Mevcut nakit (${fmtCurrencyExact(cashTry)}) sadece ${days} gün operasyonu finanse ediyor`,
        action: "Tahsilatları hızlandır + 30 günlük gider planı çıkar",
        impact: "Acil (1-3 gün içinde aksiyon)",
      });
    } else if (days < 30) {
      out.push({
        id: "alert-runway-warning",
        severity: "MEDIUM",
        cause: `Nakit süresi ${days} güne düştü`,
        action: "Bu hafta açık faturaları takip et",
        impact: "+15 gün runway potansiyeli",
      });
    }
    if (overdue.length >= 3) {
      out.push({
        id: "alert-many-overdue",
        severity: "MEDIUM",
        cause: `${overdue.length} müşteri faturası vadesi geçmiş`,
        action: "Otomatik hatırlatıcı + WhatsApp gönderim başlat",
        impact: `Tahmini +${fmtCurrencyExact(overdue.reduce((s, i) => s + Number(i.total || 0), 0))}`,
      });
    }
    if (monthBurn > cashTry * 0.5) {
      out.push({
        id: "alert-high-burn",
        severity: "MEDIUM",
        cause: "Aylık yakım hızı nakdin yarısından fazla",
        action: "Variable cost'ları gözden geçir",
        impact: "+20-40 gün runway",
      });
    }
    return out;
  }, [days, cashTry, monthBurn, invoices]);

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  const dismiss = (id) => {
    localStore.add(KEYS.crisisDismiss, { id, action: "snoozed", at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, id]));
  };
  const resolve = (id) => {
    localStore.add(KEYS.crisisDismiss, { id, action: "resolved", at: new Date().toISOString() });
    setDismissed((s) => new Set([...s, id]));
  };

  const history = localStore.list(KEYS.crisisDismiss);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("crisis.title")} subtitle={t("crisis.subtitle")} icon="🚨" palette={alert} />

      {/* Hero — days of cash */}
      <div
        style={{
          background: `linear-gradient(135deg, ${healthPalette.bg}, ${healthPalette.base}25)`,
          border: `2px solid ${healthPalette.base}40`,
          borderRadius: 18,
          padding: 24,
          marginBottom: 18,
          display: "flex",
          gap: 22,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Gauge value={Math.min(60, days)} max={60} palette={healthPalette} width={180} height={110} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: healthPalette.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {t("crisis.daysOfCash")}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: healthPalette.base,
              fontFamily: "monospace",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              animation: health === "CRITICAL" ? "critPulse 1.4s ease-in-out infinite" : "none",
            }}
          >
            {days}
            <span style={{ fontSize: 20, color: healthPalette.dark, fontWeight: 700, marginInlineStart: 8 }}>
              {t("crisis.daysOfCash.suffix")}
            </span>
          </div>
          <div style={{ fontSize: 13, color: healthPalette.dark, fontWeight: 700, marginTop: 8 }}>
            {t(`crisis.health.${health.toLowerCase()}`)}
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
            Cash {fmtCurrencyExact(cashTry)} · Burn {fmtCurrencyExact(monthBurn)}/mo
          </div>
        </div>
      </div>

      {/* Active alerts */}
      <Card palette={alert} title={t("crisis.alerts.active")} icon="🚨" style={{ marginBottom: 18 }}>
        {visible.length === 0 ? (
          <EmptyState title={t("crisis.empty")} icon="🎉" palette={success} />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {visible.map((al) => {
              const palette = getPaletteById(SEV_PALETTE[al.severity]);
              return (
                <li
                  key={al.id}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${palette.base}40`,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    boxShadow: `0 4px 14px ${palette.base}15`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span
                      style={{
                        background: palette.base,
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t(`crisis.severity.${al.severity}`)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: palette.dark, flex: 1 }}>{al.cause}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }} className="crisis-alert-grid">
                    <Tile label={t("crisis.alert.action")} value={al.action} />
                    <Tile label={t("crisis.alert.impact")} value={al.impact} accent={palette.dark} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => dismiss(al.id)} style={btn(reports, "secondary")}>
                      💤 {t("crisis.action.snooze")}
                    </button>
                    <button type="button" onClick={() => resolve(al.id)} style={btn(success)}>
                      ✓ {t("crisis.action.resolve")}
                    </button>
                    <button type="button" style={btn(brand, "primary")}>
                      ⚡ {t("crisis.action.take")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* History */}
      <Card palette={customer} title={t("crisis.alerts.history")} icon="📜">
        {history.length === 0 ? (
          <EmptyState title={t("crisis.history.empty")} icon="📜" palette={customer} />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {history.slice(0, 10).map((h, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: 16 }}>{h.action === "resolved" ? "✓" : "💤"}</div>
                <div style={{ flex: 1, fontSize: 12, color: "#475569" }}>{h.id}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{fmtDate(h.at, lang)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <style>{`
        @keyframes critPulse {
          0%, 100% { transform: scale(1); text-shadow: 0 0 0 ${alert.base}40; }
          50% { transform: scale(1.04); text-shadow: 0 0 16px ${alert.base}60; }
        }
        @media (max-width: 720px) { .crisis-alert-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Tile({ label, value, accent }) {
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 12px" }}>
      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: accent || "#475569", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}30`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

// ================================================================
// Cheque Detail — lifecycle flow + bank info + actions + timeline
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getCustomerPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import ChequeStatusFlow from "../../../components/dashboard/cash/ChequeStatusFlow";
import { localStore, KEYS, fmtCurrencyExact, fmtDate } from "./cashApi";

export default function ChequeDetailPage({ chequeId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("cash");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const [c, setC] = useState(null);

  useEffect(() => {
    if (!chequeId) return;
    setC(localStore.get(KEYS.cheques, chequeId));
  }, [chequeId]);

  if (!c) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const update = (status) => {
    localStore.update(KEYS.cheques, c.id, { status, [`${status.toLowerCase()}At`]: new Date().toISOString() });
    setC({ ...c, status });
  };

  const remove = () => {
    if (!window.confirm(t("common.confirm") + "?")) return;
    localStore.remove(KEYS.cheques, c.id);
    onNavigate && onNavigate("cash-cheques");
  };

  const days = Math.round((new Date(c.dueDate) - new Date()) / 86400000);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={c.number}
        subtitle={`${c.party} · ${c.bank || "—"}`}
        icon="📑"
        palette={money}
        breadcrumb={[
          { label: t("cheques.title"), href: "#cash-cheques" },
          { label: c.number },
        ]}
        actions={
          <PageHeaderButton palette={money} variant="ghost" onClick={() => onNavigate && onNavigate("cash-cheques")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* Action bar */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${money.base}25`,
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <InvoiceStatusPill
          status={c.status === "DEPOSITED" ? "PENDING" : c.status === "BOUNCED" || c.status === "CANCELLED" ? "OVERDUE" : c.status}
          label={t(`cheques.status.${c.status}`)}
        />
        <span style={{ fontSize: 11, color: "#64748B", marginInlineStart: 4 }}>
          {t("cheques.field.direction")}: <strong>{t(`cheques.dir.${c.direction}`)}</strong>
        </span>
        <div style={{ flex: 1 }} />
        {c.status === "PENDING" && c.direction === "INCOMING" && (
          <button type="button" onClick={() => update("DEPOSITED")} style={btn(customer, "secondary")}>
            🏦 {t("cheques.action.deposit")}
          </button>
        )}
        {(c.status === "PENDING" || c.status === "DEPOSITED") && (
          <>
            <button type="button" onClick={() => update("CLEARED")} style={btn(success, "primary")}>
              ✓ {t("cheques.action.cleared")}
            </button>
            <button type="button" onClick={() => update("BOUNCED")} style={btn(alert)}>
              ✗ {t("cheques.action.bounced")}
            </button>
          </>
        )}
        <button type="button" onClick={remove} style={btn(alert)}>
          🗑
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 18 }} className="chq-detail-grid">
        <div>
          <Card palette={money} title={t("cheques.detail.flow")} icon="🔁" style={{ marginBottom: 14 }}>
            <ChequeStatusFlow status={c.status} lang={lang} t={t} />
          </Card>

          {/* Cheque preview */}
          <div
            style={{
              background: `linear-gradient(135deg, #fff, ${customer.bg})`,
              border: `2px solid ${customer.base}30`,
              borderRadius: 18,
              padding: 24,
              boxShadow: `0 8px 28px ${customer.base}15`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -20, insetInlineEnd: -20, width: 140, height: 140, borderRadius: "50%", background: `${customer.base}10` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("cheques.field.bank")}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: customer.dark, marginTop: 4 }}>{c.bank || "—"}</div>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("cheques.field.number")}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: customer.dark, fontFamily: "monospace", marginTop: 4 }}>{c.number}</div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("cheques.field.party")}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 4 }}>{c.party}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("cheques.field.due")}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: days < 0 ? alert.base : days < 7 ? "#F59E0B" : customer.dark, marginTop: 4 }}>
                  {fmtDate(c.dueDate, lang)}
                  {days >= 0 && days < 30 && <span style={{ fontSize: 12, marginInlineStart: 8 }}>({days}d)</span>}
                  {days < 0 && <span style={{ fontSize: 12, marginInlineStart: 8 }}>({Math.abs(days)}d ago)</span>}
                </div>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("cheques.field.amount")}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: money.base, fontFamily: "monospace", marginTop: 4 }}>
                  {fmtCurrencyExact(c.amount, c.currency)}
                </div>
              </div>
            </div>
          </div>

          {c.notes && (
            <div style={{ marginTop: 14, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "#475569" }}>
              {c.notes}
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              background: c.status === "CLEARED" ? success.bg : c.status === "BOUNCED" ? alert.bg : money.bg,
              border: `1.5px solid ${(c.status === "CLEARED" ? success : c.status === "BOUNCED" ? alert : money).base}30`,
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: money.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {t("cheques.col.status")}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: (c.status === "CLEARED" ? success : c.status === "BOUNCED" ? alert : money).base }}>
              {c.status === "CLEARED" ? "✅" : c.status === "BOUNCED" ? "✗" : c.status === "DEPOSITED" ? "🏦" : "⏳"}
              {" "}
              {t(`cheques.status.${c.status}`)}
            </div>
          </div>

          <Card palette={customer} title={t("cheques.detail.bank.info")} icon="🏦">
            <Row label={t("cheques.field.bank")} value={c.bank} />
            <Row label={t("cheques.field.number")} value={c.number} mono />
            <Row label={t("cheques.field.direction")} value={t(`cheques.dir.${c.direction}`)} />
            <Row label={t("cheques.field.party")} value={c.party} />
          </Card>
        </div>
      </div>

      <style>{`@media (max-width: 880px) { .chq-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #E2E8F0" }}>
      <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, fontFamily: mono ? "monospace" : "inherit" }}>{value || "—"}</span>
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

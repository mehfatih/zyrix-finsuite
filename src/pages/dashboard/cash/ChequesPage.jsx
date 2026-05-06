// ================================================================
// Cheques — outgoing/incoming tabs + 90-day calendar + status flow
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { CalendarHeatmap } from "../../../components/dashboard/charts";
import { localStore, KEYS, ensureChequeSeed, fmtCurrencyExact, fmtDate } from "./cashApi";

export default function ChequesPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("cash");
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("OUTGOING");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    number: "",
    direction: "OUTGOING",
    party: "",
    bank: "",
    amount: 0,
    currency: "TRY",
    dueDate: new Date().toISOString().slice(0, 10),
    notes: "",
    status: "PENDING",
  });

  const reload = () => setItems(localStore.list(KEYS.cheques));
  useEffect(() => {
    ensureChequeSeed();
    reload();
  }, []);

  const filtered = useMemo(() => items.filter((c) => c.direction === tab), [items, tab]);

  const stats = useMemo(() => {
    const pending = items.filter((c) => c.status === "PENDING" || c.status === "DEPOSITED").length;
    const cleared = items.filter((c) => c.status === "CLEARED").length;
    const bounced = items.filter((c) => c.status === "BOUNCED").length;
    const value = items
      .filter((c) => c.status === "PENDING" || c.status === "DEPOSITED")
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    return { pending, cleared, bounced, value };
  }, [items]);

  const heatmapData = useMemo(() => {
    const map = new Map();
    items.forEach((c) => {
      const key = String(c.dueDate || "").slice(0, 10);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + Number(c.amount || 0));
    });
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [items]);

  const updateStatus = (id, newStatus) => {
    localStore.update(KEYS.cheques, id, { status: newStatus });
    reload();
  };

  const submit = () => {
    if (!draft.number || !draft.party || Number(draft.amount) <= 0) return;
    localStore.add(KEYS.cheques, {
      ...draft,
      direction: tab,
      amount: Number(draft.amount),
      dueDate: new Date(draft.dueDate).toISOString(),
    });
    setDraft({
      number: "",
      direction: tab,
      party: "",
      bank: "",
      amount: 0,
      currency: "TRY",
      dueDate: new Date().toISOString().slice(0, 10),
      notes: "",
      status: "PENDING",
    });
    setShowForm(false);
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("cheques.title")}
        subtitle={t("cheques.subtitle")}
        icon="📑"
        palette={money}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("cheques.new")}
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
        className="cash-kpi-grid"
      >
        <KpiCard label={t("cheques.kpi.pending")} value={stats.pending} palette={warn} icon="⏳" pulse={stats.pending > 0} />
        <KpiCard label={t("cheques.kpi.cleared")} value={stats.cleared} palette={success} icon="✅" />
        <KpiCard label={t("cheques.kpi.bounced")} value={stats.bounced} palette={alert} icon="✗" pulse={stats.bounced > 0} />
        <KpiCard label={t("cheques.kpi.value")} value={Math.round(stats.value)} prefix="₺" palette={money} icon="💰" />
      </div>

      <Card palette={customer} title={t("cheques.calendar.title")} icon="🗓️" style={{ marginBottom: 18 }}>
        <CalendarHeatmap data={heatmapData} palette={customer} weeks={14} cellSize={14} gap={4} />
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          background: money.bg,
          padding: 6,
          borderRadius: 14,
          marginBottom: 14,
          border: `1px solid ${money.base}20`,
          width: "fit-content",
        }}
      >
        {[
          { id: "OUTGOING", label: t("cheques.tab.outgoing") },
          { id: "INCOMING", label: t("cheques.tab.incoming") },
        ].map((tabDef) => {
          const active = tab === tabDef.id;
          return (
            <button
              key={tabDef.id}
              type="button"
              onClick={() => setTab(tabDef.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: active ? "#fff" : "transparent",
                color: active ? money.dark : "#64748B",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: active ? `0 2px 8px ${money.base}25` : "none",
              }}
            >
              {tabDef.label}
            </button>
          );
        })}
      </div>

      {showForm && (
        <Card palette={money} title={t("cheques.new")} icon="＋" style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Field label={t("cheques.field.number")}>
              <input type="text" value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} style={{ ...input(money), fontFamily: "monospace" }} />
            </Field>
            <Field label={t("cheques.field.bank")}>
              <input type="text" value={draft.bank} onChange={(e) => setDraft({ ...draft, bank: e.target.value })} style={input(money)} />
            </Field>
            <Field label={t("cheques.field.party")}>
              <input type="text" value={draft.party} onChange={(e) => setDraft({ ...draft, party: e.target.value })} style={input(money)} />
            </Field>
            <Field label={t("cheques.field.amount")}>
              <input type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }} />
            </Field>
            <Field label={t("cheques.field.due")}>
              <input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} style={input(money)} />
            </Field>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={btn(money, "secondary")}>{t("common.cancel")}</button>
            <button type="button" onClick={submit} style={btn(success, "primary")}>✓ {t("common.save")}</button>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={t("cheques.empty")} icon="📑" palette={money} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${money.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: money.bg, borderBottom: `1.5px solid ${money.base}20` }}>
                <th style={th}>{t("cheques.col.status")}</th>
                <th style={th}>{t("cheques.col.number")}</th>
                <th style={th}>{t("cheques.col.bank")}</th>
                <th style={th}>{t("cheques.col.party")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("cheques.col.amount")}</th>
                <th style={th}>{t("cheques.col.due")}</th>
                <th style={{ ...th, textAlign: "end" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const palette = getPaletteById(
                  { PENDING: "amber", DEPOSITED: "indigo", CLEARED: "emerald", BOUNCED: "rose", CANCELLED: "rose" }[c.status] || "indigo"
                );
                const days = Math.round((new Date(c.dueDate) - new Date()) / 86400000);
                return (
                  <tr
                    key={c.id}
                    onClick={() => onNavigate && onNavigate("cash-cheque-detail", { id: c.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = money.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <InvoiceStatusPill status={c.status === "DEPOSITED" ? "PENDING" : c.status} label={t(`cheques.status.${c.status}`)} />
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: palette.dark, fontWeight: 700 }}>{c.number}</td>
                    <td style={td}>{c.bank || "—"}</td>
                    <td style={td}>{c.party}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrencyExact(c.amount, c.currency)}
                    </td>
                    <td style={{ ...td, color: days < 0 ? alert.base : days < 7 ? warn.base : "#64748B", fontSize: 12, fontWeight: days < 7 ? 700 : 500 }}>
                      {fmtDate(c.dueDate, lang)}
                      {days >= 0 && days < 7 && <span style={{ marginInlineStart: 6 }}>({days}d)</span>}
                      {days < 0 && <span style={{ marginInlineStart: 6 }}>({Math.abs(days)}d ago)</span>}
                    </td>
                    <td style={{ ...td, textAlign: "end" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                        {c.status === "PENDING" && c.direction === "INCOMING" && (
                          <button type="button" onClick={() => updateStatus(c.id, "DEPOSITED")} style={btnSm(getPaletteById("indigo"))}>
                            🏦 {t("cheques.action.deposit")}
                          </button>
                        )}
                        {(c.status === "PENDING" || c.status === "DEPOSITED") && (
                          <>
                            <button type="button" onClick={() => updateStatus(c.id, "CLEARED")} style={btnSm(success)}>
                              ✓
                            </button>
                            <button type="button" onClick={() => updateStatus(c.id, "BOUNCED")} style={btnSm(alert)}>
                              ✗
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .cash-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
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
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  return {
    background: "#fff",
    color: palette.dark,
    border: `1px solid ${palette.base}30`,
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
function btnSm(palette) {
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

const th = {
  textAlign: "start",
  padding: "12px 14px",
  fontSize: 11,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "12px 14px", color: "#0F172A" };

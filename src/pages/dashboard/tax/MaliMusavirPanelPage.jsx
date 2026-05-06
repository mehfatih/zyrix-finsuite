// ================================================================
// Mali Müşavir Panel — accountant-only view + permission grid + invites
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getReportsPalette,
  getMoneyPalette,
  getSuccessPalette,
  getCustomerPalette,
  getBrandPalette,
  getAlertPalette,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { api, localStore, KEYS, fmtCurrency, fmtDate } from "../efatura/efaturaApi";

const PERMISSIONS = [
  { id: "read",   granted: true,  icon: "👁" },
  { id: "export", granted: true,  icon: "⬇" },
  { id: "notes",  granted: true,  icon: "📝" },
  { id: "edit",   granted: false, icon: "✏️" },
  { id: "delete", granted: false, icon: "🗑" },
  { id: "create", granted: false, icon: "＋" },
];

function makeToken() {
  return `mm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export default function MaliMusavirPanelPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("tax");
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const alert = getAlertPalette();

  const [invites, setInvites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({ invoices: 0, expenses: 0, vatThisMonth: 0, lastDownload: null });

  const reload = () => setInvites(localStore.list(KEYS.musavirInvites));

  useEffect(() => {
    reload();
    Promise.all([api("/api/invoices?limit=500"), api("/api/efatura/stats")]).then(([invRes, efRes]) => {
      const sales = invRes?.data?.invoices || invRes?.data?.items || invRes?.data || [];
      const expenses = localStore.list("zyrix_expenses_v1");
      const now = new Date();
      const thisMonthVat = (Array.isArray(sales) ? sales : [])
        .filter((i) => {
          const d = new Date(i.createdAt || 0);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((s, i) => s + Number(i.vatAmount || 0), 0);
      setStats({
        invoices: Array.isArray(sales) ? sales.length : 0,
        expenses: expenses.length,
        vatThisMonth: thisMonthVat,
        lastDownload: efRes?.data?.lastExportAt || null,
      });
    });
  }, []);

  const submit = () => {
    if (!draft.name || !draft.email) return;
    localStore.add(KEYS.musavirInvites, {
      ...draft,
      token: makeToken(),
      permissions: PERMISSIONS.filter((p) => p.granted).map((p) => p.id),
      createdAt: new Date().toISOString(),
    });
    setDraft({ name: "", email: "" });
    setShowForm(false);
    reload();
  };

  const revoke = (id) => {
    if (!window.confirm(t("common.confirm") + "?")) return;
    localStore.remove(KEYS.musavirInvites, id);
    reload();
  };

  const regenerate = (id) => {
    localStore.update(KEYS.musavirInvites, id, { token: makeToken() });
    reload();
  };

  const copyLink = async (invite) => {
    const url = `${window.location.origin}/mm/${invite.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invite.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("musavir.title")}
        subtitle={t("musavir.subtitle")}
        icon="🧮"
        palette={reports}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("musavir.invite")}
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
        className="ef-kpi-grid"
      >
        <KpiCard label={t("musavir.kpi.invoices")} value={stats.invoices} palette={customer} icon="🧾" />
        <KpiCard label={t("musavir.kpi.expenses")} value={stats.expenses} palette={reports} icon="💸" />
        <KpiCard label={t("musavir.kpi.vat")} value={Math.round(stats.vatThisMonth)} prefix="₺" palette={money} icon="📊" />
        <Card palette={success} title={t("musavir.kpi.lastdownload")} icon="⬇">
          <div style={{ fontSize: 16, fontWeight: 700, color: success.dark }}>
            {stats.lastDownload ? fmtDate(stats.lastDownload, lang) : "—"}
          </div>
        </Card>
      </div>

      {/* Permission preview */}
      <Card palette={reports} title={t("musavir.permission.title")} icon="🔐" style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {PERMISSIONS.map((p) => {
            const palette = p.granted ? success : alert;
            return (
              <div
                key={p.id}
                style={{
                  background: palette.bg,
                  border: `1px solid ${palette.base}30`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: palette.base,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {p.granted ? "✓" : "✗"}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: palette.dark }}>
                    {p.icon} {t(`musavir.perm.${p.id}`)}
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
                    {p.granted ? "ALLOWED" : "BLOCKED"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showForm && (
        <Card palette={reports} title={t("musavir.invite")} icon="✉️" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <Field label={t("musavir.col.name")}>
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input(reports)} />
            </Field>
            <Field label={t("musavir.col.email")}>
              <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={input(reports)} />
            </Field>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={btn(reports, "secondary")}>
              {t("common.cancel")}
            </button>
            <button type="button" onClick={submit} style={btn(success, "primary")}>
              ✓ {t("common.save")}
            </button>
          </div>
        </Card>
      )}

      {invites.length === 0 ? (
        <EmptyState title={t("musavir.empty")} icon="🧮" palette={reports} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${reports.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: reports.bg, borderBottom: `1.5px solid ${reports.base}20` }}>
                <th style={th}>{t("musavir.col.name")}</th>
                <th style={th}>{t("musavir.col.email")}</th>
                <th style={th}>{t("musavir.access.title")}</th>
                <th style={th}>{t("musavir.col.created")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("musavir.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 10, background: `${customer.base}25`, color: customer.dark, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12 }}>
                        {(inv.name || "?")[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, color: "#0F172A" }}>{inv.name}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{inv.email}</td>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: reports.dark }}>
                    /mm/{inv.token.slice(0, 12)}…
                  </td>
                  <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(inv.createdAt, lang)}</td>
                  <td style={{ ...td, textAlign: "end" }}>
                    <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => copyLink(inv)} style={btnSm(success)}>
                        {copiedId === inv.id ? t("musavir.access.copied") : `📋 ${t("musavir.access.copy")}`}
                      </button>
                      <button type="button" onClick={() => regenerate(inv.id)} style={btnSm(customer)}>
                        ⟳
                      </button>
                      <button type="button" onClick={() => revoke(inv.id)} style={btnSm(alert)}>
                        ✗ {t("musavir.action.revoke")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
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

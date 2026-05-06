// ================================================================
// Purchase Invoices List — Outgoing/Incoming tabs + bulk accept/reject
// Stored in localStorage today; swap to /api/purchase-invoices later.
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./purchasesApi";

function seedIfEmpty() {
  if (localStore.list(KEYS.purchases).length > 0) return;
  const today = Date.now();
  const seeds = [
    { number: "PINV-2025-0001", supplierName: "Demo Tedarik A.Ş.", direction: "OUTGOING", total: 12500, currency: "TRY", status: "PAID",            createdAt: new Date(today - 30 * 86400000).toISOString(), dueDate: new Date(today - 5 * 86400000).toISOString() },
    { number: "PINV-2025-0002", supplierName: "Acme Ofis Malzeme", direction: "OUTGOING", total: 3200,  currency: "TRY", status: "ACCEPTED",        createdAt: new Date(today - 12 * 86400000).toISOString(), dueDate: new Date(today + 18 * 86400000).toISOString() },
    { number: "EFT-9988887",    supplierName: "Yıldız Lojistik",   direction: "INCOMING", total: 4750,  currency: "TRY", status: "PENDING_ACCEPT",  createdAt: new Date(today - 2 * 86400000).toISOString(),  dueDate: new Date(today + 28 * 86400000).toISOString() },
    { number: "EFT-9988895",    supplierName: "Yeni Vendor Ltd.",  direction: "INCOMING", total: 2100,  currency: "TRY", status: "PENDING_ACCEPT",  createdAt: new Date(today - 1 * 86400000).toISOString(),  dueDate: new Date(today + 30 * 86400000).toISOString() },
  ];
  seeds.forEach((s) => localStore.add(KEYS.purchases, s));
}

export default function PurchaseInvoicesListPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [tab, setTab] = useState("OUTGOING");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const reload = () => setItems(localStore.list(KEYS.purchases));
  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  const filtered = useMemo(() => items.filter((i) => i.direction === tab), [items, tab]);

  const stats = useMemo(() => {
    const sum = (arr) => arr.reduce((s, i) => s + Number(i.total || 0), 0);
    const total = sum(items);
    const payable = sum(items.filter((i) => i.status === "ACCEPTED"));
    const paid = sum(items.filter((i) => i.status === "PAID"));
    const pending = items.filter((i) => i.status === "PENDING_ACCEPT").length;
    return { total, payable, paid, pending };
  }, [items]);

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const accept = (ids) => {
    ids.forEach((id) => localStore.update(KEYS.purchases, id, { status: "ACCEPTED" }));
    setSelected(new Set());
    reload();
  };
  const reject = (ids) => {
    ids.forEach((id) => localStore.update(KEYS.purchases, id, { status: "REJECTED" }));
    setSelected(new Set());
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("invoices.title")}
        subtitle={t("invoices.subtitle")}
        icon="📥"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => onNavigate && onNavigate("purch-invoice-new")}>
            {t("invoices.new")}
          </PageHeaderButton>
        }
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="purch-kpi-grid"
      >
        <KpiCard label={t("invoices.kpi.total")} value={Math.round(stats.total)} prefix="₺" palette={market} icon="📊" />
        <KpiCard label={t("invoices.kpi.payable")} value={Math.round(stats.payable)} prefix="₺" palette={warn} icon="💸" />
        <KpiCard label={t("invoices.kpi.paid")} value={Math.round(stats.paid)} prefix="₺" palette={success} icon="✅" />
        <KpiCard label={t("invoices.kpi.pending")} value={stats.pending} palette={alert} icon="⏳" pulse={stats.pending > 0} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          background: market.bg,
          padding: 6,
          borderRadius: 14,
          marginBottom: 14,
          border: `1px solid ${market.base}20`,
          width: "fit-content",
        }}
      >
        {[
          { id: "OUTGOING", label: t("invoices.tab.outgoing") },
          { id: "INCOMING", label: t("invoices.tab.incoming") },
        ].map((tabDef) => {
          const active = tab === tabDef.id;
          return (
            <button
              key={tabDef.id}
              type="button"
              onClick={() => {
                setTab(tabDef.id);
                setSelected(new Set());
              }}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: active ? "#fff" : "transparent",
                color: active ? market.dark : "#64748B",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: active ? `0 2px 8px ${market.base}25` : "none",
              }}
            >
              {tabDef.label}
            </button>
          );
        })}
      </div>

      {/* Bulk action bar (incoming only) */}
      {tab === "INCOMING" && selected.size > 0 && (
        <div
          style={{
            background: "#fff",
            border: `2px solid ${market.base}40`,
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: market.dark, marginInlineEnd: 4 }}>
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={() => accept(Array.from(selected))}
            style={{ ...btn(success, "primary") }}
          >
            ✓ {t("invoices.action.bulkaccept")}
          </button>
          <button
            type="button"
            onClick={() => reject(Array.from(selected))}
            style={{ ...btn(alert, "secondary") }}
          >
            ✗ {t("invoices.action.bulkreject")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={t("invoices.empty")} icon="📥" palette={market} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                {tab === "INCOMING" && <th style={{ ...th, width: 36 }} />}
                <th style={th}>{t("invoices.col.status")}</th>
                <th style={th}>{t("invoices.col.number")}</th>
                <th style={th}>{t("invoices.col.supplier")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("invoices.col.amount")}</th>
                <th style={th}>{t("invoices.col.due")}</th>
                <th style={{ ...th, textAlign: "end" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const palette = getPaletteById(
                  { PENDING_ACCEPT: "amber", ACCEPTED: "cyan", REJECTED: "rose", PAID: "emerald" }[inv.status] || "indigo"
                );
                return (
                  <tr
                    key={inv.id}
                    style={{ borderBottom: "1px solid #F1F5F9", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = market.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {tab === "INCOMING" && (
                      <td style={td}>
                        <input
                          type="checkbox"
                          checked={selected.has(inv.id)}
                          onChange={() => toggle(inv.id)}
                          style={{ width: 16, height: 16, accentColor: market.base, cursor: "pointer" }}
                        />
                      </td>
                    )}
                    <td style={td}>
                      <InvoiceStatusPill status={inv.status} label={t(`invoices.status.${inv.status}`)} />
                    </td>
                    <td style={{ ...td, fontFamily: "monospace", color: palette.dark, fontWeight: 700 }}>
                      {inv.number}
                    </td>
                    <td style={td}>{inv.supplierName || "—"}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(inv.total, inv.currency)}
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(inv.dueDate, lang)}</td>
                    <td style={{ ...td, textAlign: "end" }}>
                      <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                        {tab === "INCOMING" && inv.status === "PENDING_ACCEPT" && (
                          <>
                            <button type="button" onClick={() => accept([inv.id])} style={{ ...btn(success), padding: "5px 10px", fontSize: 11 }}>
                              ✓
                            </button>
                            <button type="button" onClick={() => reject([inv.id])} style={{ ...btn(alert), padding: "5px 10px", fontSize: 11 }}>
                              ✗
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate("purch-invoice-detail", { id: inv.id })}
                          style={{ ...btn(market), padding: "5px 10px", fontSize: 11 }}
                        >
                          ›
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .purch-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant = "primary") {
  if (variant === "primary") {
    return {
      background: palette.bg,
      color: palette.dark,
      border: `1px solid ${palette.base}40`,
      padding: "6px 12px",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
    };
  }
  return {
    background: "#fff",
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
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

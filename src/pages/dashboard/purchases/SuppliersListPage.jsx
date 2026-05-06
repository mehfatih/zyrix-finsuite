// ================================================================
// Suppliers List — KPIs + filterable table with mini-bar spend
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getBrandPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, ensureSupplierSeed, fmtCurrency, fmtDate, daysAgo } from "./purchasesApi";

export default function SuppliersListPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    ensureSupplierSeed();
    setSuppliers(localStore.list(KEYS.suppliers));
    setInvoices(localStore.list(KEYS.purchases));
  }, []);

  const enriched = useMemo(() => {
    const byKey = {};
    invoices.forEach((inv) => {
      const key = inv.supplierId || inv.supplierName;
      if (!key) return;
      if (!byKey[key]) byKey[key] = { spend: 0, count: 0, last: null };
      byKey[key].spend += Number(inv.total || 0);
      byKey[key].count += 1;
      const dt = inv.createdAt ? new Date(inv.createdAt) : null;
      if (dt && (!byKey[key].last || dt > byKey[key].last)) byKey[key].last = dt;
    });
    return suppliers.map((s) => {
      const stat = byKey[s.id] || byKey[s.name] || { spend: 0, count: 0, last: null };
      const lastDays = stat.last ? daysAgo(stat.last) : 9999;
      const status = lastDays < 90 ? "ACTIVE" : lastDays > 180 ? "AT_RISK" : "INACTIVE";
      return { ...s, _spend: stat.spend, _count: stat.count, _last: stat.last, _status: status };
    });
  }, [suppliers, invoices]);

  const stats = useMemo(() => {
    const total = enriched.length;
    const active = enriched.filter((s) => s._status === "ACTIVE").length;
    const atRisk = enriched.filter((s) => s._status === "AT_RISK").length;
    const top = enriched.length === 0 ? null : enriched.reduce((a, b) => (b._spend > a._spend ? b : a));
    return { total, active, atRisk, top };
  }, [enriched]);

  const filtered = useMemo(() => {
    if (!search) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(
      (s) =>
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.category || "").toLowerCase().includes(q) ||
        String(s.taxId || "").toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const maxSpend = Math.max(1, ...enriched.map((s) => s._spend));
  const palettes = paletteSequence(filtered.length, { exclude: ["wine"] });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        icon="🏭"
        palette={market}
        actions={
          <PageHeaderButton
            palette={brand}
            variant="primary"
            icon="＋"
            onClick={() => {
              const name = window.prompt(t("suppliers.new") + ":");
              if (!name) return;
              localStore.add(KEYS.suppliers, { name, category: "Diğer" });
              setSuppliers(localStore.list(KEYS.suppliers));
            }}
          >
            {t("suppliers.new")}
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
        className="purch-kpi-grid"
      >
        <KpiCard label={t("suppliers.kpi.total")} value={stats.total} palette={market} icon="🏭" />
        <KpiCard label={t("suppliers.kpi.active")} value={stats.active} palette={success} icon="✅" />
        <KpiCard label={t("suppliers.kpi.atrisk")} value={stats.atRisk} palette={alert} icon="⚠️" pulse={stats.atRisk > 0} />
        <KpiCard
          label={t("suppliers.kpi.topspend")}
          value={stats.top ? Math.round(stats.top._spend) : 0}
          prefix="₺"
          palette={money}
          icon="💰"
          trendLabel={stats.top?.name}
        />
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${market.base}15`,
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, category, tax ID…"
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${market.base}25`,
            background: "#fff",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("suppliers.empty")} icon="🏭" palette={market} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("suppliers.col.name")}</th>
                <th style={th}>{t("suppliers.col.category")}</th>
                <th style={{ ...th, minWidth: 220 }}>{t("suppliers.col.spend")}</th>
                <th style={th}>{t("suppliers.col.last")}</th>
                <th style={th}>{t("invoices.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const palette = palettes[i] || market;
                const spendW = (s._spend / maxSpend) * 100;
                return (
                  <tr
                    key={s.id}
                    onClick={() => onNavigate && onNavigate("purch-supplier-detail", { id: s.id })}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = market.bg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: palette.base,
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {(s.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{s.email || s.phone || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{s.category || "—"}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: `${palette.base}15`, borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.max(2, spendW)}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${palette.base}, ${palette.dark})`,
                              transition: "width .8s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: money.dark, fontSize: 12, minWidth: 80, textAlign: "end" }}>
                          {fmtCurrency(s._spend)}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{s._last ? fmtDate(s._last, lang) : "—"}</td>
                    <td style={td}>
                      <InvoiceStatusPill status={s._status} label={t(`suppliers.status.${s._status}`)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .purch-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
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
const td = { padding: "12px 14px" };

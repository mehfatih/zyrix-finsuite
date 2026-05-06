// ================================================================
// Expenses — quick entry + sunburst category breakdown + top bars
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getReportsPalette,
  getSuccessPalette,
  getWarningPalette,
  getBrandPalette,
  paletteSequence,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { Sunburst, BarChart } from "../../../components/dashboard/charts";
import ExpenseCategoryPicker, { EXPENSE_CATEGORIES } from "../../../components/dashboard/purchases/ExpenseCategoryPicker";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./purchasesApi";

function seedIfEmpty() {
  if (localStore.list(KEYS.expenses).length > 0) return;
  const today = Date.now();
  const seeds = [
    { category: "fuel",      amount: 1200, supplier: "BP Petrol",     note: "Filo yakıt", createdAt: new Date(today - 2 * 86400000).toISOString() },
    { category: "office",    amount: 450,  supplier: "Acme Ofis",      note: "Kırtasiye", createdAt: new Date(today - 5 * 86400000).toISOString() },
    { category: "rent",      amount: 8500, supplier: "Emlakçı",         note: "Şubat kirası", createdAt: new Date(today - 14 * 86400000).toISOString() },
    { category: "marketing", amount: 3200, supplier: "Google Ads",      note: "Q1 kampanya", createdAt: new Date(today - 20 * 86400000).toISOString() },
    { category: "utilities", amount: 980,  supplier: "TEDAŞ",            note: "Elektrik",  createdAt: new Date(today - 7 * 86400000).toISOString() },
    { category: "travel",    amount: 2450, supplier: "THY",              note: "Ankara seyahati", createdAt: new Date(today - 11 * 86400000).toISOString() },
  ];
  seeds.forEach((s) => localStore.add(KEYS.expenses, s));
}

export default function ExpensesPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [draft, setDraft] = useState({
    category: "fuel",
    amount: 0,
    supplier: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const reload = () => setItems(localStore.list(KEYS.expenses));
  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const monthSum = items
      .filter((i) => {
        const d = new Date(i.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    const yearSum = items
      .filter((i) => new Date(i.createdAt).getFullYear() === now.getFullYear())
      .reduce((s, i) => s + Number(i.amount || 0), 0);
    const months = new Set(items.map((i) => String(i.createdAt || "").slice(0, 7))).size || 1;
    const avg = yearSum / months;
    const byCat = {};
    items.forEach((i) => {
      byCat[i.category] = (byCat[i.category] || 0) + Number(i.amount || 0);
    });
    const top = Object.entries(byCat).sort(([, a], [, b]) => b - a)[0];
    return { monthSum, yearSum, avg, top: top ? { id: top[0], amount: top[1] } : null };
  }, [items]);

  const sunburstData = useMemo(() => {
    const palettes = paletteSequence(EXPENSE_CATEGORIES.length, { exclude: ["wine"] });
    const byCat = {};
    items.forEach((i) => {
      byCat[i.category] = (byCat[i.category] || 0) + Number(i.amount || 0);
    });
    return EXPENSE_CATEGORIES.map((c, i) => ({
      label: t(`expenses.cat.${c.id}`),
      value: byCat[c.id] || 0,
      color: palettes[i].base,
    })).filter((x) => x.value > 0);
  }, [items, t]);

  const topBars = useMemo(() => {
    return sunburstData
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((d) => ({ label: d.label, value: d.value, color: d.color }));
  }, [sunburstData]);

  const filtered = useMemo(() => {
    let arr = items;
    if (filter !== "ALL") arr = arr.filter((i) => i.category === filter);
    return arr.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, filter]);

  const submit = () => {
    if (!draft.amount || Number(draft.amount) <= 0) return;
    localStore.add(KEYS.expenses, {
      category: draft.category,
      amount: Number(draft.amount),
      supplier: draft.supplier,
      note: draft.note,
      createdAt: new Date(draft.date).toISOString(),
    });
    setDraft({ category: "fuel", amount: 0, supplier: "", note: "", date: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("expenses.title")}
        subtitle={t("expenses.subtitle")}
        icon="💸"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("expenses.new")}
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
        <KpiCard label={t("expenses.kpi.month")} value={Math.round(stats.monthSum)} prefix="₺" palette={market} icon="📆" />
        <KpiCard label={t("expenses.kpi.year")} value={Math.round(stats.yearSum)} prefix="₺" palette={money} icon="📊" />
        <KpiCard label={t("expenses.kpi.avg")} value={Math.round(stats.avg)} prefix="₺" palette={reports} icon="📈" />
        <KpiCard
          label={t("expenses.kpi.top")}
          value={stats.top ? Math.round(stats.top.amount) : 0}
          prefix="₺"
          palette={warn}
          icon="🔥"
          trendLabel={stats.top ? t(`expenses.cat.${stats.top.id}`) : ""}
        />
      </div>

      {showForm && (
        <Card palette={market} title={t("expenses.new")} icon="📝" style={{ marginBottom: 18 }}>
          <ExpenseCategoryPicker value={draft.category} onChange={(c) => setDraft({ ...draft, category: c })} t={t} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                style={{ ...input(market), fontFamily: "monospace", textAlign: "end" }}
              />
            </Field>
            <Field label={t("expenses.col.supplier")}>
              <input type="text" value={draft.supplier} onChange={(e) => setDraft({ ...draft, supplier: e.target.value })} style={input(market)} />
            </Field>
            <Field label={t("expenses.col.date")}>
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={input(market)} />
            </Field>
            <Field label={t("expenses.col.note")}>
              <input type="text" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} style={input(market)} />
            </Field>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={btnGhost(market)}>
              {t("common.cancel")}
            </button>
            <button type="button" onClick={submit} style={btnPrimary(success)}>
              ✓ {t("common.save")}
            </button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 18, marginBottom: 18 }} className="purch-detail-grid">
        <Card palette={market} title={t("expenses.cat.title")} icon="🍩">
          {sunburstData.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }}>
              <Sunburst data={sunburstData} palette={market} size={180} />
              <div>
                {sunburstData.slice(0, 6).map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: money.dark }}>
                      {fmtCurrency(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card palette={reports} title={t("expenses.top.title")} icon="📊">
          {topBars.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>—</div>
          ) : (
            <BarChart data={topBars} palette={reports} height={220} />
          )}
        </Card>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${market.base}15`,
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {[{ id: "ALL", label: t("invoices.filter.all") || "All" }, ...EXPENSE_CATEGORIES.map((c) => ({ id: c.id, label: t(`expenses.cat.${c.id}`) }))].map((f) => {
          const active = filter === f.id;
          const palette = f.id === "ALL" ? market : getPaletteById(paletteSequence(EXPENSE_CATEGORIES.length, { exclude: ["wine"] })[EXPENSE_CATEGORIES.findIndex((c) => c.id === f.id)]?.id || "indigo");
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
                background: active ? palette.base : `${palette.base}10`,
                color: active ? "#fff" : palette.dark,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("expenses.empty")} icon="💸" palette={market} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("expenses.col.date")}</th>
                <th style={th}>{t("expenses.col.category")}</th>
                <th style={th}>{t("expenses.col.supplier")}</th>
                <th style={th}>{t("expenses.col.note")}</th>
                <th style={{ ...th, textAlign: "end" }}>{t("expenses.col.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const cat = EXPENSE_CATEGORIES.find((c) => c.id === e.category) || EXPENSE_CATEGORIES[7];
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(e.createdAt, lang)}</td>
                    <td style={td}>
                      <span style={{ fontSize: 16, marginInlineEnd: 6 }}>{cat.icon}</span>
                      {t(`expenses.cat.${e.category}`)}
                    </td>
                    <td style={{ ...td, color: "#64748B" }}>{e.supplier || "—"}</td>
                    <td style={{ ...td, color: "#475569", fontSize: 12 }}>{e.note || "—"}</td>
                    <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                      {fmtCurrency(e.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="purch-fab"
        style={{
          position: "fixed",
          bottom: 24,
          insetInlineEnd: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          color: "#fff",
          border: "none",
          fontSize: 24,
          fontWeight: 900,
          cursor: "pointer",
          boxShadow: `0 8px 22px ${brand.base}50`,
          display: "none",
          zIndex: 100,
        }}
      >
        +
      </button>

      <style>{`
        @media (max-width: 720px) {
          .purch-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .purch-fab { display: grid !important; place-items: center; }
        }
        @media (max-width: 880px) { .purch-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
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
function btnPrimary(palette) {
  return {
    background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: `0 4px 12px ${palette.base}35`,
  };
}
function btnGhost(palette) {
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

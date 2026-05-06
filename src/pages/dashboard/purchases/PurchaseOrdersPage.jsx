// ================================================================
// Purchase Orders — procurement workflow + 3-way quote comparison
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
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, ensureSupplierSeed, fmtCurrency, fmtDate } from "./purchasesApi";

function seedIfEmpty() {
  if (localStore.list(KEYS.pos).length > 0) return;
  const today = Date.now();
  [
    {
      number: "PO-2025-0001",
      supplierName: "Demo Tedarik A.Ş.",
      status: "SENT",
      total: 18500,
      currency: "TRY",
      createdAt: new Date(today - 6 * 86400000).toISOString(),
      itemsCount: 3,
      compare: [
        { supplier: "Demo Tedarik A.Ş.",   price: 18500, leadDays: 5,  rating: 4.6 },
        { supplier: "Acme Ofis Malzeme",   price: 19200, leadDays: 3,  rating: 4.4 },
        { supplier: "Yıldız Lojistik",     price: 17900, leadDays: 9,  rating: 4.1 },
      ],
    },
    {
      number: "PO-2025-0002",
      supplierName: "Acme Ofis Malzeme",
      status: "RECEIVED",
      total: 4800,
      currency: "TRY",
      createdAt: new Date(today - 18 * 86400000).toISOString(),
      itemsCount: 7,
    },
  ].forEach((po) => localStore.add(KEYS.pos, po));
}

export default function PurchaseOrdersPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("purchases");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const reload = () => setOrders(localStore.list(KEYS.pos));
  useEffect(() => {
    ensureSupplierSeed();
    seedIfEmpty();
    reload();
  }, []);

  const stats = useMemo(() => {
    const draft = orders.filter((o) => o.status === "DRAFT").length;
    const sent = orders.filter((o) => o.status === "SENT").length;
    const received = orders.filter((o) => o.status === "RECEIVED" || o.status === "INVOICED").length;
    const value = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    return { draft, sent, received, value };
  }, [orders]);

  const advance = (po, next) => {
    localStore.update(KEYS.pos, po.id, { status: next });
    reload();
  };

  const convert = (po) => {
    advance(po, "INVOICED");
    onNavigate && onNavigate("purch-invoice-new");
  };

  const compareCols = expanded?.compare || [];
  const bestPriceIdx = compareCols.length > 0 ? compareCols.reduce((best, c, i) => c.price < compareCols[best].price ? i : best, 0) : -1;
  const bestRatingIdx = compareCols.length > 0 ? compareCols.reduce((best, c, i) => c.rating > compareCols[best].rating ? i : best, 0) : -1;
  const fastestIdx = compareCols.length > 0 ? compareCols.reduce((best, c, i) => c.leadDays < compareCols[best].leadDays ? i : best, 0) : -1;
  const palettes = paletteSequence(compareCols.length, { exclude: ["wine"] });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        icon="📦"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋">
            {t("orders.new")}
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
        <KpiCard label={t("orders.kpi.draft")} value={stats.draft} palette={warn} icon="📝" />
        <KpiCard label={t("orders.kpi.sent")} value={stats.sent} palette={reports} icon="📤" />
        <KpiCard label={t("orders.kpi.received")} value={stats.received} palette={success} icon="📥" />
        <KpiCard label={t("orders.kpi.value")} value={Math.round(stats.value)} prefix="₺" palette={money} icon="💰" />
      </div>

      {expanded && (
        <Card palette={market} title={t("orders.compare.title")} icon="⚖️" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${compareCols.length}, 1fr)`, gap: 12 }} className="purch-compare-grid">
            {compareCols.map((c, i) => {
              const palette = palettes[i];
              const wins = [];
              if (i === bestPriceIdx) wins.push("💰 Best price");
              if (i === fastestIdx) wins.push("⚡ Fastest");
              if (i === bestRatingIdx) wins.push("★ Top rated");
              return (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: `2px solid ${wins.length > 0 ? palette.base : palette.base + "30"}`,
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: palette.dark, marginBottom: 4 }}>{c.supplier}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: palette.base, fontFamily: "monospace", marginBottom: 6 }}>
                    {fmtCurrency(c.price)}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                    Lead time: <strong>{c.leadDays}d</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                    Rating: <strong>{c.rating}/5</strong>
                  </div>
                  {wins.map((w, j) => (
                    <div
                      key={j}
                      style={{
                        background: palette.bg,
                        color: palette.dark,
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        marginBottom: 4,
                        display: "inline-block",
                        marginInlineEnd: 4,
                      }}
                    >
                      {w}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, textAlign: "end" }}>
            <button type="button" onClick={() => setExpanded(null)} style={{ background: "transparent", color: market.dark, border: `1px solid ${market.base}30`, borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </Card>
      )}

      {orders.length === 0 ? (
        <EmptyState title={t("orders.empty")} icon="📦" palette={market} />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${market.base}15`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: market.bg, borderBottom: `1.5px solid ${market.base}20` }}>
                <th style={th}>{t("orders.col.number")}</th>
                <th style={th}>{t("orders.col.supplier")}</th>
                <th style={th}>{t("orders.col.status")}</th>
                <th style={{ ...th, textAlign: "end" }}>Value</th>
                <th style={th}>Created</th>
                <th style={{ ...th, textAlign: "end" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr
                  key={po.id}
                  style={{ borderBottom: "1px solid #F1F5F9", transition: "background .15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = market.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...td, fontFamily: "monospace", color: market.dark, fontWeight: 700 }}>{po.number}</td>
                  <td style={td}>{po.supplierName}</td>
                  <td style={td}>
                    <InvoiceStatusPill status={po.status} label={t(`orders.status.${po.status}`)} />
                  </td>
                  <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: money.dark }}>
                    {fmtCurrency(po.total, po.currency)}
                  </td>
                  <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(po.createdAt, lang)}</td>
                  <td style={{ ...td, textAlign: "end" }}>
                    <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                      {po.compare && (
                        <button type="button" onClick={() => setExpanded(po)} style={{ ...btnSmall(reports) }}>
                          ⚖
                        </button>
                      )}
                      {po.status === "SENT" && (
                        <button type="button" onClick={() => advance(po, "RECEIVED")} style={{ ...btnSmall(success) }}>
                          📥 {t("orders.action.markreceived")}
                        </button>
                      )}
                      {po.status === "RECEIVED" && (
                        <button type="button" onClick={() => convert(po)} style={{ ...btnSmall(brand) }}>
                          → {t("orders.action.toinvoice")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .purch-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .purch-compare-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function btnSmall(palette) {
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

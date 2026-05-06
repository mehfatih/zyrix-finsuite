// ================================================================
// Incoming e-Faturas — tabbed (New/Accepted/Rejected/Archived) + bulk
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getBrandPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getWarningPalette,
  getReportsPalette,
  getPaletteById,
  getAIPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./efaturaApi";

function seedIfEmpty() {
  if (localStore.list(KEYS.incoming).length > 0) return;
  const today = Date.now();
  const seeds = [
    { number: "F-2026-101", supplierName: "Demo Tedarik A.Ş.",   total: 4750, currency: "TRY", status: "PENDING_ACCEPT", supplierTaxId: "1234567890", receivedAt: new Date(today - 1 * 86400000).toISOString(), suggestedCategory: "fuel" },
    { number: "F-2026-102", supplierName: "Acme Ofis Malzeme",   total: 1200, currency: "TRY", status: "PENDING_ACCEPT", supplierTaxId: "9876543210", receivedAt: new Date(today - 2 * 86400000).toISOString(), suggestedCategory: "office" },
    { number: "F-2026-103", supplierName: "TEDAŞ",                total: 980,  currency: "TRY", status: "PENDING_ACCEPT", supplierTaxId: "5555555555", receivedAt: new Date(today - 3 * 86400000).toISOString(), suggestedCategory: "utilities" },
    { number: "F-2026-091", supplierName: "Yıldız Lojistik",      total: 3400, currency: "TRY", status: "ACCEPTED",        supplierTaxId: "1112223334", receivedAt: new Date(today - 14 * 86400000).toISOString() },
    { number: "F-2026-088", supplierName: "Beta Yazılım",          total: 5500, currency: "TRY", status: "REJECTED",        supplierTaxId: "9998887776", receivedAt: new Date(today - 22 * 86400000).toISOString() },
  ];
  seeds.forEach((s) => localStore.add(KEYS.incoming, s));
}

const TABS = [
  { id: "PENDING_ACCEPT", labelKey: "incoming.tab.new",      palette: "amber"   },
  { id: "ACCEPTED",       labelKey: "incoming.tab.accepted", palette: "emerald" },
  { id: "REJECTED",       labelKey: "incoming.tab.rejected", palette: "rose"    },
  { id: "ARCHIVED",       labelKey: "incoming.tab.archived", palette: "indigo"  },
];

export default function IncomingEFaturasPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("efatura");
  const market = getMarketPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const ai = getAIPalette();

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("PENDING_ACCEPT");
  const [selected, setSelected] = useState(new Set());

  const reload = () => setItems(localStore.list(KEYS.incoming));
  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  const counts = useMemo(() => {
    const m = { PENDING_ACCEPT: 0, ACCEPTED: 0, REJECTED: 0, ARCHIVED: 0 };
    items.forEach((i) => {
      m[i.status] = (m[i.status] || 0) + 1;
    });
    return m;
  }, [items]);

  const filtered = useMemo(() => items.filter((i) => i.status === tab), [items, tab]);

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const acceptIds = (ids) => {
    ids.forEach((id) => localStore.update(KEYS.incoming, id, { status: "ACCEPTED" }));
    setSelected(new Set());
    reload();
  };

  const rejectIds = (ids) => {
    ids.forEach((id) => localStore.update(KEYS.incoming, id, { status: "REJECTED" }));
    setSelected(new Set());
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("incoming.title")} subtitle={t("incoming.subtitle")} icon="📥" palette={market} />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tabDef) => {
          const palette = getPaletteById(tabDef.palette);
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
                padding: "8px 16px",
                borderRadius: 10,
                border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
                background: active ? palette.base : `${palette.base}10`,
                color: active ? "#fff" : palette.dark,
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{t(tabDef.labelKey)}</span>
              <span
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : `${palette.base}25`,
                  color: active ? "#fff" : palette.dark,
                  padding: "1px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {counts[tabDef.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {tab === "PENDING_ACCEPT" && selected.size > 0 && (
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
          <button type="button" onClick={() => acceptIds(Array.from(selected))} style={btn(success, "primary")}>
            ✓ {t("incoming.action.bulk.accept")}
          </button>
          <button type="button" onClick={() => rejectIds(Array.from(selected))} style={btn(alert)}>
            ✗ Reject Selected
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={t("incoming.empty")} icon="📥" palette={market} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((inv) => (
            <div
              key={inv.id}
              style={{
                background: "#fff",
                border: `1px solid ${market.base}25`,
                borderRadius: 16,
                padding: 16,
                position: "relative",
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 22px ${market.base}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {tab === "PENDING_ACCEPT" && (
                <input
                  type="checkbox"
                  checked={selected.has(inv.id)}
                  onChange={() => toggle(inv.id)}
                  style={{
                    position: "absolute",
                    top: 12,
                    insetInlineEnd: 12,
                    width: 18,
                    height: 18,
                    accentColor: market.base,
                    cursor: "pointer",
                  }}
                />
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${market.base}25`,
                    color: market.dark,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {(inv.supplierName || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{inv.supplierName}</div>
                  <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>
                    {t("incoming.col.taxId")}: {inv.supplierTaxId || "—"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{inv.number}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: money.base, fontFamily: "monospace" }}>
                  {fmtCurrency(inv.total, inv.currency)}
                </span>
              </div>

              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>
                {t("incoming.col.received")}: {fmtDate(inv.receivedAt, lang)}
              </div>

              {inv.suggestedCategory && (
                <div
                  style={{
                    background: ai.bg,
                    color: ai.dark,
                    border: `1px solid ${ai.base}30`,
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 14 }}>🤖</span>
                  <span>
                    AI: <strong>{inv.suggestedCategory}</strong>
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 10 }}>
                <InvoiceStatusPill status={inv.status} label={t(`outgoing.status.${{ PENDING_ACCEPT: "DRAFT", ACCEPTED: "ACKNOWLEDGED", REJECTED: "REJECTED", ARCHIVED: "RECEIVED" }[inv.status]}`)} size="compact" />
              </div>

              {inv.status === "PENDING_ACCEPT" ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => acceptIds([inv.id])} style={{ ...btn(success, "primary"), flex: 1 }}>
                    ✓ {t("incoming.action.accept")}
                  </button>
                  <button type="button" onClick={() => rejectIds([inv.id])} style={{ ...btn(alert), flex: 1 }}>
                    ✗ {t("incoming.action.reject")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => localStore.update(KEYS.incoming, inv.id, { status: "ARCHIVED" }) && reload()}
                  style={{ ...btn(market), width: "100%" }}
                >
                  📦 Archive
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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

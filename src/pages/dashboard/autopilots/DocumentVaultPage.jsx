// ================================================================
// Document Vault — natural-language AI search over all documents
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getCustomerPalette,
  getMoneyPalette,
  getReportsPalette,
  getMarketPalette,
  getSuccessPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import AISearchBar from "../../../components/dashboard/autopilots/AISearchBar";
import AutoFileBadge from "../../../components/dashboard/autopilots/AutoFileBadge";
import { localStore, KEYS, ensureVaultSeed, fmtCurrency, fmtDate } from "./autopilotsApi";

const TYPE_PALETTE = {
  salesInvoice:    "emerald",
  purchaseInvoice: "orange",
  receipt:         "amber",
  contract:        "indigo",
  permit:          "cyan",
  bank:            "teal",
  tax:             "wine",
};

// Lightweight natural-language search:
// - extract amount comparator (>, <)
// - extract date range (january, last month)
// - keyword on title/party
function nlSearch(query, docs) {
  if (!query) return { results: docs, interpretation: null };
  const q = query.toLowerCase();
  let results = docs;
  const parts = [];

  // Amount filters
  const ovrM = q.match(/(?:over|above|üzeri|fazla|>)\s*₺?\s*(\d{2,7})/);
  if (ovrM) {
    const v = parseInt(ovrM[1].replace(/[.,]/g, ""), 10);
    results = results.filter((d) => Number(d.amount) >= v);
    parts.push(`amount > ₺${v.toLocaleString()}`);
  }
  const undrM = q.match(/(?:under|below|altı|az|<)\s*₺?\s*(\d{2,7})/);
  if (undrM) {
    const v = parseInt(undrM[1].replace(/[.,]/g, ""), 10);
    results = results.filter((d) => Number(d.amount) < v);
    parts.push(`amount < ₺${v.toLocaleString()}`);
  }

  // Date filters
  const months = { ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5, temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11, january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
  for (const [name, idx] of Object.entries(months)) {
    if (q.includes(name)) {
      results = results.filter((d) => new Date(d.date).getMonth() === idx);
      parts.push(`month: ${name}`);
      break;
    }
  }
  if (/last\s+month|geçen\s+ay/.test(q)) {
    const now = new Date();
    const m = (now.getMonth() + 11) % 12;
    const y = m === 11 ? now.getFullYear() - 1 : now.getFullYear();
    results = results.filter((d) => {
      const dt = new Date(d.date);
      return dt.getMonth() === m && dt.getFullYear() === y;
    });
    parts.push("last month");
  }

  // Type filter
  const typeMap = {
    salesInvoice:    ["sales invoice", "satış", "satis", "sale"],
    purchaseInvoice: ["purchase", "alış", "alis"],
    receipt:         ["receipt", "fiş", "fis"],
    contract:        ["contract", "sözleşme", "sözleş"],
    permit:          ["permit", "lisans"],
    bank:            ["bank", "ekstre"],
    tax:             ["tax", "vergi"],
  };
  for (const [type, kws] of Object.entries(typeMap)) {
    if (kws.some((k) => q.includes(k))) {
      results = results.filter((d) => d.type === type);
      parts.push(`type: ${type}`);
      break;
    }
  }

  // Party fuzzy match
  results = results.filter((d) => {
    const title = String(d.title || "").toLowerCase();
    const party = String(d.party || "").toLowerCase();
    return title.includes(q) || party.includes(q) || q.split(/\s+/).some((w) => w.length > 3 && (title.includes(w) || party.includes(w)));
  });

  // If filters narrowed to nothing but we had qualifiers, fall back to date+amount only
  if (results.length === 0 && parts.length > 0) {
    results = docs;
    if (ovrM) {
      const v = parseInt(ovrM[1].replace(/[.,]/g, ""), 10);
      results = results.filter((d) => Number(d.amount) >= v);
    }
  }

  return {
    results,
    interpretation: parts.length > 0 ? parts.join(" · ") : null,
  };
}

export default function DocumentVaultPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const reports = getReportsPalette();
  const market = getMarketPalette();
  const success = getSuccessPalette();

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    ensureVaultSeed();
    setDocs(localStore.list(KEYS.vaultDocs));
  }, []);

  const examples = [
    t("vault.search.example.1"),
    t("vault.search.example.2"),
    t("vault.search.example.3"),
  ];

  const search = (q) => {
    setLoading(true);
    setTimeout(() => {
      setSearched(q);
      setLoading(false);
    }, 600);
  };

  const filteredByType = useMemo(() => {
    if (typeFilter === "ALL") return docs;
    return docs.filter((d) => d.type === typeFilter);
  }, [docs, typeFilter]);

  const { results, interpretation } = useMemo(
    () => nlSearch(searched, filteredByType),
    [searched, filteredByType]
  );

  const stats = useMemo(() => {
    const totalSizeMb = docs.reduce((s, d) => s + (d.sizeKb || 0), 0) / 1024;
    const now = new Date();
    const thisMonth = docs.filter((d) => {
      const dt = new Date(d.date);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;
    const aiTagged = docs.filter((d) => (d.tags || []).includes("AI")).length;
    return { total: docs.length, thisMonth, aiTagged, sizeMb: totalSizeMb };
  }, [docs]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("vault.title")} subtitle={t("vault.subtitle")} icon="🗂️" palette={ai} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("vault.kpi.total")} value={stats.total} palette={customer} icon="🗂️" />
        <KpiCard label={t("vault.kpi.thisMonth")} value={stats.thisMonth} palette={success} icon="📈" />
        <KpiCard label={t("vault.kpi.aiTagged")} value={stats.aiTagged} palette={ai} icon="🤖" />
        <KpiCard label={t("vault.kpi.size")} value={Math.round(stats.sizeMb)} suffix=" MB" palette={money} icon="💾" />
      </div>

      <Card palette={ai} style={{ marginBottom: 18, padding: 22 }}>
        <AISearchBar
          value={query}
          onChange={setQuery}
          onSearch={search}
          placeholder={t("vault.search.placeholder")}
          examples={examples}
          loading={loading}
          interpretation={searched ? interpretation : null}
          t={t}
        />
      </Card>

      {/* Type filter */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${ai.base}15`,
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <button type="button" onClick={() => setTypeFilter("ALL")} style={chipStyle(customer, typeFilter === "ALL")}>
          {t("vault.filter.type")}: All
        </button>
        {Object.keys(TYPE_PALETTE).map((tp) => {
          const palette = getPaletteById(TYPE_PALETTE[tp]);
          const active = typeFilter === tp;
          return (
            <button key={tp} type="button" onClick={() => setTypeFilter(tp)} style={chipStyle(palette, active)}>
              {t(`filing.cat.${tp}`)}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>
          {t("vault.results.count").replace("{n}", results.length)}
        </span>
      </div>

      {results.length === 0 ? (
        <EmptyState title={t("vault.empty")} icon="🗂️" palette={ai} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {results.map((d) => {
            const palette = getPaletteById(TYPE_PALETTE[d.type] || "indigo");
            return (
              <div
                key={d.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${palette.base}30`,
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "transform .15s, box-shadow .15s",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 12px 28px ${palette.base}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  style={{
                    aspectRatio: "1.4",
                    background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 38,
                    color: palette.dark,
                    position: "relative",
                  }}
                >
                  📄
                  <div style={{ position: "absolute", top: 8, insetInlineEnd: 8 }}>
                    <AutoFileBadge confidence={88} label="AI" size="compact" />
                  </div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 10, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {t(`filing.cat.${d.type}`)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>
                    {d.party} · {fmtDate(d.date, lang)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: money.dark, fontSize: 13 }}>
                      {fmtCurrency(d.amount)}
                    </span>
                    <span style={{ fontSize: 10, color: "#94A3B8" }}>{Math.round(d.sizeKb)}KB</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button type="button" style={btnSm(palette)}>📂 {t("vault.action.open")}</button>
                    <button type="button" style={btnSm(reports)}>↗ {t("vault.action.share")}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@media (max-width: 720px) { .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function chipStyle(palette, active) {
  return {
    padding: "5px 10px",
    borderRadius: 999,
    border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
    background: active ? palette.base : `${palette.base}10`,
    color: active ? "#fff" : palette.dark,
    fontSize: 11,
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
    flex: 1,
  };
}

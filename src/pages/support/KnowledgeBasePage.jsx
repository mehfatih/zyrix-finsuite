// ================================================================
// /support/kb — KB browser with category filter
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getMoneyPalette, getCustomerPalette, getAIPalette, getMarketPalette, getAlertPalette } from "../../utils/dashboardPalette";
import ArticleSearchBar from "../../components/support/ArticleSearchBar";
import ArticleCard from "../../components/support/ArticleCard";
import { listArticles, SUPPORT_CATEGORIES } from "./supportApi";

export default function SupportKnowledgeBasePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const [params, setParams] = useSearchParams();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const market = getMarketPalette();
  const alert = getAlertPalette();

  const palettes = {
    gettingStarted: brand, invoicing: money, tax: customer, banks: ai,
    ai: { bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8" },
    security: { bg: "#DBEAFE", base: "#1E40AF", dark: "#1E3A8A" },
    billing: market, troubleshoot: alert,
  };

  const cat = params.get("cat") || "all";
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    listArticles({ category: cat === "all" ? null : cat, q: query || null }).then(setArticles);
  }, [cat, query]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", textAlign: "center" }}>{t("title")}</h1>
        <div style={{ marginBottom: 24 }}>
          <ArticleSearchBar onSearch={setQuery} placeholder={t("search.placeholder")} lang={lang} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          <button type="button" onClick={() => setParams({})} style={chip(brand, cat === "all")}>All</button>
          {SUPPORT_CATEGORIES.map((c) => {
            const p = palettes[c] || reports;
            return (
              <button key={c} type="button" onClick={() => setParams({ cat: c })} style={chip(p, cat === c)}>
                {t(`cat.${c}`)}
              </button>
            );
          })}
        </div>

        {articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("common.empty")}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {articles.map((a) => (
              <ArticleCard key={a.slug || a.id} article={a} lang={lang} t={t} palette={palettes[a.category]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function chip(p, active) {
  return {
    background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
    color: active ? "#fff" : p.dark,
    border: `1px solid ${active ? p.base : p.base + "30"}`,
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  };
}

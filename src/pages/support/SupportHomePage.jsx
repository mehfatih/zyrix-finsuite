// ================================================================
// /support — Public-facing help center landing page
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getCustomerPalette, getAIPalette, getMarketPalette, getReportsPalette, getSuccessPalette, getAlertPalette, getWarningPalette } from "../../utils/dashboardPalette";
import ArticleSearchBar from "../../components/support/ArticleSearchBar";
import ArticleCard from "../../components/support/ArticleCard";
import { listArticles, SUPPORT_CATEGORIES } from "./supportApi";

const CAT_PALETTES = (brand, money, customer, ai, success, market, warn, alert) => ({
  gettingStarted: brand,
  invoicing:      money,
  tax:            customer,
  banks:          ai,
  ai:             { id: "purple", bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8" },
  security:       { id: "trust", bg: "#DBEAFE", base: "#1E40AF", dark: "#1E3A8A" },
  billing:        market,
  troubleshoot:   alert,
});

const CAT_ICON = { gettingStarted: "🚀", invoicing: "📄", tax: "🧾", banks: "🏦", ai: "🤖", security: "🔒", billing: "💳", troubleshoot: "🔧" };

export default function SupportHomePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const navigate = useNavigate();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const market = getMarketPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const palettes = CAT_PALETTES(brand, money, customer, ai, success, market, warn, alert);

  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    listArticles({ q: query || null }).then(setArticles);
  }, [query]);

  const popular = useMemo(() => articles.slice(0, 6), [articles]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, paddingBottom: 40 }}>
      {/* Hero */}
      <header style={{ padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: brand.dark, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          ZYRIX FINSUITE
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: 15, color: "#64748B", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.6 }}>
          {t("subtitle")}
        </p>
        <ArticleSearchBar onSearch={setQuery} placeholder={t("search.placeholder")} lang={lang} />
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        {/* Category grid */}
        <section style={{ marginBottom: 40 }} aria-labelledby="cat-heading">
          <h2 id="cat-heading" style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
            {t("categories")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {SUPPORT_CATEGORIES.map((cat) => {
              const p = palettes[cat] || reports;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => navigate(`/support/kb?cat=${cat}`)}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${p.base}30`,
                    borderRadius: 14,
                    padding: 18,
                    cursor: "pointer",
                    textAlign: "start",
                    transition: "all .15s",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 22px ${p.base}25`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{CAT_ICON[cat]}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: p.dark }}>{t(`cat.${cat}`)}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Popular articles */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
            {t("popular")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {popular.map((a) => (
              <ArticleCard key={a.slug || a.id} article={a} lang={lang} t={t} palette={palettes[a.category]} />
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section style={{ background: `linear-gradient(135deg, ${brand.bg}, #fff)`, border: `1.5px solid ${brand.base}30`, borderRadius: 18, padding: 28, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 10px" }}>{t("contact.title")}</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("contact.subtitle")}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigate("/support/contact")} style={{ background: "#fff", color: brand.dark, border: `1.5px solid ${brand.base}40`, padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              📨 {t("contact.channel.email")}
            </button>
            <button type="button" onClick={() => navigate("/support/tickets/new")} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "12px 22px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${brand.base}40` }}>
              ⚡ {t("ticket.new")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

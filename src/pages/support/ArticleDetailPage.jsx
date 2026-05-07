// ================================================================
// /support/article/:slug — single article view with helpful vote
// ================================================================
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";
import { getArticle, voteHelpful, listArticles } from "./supportApi";

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [voted, setVoted] = useState(null);

  useEffect(() => {
    getArticle(slug).then((a) => {
      setArticle(a);
      if (a) listArticles({ category: a.category }).then((all) => setRelated(all.filter((x) => x.slug !== a.slug).slice(0, 3)));
    });
  }, [slug]);

  if (!article) {
    return <div style={{ padding: 60, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;
  }

  const title = article.titles?.[lang] || article.titleEn || article.titles?.EN;
  const body  = article.bodies?.[lang] || article.contentEn || article.bodies?.EN;

  const vote = (helpful) => {
    setVoted(helpful);
    voteHelpful(article.id || article.slug, helpful).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link to="/support" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 16 }}>
          ← {t("title")}
        </Link>

        <article style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: "32px 36px", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: brand.dark, background: brand.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-block", marginBottom: 14 }}>
            {t(`cat.${article.category}`)}
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.25 }}>{title}</h1>
          <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 18 }}>👁 {t("article.viewCount", { n: article.viewCount || 0 })}</div>
          <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{body}</div>

          <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #F1F5F9", textAlign: "center" }}>
            {voted == null ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 10 }}>{t("article.helpful")}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button type="button" onClick={() => vote(true)} style={{ background: success.bg, color: success.dark, border: `1px solid ${success.base}40`, padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>👍 {t("article.helpful.yes")}</button>
                  <button type="button" onClick={() => vote(false)} style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>👎 {t("article.helpful.no")}</button>
                </div>
              </>
            ) : (
              <div role="status" style={{ fontSize: 13, fontWeight: 700, color: success.dark }}>✓ {t("article.helpfulThanks")}</div>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>{t("article.related")}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {related.map((r) => (
                <Link key={r.slug} to={`/support/article/${r.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, color: "#0F172A", fontSize: 13, fontWeight: 700 }}>
                  → {r.titles?.[lang] || r.titleEn || r.titles?.EN}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

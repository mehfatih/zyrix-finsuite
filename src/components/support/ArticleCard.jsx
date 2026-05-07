// ================================================================
// ArticleCard — KB article preview tile
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { getReportsPalette } from "../../utils/dashboardPalette";

export default function ArticleCard({ article, lang = "TR", t = (s) => s, palette }) {
  const reports = getReportsPalette();
  const p = palette || reports;
  const title = article.titles?.[lang] || article.titleEn || article.titleTr || article.titles?.EN || "Untitled";
  return (
    <Link to={`/support/article/${article.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article style={{
        background: "#fff",
        border: `1px solid ${p.base}30`,
        borderRadius: 14,
        padding: 18,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        height: "100%",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 22px ${p.base}25`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}
      >
        <span style={{ fontSize: 9, fontWeight: 800, color: p.dark, background: p.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginBottom: 10 }}>
          {t(`cat.${article.category}`)}
        </span>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", lineHeight: 1.4 }}>{title}</h3>
        <div style={{ marginTop: 10, fontSize: 11, color: "#94A3B8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>👁 {t("article.viewCount", { n: article.viewCount || 0 })}</span>
          <span style={{ color: "#10B981", fontWeight: 700 }}>👍 {article.helpfulCount || 0}</span>
        </div>
      </article>
    </Link>
  );
}

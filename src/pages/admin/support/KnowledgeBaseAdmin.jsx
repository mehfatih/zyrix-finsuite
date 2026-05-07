// ================================================================
// /admin/support/kb — Article CRUD with markdown editor
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette, getReportsPalette } from "../../../utils/dashboardPalette";
import { listArticles, SUPPORT_CATEGORIES } from "../../support/supportApi";

const LANGS = ["TR", "EN", "AR"];

export default function KnowledgeBaseAdmin() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const reports = getReportsPalette();

  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [activeLang, setActiveLang] = useState("TR");

  useEffect(() => { listArticles().then(setArticles); }, []);

  const newArticle = () => setEditing({
    slug: "", category: "gettingStarted", published: false,
    titles: { TR: "", EN: "", AR: "" }, bodies: { TR: "", EN: "", AR: "" },
  });

  if (editing) {
    return (
      <div style={{ padding: "28px 24px", maxWidth: 900, margin: "0 auto" }}>
        <button type="button" onClick={() => setEditing(null)} style={{ background: "transparent", color: brand.dark, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>
          ← {t("admin.kb.title")}
        </button>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 22 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "0 0 18px" }}>{editing.id ? "Edit article" : "New article"}</h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Slug">
              <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="getting-started" style={inp} />
            </Field>
            <Field label="Category">
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} style={inp}>
                {SUPPORT_CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {LANGS.map((l) => (
              <button key={l} type="button" onClick={() => setActiveLang(l)} style={{
                background: activeLang === l ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : brand.bg,
                color: activeLang === l ? "#fff" : brand.dark,
                border: `1px solid ${brand.base}30`, padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>

          <Field label={`Title (${activeLang})`}>
            <input type="text" value={editing.titles[activeLang]} onChange={(e) => setEditing({ ...editing, titles: { ...editing.titles, [activeLang]: e.target.value } })} style={inp} />
          </Field>
          <Field label={`Body (${activeLang}) — markdown`}>
            <textarea rows={10} value={editing.bodies[activeLang]} onChange={(e) => setEditing({ ...editing, bodies: { ...editing.bodies, [activeLang]: e.target.value } })} style={{ ...inp, resize: "vertical", fontFamily: "ui-monospace, monospace" }} />
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            {editing.published ? t("admin.kb.publish") : t("admin.kb.draft")}
          </label>

          <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setEditing(null)} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t("common.cancel")}</button>
            <button type="button" onClick={() => setEditing(null)} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 12px ${success.base}40` }}>
              💾 Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", margin: 0 }}>{t("admin.kb.title")}</h1>
        <button type="button" onClick={newArticle} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${brand.base}40` }}>
          {t("admin.kb.create")}
        </button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
        {articles.map((a, i) => (
          <div key={a.slug || a.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", padding: "12px 18px", borderBottom: i < articles.length - 1 ? "1px solid #F1F5F9" : "none" }} className="kba-row">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titles?.TR || a.titleTr || a.titles?.EN || a.slug}</div>
            <span style={{ fontSize: 10, fontWeight: 800, color: reports.dark, background: reports.bg, padding: "3px 8px", borderRadius: 999 }}>{t(`cat.${a.category}`)}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: a.published === false ? "#94A3B8" : success.dark, background: a.published === false ? "#F1F5F9" : success.bg, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {a.published === false ? t("admin.kb.draft") : t("admin.kb.publish")}
            </span>
            <button type="button" onClick={() => setEditing({ ...a, titles: a.titles || { TR: a.titleTr, EN: a.titleEn, AR: a.titleAr }, bodies: a.bodies || { TR: a.contentTr, EN: a.contentEn, AR: a.contentAr } })} style={{ background: brand.bg, color: brand.dark, border: `1px solid ${brand.base}30`, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Edit
            </button>
            <style>{`@media (max-width: 720px) { .kba-row { grid-template-columns: 1fr auto !important; } .kba-row > *:nth-child(2), .kba-row > *:nth-child(3) { display: none; } }`}</style>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

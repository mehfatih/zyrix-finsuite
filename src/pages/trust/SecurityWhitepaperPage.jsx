// ================================================================
// /trust/whitepaper — Detailed security architecture document
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";

const SECTIONS = [
  { id: "network",       icon: "🌐" },
  { id: "auth",          icon: "🔑" },
  { id: "encryption",    icon: "🔒" },
  { id: "dr",            icon: "♻" },
  { id: "incident",      icon: "🚨" },
  { id: "subprocessors", icon: "🤝" },
];

export default function SecurityWhitepaperPage() {
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${p.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link to="/trust" style={{ fontSize: 12, color: p.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 18 }}>
          ← Trust Center
        </Link>

        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{t("whitepaper.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.6 }}>{t("whitepaper.subtitle")}</p>
        </header>

        <button type="button" style={{ background: `linear-gradient(135deg, ${p.base}, ${p.dark})`, color: "#fff", border: "none", padding: "14px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${p.base}40`, marginBottom: 28 }}>
          📥 {t("whitepaper.download")} (PDF)
        </button>

        <h2 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
          {t("whitepaper.contents")}
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {SECTIONS.map((s) => (
            <article key={s.id} style={{ background: "#fff", border: `1px solid ${p.base}20`, borderRadius: 12, padding: 18, display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center", boxShadow: "0 2px 6px rgba(15,23,42,0.04)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 22 }}>
                {s.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>{t(`whitepaper.section.${s.id}`)}</h3>
                <div style={{ fontSize: 11, color: "#64748B" }}>Section {SECTIONS.indexOf(s) + 1} of {SECTIONS.length}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

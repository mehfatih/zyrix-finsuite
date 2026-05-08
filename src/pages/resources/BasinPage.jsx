// ================================================================
// /basin — Basın (Press).
// Brand-consistent shell via ResourcePage.
// ================================================================
import React from "react";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "BASIN ODASI",
    title: "Zyrix hakkında haber yapanlar için",
    subtitle: "Zyrix FinSuite'i tanıtan basın bültenleri, marka varlıkları ve liderlik kadrosuna doğrudan erişim.",
    releasesEyebrow: "BASIN BÜLTENLERİ",
    releasesTitle: "Son duyurular",
    releases: [
      { date: "2026-04-22", tag: "Ürün", title: "Zyrix, MENA pazarı için Voice-to-Invoice'u ZATCA uyumlu olarak duyurdu" },
      { date: "2026-02-10", tag: "Şirket", title: "Zyrix Pre-Seed turunu kapattı — Türkiye + Körfez büyüme planı" },
      { date: "2025-11-04", tag: "Tanıtım", title: "Zyrix FinSuite halka açık beta olarak yayında" },
    ],
    kitTitle: "Marka varlıkları",
    kitDesc: "Logo, ekran görüntüleri, ürün videoları ve marka kullanım kılavuzu — tek paket.",
    kitCta: "Marka kitini indir (yakında)",
    contactTitle: "Basın iletişimi",
    contactBody: "Röportaj talepleri, açıklama veya doğrulama için doğrudan iletişim:",
    contactEmail: "press@zyrix.co",
  },
  EN: {
    eyebrow: "PRESS ROOM",
    title: "For journalists writing about Zyrix",
    subtitle: "Press releases, brand assets and direct access to the leadership team — everything you need to cover Zyrix FinSuite.",
    releasesEyebrow: "PRESS RELEASES",
    releasesTitle: "Latest announcements",
    releases: [
      { date: "2026-04-22", tag: "Product", title: "Zyrix announces ZATCA-compliant Voice-to-Invoice for the MENA market" },
      { date: "2026-02-10", tag: "Company", title: "Zyrix closes pre-seed round — Turkey + Gulf growth plan" },
      { date: "2025-11-04", tag: "Launch",  title: "Zyrix FinSuite is live in public beta" },
    ],
    kitTitle: "Brand assets",
    kitDesc: "Logos, screenshots, product videos and brand usage guide — one bundle.",
    kitCta: "Download brand kit (soon)",
    contactTitle: "Press contact",
    contactBody: "For interview requests, statements or verification — get in touch directly:",
    contactEmail: "press@zyrix.co",
  },
  AR: {
    eyebrow: "غرفة الصحافة",
    title: "للصحفيين الذين يكتبون عن Zyrix",
    subtitle: "البيانات الصحفية، أصول العلامة، والوصول المباشر لفريق القيادة — كل ما تحتاجه لتغطية Zyrix FinSuite.",
    releasesEyebrow: "البيانات الصحفية",
    releasesTitle: "آخر الإعلانات",
    releases: [
      { date: "2026-04-22", tag: "منتج",  title: "Zyrix تعلن عن Voice-to-Invoice متوافق مع ZATCA لسوق MENA" },
      { date: "2026-02-10", tag: "شركة",  title: "Zyrix تغلق جولة Pre-Seed — خطة نمو في تركيا والخليج" },
      { date: "2025-11-04", tag: "إطلاق", title: "Zyrix FinSuite متاح بنسخة بيتا عامة" },
    ],
    kitTitle: "أصول العلامة",
    kitDesc: "الشعارات، لقطات الشاشة، فيديوهات المنتج، ودليل استخدام العلامة — حزمة واحدة.",
    kitCta: "تنزيل حزمة العلامة (قريباً)",
    contactTitle: "تواصل صحفي",
    contactBody: "لطلبات المقابلة، البيانات أو التحقق — تواصل مباشر:",
    contactEmail: "press@zyrix.co",
  },
};

const TAG_TINTS = {
  "Ürün": { bg: "#FEE2E2", text: "#991B1B" }, "Product": { bg: "#FEE2E2", text: "#991B1B" }, "منتج": { bg: "#FEE2E2", text: "#991B1B" },
  "Şirket": { bg: "#DBEAFE", text: "#1E40AF" }, "Company": { bg: "#DBEAFE", text: "#1E40AF" }, "شركة": { bg: "#DBEAFE", text: "#1E40AF" },
  "Tanıtım": { bg: "#D1FAE5", text: "#065F46" }, "Launch": { bg: "#D1FAE5", text: "#065F46" }, "إطلاق": { bg: "#D1FAE5", text: "#065F46" },
};

export default function BasinPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      {/* Releases */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.releasesEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.releasesTitle}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {t.releases.map((r, i) => {
            const tint = TAG_TINTS[r.tag] || { bg: "#FEE2E2", text: "#991B1B" };
            return (
              <article key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                padding: 22,
                display: "flex",
                gap: 18,
                alignItems: "center",
                flexWrap: "wrap",
                boxShadow: "0 10px 28px rgba(58,5,9,0.05)",
              }}>
                <div style={{ minWidth: 90, fontSize: 12, fontWeight: 800, color: "#5C4F52", letterSpacing: "0.04em" }}>{r.date}</div>
                <div style={{
                  background: tint.bg, color: tint.text,
                  fontSize: 10, fontWeight: 900,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "4px 10px", borderRadius: 999,
                }}>{r.tag}</div>
                <div style={{ flex: 1, minWidth: 240, fontSize: 16, fontWeight: 800, color: "#1B0F11", letterSpacing: "-0.01em", lineHeight: 1.4 }}>{r.title}</div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Kit + Contact */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 18,
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderTop: "3px solid #DC2626",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 900, color: "#1B0F11" }}>{t.kitTitle}</h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#5C4F52", fontWeight: 500, lineHeight: 1.55 }}>{t.kitDesc}</p>
          <button disabled style={{
            padding: "10px 16px",
            background: "#FEE2E2",
            color: "#991B1B",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            cursor: "not-allowed",
            opacity: 0.85,
          }}>{t.kitCta}</button>
        </div>
        <div style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderTop: "3px solid #2563EB",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 900, color: "#1B0F11" }}>{t.contactTitle}</h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#5C4F52", fontWeight: 500, lineHeight: 1.55 }}>{t.contactBody}</p>
          <a href={`mailto:${t.contactEmail}`} style={{
            display: "inline-block",
            padding: "10px 16px",
            background: "linear-gradient(135deg, #2563EB, #1E40AF)",
            color: "#fff",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}>{t.contactEmail}</a>
        </div>
      </div>
    </ResourcePage>
  );
}

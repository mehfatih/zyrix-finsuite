// ================================================================
// /partners — İş Ortakları (Partners).
// Brand-consistent shell via ResourcePage.
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "İŞ ORTAKLARI PROGRAMI",
    title: "Zyrix İş Ortağı olun",
    subtitle: "Mali müşavirler, yazılım entegratörleri ve danışmanlar için yapılandırılmış bir program. Komisyon, eğitim ve destek dahil.",
    tracksEyebrow: "PROGRAM PATİKALARI",
    tracksTitle: "Hangi tip ortağız?",
    tracks: [
      { icon: "🧮", title: "Mali Müşavir Programı", desc: "Müşterilerinize Zyrix'i önerin, komisyon kazanın, otomatik raporlama panelinden mükellef takibi yapın." },
      { icon: "🔌", title: "Teknoloji Entegratörü", desc: "ERP, CRM, e-ticaret bağlantıları kuran ekiplere co-marketing, API erişimi, ortak vaka çalışmaları." },
      { icon: "💼", title: "Çözüm Ortağı",          desc: "KOBİ'lere uçtan uca finans dijitalleşmesi sunan danışmanlık firmaları için satış desteği ve ortak müşteri akışı." },
      { icon: "🏢", title: "Kurumsal Yeniden Satış", desc: "Beyaz etiket / OEM seçenekleri, hacme dayalı fiyatlandırma, özel SLA." },
    ],
    benefitsEyebrow: "AVANTAJLAR",
    benefitsTitle: "Ortak olduğunuzda",
    benefits: [
      { icon: "💰", text: "Yenilenen abonelik gelirinin %20'sine kadar komisyon" },
      { icon: "🎓", text: "Sertifikasyon ve eğitim programı" },
      { icon: "📈", text: "Lead paylaşımı ve co-marketing" },
      { icon: "🛟", text: "Adanmış ortak başarı ekibi" },
      { icon: "🧰", text: "API, sandbox ve ortak portal erişimi" },
      { icon: "📜", text: "Marka kullanım hakkı ve kit" },
    ],
    ctaTitle: "Birlikte çalışalım",
    ctaSub: "Tek mesaj yeterli — sizi 48 saat içinde arıyoruz.",
    ctaBtn: "Bize ulaşın",
    ctaHref: "/iletisim",
  },
  EN: {
    eyebrow: "PARTNER PROGRAM",
    title: "Become a Zyrix partner",
    subtitle: "A structured program for accountants, software integrators and consulting firms — with commission, training and support.",
    tracksEyebrow: "PROGRAM TRACKS",
    tracksTitle: "What kind of partner are you?",
    tracks: [
      { icon: "🧮", title: "Accountant Program",     desc: "Recommend Zyrix to your clients, earn commission, run client portfolios from a dedicated dashboard." },
      { icon: "🔌", title: "Tech Integrator",         desc: "ERP, CRM, e-commerce connectors with co-marketing, API access and joint case studies." },
      { icon: "💼", title: "Solution Partner",        desc: "Sales enablement and joint pipeline for consultancies delivering end-to-end finance digitalisation." },
      { icon: "🏢", title: "Enterprise Reseller",     desc: "White-label / OEM options, volume-based pricing, custom SLA." },
    ],
    benefitsEyebrow: "BENEFITS",
    benefitsTitle: "When you join",
    benefits: [
      { icon: "💰", text: "Up to 20% recurring commission" },
      { icon: "🎓", text: "Certification and training program" },
      { icon: "📈", text: "Lead sharing and co-marketing" },
      { icon: "🛟", text: "Dedicated partner success team" },
      { icon: "🧰", text: "API, sandbox and partner portal access" },
      { icon: "📜", text: "Brand usage rights and kit" },
    ],
    ctaTitle: "Let's work together",
    ctaSub: "One email — we'll get back within 48 hours.",
    ctaBtn: "Contact us",
    ctaHref: "/iletisim",
  },
  AR: {
    eyebrow: "برنامج الشركاء",
    title: "كن شريك Zyrix",
    subtitle: "برنامج منظَّم للمحاسبين ومُكاملي البرمجيات والاستشاريين — مع عمولة، تدريب، ودعم.",
    tracksEyebrow: "مسارات البرنامج",
    tracksTitle: "ما نوع الشريك الذي أنت؟",
    tracks: [
      { icon: "🧮", title: "برنامج المحاسبين",         desc: "أوصِ Zyrix لعملائك، اكسب عمولة، أدِر محافظ العملاء من لوحة مخصصة." },
      { icon: "🔌", title: "مُكامل التقني",             desc: "موصلات ERP وCRM والتجارة الإلكترونية مع تسويق مشترك ووصول API ودراسات حالة مشتركة." },
      { icon: "💼", title: "شريك حلول",                  desc: "تمكين مبيعات وقناة عملاء مشتركة لشركات الاستشارات." },
      { icon: "🏢", title: "موزع مؤسسي",                  desc: "خيارات White-label / OEM، تسعير بحسب الحجم، SLA مخصص." },
    ],
    benefitsEyebrow: "المزايا",
    benefitsTitle: "عند الانضمام",
    benefits: [
      { icon: "💰", text: "حتى 20% عمولة متكررة" },
      { icon: "🎓", text: "برنامج شهادات وتدريب" },
      { icon: "📈", text: "مشاركة العملاء المحتملين والتسويق المشترك" },
      { icon: "🛟", text: "فريق نجاح شركاء مخصص" },
      { icon: "🧰", text: "وصول API و sandbox وبوابة شركاء" },
      { icon: "📜", text: "حقوق استخدام العلامة وحزمة" },
    ],
    ctaTitle: "لنعمل معاً",
    ctaSub: "بريد واحد — نرد خلال 48 ساعة.",
    ctaBtn: "تواصل معنا",
    ctaHref: "/iletisim",
  },
};

const TRACK_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
  { bg: "#D1FAE5", border: "#10B981", icon: "#10B981" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED" },
];

export default function PartnersPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      {/* Tracks */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.tracksEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.tracksTitle}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {t.tracks.map((tr, i) => {
            const th = TRACK_THEMES[i % TRACK_THEMES.length];
            return (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderTop: `3px solid ${th.border}`,
                borderRadius: 18,
                padding: 22,
                boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: th.bg, color: th.icon, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 14 }}>{tr.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em" }}>{tr.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{tr.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: "36px 28px",
        boxShadow: "0 14px 36px rgba(58,5,9,0.06)",
        marginBottom: 40,
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 8 }}>{t.benefitsEyebrow}</div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.benefitsTitle}</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {t.benefits.map((b, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: "#FFF8F8",
              borderRadius: 12,
              border: "1px solid rgba(227,10,23,0.10)",
            }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1B0F11" }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: "center",
        padding: "32px 24px",
        borderRadius: 20,
        background: "linear-gradient(135deg, #FEE2E2, #FFF8F8)",
        border: "1px solid rgba(227,10,23,0.20)",
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, color: "#1B0F11" }}>{t.ctaTitle}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#5C4F52", fontWeight: 500 }}>{t.ctaSub}</p>
        <Link to={t.ctaHref} style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "linear-gradient(135deg, #E30A17, #B30810)",
          color: "#fff",
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.04em",
          textDecoration: "none",
          boxShadow: "0 12px 28px rgba(227,10,23,0.4)",
        }}>{t.ctaBtn}</Link>
      </div>
    </ResourcePage>
  );
}

// ================================================================
// /blog — Zyrix Blog (coming soon).
// Uses ResourcePage for header/hero/footer so the page belongs visually
// to the rest of the site. Newsletter signup, 4 colour-themed category
// previews, and 3 sample upcoming-article cards.
// ================================================================
import React from "react";
import { useI18n } from "../i18n/i18n.jsx";
import ResourcePage from "../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "ZYRIX BLOG",
    title: "Yakında: Zyrix Blog",
    subtitle: "MENA ve Türkiye'deki KOBİ'ler için finansal yönetim, vergi rehberleri, başarı hikayeleri ve ürün güncellemeleri — yakında burada.",
    newsletterTagline: "İLK YAZILAR YAYINLANDIĞINDA HABERDAR OLUN",
    newsletter: {
      tagline: "İLK YAZILAR YAYINLANDIĞINDA HABERDAR OLUN",
      email: "E-posta",
      emailPh: "ornek@sirket.com",
      submit: "Abone Ol",
      busy: "Gönderiliyor...",
      successMsg: "Aboneliğiniz alındı — yayıma geçtiğimizde size haber vereceğiz.",
      errEmail: "Geçerli bir e-posta adresi girin.",
    },
    categoriesEyebrow: "KATEGORİLER",
    categoriesTitle: "Hangi konuları işleyeceğiz?",
    categoriesSub: "Dört ana akış — pratik, sektöre özel, ölçülebilir.",
    categories: [
      { icon: "🧾", title: "Vergi Rehberleri",      desc: "KDV, e-Fatura, ZATCA, KVKK ve uyumluluk için pratik ipuçları." },
      { icon: "💰", title: "Finansal Stratejiler",  desc: "Nakit akışı, tahsilat, fiyatlama ve büyüme — sayılarla anlatılan rehberler." },
      { icon: "🌟", title: "Başarı Hikayeleri",      desc: "Zyrix kullanan KOBİ'lerin gerçek dönüşüm hikâyeleri." },
      { icon: "🤖", title: "AI ve Otomasyon",        desc: "Yapay zekayı muhasebenize, satışınıza ve operasyonunuza nasıl bağlarsınız." },
    ],
    upcomingEyebrow: "İLK YAZILAR HAZIRLANIYOR",
    upcomingTitle: "Yayında olduğunda okuyabileceğiniz yazılar",
    upcomingSub: "Aşağıdaki üç yazı şu anda hazırlık aşamasında. Bültenimize abone olursanız ilkleri sizinle paylaşırız.",
    upcoming: [
      { tag: "Vergi", title: "5 dakikada e-Fatura nedir?",                   read: "5 dk", color: "wine" },
      { tag: "Finans", title: "KOBİ'ler için nakit akışı yönetimi",           read: "8 dk", color: "blue" },
      { tag: "AI",   title: "AI nasıl muhasebenizi devrim niteliğinde değiştirir?", read: "10 dk", color: "purple" },
    ],
    soonBadge: "Yakında",
  },
  EN: {
    eyebrow: "ZYRIX BLOG",
    title: "Coming Soon: Zyrix Blog",
    subtitle: "Financial management, tax guides, success stories and product updates for SMBs in MENA and Turkey — coming soon.",
    newsletter: {
      tagline: "BE THE FIRST TO READ WHEN WE LAUNCH",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Subscribe",
      busy: "Sending...",
      successMsg: "You're on the list — we'll let you know the moment we publish.",
      errEmail: "Enter a valid email address.",
    },
    categoriesEyebrow: "CATEGORIES",
    categoriesTitle: "What we'll cover",
    categoriesSub: "Four streams — practical, sector-specific, measurable.",
    categories: [
      { icon: "🧾", title: "Tax Guides",          desc: "VAT, e-Invoice, ZATCA, KVKK and compliance — written for operators." },
      { icon: "💰", title: "Financial Strategy",  desc: "Cash flow, collections, pricing, growth — explained in numbers." },
      { icon: "🌟", title: "Success Stories",     desc: "Real-world transformations from SMBs running on Zyrix." },
      { icon: "🤖", title: "AI & Automation",     desc: "How to plug AI into your accounting, sales and operations." },
    ],
    upcomingEyebrow: "FIRST POSTS UNDERWAY",
    upcomingTitle: "What you'll be able to read on day one",
    upcomingSub: "Three pieces are already in draft. Subscribe to the newsletter and you'll see them first.",
    upcoming: [
      { tag: "Tax",     title: "What is e-Invoice in 5 minutes?",       read: "5 min",  color: "wine" },
      { tag: "Finance", title: "Cash-flow management for SMBs",          read: "8 min",  color: "blue" },
      { tag: "AI",      title: "How AI transforms your accounting",      read: "10 min", color: "purple" },
    ],
    soonBadge: "Coming soon",
  },
  AR: {
    eyebrow: "مدونة ZYRIX",
    title: "قريباً: مدونة Zyrix",
    subtitle: "إدارة مالية، أدلة ضريبية، قصص نجاح، وتحديثات المنتج للشركات الصغيرة والمتوسطة في MENA وتركيا — قريباً.",
    newsletter: {
      tagline: "كن أول من يقرأ عند الإطلاق",
      email: "البريد الإلكتروني",
      emailPh: "you@company.com",
      submit: "اشترك",
      busy: "جاري الإرسال...",
      successMsg: "تم تسجيل اشتراكك — سنخبرك لحظة الإطلاق.",
      errEmail: "أدخل بريداً إلكترونيّاً صالحاً.",
    },
    categoriesEyebrow: "الفئات",
    categoriesTitle: "ماذا سنغطّي؟",
    categoriesSub: "أربعة محاور — عملية، خاصة بالقطاع، وقابلة للقياس.",
    categories: [
      { icon: "🧾", title: "أدلة ضريبية",            desc: "VAT، الفاتورة الإلكترونية، ZATCA، KVKK، والامتثال — مكتوبة للمشغلين." },
      { icon: "💰", title: "الاستراتيجيات المالية",  desc: "التدفق النقدي، التحصيل، التسعير، والنمو — بالأرقام." },
      { icon: "🌟", title: "قصص النجاح",              desc: "تحوّلات حقيقية لشركات تعمل على Zyrix." },
      { icon: "🤖", title: "AI والأتمتة",              desc: "كيف تربط الذكاء الاصطناعي بمحاسبتك ومبيعاتك وعملياتك." },
    ],
    upcomingEyebrow: "أول المقالات قيد الإعداد",
    upcomingTitle: "ما ستقرأه يوم الإطلاق",
    upcomingSub: "ثلاث مقالات قيد المسودة. اشترك بالنشرة لتراها أولاً.",
    upcoming: [
      { tag: "ضريبة",  title: "ما هي الفاتورة الإلكترونية في 5 دقائق؟",        read: "5 د",   color: "wine" },
      { tag: "مالية",  title: "إدارة التدفق النقدي للشركات الصغيرة والمتوسطة",  read: "8 د",   color: "blue" },
      { tag: "AI",     title: "كيف يحوّل الذكاء الاصطناعي محاسبتك",            read: "10 د",  color: "purple" },
    ],
    soonBadge: "قريباً",
  },
};

// Same theme system as the FeaturesPage cards — gives every category
// a distinct identity instead of "8 white boxes".
const CATEGORY_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626", glow: "rgba(220,38,38,0.20)" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB", glow: "rgba(37,99,235,0.20)" },
  { bg: "#D1FAE5", border: "#10B981", icon: "#10B981", glow: "rgba(16,185,129,0.20)" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED", glow: "rgba(124,58,237,0.20)" },
];

const ARTICLE_TINTS = {
  wine:   { bg: "#FEE2E2", text: "#991B1B" },
  blue:   { bg: "#DBEAFE", text: "#1E40AF" },
  purple: { bg: "#EDE9FE", text: "#5B21B6" },
};

export default function BlogPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;

  return (
    <ResourcePage
      eyebrow={t.eyebrow}
      title={t.title}
      subtitle={t.subtitle}
      showNewsletter
      newsletterTagline={t.newsletter.tagline}
      newsletterLabels={t.newsletter}
    >
      {/* Categories */}
      <div style={{ marginBottom: 64 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 12, fontWeight: 800,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#DC2626", marginBottom: 10,
          }}>{t.categoriesEyebrow}</div>
          <h2 style={{
            margin: "0 0 8px", fontSize: 30, fontWeight: 900,
            color: "#1B0F11", letterSpacing: "-0.02em",
          }}>{t.categoriesTitle}</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#5C4F52", fontWeight: 500 }}>
            {t.categoriesSub}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}>
          {t.categories.map((cat, i) => {
            const th = CATEGORY_THEMES[i % CATEGORY_THEMES.length];
            return (
              <div key={i} style={{
                position: "relative",
                borderRadius: 16,
                padding: 20,
                background: th.bg,
                borderTop: `3px solid ${th.border}`,
                boxShadow: `0 8px 24px ${th.glow}`,
                overflow: "hidden",
              }}>
                <span aria-hidden="true" style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `radial-gradient(${th.border}22 1px, transparent 1px)`,
                  backgroundSize: "14px 14px",
                  opacity: 0.5,
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "#fff",
                    display: "grid", placeItems: "center",
                    fontSize: 22,
                    boxShadow: `0 4px 14px ${th.glow}`,
                    marginBottom: 14,
                  }}>{cat.icon}</div>
                  <h3 style={{
                    margin: "0 0 6px",
                    fontSize: 16, fontWeight: 900,
                    color: "#1B0F11", letterSpacing: "-0.01em",
                  }}>{cat.title}</h3>
                  <p style={{
                    margin: 0, fontSize: 13,
                    color: "#5C4F52", lineHeight: 1.55, fontWeight: 500,
                  }}>{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming sample articles */}
      <div>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 12, fontWeight: 800,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#DC2626", marginBottom: 10,
          }}>{t.upcomingEyebrow}</div>
          <h2 style={{
            margin: "0 0 8px", fontSize: 30, fontWeight: 900,
            color: "#1B0F11", letterSpacing: "-0.02em",
          }}>{t.upcomingTitle}</h2>
          <p style={{ margin: "0 auto", maxWidth: 640, fontSize: 14, color: "#5C4F52", fontWeight: 500 }}>
            {t.upcomingSub}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}>
          {t.upcoming.map((art, i) => {
            const tint = ARTICLE_TINTS[art.color] || ARTICLE_TINTS.wine;
            return (
              <article key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 14px 36px rgba(58,5,9,0.06)",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* "cover" placeholder — coloured rectangle with the tag */}
                <div style={{
                  aspectRatio: "16/9",
                  background: `linear-gradient(135deg, ${tint.bg}, #fff 120%)`,
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}>
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    background: "#fff",
                    color: tint.text,
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "4px 10px",
                    borderRadius: 999,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                  }}>{art.tag}</span>
                  <span style={{ fontSize: 64, opacity: 0.4 }}>📰</span>
                </div>
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <h3 style={{
                    margin: "0 0 12px",
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#1B0F11",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                  }}>{art.title}</h3>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#5C4F52",
                    fontWeight: 700,
                  }}>
                    <span style={{
                      background: "#FEE2E2",
                      color: "#991B1B",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>{t.soonBadge}</span>
                    <span>⏱ {art.read}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ResourcePage>
  );
}

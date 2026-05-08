// ================================================================
// /destek — Help Center (Yardım Merkezi).
// Lightweight launchpad: pre-launch FAQ topics + clear paths to the
// existing /contact page and the /support flow.
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "YARDIM MERKEZİ",
    title: "Sorunuz var mı? Yanıt 1 iş günü içinde.",
    subtitle: "Sıkça sorulan sorular, hızlı başlangıç rehberleri ve doğrudan destek ekibimize ulaşma — her şey tek panelde.",
    quickEyebrow: "POPÜLER KONULAR",
    quickTitle: "Çoğu insanın sorduğu",
    topics: [
      { icon: "🧾", title: "e-Fatura kurulumu",      desc: "Mali Mühür, GİB onayı, ilk fatura — 10 dakikada.", to: "/features#e-fatura" },
      { icon: "💸", title: "Tahsilat akışları",       desc: "WhatsApp hatırlatma, AR aging, otomatik takip.",   to: "/features#tahsilat" },
      { icon: "👥", title: "Müşteri ve CRM",          desc: "Müşteri import, pipeline, segmentasyon.",          to: "/features#crm" },
      { icon: "🔌", title: "API ve entegrasyonlar",   desc: "REST API, webhook, SDK — bağlama kılavuzu.",       to: "/integrations" },
    ],
    contactEyebrow: "DOĞRUDAN DESTEK",
    contactTitle: "Bizimle konuşun",
    contactSub: "1 iş günü içinde bir uzmanımız size dönecek.",
    contactCta: "Destek talebi aç",
    contactPath: "/contact",
    secondaryCta: "Tüm özellikleri görüntüle",
    secondaryPath: "/features",
  },
  EN: {
    eyebrow: "HELP CENTER",
    title: "Have a question? Answers within 1 business day.",
    subtitle: "Frequently asked questions, quick-start guides, and a direct line to our support team — all in one place.",
    quickEyebrow: "POPULAR TOPICS",
    quickTitle: "What most people ask",
    topics: [
      { icon: "🧾", title: "e-Invoice setup",          desc: "Financial seal, GİB approval, first invoice — in 10 minutes.", to: "/features#e-fatura" },
      { icon: "💸", title: "Collection flows",         desc: "WhatsApp reminders, AR aging, automatic follow-ups.",          to: "/features#tahsilat" },
      { icon: "👥", title: "Customers and CRM",        desc: "Customer import, pipeline, segmentation.",                     to: "/features#crm" },
      { icon: "🔌", title: "API and integrations",     desc: "REST API, webhook, SDK — wiring guide.",                       to: "/integrations" },
    ],
    contactEyebrow: "DIRECT SUPPORT",
    contactTitle: "Talk to us",
    contactSub: "An expert will get back to you within 1 business day.",
    contactCta: "Open a support request",
    contactPath: "/contact",
    secondaryCta: "Browse all features",
    secondaryPath: "/features",
  },
  AR: {
    eyebrow: "مركز المساعدة",
    title: "لديك سؤال؟ الردود خلال يوم عمل واحد.",
    subtitle: "أسئلة متكررة، أدلة سريعة، وخط مباشر مع فريق الدعم — كلّها في مكان واحد.",
    quickEyebrow: "المواضيع الشائعة",
    quickTitle: "أكثر ما يُسأل",
    topics: [
      { icon: "🧾", title: "إعداد الفاتورة الإلكترونية", desc: "الختم المالي، اعتماد GİB، أول فاتورة — في 10 دقائق.", to: "/features#e-fatura" },
      { icon: "💸", title: "سلاسل التحصيل",               desc: "تذكيرات WhatsApp، أعمار الديون، متابعة آلية.",         to: "/features#tahsilat" },
      { icon: "👥", title: "العملاء وCRM",                 desc: "استيراد العملاء، خط المبيعات، التقسيم.",                 to: "/features#crm" },
      { icon: "🔌", title: "API والتكاملات",                desc: "REST API، webhook، SDK — دليل الربط.",                 to: "/integrations" },
    ],
    contactEyebrow: "دعم مباشر",
    contactTitle: "تحدث إلينا",
    contactSub: "سيرد عليك خبير خلال يوم عمل واحد.",
    contactCta: "افتح طلب دعم",
    contactPath: "/contact",
    secondaryCta: "تصفح كل المزايا",
    secondaryPath: "/features",
  },
};

const TOPIC_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#FED7AA", border: "#EA580C", icon: "#EA580C" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
  { bg: "#FEF3C7", border: "#F59E0B", icon: "#F59E0B" },
];

export default function HelpCenterPage() {
  const { lang, isRTL } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      {/* Popular topics */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.quickEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.quickTitle}</h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {t.topics.map((topic, i) => {
            const th = TOPIC_THEMES[i % TOPIC_THEMES.length];
            return (
              <Link
                key={i}
                to={topic.to}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderTop: `3px solid ${th.border}`,
                  borderRadius: 16,
                  padding: 18,
                  textDecoration: "none",
                  color: "inherit",
                  boxShadow: "0 8px 22px rgba(58,5,9,0.05)",
                  transition: "transform .18s ease, box-shadow .18s ease",
                  display: "block",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 30px rgba(58,5,9,0.10)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(58,5,9,0.05)"; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: th.bg, color: th.icon,
                  display: "grid", placeItems: "center",
                  fontSize: 20, marginBottom: 12,
                }}>{topic.icon}</div>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em" }}>{topic.title}</h3>
                <p style={{ margin: 0, fontSize: 12.5, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{topic.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Direct contact card */}
      <div style={{
        background: "linear-gradient(135deg, #1F0205 0%, #3A0509 100%)",
        color: "#fff",
        borderRadius: 22,
        padding: 32,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,215,0,0.95)", marginBottom: 10 }}>{t.contactEyebrow}</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.contactTitle}</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14.5, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{t.contactSub}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={t.contactPath} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 24px", borderRadius: 14,
            background: "linear-gradient(135deg, #E30A17, #B30810)",
            color: "#fff", textDecoration: "none",
            fontSize: 14, fontWeight: 900, letterSpacing: "0.04em",
            boxShadow: "0 14px 32px rgba(227,10,23,0.45)",
          }}>{t.contactCta} <span aria-hidden="true">{isRTL ? "←" : "→"}</span></Link>
          <Link to={t.secondaryPath} style={{
            display: "inline-flex", alignItems: "center",
            padding: "13px 22px", borderRadius: 14,
            background: "rgba(255,255,255,0.10)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.22)",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>{t.secondaryCta}</Link>
        </div>
      </div>
    </ResourcePage>
  );
}

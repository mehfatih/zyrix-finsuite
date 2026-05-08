// ================================================================
// /kilavuz — Kullanım Kılavuzu (User Guide).
// Brand-consistent shell via ResourcePage. Category cards point at
// the relevant feature anchors / dedicated pages so visitors can
// jump straight into the topic they need.
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "KULLANIM KILAVUZU",
    title: "Zyrix'i en iyi şekilde kullanın",
    subtitle: "Faturalama, CRM, tahsilat ve AI özelliklerini sıfırdan ileri seviyeye anlatan kategori bazlı kılavuzlar.",
    sectionEyebrow: "KATEGORİLER",
    sectionTitle: "Hangi konuda yardım istersin?",
    cats: [
      { icon: "🧾", title: "E-Fatura nasıl kesilir?",   desc: "GİB onayı, KDV, e-Arşiv ve tekrarlanan faturalar — uçtan uca akış.", to: "/features#e-fatura" },
      { icon: "👥", title: "CRM nasıl kullanılır?",     desc: "Müşteri hattını kurma, segmentasyon, otomatik takip ve raporlama.", to: "/features#crm" },
      { icon: "💰", title: "Tahsilat süreçleri",         desc: "AR aging, hatırlatma akışları ve Akıllı Tahsilat ile öncelik atama.", to: "/features#tahsilat" },
      { icon: "🤖", title: "AI özelliklerin kullanımı",  desc: "Voice-to-Invoice, Tax Autopilot, Cashflow Forecast — pratik örneklerle.", to: "/features#ai" },
      { icon: "📱", title: "Mobil uygulama",             desc: "iOS / Android'de fatura kesme, makbuz tarama, fotoğraf-to-veri.", to: "/features#mobil" },
      { icon: "🔌", title: "Entegrasyonlar",              desc: "Banka, pazaryeri, e-ticaret ve API/Webhook bağlantıları.", to: "/integrations" },
    ],
    helpEyebrow: "DAHA FAZLASI",
    helpTitle: "Aradığını bulamadın mı?",
    helpSub: "Yardım Merkezi'nde SSS, video eğitim ve canlı destek seçenekleri mevcut.",
    helpCta: "Yardım Merkezi'ne git",
    helpHref: "/destek",
  },
  EN: {
    eyebrow: "USER GUIDE",
    title: "Get the most out of Zyrix",
    subtitle: "Category-based guides that take you from zero to advanced for invoicing, CRM, collections and AI features.",
    sectionEyebrow: "CATEGORIES",
    sectionTitle: "What do you need help with?",
    cats: [
      { icon: "🧾", title: "How to issue an e-Invoice", desc: "GİB approval, VAT, e-Archive and recurring invoices — end-to-end flow.", to: "/features#e-fatura" },
      { icon: "👥", title: "Using the CRM",              desc: "Setting up your pipeline, segmentation, automated follow-ups and reporting.", to: "/features#crm" },
      { icon: "💰", title: "Collections workflow",       desc: "AR aging, reminder cadences and AI-prioritised collections.", to: "/features#tahsilat" },
      { icon: "🤖", title: "Using AI features",          desc: "Voice-to-Invoice, Tax Autopilot, Cashflow Forecast — applied examples.", to: "/features#ai" },
      { icon: "📱", title: "Mobile app",                 desc: "Invoicing on iOS/Android, receipt scanning, photo-to-data.", to: "/features#mobil" },
      { icon: "🔌", title: "Integrations",                desc: "Banks, marketplaces, e-commerce and API/Webhook connections.", to: "/integrations" },
    ],
    helpEyebrow: "MORE",
    helpTitle: "Couldn't find what you were looking for?",
    helpSub: "The Help Center has FAQs, video tutorials and live support options.",
    helpCta: "Go to Help Center",
    helpHref: "/destek",
  },
  AR: {
    eyebrow: "دليل المستخدم",
    title: "احصل على أقصى استفادة من Zyrix",
    subtitle: "أدلة حسب الفئة تأخذك من الصفر إلى المستوى المتقدم في الفوترة وCRM والتحصيل وميزات AI.",
    sectionEyebrow: "الفئات",
    sectionTitle: "ما الذي تحتاج مساعدة فيه؟",
    cats: [
      { icon: "🧾", title: "كيفية إصدار فاتورة إلكترونية", desc: "اعتماد GİB، VAT، الأرشيف الإلكتروني والفواتير المتكررة — من البداية للنهاية.", to: "/features#e-fatura" },
      { icon: "👥", title: "استخدام CRM",                    desc: "إعداد الـ pipeline، التقسيم، المتابعات الآلية والتقارير.", to: "/features#crm" },
      { icon: "💰", title: "سير عمل التحصيل",                desc: "أعمار الديون، سلاسل التذكير، والتحصيل بأولويات AI.", to: "/features#tahsilat" },
      { icon: "🤖", title: "استخدام ميزات AI",                desc: "Voice-to-Invoice، Tax Autopilot، Cashflow Forecast — أمثلة تطبيقية.", to: "/features#ai" },
      { icon: "📱", title: "تطبيق الجوال",                    desc: "الفوترة على iOS/Android، مسح الإيصالات، صورة إلى بيانات.", to: "/features#mobil" },
      { icon: "🔌", title: "التكاملات",                       desc: "البنوك، الأسواق، التجارة الإلكترونية، اتصالات API/Webhook.", to: "/integrations" },
    ],
    helpEyebrow: "المزيد",
    helpTitle: "لم تجد ما تبحث عنه؟",
    helpSub: "مركز المساعدة يحتوي على الأسئلة الشائعة، فيديوهات تعليمية، وخيارات دعم مباشر.",
    helpCta: "اذهب إلى مركز المساعدة",
    helpHref: "/destek",
  },
};

const CARD_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
  { bg: "#D1FAE5", border: "#10B981", icon: "#10B981" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED" },
  { bg: "#FED7AA", border: "#EA580C", icon: "#EA580C" },
  { bg: "#FEF3C7", border: "#D97706", icon: "#D97706" },
];

export default function KilavuzPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      <div style={{ marginBottom: 56 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.sectionEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.sectionTitle}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {t.cats.map((c, i) => {
            const th = CARD_THEMES[i % CARD_THEMES.length];
            return (
              <Link key={i} to={c.to} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderTop: `3px solid ${th.border}`,
                  borderRadius: 18,
                  padding: 22,
                  boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
                  transition: "transform .2s, box-shadow .2s",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: th.bg, color: th.icon, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 14 }}>{c.icon}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{c.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{c.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: "36px 28px",
        textAlign: "center",
        boxShadow: "0 14px 36px rgba(58,5,9,0.06)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 8 }}>{t.helpEyebrow}</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.helpTitle}</h3>
        <p style={{ margin: "0 auto 18px", maxWidth: 540, fontSize: 14, color: "#5C4F52", fontWeight: 500 }}>{t.helpSub}</p>
        <Link to={t.helpHref} style={{
          display: "inline-block",
          padding: "12px 22px",
          background: "linear-gradient(135deg, #E30A17, #B30810)",
          color: "#fff",
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.04em",
          textDecoration: "none",
          boxShadow: "0 12px 28px rgba(227,10,23,0.4)",
        }}>{t.helpCta}</Link>
      </div>
    </ResourcePage>
  );
}

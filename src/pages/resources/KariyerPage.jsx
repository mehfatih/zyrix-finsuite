// ================================================================
// /kariyer — Kariyer Fırsatları (Careers).
// Brand-consistent shell via ResourcePage.
// ================================================================
import React from "react";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "ZYRIX'TE KARİYER",
    title: "MENA ve Türkiye'nin finans operasyonunu yeniden yazıyoruz",
    subtitle: "Şu anda açık pozisyonlarımız bulunmuyor. Bize katılmak isterseniz CV'nizi gönderebilirsiniz — ilerideki açılışlarda öncelikli değerlendirilirsiniz.",
    newsletter: {
      tagline: "İLK İLANLARDAN HABERDAR OLUN",
      email: "E-posta",
      emailPh: "ornek@sirket.com",
      submit: "Bekleme Listesine Katıl",
      busy: "Gönderiliyor...",
      successMsg: "Bekleme listesindesiniz — yeni pozisyonlar açıldığında haber vereceğiz.",
      errEmail: "Geçerli bir e-posta adresi girin.",
    },
    cultureEyebrow: "ÇALIŞMA KÜLTÜRÜMÜZ",
    cultureTitle: "Nasıl çalışıyoruz",
    culture: [
      { icon: "🌍", title: "Uzaktan-öncelikli",     desc: "İstanbul, Riyad ve Avrupa'dan ekiplerle çalışıyoruz. Ofis seçimliktir." },
      { icon: "🚀", title: "Etkili sevkiyat",        desc: "Komite değil, ekipler. Karar küçük, sevkiyat hızlı." },
      { icon: "📊", title: "Sayılarla yön",          desc: "Her özelliğin metriği var; sezgi değil veri kullanıyoruz." },
      { icon: "💡", title: "Yapay zeka odağı",        desc: "Voice-to-Invoice'tan Tax Autopilot'a — AI bizim için araç değil mimari." },
    ],
    benefitsEyebrow: "YAN HAKLAR",
    benefitsTitle: "Sunduklarımız",
    benefits: [
      { icon: "💰", text: "Rekabetçi maaş + hisse opsiyonu" },
      { icon: "🏥", text: "Özel sağlık sigortası" },
      { icon: "🏖️", text: "30 gün ücretli izin" },
      { icon: "💻", text: "Ekipman bütçesi" },
      { icon: "📚", text: "Yıllık eğitim bütçesi" },
      { icon: "🍽️", text: "Yemek kartı" },
    ],
    contactNote: "Tek mesaj yeterli — kariyer@zyrix.co",
  },
  EN: {
    eyebrow: "CAREERS AT ZYRIX",
    title: "We're rewriting financial operations for MENA and Turkey",
    subtitle: "We don't have open roles right now. If you'd like to join, send your CV — you'll be prioritised when the next openings come up.",
    newsletter: {
      tagline: "BE FIRST TO HEAR ABOUT NEW ROLES",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Join the waitlist",
      busy: "Sending...",
      successMsg: "You're on the waitlist — we'll let you know when new roles open.",
      errEmail: "Enter a valid email address.",
    },
    cultureEyebrow: "OUR CULTURE",
    cultureTitle: "How we work",
    culture: [
      { icon: "🌍", title: "Remote-first",         desc: "Teams in Istanbul, Riyadh and across Europe. Office is optional." },
      { icon: "🚀", title: "Ship to learn",         desc: "Small teams, small decisions, fast shipping." },
      { icon: "📊", title: "Steered by numbers",    desc: "Every feature has a metric; we use data, not intuition." },
      { icon: "💡", title: "AI-native",              desc: "From Voice-to-Invoice to Tax Autopilot — AI is architecture, not a tool." },
    ],
    benefitsEyebrow: "BENEFITS",
    benefitsTitle: "What we offer",
    benefits: [
      { icon: "💰", text: "Competitive salary + equity" },
      { icon: "🏥", text: "Private health insurance" },
      { icon: "🏖️", text: "30 days paid leave" },
      { icon: "💻", text: "Equipment budget" },
      { icon: "📚", text: "Annual learning budget" },
      { icon: "🍽️", text: "Meal allowance" },
    ],
    contactNote: "One email — careers@zyrix.co",
  },
  AR: {
    eyebrow: "وظائف في ZYRIX",
    title: "نعيد كتابة العمليات المالية لـ MENA وتركيا",
    subtitle: "لا توجد لدينا وظائف مفتوحة حالياً. إذا كنت ترغب بالانضمام، أرسل سيرتك — ستُعطى الأولوية عند فتح الوظائف القادمة.",
    newsletter: {
      tagline: "كن أول من يعرف بالوظائف الجديدة",
      email: "البريد الإلكتروني",
      emailPh: "you@company.com",
      submit: "انضم لقائمة الانتظار",
      busy: "جاري الإرسال...",
      successMsg: "أنت في قائمة الانتظار — سنخبرك عند فتح وظائف جديدة.",
      errEmail: "أدخل بريداً إلكترونيّاً صالحاً.",
    },
    cultureEyebrow: "ثقافتنا",
    cultureTitle: "كيف نعمل",
    culture: [
      { icon: "🌍", title: "الأولوية للعن بُعد",      desc: "فرقنا في إسطنبول والرياض وأوروبا. المكتب اختياري." },
      { icon: "🚀", title: "اشحن لتتعلم",              desc: "فرق صغيرة، قرارات صغيرة، شحن سريع." },
      { icon: "📊", title: "موجَّهون بالأرقام",        desc: "كل ميزة لها مقياس؛ نستخدم البيانات لا الحدس." },
      { icon: "💡", title: "AI-أساسي",                  desc: "من Voice-to-Invoice إلى Tax Autopilot — AI هو معماريتنا." },
    ],
    benefitsEyebrow: "المزايا",
    benefitsTitle: "ما نقدمه",
    benefits: [
      { icon: "💰", text: "راتب تنافسي + أسهم" },
      { icon: "🏥", text: "تأمين صحي خاص" },
      { icon: "🏖️", text: "30 يوم إجازة مدفوعة" },
      { icon: "💻", text: "ميزانية للمعدات" },
      { icon: "📚", text: "ميزانية تعلم سنوية" },
      { icon: "🍽️", text: "بدل وجبات" },
    ],
    contactNote: "بريد واحد — careers@zyrix.co",
  },
};

const CULTURE_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
  { bg: "#D1FAE5", border: "#10B981", icon: "#10B981" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED" },
];

export default function KariyerPage() {
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
      {/* Culture */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.cultureEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.cultureTitle}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {t.culture.map((c, i) => {
            const th = CULTURE_THEMES[i % CULTURE_THEMES.length];
            return (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderTop: `3px solid ${th.border}`,
                borderRadius: 18,
                padding: 22,
                boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: th.bg, color: th.icon, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{c.desc}</p>
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
              display: "flex",
              alignItems: "center",
              gap: 14,
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

      <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "#5C4F52", fontWeight: 600 }}>{t.contactNote}</p>
    </ResourcePage>
  );
}

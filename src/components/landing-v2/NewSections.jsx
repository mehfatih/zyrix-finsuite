// ============================================================
// Zyrix FinSuite - 5 New Landing Sections + WhatsAppWidget
// To be inserted into LandingPageV2Extended.jsx
// ============================================================
//
// USAGE:
// 1. Place this file at: src/components/landing/NewSections.jsx
// 2. In LandingPageV2Extended.jsx, add this import at top:
//    import { WhyUsSection, SectorsSection, IntegrationsSection,
//             FAQSection, WhatsAppWidget } from "../components/landing/NewSections";
// 3. Insert <WhyUsSection lang={lang} /> after SolutionSection JSX
// 4. Insert <SectorsSection lang={lang} /> after FeaturesSection JSX
// 5. Insert <IntegrationsSection lang={lang} /> after SectorsSection JSX
// 6. Insert <FAQSection lang={lang} /> before CTASection JSX
// 7. Add <WhatsAppWidget lang={lang} /> as last child of the page
//
// All sections accept optional `lang` prop ("TR" | "EN" | "AR"). Falls back to TR.
// Colors match the rest of LandingPageV2Extended (cyan/sky family).
// ============================================================

import React, { useState } from "react";

const COLORS = {
  primary:  "#0891B2",
  accent:   "#06B6D4",
  bg:       "#F8FAFC",
  card:     "#FFFFFF",
  text:     "#0F172A",
  muted:    "#64748B",
  border:   "#E2E8F8",
  success:  "#10B981",
  whatsapp: "#25D366",
};

// ============================================================
//  1. WHY US SECTION  (5 reasons)
// ============================================================

const WHY_US_TXT = {
  TR: {
    eyebrow: "NEDEN BİZ",
    title: "Neden Zyrix FinSuite?",
    subtitle: "MENA ve Türkiye'de KOBİ'ler için tasarlanmış, 5 farkımızla öne çıkıyoruz.",
    items: [
      { icon: "🌍", title: "MENA İçin Tasarlandı",
        desc: "Sadece çevrilmiş bir araç değil — Türk vergi mevzuatı, ZATCA Suudi Arabistan, BAE VAT'ı doğal olarak destekler." },
      { icon: "🌐", title: "3 Dil, 3 Pazar",
        desc: "Türkçe, İngilizce ve Arapça arayüz tek tıkla. Aynı veriler, farklı diller." },
      { icon: "🤖", title: "Yapay Zeka CFO Hazır",
        desc: "Nakit akışı tahmini, anomali tespiti ve sektör karşılaştırması — ekstra abonelik gerekmez." },
      { icon: "💬", title: "WhatsApp Tahsilat",
        desc: "Otomatik fatura hatırlatmaları — ortalama tahsilat süresini 17 gün kısaltır." },
      { icon: "🎯", title: "Tek Platform, Tek Fatura",
        desc: "CRM, ön muhasebe, e-Fatura, ödemeler ve raporlar tek yerde. 5 yerine 1 abonelik." },
      { icon: "⚡", title: "5 Dakikada Hazır",
        desc: "Kurulum yok, sunucu yok. E-postanızla giriş yapın, hemen kullanmaya başlayın." },
      { icon: "🔐", title: "Banka Düzeyinde Güvenlik",
        desc: "KVKK ve GDPR uyumlu. Verileriniz İstanbul'da, AES-256 şifreli, günlük yedekli." },
      { icon: "💎", title: "Saklı Maliyet Yok",
        desc: "Aylık veya yıllık ödeyin. Kurulum, eğitim, destek dahil. Faturanızda sürpriz yok." },
    ],
  },
  EN: {
    eyebrow: "WHY US",
    title: "Why Zyrix FinSuite?",
    subtitle: "Built specifically for SMBs in MENA and Turkey — 5 things that set us apart.",
    items: [
      { icon: "🌍", title: "Built for MENA",
        desc: "Not just translated — handles Turkish tax law, ZATCA Saudi Arabia, and UAE VAT natively." },
      { icon: "🌐", title: "3 Languages, 3 Markets",
        desc: "Turkish, English, and Arabic interface with one click. Same data, different languages." },
      { icon: "🤖", title: "AI CFO Built-In",
        desc: "Cash flow forecasting, anomaly detection, and sector benchmarking — no extra subscription." },
      { icon: "💬", title: "WhatsApp-Native Collections",
        desc: "Automatic invoice reminders — cuts average collection time by 17 days." },
      { icon: "🎯", title: "One Platform, One Bill",
        desc: "CRM, accounting, e-invoice, payments, and reports — all in one place. 1 subscription instead of 5." },
      { icon: "⚡", title: "Ready in 5 Minutes",
        desc: "No setup, no server. Sign in with your email and start using immediately." },
      { icon: "🔐", title: "Bank-Grade Security",
        desc: "KVKK and GDPR compliant. Data in Istanbul, AES-256 encrypted, daily backups." },
      { icon: "💎", title: "No Hidden Fees",
        desc: "Pay monthly or yearly. Setup, training, support all included. No surprises on your bill." },
    ],
  },
  AR: {
    eyebrow: "لماذا نحن",
    title: "لماذا Zyrix FinSuite؟",
    subtitle: "صُمم خصيصاً للشركات الصغيرة والمتوسطة في MENA وتركيا — 5 ميزات تجعلنا مختلفين.",
    items: [
      { icon: "🌍", title: "صُمم لمنطقة MENA",
        desc: "ليس مجرد ترجمة — يدعم قانون الضرائب التركي و ZATCA السعودية و VAT الإمارات بشكل أصلي." },
      { icon: "🌐", title: "3 لغات، 3 أسواق",
        desc: "واجهة تركية وإنجليزية وعربية بنقرة واحدة. نفس البيانات، لغات مختلفة." },
      { icon: "🤖", title: "مدير مالي ذكي مدمج",
        desc: "توقعات التدفق النقدي وكشف الشذوذ ومقارنة القطاع — بدون اشتراك إضافي." },
      { icon: "💬", title: "تحصيل عبر WhatsApp",
        desc: "تذكيرات فواتير تلقائية — تقلّل متوسط وقت التحصيل بـ 17 يوم." },
      { icon: "🎯", title: "منصة واحدة، فاتورة واحدة",
        desc: "CRM والمحاسبة والفاتورة الإلكترونية والمدفوعات والتقارير في مكان واحد. اشتراك واحد بدل 5." },
      { icon: "⚡", title: "جاهز في 5 دقائق",
        desc: "بدون تثبيت، بدون خادم. سجّل بإيميلك وابدأ الاستخدام فوراً." },
      { icon: "🔐", title: "أمان بمستوى البنوك",
        desc: "متوافق KVKK و GDPR. بياناتك في إسطنبول، تشفير AES-256، نسخ احتياطي يومي." },
      { icon: "💎", title: "بدون رسوم خفية",
        desc: "ادفع شهرياً أو سنوياً. الإعداد والتدريب والدعم مشمولين. لا مفاجآت في فاتورتك." },
    ],
  },
};

export function WhyUsSection({ lang = "TR" }) {
  const t = WHY_US_TXT[lang] || WHY_US_TXT.TR;
  return (
    <section style={{ padding: "80px 24px", background: COLORS.bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>
            {t.eyebrow}
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: COLORS.text }}>
            {t.title}
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: COLORS.muted, maxWidth: 600, marginInline: "auto", lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {t.items.map((it, i) => (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 16, padding: 28,
              border: `1.5px solid ${COLORS.border}`,
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 40px ${COLORS.primary}15`;
              e.currentTarget.style.borderColor = `${COLORS.primary}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.borderColor = COLORS.border;
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{it.icon}</div>
              <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: COLORS.text }}>{it.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  2. SECTORS SECTION  (6 industries)
// ============================================================

const SECTORS_TXT = {
  TR: {
    eyebrow: "SEKTÖRLER",
    title: "Sektörünüze Özel",
    subtitle: "Her sektörün ihtiyaçları farklı. Zyrix FinSuite 6 ana sektörde özel iş akışları sunar.",
    items: [
      { icon: "🛍️", title: "E-Ticaret",
        desc: "Trendyol, Hepsiburada, Amazon entegrasyonu. Stok senkronizasyonu otomatik." },
      { icon: "🍽️", title: "Restoran ve Yiyecek",
        desc: "Yemeksepeti, Getir, Trendyol Yemek bağlantıları. POS entegrasyonu." },
      { icon: "💼", title: "Profesyonel Hizmetler",
        desc: "Avukatlar, danışmanlar, ajanslar için saat bazlı faturalama ve sözleşme yönetimi." },
      { icon: "💆", title: "Sağlık ve Güzellik",
        desc: "Klinikler, kuaförler ve spa'lar için randevu, sadakat ve ödeme akışı." },
      { icon: "🎓", title: "Eğitim ve Kurslar",
        desc: "Kurs satışları, taksitli ödemeler, öğrenci kayıt ve sertifika yönetimi." },
      { icon: "📦", title: "Toptan ve Dağıtım",
        desc: "Çoklu depo, B2B fiyatlandırma, kredili satış ve cari hesap takibi." },
      { icon: "🚚", title: "Lojistik ve Nakliyat",
        desc: "Kargo entegrasyonu, kapıda ödeme yönetimi, sipariş takibi ve filo raporlama." },
      { icon: "🏗️", title: "İnşaat ve Müteahhitlik",
        desc: "Proje bazlı maliyet, hak ediş takibi, taşeron yönetimi ve KDV raporları." },
    ],
  },
  EN: {
    eyebrow: "INDUSTRIES",
    title: "Tailored for Your Industry",
    subtitle: "Every industry has unique needs. Zyrix FinSuite offers tailored workflows for 6 core sectors.",
    items: [
      { icon: "🛍️", title: "E-Commerce",
        desc: "Trendyol, Hepsiburada, Amazon integration. Automatic stock sync." },
      { icon: "🍽️", title: "Restaurants & F&B",
        desc: "Yemeksepeti, Getir, Trendyol Yemek connectors. POS integration." },
      { icon: "💼", title: "Professional Services",
        desc: "Hourly billing and contract management for lawyers, consultants, and agencies." },
      { icon: "💆", title: "Health & Beauty",
        desc: "Appointments, loyalty, and payments for clinics, salons, and spas." },
      { icon: "🎓", title: "Education & Training",
        desc: "Course sales, installment payments, student enrollment, and certificate management." },
      { icon: "📦", title: "Wholesale & Distribution",
        desc: "Multi-warehouse, B2B pricing, credit sales, and account tracking." },
      { icon: "🚚", title: "Logistics & Transport",
        desc: "Shipping integration, COD management, order tracking, and fleet reporting." },
      { icon: "🏗️", title: "Construction & Contracting",
        desc: "Project-based costing, milestone tracking, subcontractor management, and VAT reports." },
    ],
  },
  AR: {
    eyebrow: "القطاعات",
    title: "مخصص لقطاعك",
    subtitle: "لكل قطاع احتياجاته. يقدم Zyrix FinSuite تدفقات عمل مخصصة لـ 6 قطاعات رئيسية.",
    items: [
      { icon: "🛍️", title: "التجارة الإلكترونية",
        desc: "تكامل Trendyol وHepsiburada وAmazon. مزامنة مخزون تلقائية." },
      { icon: "🍽️", title: "المطاعم والأطعمة",
        desc: "روابط Yemeksepeti وGetir وTrendyol Yemek. تكامل POS." },
      { icon: "💼", title: "الخدمات المهنية",
        desc: "فوترة بالساعة وإدارة عقود للمحامين والمستشارين والوكالات." },
      { icon: "💆", title: "الصحة والجمال",
        desc: "حجوزات وولاء ومدفوعات للعيادات وصالونات التجميل والسبا." },
      { icon: "🎓", title: "التعليم والتدريب",
        desc: "بيع الدورات والدفع بالتقسيط وتسجيل الطلاب وإدارة الشهادات." },
      { icon: "📦", title: "الجملة والتوزيع",
        desc: "مستودعات متعددة وتسعير B2B ومبيعات بالائتمان وتتبع الحسابات." },
      { icon: "🚚", title: "اللوجستيات والنقل",
        desc: "تكامل الشحن، إدارة الدفع عند الاستلام، تتبع الطلبات، وتقارير الأسطول." },
      { icon: "🏗️", title: "البناء والمقاولات",
        desc: "تكلفة على أساس المشروع، تتبع المراحل، إدارة المقاولين الفرعيين، وتقارير VAT." },
    ],
  },
};

export function SectorsSection({ lang = "TR" }) {
  const t = SECTORS_TXT[lang] || SECTORS_TXT.TR;
  return (
    <section style={{ padding: "80px 24px", background: COLORS.card }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>
            {t.eyebrow}
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: COLORS.text }}>
            {t.title}
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: COLORS.muted, maxWidth: 600, marginInline: "auto", lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {t.items.map((it, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${COLORS.bg} 0%, #FFFFFF 100%)`,
              borderRadius: 16, padding: 24, border: `1.5px solid ${COLORS.border}`,
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.accent}05 100%)`;
              e.currentTarget.style.borderColor = `${COLORS.primary}50`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.bg} 0%, #FFFFFF 100%)`;
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.transform = "";
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{it.icon}</div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>{it.title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: COLORS.muted, lineHeight: 1.55 }}>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  3. INTEGRATIONS SECTION  (10 logos)
// ============================================================

const INTEGRATIONS_TXT = {
  TR: {
    eyebrow: "ENTEGRASYONLAR",
    title: "Sevdiğiniz Araçlarla Çalışır",
    subtitle: "Mevcut sisteminizi terk etmenize gerek yok. 10+ entegrasyonla sorunsuz birlikte çalışır.",
  },
  EN: {
    eyebrow: "INTEGRATIONS",
    title: "Works With Your Favorite Tools",
    subtitle: "No need to leave your existing systems. Works seamlessly with 10+ integrations.",
  },
  AR: {
    eyebrow: "التكاملات",
    title: "يعمل مع أدواتك المفضلة",
    subtitle: "لا حاجة لترك أنظمتك الحالية. يعمل بسلاسة مع أكثر من 10 تكاملات.",
  },
};

const INTEGRATIONS_LIST = [
  { icon: "🛒", name: "Trendyol",         category: "E-Commerce" },
  { icon: "🛍️", name: "Hepsiburada",      category: "E-Commerce" },
  { icon: "🏬", name: "N11",              category: "E-Commerce" },
  { icon: "📦", name: "Amazon",           category: "E-Commerce" },
  { icon: "🍔", name: "Yemeksepeti",      category: "Food Delivery" },
  { icon: "🛵", name: "Getir",            category: "Quick Commerce" },
  { icon: "🏦", name: "Garanti BBVA",     category: "Banking" },
  { icon: "💳", name: "Iyzico",           category: "Payments" },
  { icon: "💬", name: "WhatsApp Business",category: "Messaging" },
  { icon: "📊", name: "Google Workspace", category: "Productivity" },
];

export function IntegrationsSection({ lang = "TR" }) {
  const t = INTEGRATIONS_TXT[lang] || INTEGRATIONS_TXT.TR;
  return (
    <section style={{ padding: "80px 24px", background: COLORS.bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>
            {t.eyebrow}
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: COLORS.text }}>
            {t.title}
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: COLORS.muted, maxWidth: 600, marginInline: "auto", lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {INTEGRATIONS_LIST.map((it, i) => (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 14, padding: "20px 18px",
              border: `1.5px solid ${COLORS.border}`,
              display: "flex", alignItems: "center", gap: 14,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${COLORS.primary}50`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.primary}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: COLORS.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>{it.icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500, marginTop: 2 }}>
                  {it.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  4. FAQ SECTION  (6 questions)
// ============================================================

const FAQ_TXT = {
  TR: {
    eyebrow: "SSS",
    title: "Sıkça Sorulan Sorular",
    subtitle: "Aklınıza takılan başka bir şey varsa, bizimle iletişime geçin.",
    items: [
      { q: "Aylık ücret ne kadar?",
        a: "Aylık 463 TL'den başlar (e-Dönüşüm planı). Pro plan AI CFO ile 738 TL/ay. Yıllık ödemelerde %20 indirim." },
      { q: "Deneme süresi var mı?",
        a: "14 günlük ücretsiz deneme — kredi kartı gerekmez. İptal etmek tek tık." },
      { q: "e-Fatura'ya nasıl bağlanır?",
        a: "GİB üzerinden onaylı entegratörüz. Mali mührünüzü yükleyin, 5 dakikada aktif." },
      { q: "Verilerim güvende mi?",
        a: "KVKK ve GDPR uyumlu. Veriler İstanbul'da, AES-256 ile şifreli. Günlük yedek." },
      { q: "Mevcut sistemden veri aktarımı?",
        a: "Excel, Logo, Mikro, Parasüt, Bizim Hesap'tan ücretsiz veri aktarımı. Onboarding ekibimiz size yardımcı olur." },
      { q: "Destek hangi dillerde?",
        a: "Türkçe, İngilizce ve Arapça canlı destek. WhatsApp, e-posta ve canlı sohbet." },
    ],
  },
  EN: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    subtitle: "If you have another question, reach out to us anytime.",
    items: [
      { q: "How much does it cost per month?",
        a: "Starts at 463 TL/month (e-Transformation plan). Pro plan with AI CFO is 738 TL/month. 20% off for annual." },
      { q: "Is there a free trial?",
        a: "14-day free trial — no credit card required. Cancel anytime in one click." },
      { q: "How does e-Invoice integration work?",
        a: "We're an officially approved GİB integrator. Upload your fiscal seal — active in 5 minutes." },
      { q: "Is my data secure?",
        a: "KVKK and GDPR compliant. Data stored in Istanbul, AES-256 encryption. Daily backups." },
      { q: "Can I migrate from my existing system?",
        a: "Free data migration from Excel, Logo, Mikro, Parasüt, Bizim Hesap. Our onboarding team helps you." },
      { q: "What languages is support available in?",
        a: "Turkish, English, and Arabic live support. WhatsApp, email, and live chat." },
    ],
  },
  AR: {
    eyebrow: "الأسئلة الشائعة",
    title: "الأسئلة الشائعة",
    subtitle: "إذا كان لديك سؤال آخر، تواصل معنا في أي وقت.",
    items: [
      { q: "كم تكلفة الاشتراك الشهري؟",
        a: "يبدأ من 463 ليرة شهرياً (خطة التحول الرقمي). الخطة المتقدمة مع AI CFO بـ 738 ليرة شهرياً. خصم 20% للاشتراك السنوي." },
      { q: "هل توجد فترة تجريبية؟",
        a: "تجربة مجانية 14 يوم — لا حاجة لبطاقة ائتمان. إلغاء بنقرة واحدة في أي وقت." },
      { q: "كيف يعمل تكامل الفاتورة الإلكترونية؟",
        a: "نحن مكامل معتمد رسمياً من GİB. حمّل ختمك المالي — يصبح نشطاً في 5 دقائق." },
      { q: "هل بياناتي آمنة؟",
        a: "متوافق مع KVKK و GDPR. البيانات في إسطنبول، تشفير AES-256. نسخ احتياطي يومي." },
      { q: "هل يمكنني الانتقال من نظامي الحالي؟",
        a: "نقل بيانات مجاني من Excel وLogo وMikro وParasüt وBizim Hesap. فريق الدعم يساعدك." },
      { q: "بأي لغات يتوفر الدعم؟",
        a: "دعم مباشر بالتركية والإنجليزية والعربية. WhatsApp وبريد إلكتروني ودردشة مباشرة." },
    ],
  },
};

export function FAQSection({ lang = "TR" }) {
  const t = FAQ_TXT[lang] || FAQ_TXT.TR;
  const [openIdx, setOpenIdx] = useState(0);
  const isRtl = lang === "AR";

  return (
    <section style={{ padding: "80px 24px", background: COLORS.card }} dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>
            {t.eyebrow}
          </div>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: COLORS.text }}>
            {t.title}
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: COLORS.muted, lineHeight: 1.6 }}>{t.subtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {t.items.map((it, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} style={{
                background: isOpen ? `${COLORS.primary}06` : COLORS.bg,
                border: `1.5px solid ${isOpen ? COLORS.primary + "40" : COLORS.border}`,
                borderRadius: 12, overflow: "hidden", transition: "all 0.2s",
              }}>
                <button onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  style={{
                    width: "100%", padding: "18px 22px",
                    background: "transparent", border: "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
                    cursor: "pointer", textAlign: isRtl ? "right" : "left",
                  }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, flex: 1 }}>{it.q}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isOpen ? COLORS.primary : `${COLORS.primary}15`,
                    color: isOpen ? "#fff" : COLORS.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, flexShrink: 0,
                    transition: "all 0.2s",
                  }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: "0 22px 18px",
                    fontSize: 14, color: COLORS.muted, lineHeight: 1.65,
                  }}>
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  5. WHATSAPP FLOATING WIDGET
// ============================================================

const WHATSAPP_NUMBER = "905452210888"; // No + or spaces
const WHATSAPP_PRESET = {
  TR: "Merhaba, Zyrix FinSuite hakkinda bilgi almak istiyorum.",
  EN: "Hello, I'd like more information about Zyrix FinSuite.",
  AR: "مرحبًا، أود الحصول على مزيد من المعلومات حول Zyrix FinSuite.",
};

export function WhatsAppWidget({ lang = "TR" }) {
  const [hover, setHover] = useState(false);
  const presetText = WHATSAPP_PRESET[lang] || WHATSAPP_PRESET.TR;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(presetText)}`;

  const tooltipText = lang === "AR" ? "تحدث معنا على WhatsApp"
    : lang === "EN" ? "Chat with us on WhatsApp"
    : "WhatsApp'tan sohbet edin";

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      aria-label="WhatsApp"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.whatsapp, color: "#fff",
        borderRadius: 999, padding: hover ? "14px 20px 14px 14px" : "14px",
        boxShadow: "0 8px 32px rgba(37, 211, 102, 0.4)",
        textDecoration: "none",
        transition: "all 0.25s",
        fontWeight: 700, fontSize: 14,
      }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {hover && <span style={{ whiteSpace: "nowrap" }}>{tooltipText}</span>}
    </a>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

const C = {
  red: "#E30A17", redDeep: "#B30810", redBright: "#FF1A2A",
  redSoft: "#FFE3E5", wine900: "#3A0509", wine950: "#1F0205",
  bgTinted: "#FFF7F4", ink: "#1B0F11", muted: "#5C4F52",
  hairline: "rgba(0,0,0,.08)", emerald: "#10B981", amber: "#F59E0B",
};

const SA = {
  green: "#006C35", greenDeep: "#004D26", greenBright: "#00A050",
  green900: "#00190C", green950: "#000B05",
  bgTinted: "#F4FBF7", hairline: "rgba(0,0,0,.08)",
};

const TXT = {
  TR: {
    back: "\u2190 Geri",
    badge: "ZYRIX NASIL ÇALIŞIR",
    h1Pre: "Faturalardan kararlara —",
    h1Highlight: "otomatik olarak",
    sub: "Zyrix faturalarınıza bağlanır, davranışı analiz eder, riskleri erken tespit eder ve nakit akışı sorunları yaşanmadan önce ne yapmanız gerektiğini söyler.",
    ctaPrimary: "İlk Analizinizi Başlatın \u2192",
    ctaSecondary: "Uzmanla Görüş",
    flow: ["Faturalar", "AI Analizi", "Risk Tespiti", "Aksiyonlar", "Nakit Kontrolü"],
    midH2: "Dashboardlara değil, kararlara ihtiyacınız var.",
    midSub: "Zyrix ham fatura verisini anında net, uygulanabilir adımlara dönüştürür.",
    cols: [
      ["01", "Veri Bağlantısı", "Fatura ve ödeme verilerinize bağlanırız. Manuel kurulum yok. İşletme veriniz anında kullanılabilir hale gelir."],
      ["02", "AI Analiz Motoru", "Desenleri analiz eder, gecikmeleri tespit eder ve nakit akışı sorununa dönüşmeden önce gizli riskleri belirleriz."],
      ["03", "Aksiyon Sistemi", "Kimi ne zaman ve nasıl takip edeceğinizi açıkça gösteririz. Tahmin etmezsiniz. Uygularsınız."],
    ],
    beforeBadge: "ÖNCE",
    beforeTitle: "Geleneksel akış",
    beforeItems: ["Faturalar kesilir", "Ödemeler gecikir", "Sorunlar çok geç fark edilir", "Manuel takipler", "Kaçırılan fırsatlar"],
    afterBadge: "ZYRIX İLE",
    afterTitle: "Öngörülü akış",
    afterItems: ["Riskler erken tespit edilir", "Nakit akışı önceden öngörülür", "Takipler otomatikleştirilir", "Fırsatlar önceliklendirilir", "Aksiyonlar anında uygulanır"],
    cmpBadge: "NEDEN FARKLI",
    cmpTitle: "Çoğu sistem ne olduğunu gösterir. Zyrix ne yapacağınızı söyler.",
    cmpRows: [
      ["Rapor gösterir", "Karar verir"],
      ["Manuel iş gerektirir", "Aksiyonları otomatikleştirir"],
      ["Statik dashboard", "Gerçek zamanlı zekâ"],
      ["Reaktif", "Öngörülü"],
    ],
    previewBadge: "SİSTEM İŞ BAŞINDA",
    previewTitle: "Saniyeler içinde Zyrix verinizi karara dönüştürür.",
    previewSub: "Sayılarla durmaz. Riskleri gösterir, davranışları karşılaştırır ve bir sonraki en iyi aksiyonu üretir.",
    previewItems: [
      ["AI İçgörüsü", "Nakit akışı sorunu olmadan önce gecikme deseni tespit edildi."],
      ["Risk Sinyali", "%22 risk seviyesi öncelikli takip gerektiriyor."],
      ["Hazır Aksiyon", "Hatırlatma ve takip mesajı otomatik hazırlandı."],
    ],
    pressureBadge: "GERÇEK AN",
    pressureTitle: "Geleneksel araçları kullanmaya devam ederseniz, riskler gizli kalır.",
    pressureItems: ["Nakit akışı tahmin edilemez hale gelir", "Takipler manuel kalır", "Para tahsil edilmemiş kalır", "Fırsatlar görünmez kalır"],
    finalBadge: "ŞİMDİ BAŞLA",
    finalTitle: "Bugün nakit akışınızı kontrol etmeye başlayın",
    finalSub: "İlk analizinizi başlatın, gizli riskleri görün ve faturaları hazır kararlara dönüştürün.",
    finalNote: "Kurulum yok • Dakikalar içinde hazır • Gerçek verilerinizle çalışır",
  },
  AR: {
    back: "\u2190 \u0639\u0648\u062F\u0629",
    badge: "كيف يعمل Zyrix",
    h1Pre: "من الفواتير إلى القرارات —",
    h1Highlight: "تلقائياً",
    sub: "يتصل Zyrix بفواتيرك، يحلل السلوك، يكتشف المخاطر مبكراً، ويخبرك بالضبط ما يجب فعله قبل حدوث مشاكل التدفق النقدي.",
    ctaPrimary: "ابدأ تحليلك الأول \u2190",
    ctaSecondary: "تحدّث مع خبير",
    flow: ["الفواتير", "تحليل الذكاء الاصطناعي", "كشف المخاطر", "الإجراءات", "التحكم بالنقد"],
    midH2: "لا تحتاج لوحات تحكم. تحتاج قرارات.",
    midSub: "Zyrix يحول بيانات الفواتير الخام إلى خطوات واضحة قابلة للتنفيذ فوراً.",
    cols: [
      ["01", "ربط البيانات", "نتصل ببيانات فواتيرك ومدفوعاتك. لا إعداد يدوي. بيانات عملك تصبح قابلة للاستخدام فوراً."],
      ["02", "محرك تحليل الذكاء الاصطناعي", "نحلل الأنماط، نكتشف التأخيرات، ونحدد المخاطر الخفية قبل أن تصبح مشاكل تدفق نقدي."],
      ["03", "نظام الإجراءات", "نولّد إجراءات واضحة — من تتابع، ومتى، وكيف. لا تخمن. تنفّذ."],
    ],
    beforeBadge: "قبل",
    beforeTitle: "السير التقليدي",
    beforeItems: ["تُصدر الفواتير", "تتأخر المدفوعات", "تُكتشف المشاكل متأخراً", "متابعات يدوية", "فرص ضائعة"],
    afterBadge: "مع Zyrix",
    afterTitle: "السير التنبؤي",
    afterItems: ["كشف المخاطر مبكراً", "توقع التدفق النقدي", "أتمتة المتابعات", "أولوية للفرص", "إجراءات فورية"],
    cmpBadge: "لماذا مختلف",
    cmpTitle: "أغلب الأنظمة تريك ما حدث. Zyrix يخبرك ماذا تفعل بعد ذلك.",
    cmpRows: [
      ["يعرض تقارير", "يعطي قرارات"],
      ["يتطلب عمل يدوي", "يؤتمت الإجراءات"],
      ["لوحات ثابتة", "ذكاء فوري"],
      ["تفاعلي", "تنبؤي"],
    ],
    previewBadge: "النظام في العمل",
    previewTitle: "في ثوانٍ، Zyrix يحول بياناتك إلى قرارات.",
    previewSub: "لا يتوقف عند الأرقام. يُظهر المخاطر، يقارن السلوك، ويولد الإجراء التالي الأفضل.",
    previewItems: [
      ["رؤية الذكاء الاصطناعي", "تم كشف نمط تأخير قبل أن يصبح مشكلة تدفق نقدي."],
      ["إشارة مخاطر", "مستوى مخاطر 22% يتطلب متابعة بالأولوية."],
      ["إجراء جاهز", "تذكير ورسالة متابعة جُهزت تلقائياً."],
    ],
    pressureBadge: "لحظة الحقيقة",
    pressureTitle: "لو استمريت في استخدام الأدوات التقليدية، تبقى المخاطر مخفية.",
    pressureItems: ["التدفق النقدي يصبح غير متوقع", "تبقى المتابعات يدوية", "يبقى المال غير محصّل", "تبقى الفرص غير مرئية"],
    finalBadge: "ابدأ الآن",
    finalTitle: "ابدأ التحكم في تدفقك النقدي اليوم",
    finalSub: "شغّل تحليلك الأول، اكتشف المخاطر الخفية، وحوّل الفواتير إلى قرارات جاهزة للتنفيذ.",
    finalNote: "بدون إعداد • جاهز في دقائق • يعمل مع بياناتك الفعلية",
  },
  EN: {
    back: "\u2190 Back",
    badge: "HOW ZYRIX WORKS",
    h1Pre: "From invoices to decisions —",
    h1Highlight: "automatically",
    sub: "Zyrix connects to your invoices, analyzes behavior, detects risks early, and tells you exactly what to do before cashflow problems happen.",
    ctaPrimary: "Run Your First Analysis \u2192",
    ctaSecondary: "Talk to an Expert",
    flow: ["Invoices", "AI Analysis", "Risk Detection", "Actions", "Cashflow Control"],
    midH2: "You don't need dashboards. You need decisions.",
    midSub: "Zyrix transforms raw invoice data into clear, actionable steps instantly.",
    cols: [
      ["01", "Data Connection", "We connect to your invoice and payment data. No manual setup. Your business data becomes instantly usable."],
      ["02", "AI Analysis Engine", "We analyze patterns, detect delays, and identify hidden risks before they become cashflow problems."],
      ["03", "Action System", "We generate clear actions — who to follow up with, when, and how. You don't guess. You execute."],
    ],
    beforeBadge: "BEFORE",
    beforeTitle: "Traditional workflow",
    beforeItems: ["Invoices issued", "Payments delayed", "Problems discovered too late", "Manual follow-ups", "Missed opportunities"],
    afterBadge: "WITH ZYRIX",
    afterTitle: "Predictive workflow",
    afterItems: ["Risks detected early", "Cashflow predicted", "Follow-ups automated", "Opportunities prioritized", "Actions executed instantly"],
    cmpBadge: "WHY IT'S DIFFERENT",
    cmpTitle: "Most systems show you what happened. Zyrix tells you what to do next.",
    cmpRows: [
      ["Show reports", "Give decisions"],
      ["Require manual work", "Automate actions"],
      ["Static dashboards", "Real-time intelligence"],
      ["Reactive", "Predictive"],
    ],
    previewBadge: "SYSTEM IN ACTION",
    previewTitle: "In seconds, Zyrix turns your data into decisions.",
    previewSub: "It doesn't stop at numbers. It shows risks, compares behavior, and generates the next best action.",
    previewItems: [
      ["AI Insight", "Delay pattern detected before it becomes a cashflow issue."],
      ["Risk Signal", "22% risk level requires priority follow-up."],
      ["Action Ready", "Reminder and follow-up message prepared automatically."],
    ],
    pressureBadge: "THE MOMENT OF TRUTH",
    pressureTitle: "If you keep using traditional tools, risks stay hidden.",
    pressureItems: ["Cashflow becomes unpredictable", "Follow-ups stay manual", "Money stays uncollected", "Opportunities stay invisible"],
    finalBadge: "START NOW",
    finalTitle: "Start controlling your cashflow today",
    finalSub: "Run your first analysis, see hidden risks, and turn invoices into action-ready decisions.",
    finalNote: "No setup \u2022 Ready in minutes \u2022 Works with your real data",
  },
};

export default function HowItWorksPage() {
  const { lang } = useI18n();
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;
  const t = TXT[lang] || TXT.TR;

  const themeColor = isArabic ? SA.green : C.red;
  const themeDeep = isArabic ? SA.greenDeep : C.redDeep;
  const themeBright = isArabic ? SA.greenBright : C.redBright;

  const card = {
    borderRadius: 30,
    background: "rgba(255,255,255,.86)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 72px rgba(58,5,9,.10)",
    backdropFilter: "blur(18px)",
  };

  const ctaGradient = "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")";
  const ctaShadow = isArabic ? "0 28px 70px rgba(0,108,53,.30)" : "0 28px 70px rgba(227,10,23,.32)";
  const heroBg = "linear-gradient(180deg, #FFFFFF 0%, " + T.bgTinted + " 44%, #FFFFFF 100%)";

  return (
    <>
      <NavV2 />
      <main style={{ direction: isRTL ? "rtl" : "ltr", minHeight: "100vh", color: T.ink, background: heroBg, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <section style={{ padding: "186px 32px 70px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: isArabic ? "radial-gradient(circle at 50% 18%, rgba(0,108,53,.15), transparent 48%)" : "radial-gradient(circle at 50% 18%, rgba(227,10,23,.18), transparent 48%)" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

          {/* HERO */}
          <div style={{ textAlign: "center", maxWidth: 960, margin: "0 auto 76px" }}>
            <div style={{ display: "inline-flex", padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,.85)", border: "1px solid " + T.hairline, color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.4px", marginBottom: 24, boxShadow: "0 18px 44px rgba(58,5,9,.10)" }}>
              {"\u2726 " + t.badge}
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(40px, 6vw, 78px)", lineHeight: 1.04, letterSpacing: "-0.05em", fontWeight: 900 }}>
              {t.h1Pre} <span style={{ color: themeColor }}>{t.h1Highlight}</span>
            </h1>
            <p style={{ margin: "24px auto 0", maxWidth: 780, fontSize: 17, lineHeight: 1.7, color: T.muted, fontWeight: 600 }}>
              {t.sub}
            </p>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link to="/ai-analysis" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "20px 32px", color: "#fff", fontSize: 16, fontWeight: 900, textDecoration: "none", background: ctaGradient, boxShadow: ctaShadow }}>
                {t.ctaPrimary}
              </Link>
              <a href="mailto:hello@zyrix.co" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "20px 28px", color: T.ink, fontSize: 16, fontWeight: 900, textDecoration: "none", background: "#fff", border: "1px solid " + T.hairline }}>
                {t.ctaSecondary}
              </a>
            </div>
          </div>

          {/* FLOW */}
          <div style={{ ...card, padding: 24, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 34 }}>
            {t.flow.map((item, i) => (
              <div key={i} style={{ position: "relative", borderRadius: 22, padding: "22px 14px", background: i === 2 ? ctaGradient : "rgba(255,255,255,.85)", color: i === 2 ? "#fff" : T.ink, textAlign: "center", fontSize: 14, fontWeight: 900, border: "1px solid " + T.hairline, lineHeight: 1.3 }}>
                {item}
                {i < 4 && (
                  <span style={{ position: "absolute", [isRTL ? "left" : "right"]: -12, top: "50%", transform: "translateY(-50%)", color: themeColor, fontWeight: 900, fontSize: 18, zIndex: 2 }}>
                    {isRTL ? "\u2190" : "\u2192"}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* MID HEADLINE */}
          <div style={{ textAlign: "center", margin: "60px auto 60px", maxWidth: 760 }}>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 3.4vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
              {t.midH2}
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.7, color: T.muted, fontWeight: 600 }}>
              {t.midSub}
            </p>
          </div>

          {/* THREE COLUMNS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 72 }}>
            {t.cols.map((row) => {
              const num = row[0];
              const title = row[1];
              const desc = row[2];
              return (
                <div key={num} style={{ ...card, padding: 28 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, background: ctaGradient, marginBottom: 18, fontSize: 14 }}>
                    {num}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 14, lineHeight: 1.65, fontWeight: 600 }}>
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* BEFORE / AFTER */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 72 }}>
            <div style={{ ...card, padding: 30, background: "rgba(255,255,255,.9)" }}>
              <div style={{ color: T.muted, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 12 }}>
                {t.beforeBadge}
              </div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.beforeTitle}</h3>
              {t.beforeItems.map((x, i) => (
                <div key={i} style={{ marginTop: 14, fontSize: 15, color: T.muted, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#999", fontSize: 14, fontWeight: 900 }}>{"\u2715"}</span>
                  <span>{x}</span>
                </div>
              ))}
            </div>

            <div style={{ ...card, padding: 30, background: isArabic ? "linear-gradient(135deg, rgba(232,247,238,.95), rgba(255,255,255,.92))" : "linear-gradient(135deg, rgba(255,241,242,.95), rgba(255,255,255,.92))" }}>
              <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 12 }}>
                {t.afterBadge}
              </div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.afterTitle}</h3>
              {t.afterItems.map((x, i) => (
                <div key={i} style={{ marginTop: 14, fontSize: 15, color: T.ink, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: themeColor, fontSize: 14, fontWeight: 900 }}>{"\u2713"}</span>
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COMPARISON */}
          <div style={{ ...card, padding: 32, marginBottom: 72 }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px" }}>
                {t.cmpBadge}
              </div>
              <h2 style={{ margin: "8px auto 0", maxWidth: 800, fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.25 }}>
                {t.cmpTitle}
              </h2>
            </div>

            {t.cmpRows.map((row, i) => {
              const oldWay = row[0];
              const zyrix = row[1];
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "12px 0", borderTop: "1px solid " + T.hairline }}>
                  <div style={{ padding: 16, borderRadius: 16, background: "rgba(0,0,0,.035)", color: T.muted, fontWeight: 800, fontSize: 14 }}>
                    {oldWay}
                  </div>
                  <div style={{ padding: 16, borderRadius: 16, background: isArabic ? "rgba(0,108,53,.07)" : "rgba(227,10,23,.07)", color: T.ink, fontWeight: 900, fontSize: 14 }}>
                    {zyrix}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MINI AI PREVIEW */}
          <div style={{ ...card, padding: 32, marginBottom: 72 }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 10 }}>
                  {t.previewBadge}
                </div>
                <h2 style={{ margin: 0, fontSize: "clamp(26px, 3.2vw, 36px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                  {t.previewTitle}
                </h2>
                <p style={{ marginTop: 14, color: T.muted, fontSize: 15, lineHeight: 1.7, fontWeight: 600 }}>
                  {t.previewSub}
                </p>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {t.previewItems.map((row, i) => {
                  const tints = [
                    { bg: "rgba(99,102,241,.08)", border: "rgba(99,102,241,.18)", color: "#6366F1" },
                    { bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.22)", color: "#D97706" },
                    { bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.20)", color: "#059669" },
                  ];
                  const tint = tints[i];
                  return (
                    <div key={i} style={{ borderRadius: 18, padding: 18, background: tint.bg, border: "1px solid " + tint.border }}>
                      <strong style={{ fontSize: 14, color: tint.color, fontWeight: 900, letterSpacing: "0.3px" }}>{row[0]}</strong>
                      <p style={{ margin: "6px 0 0", color: T.ink, fontSize: 14, lineHeight: 1.55, fontWeight: 700 }}>
                        {row[1]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRESSURE BLOCK */}
          <div style={{ borderRadius: 36, padding: 40, background: "linear-gradient(135deg, " + themeDeep + ", " + (isArabic ? SA.green950 : C.wine950) + ")", color: "#fff", boxShadow: "0 34px 90px rgba(58,5,9,.25)", marginBottom: 72 }}>
            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 10 }}>
              {"\u26A0 " + t.pressureBadge}
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(26px, 3.4vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
              {t.pressureTitle}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 26 }}>
              {t.pressureItems.map((x, i) => (
                <div key={i} style={{ borderRadius: 20, padding: 18, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", fontWeight: 800, lineHeight: 1.45, fontSize: 14 }}>
                  {x}
                </div>
              ))}
            </div>
          </div>

          {/* FINAL CTA */}
          <div style={{ ...card, padding: 42, textAlign: "center", maxWidth: 920, margin: "0 auto" }}>
            <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 12 }}>
              {t.finalBadge}
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(30px, 3.8vw, 42px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.2 }}>
              {t.finalTitle}
            </h2>
            <p style={{ margin: "14px auto 0", maxWidth: 640, color: T.muted, fontSize: 16, lineHeight: 1.7, fontWeight: 600 }}>
              {t.finalSub}
            </p>

            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link to="/ai-analysis" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "20px 32px", color: "#fff", fontSize: 16, fontWeight: 900, textDecoration: "none", background: ctaGradient, boxShadow: ctaShadow }}>
                {t.ctaPrimary}
              </Link>
              <a href="mailto:hello@zyrix.co" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "19px 28px", color: T.ink, fontSize: 16, fontWeight: 900, textDecoration: "none", background: "#fff", border: "1px solid " + T.hairline }}>
                {t.ctaSecondary}
              </a>
            </div>

            <div style={{ marginTop: 22, color: T.muted, fontSize: 13, fontWeight: 700 }}>
              {t.finalNote}
            </div>
          </div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

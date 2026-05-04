import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import { useCountry } from "../hooks/useCountry.jsx";
import { COUNTRY_PROFILES, SUPPORTED_COUNTRIES } from "../utils/countryProfiles.js";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ================================================================
// Country-specific pricing (purchasing-power adjusted)
// Not pure FX conversion - prices reflect local market expectations.
// All values are MONTHLY. Yearly is roughly 80% of monthly (20% off).
// ================================================================
const COUNTRY_PRICING = {
  TR: { starterMonthly: 199, starterYearly: 159, growthMonthly: 499, growthYearly: 399 },
  SA: { starterMonthly: 69,  starterYearly: 55,  growthMonthly: 179, growthYearly: 143 },
  AE: { starterMonthly: 69,  starterYearly: 55,  growthMonthly: 179, growthYearly: 143 },
  EG: { starterMonthly: 299, starterYearly: 239, growthMonthly: 799, growthYearly: 639 },
  KW: { starterMonthly: 5,   starterYearly: 4,   growthMonthly: 15,  growthYearly: 12  },
  QA: { starterMonthly: 69,  starterYearly: 55,  growthMonthly: 179, growthYearly: 143 },
  BH: { starterMonthly: 7,   starterYearly: 5,   growthMonthly: 18,  growthYearly: 14  },
  OM: { starterMonthly: 7,   starterYearly: 5,   growthMonthly: 18,  growthYearly: 14  },
  JO: { starterMonthly: 13,  starterYearly: 10,  growthMonthly: 35,  growthYearly: 28  },
  US: { starterMonthly: 19,  starterYearly: 15,  growthMonthly: 49,  growthYearly: 39  },
};

function getPricingForCountry(code) {
  return COUNTRY_PRICING[code] || COUNTRY_PRICING.US;
}

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
    badge: "KENDİNİ ÖDEYEN FİYATLANDIRMA",
    h1Pre: "Zaten para kaybediyorsunuz —",
    h1Highlight: "ne kadar hızlı düzelteceğinizi seçin",
    sub: "Zyrix fatura davranışını nakit akışı kararlarına dönüştürür. Riskleri tespit eden, nakit kurtaran ve takipleri otomatikleştiren planı seçin.",
    roiBadge: "ROI HESAPLAYICISI",
    roiTitle: "Ne kadar nakit akışı sızıyor olabileceğinizi görün",
    roiSub: "Sayıları ayarlayın ve doğru planın neden düşündüğünüzden daha hızlı kendini ödeyebileceğini görün.",
    roiVolume: "Aylık fatura hacmi",
    roiDelay: "Gecikme oranı",
    roiRecovery: "Beklenen kurtarma etkisi",
    impactTitle: "TAHMİNİ ETKİ",
    impactMonthly: "Aylık sızıntı",
    impactRecover: "Kurtarılabilir nakit",
    impactAnnual: "Potansiyel yıllık etki",
    impactNote: "Growth planı bile önlenebilir nakit sızıntısının yanında çok küçük görünebilir.",
    shockBased: "Sayılarınıza göre:",
    shockLosing: "Aylık {amt} kaybediyor olabilirsiniz",
    shockRecover: "Zyrix yaklaşık {amt}/ay kurtarmanıza yardım edebilir",
    shockStart: "{price}/ay'dan başlayarak \u2192",
    plansTitle: "Ne kadar nakit akışı kurtarmak istediğinizi seçin",
    plansSub: "Hepsi 14 gün ücretsiz başlar. Kurulum yok.",
    perMonth: "/ay",
    perYear: "/ay (yıllık)",
    bestValue: "EN İYİ DEĞER",
    billingMonthly: "Aylık",
    billingYearly: "Yıllık",
    saveBadge: "%20 tasarruf",
    plans: [
      {
        name: "Starter",
        priceMonthly: 19,
        priceYearly: 15,
        line: "AI nakit akışı görünürlüğüne yeni başlayan küçük ekipler için.",
        cta: "Hafif Başla",
        items: ["Fatura davranışı genel görünümü", "Temel AI içgörüleri", "Risk sinyalleri", "Manuel takip aksiyonları"],
      },
      {
        name: "Growth",
        priceMonthly: 49,
        priceYearly: 39,
        line: "İçgörüleri aksiyona dönüştürmek isteyen ekipler için en iyi değer.",
        cta: "Nakit Akışını Düzeltmeye Başla",
        items: ["Gelişmiş AI analizi", "Nakit akışı tahmini", "Otomatik takip önerileri", "WhatsApp / Email aksiyon önizleme", "Öncelikli risk tespiti", "ROI zekâsı"],
      },
      {
        name: "Scale",
        priceMonthly: null,
        priceYearly: null,
        priceLabel: "Custom",
        line: "Tam otomasyon ve kontrol gerektiren büyük operasyonlar için.",
        cta: "Satışla Görüş",
        items: ["Tam otomasyon iş akışları", "Gelişmiş yetkilendirmeler", "API erişimi", "Özel onboarding", "Öncelikli destek"],
      },
    ],
    growthHint: "Aylık sızıntınızın %1'inden daha az",
    growthPressure: "\u26A1 Çoğu ekip ilk analizden sonra Growth'a yükseltir",
    yearlySavings: "{amt} tasarruf",
    cmpBadge: "BEKLEMENİN MALİYETİ",
    cmpTitle: "En pahalı plan hiçbir şey yapmamaktır.",
    cmpWithout: "Zyrix Olmadan",
    cmpWithoutDesc: "Geciken ödemeler gizli kalır, takipler manuel kalır ve nakit akışı riski sessizce büyür.",
    cmpWithoutTag: "{amt} / ay risk altında",
    cmpWith: "Zyrix İle",
    cmpWithDesc: "AI riskleri belirler, aksiyonları hazırlar ve ekibinizin kurtarılabilir nakte odaklanmasını sağlar.",
    cmpWithTag: "{amt} / ay kurtarılabilir",
    trustItems: ["Ücretsiz başla", "Kurulum yok", "İstediğiniz zaman iptal", "Dakikalar içinde hazır"],
    finalBadge: "SIZINTI BÜYÜMEDEN BAŞLAYIN",
    finalTitle: "Nakit akışınız zaten bir hikâye anlatıyor. Zyrix bunu aksiyona dönüştürsün.",
    finalCta1: "Nakit Akışını Düzeltmeye Başla \u2192",
    finalCta2: "Önce Nakit Akışımı Gör",
  },
  AR: {
    back: "\u2190 \u0639\u0648\u062F\u0629",
    badge: "تسعير يدفع ثمن نفسه",
    h1Pre: "أنت تخسر المال بالفعل —",
    h1Highlight: "اختر مدى سرعة إصلاحه",
    sub: "Zyrix يحول سلوك الفواتير إلى قرارات تدفق نقدي. اختر الخطة التي تكشف المخاطر، تستعيد النقد، وتؤتمت المتابعات.",
    roiBadge: "حاسبة العائد",
    roiTitle: "اعرف كم من التدفق النقدي قد يتسرب منك",
    roiSub: "عدّل الأرقام واكتشف لماذا الخطة الصحيحة تدفع ثمن نفسها أسرع مما تظن.",
    roiVolume: "حجم الفواتير الشهري",
    roiDelay: "نسبة التأخير",
    roiRecovery: "أثر الاسترداد المتوقع",
    impactTitle: "الأثر المتوقع",
    impactMonthly: "تسرب شهري",
    impactRecover: "نقد قابل للاسترداد",
    impactAnnual: "أثر سنوي محتمل",
    impactNote: "حتى خطة Growth قد تبدو صغيرة جداً مقارنة بتسرب نقدي يمكن منعه.",
    shockBased: "بناءً على أرقامك:",
    shockLosing: "قد تخسر {amt} شهرياً",
    shockRecover: "Zyrix قد يساعدك على استرداد ~{amt}/شهر",
    shockStart: "ابتداءً من {price}/شهر \u2190",
    plansTitle: "اختر كم من التدفق النقدي تريد استرداده",
    plansSub: "كلها تبدأ بـ 14 يوم مجاناً. بدون إعداد.",
    perMonth: "/شهر",
    perYear: "/شهر (سنوي)",
    bestValue: "أفضل قيمة",
    billingMonthly: "شهري",
    billingYearly: "سنوي",
    saveBadge: "وفر 20%",
    plans: [
      {
        name: "Starter",
        priceMonthly: 19,
        priceYearly: 15,
        line: "للفرق الصغيرة التي تبدأ في رؤية التدفق النقدي بالذكاء الاصطناعي.",
        cta: "ابدأ خفيفاً",
        items: ["نظرة عامة على سلوك الفواتير", "رؤى أساسية بالذكاء الاصطناعي", "إشارات المخاطر", "إجراءات متابعة يدوية"],
      },
      {
        name: "Growth",
        priceMonthly: 49,
        priceYearly: 39,
        line: "أفضل قيمة للفرق التي تريد تحويل الرؤى إلى أفعال.",
        cta: "ابدأ في إصلاح التدفق النقدي",
        items: ["تحليل ذكاء اصطناعي متقدم", "توقع التدفق النقدي", "اقتراحات متابعة تلقائية", "معاينة إجراءات واتساب/بريد", "كشف مخاطر بالأولوية", "ذكاء العائد على الاستثمار"],
      },
      {
        name: "Scale",
        priceMonthly: null,
        priceYearly: null,
        priceLabel: "Custom",
        line: "للعمليات الكبيرة التي تحتاج أتمتة وتحكم كاملين.",
        cta: "تحدّث مع المبيعات",
        items: ["تدفقات أتمتة كاملة", "صلاحيات متقدمة", "وصول API", "إعداد مخصص", "دعم بالأولوية"],
      },
    ],
    growthHint: "أقل من 1% من تسربك الشهري",
    growthPressure: "\u26A1 معظم الفرق تترقى إلى Growth بعد التحليل الأول",
    yearlySavings: "وفر {amt}",
    cmpBadge: "تكلفة الانتظار",
    cmpTitle: "أغلى خطة هي عدم فعل أي شيء.",
    cmpWithout: "بدون Zyrix",
    cmpWithoutDesc: "تبقى المدفوعات المتأخرة خفية، وتبقى المتابعات يدوية، وتنمو مخاطر التدفق النقدي بهدوء.",
    cmpWithoutTag: "{amt} / شهر في خطر",
    cmpWith: "مع Zyrix",
    cmpWithDesc: "الذكاء الاصطناعي يبرز المخاطر، يجهز الإجراءات، ويساعد فريقك على التركيز على النقد القابل للاسترداد.",
    cmpWithTag: "{amt} / شهر قابل للاسترداد",
    trustItems: ["ابدأ مجاناً", "بدون إعداد", "ألغِ في أي وقت", "جاهز في دقائق"],
    finalBadge: "ابدأ قبل أن يتضخم التسرب",
    finalTitle: "تدفقك النقدي يحكي قصة بالفعل. اجعل Zyrix يحوّلها إلى إجراء.",
    finalCta1: "ابدأ في إصلاح التدفق النقدي \u2190",
    finalCta2: "اعرض تدفقي النقدي أولاً",
  },
  EN: {
    back: "\u2190 Back",
    badge: "PRICING THAT PAYS FOR ITSELF",
    h1Pre: "You're already losing money —",
    h1Highlight: "choose how fast you fix it",
    sub: "Zyrix turns invoice behavior into cashflow decisions. Pick the plan that helps you detect risk, recover cash, and automate follow-ups.",
    roiBadge: "ROI CALCULATOR",
    roiTitle: "See how much cashflow you may be leaking",
    roiSub: "Adjust the numbers and see why the right plan can pay for itself faster than you think.",
    roiVolume: "Monthly invoice volume",
    roiDelay: "Delay rate",
    roiRecovery: "Expected recovery impact",
    impactTitle: "ESTIMATED IMPACT",
    impactMonthly: "Monthly leakage",
    impactRecover: "Recoverable cash",
    impactAnnual: "Potential annual impact",
    impactNote: "Even the Growth plan can look tiny compared to avoidable cashflow leakage.",
    shockBased: "Based on your numbers:",
    shockLosing: "You may be losing {amt}/month",
    shockRecover: "Zyrix could help recover ~{amt}/month",
    shockStart: "Starting from {price}/month \u2192",
    plansTitle: "Choose how much cashflow you want to recover",
    plansSub: "All start with a 14-day free trial. No setup.",
    perMonth: "/mo",
    perYear: "/mo (billed yearly)",
    bestValue: "BEST VALUE",
    billingMonthly: "Monthly",
    billingYearly: "Yearly",
    saveBadge: "Save 20%",
    plans: [
      {
        name: "Starter",
        priceMonthly: 19,
        priceYearly: 15,
        line: "For small teams starting with AI cashflow visibility.",
        cta: "Start Light",
        items: ["Invoice behavior overview", "Basic AI insights", "Risk signals", "Manual follow-up actions"],
      },
      {
        name: "Growth",
        priceMonthly: 49,
        priceYearly: 39,
        line: "Best value for teams that want to turn insights into action.",
        cta: "Start Fixing Cashflow",
        items: ["Advanced AI analysis", "Cashflow prediction", "Auto follow-up suggestions", "WhatsApp / Email action preview", "Priority risk detection", "ROI intelligence"],
      },
      {
        name: "Scale",
        priceMonthly: null,
        priceYearly: null,
        priceLabel: "Custom",
        line: "For larger operations that need full automation and control.",
        cta: "Talk to Sales",
        items: ["Full automation workflows", "Advanced permissions", "API access", "Dedicated onboarding", "Priority support"],
      },
    ],
    growthHint: "Costs less than 1% of your monthly leakage",
    growthPressure: "\u26A1 Most teams upgrade to Growth after first analysis",
    yearlySavings: "Save {amt}",
    cmpBadge: "COST OF WAITING",
    cmpTitle: "The most expensive plan is doing nothing.",
    cmpWithout: "Without Zyrix",
    cmpWithoutDesc: "Delayed payments stay hidden, follow-ups stay manual, and cashflow risk grows quietly.",
    cmpWithoutTag: "{amt} / month at risk",
    cmpWith: "With Zyrix",
    cmpWithDesc: "AI highlights risks, prepares actions, and helps your team focus on recoverable cash.",
    cmpWithTag: "{amt} / month recoverable",
    trustItems: ["Start free", "No setup", "Cancel anytime", "Ready in minutes"],
    finalBadge: "START BEFORE THE LEAKAGE GROWS",
    finalTitle: "Your cashflow is already telling a story. Let Zyrix turn it into action.",
    finalCta1: "Start Fixing Cashflow \u2192",
    finalCta2: "See My Cashflow First",
  },
};

// Hook: animate number changes with brief glow
function useAnimatedNumber(value) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setPulse(true);
      const id = setTimeout(() => setPulse(false), 350);
      prev.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);
  return pulse;
}

export default function PricingPage() {
  const { lang } = useI18n();
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;
  const t = TXT[lang] || TXT.TR;

  const themeColor = isArabic ? SA.green : C.red;
  const themeDeep = isArabic ? SA.greenDeep : C.redDeep;
  const themeBright = isArabic ? SA.greenBright : C.redBright;
  const themeNight = isArabic ? SA.green950 : C.wine950;

  // Country-aware pricing: read user country (auto-detected or chosen)
  const { country: detectedCountry, profile, setCountry } = useCountry();
  const [pricingCountry, setPricingCountry] = useState(detectedCountry);

  // Sync if user picks a country from the dropdown above pricing cards
  const handleCountryChange = (code) => {
    setPricingCountry(code);
    setCountry(code);
  };

  // Active profile and pricing for the selected country
  const activeProfile = COUNTRY_PROFILES[pricingCountry] || profile;
  const countryPricing = getPricingForCountry(pricingCountry);
  const currencySymbol = activeProfile.currencySymbol;
  const currencyPos = activeProfile.code === "US" || activeProfile.code === "TR" ? "prefix" : "suffix";

  // Build the actual plans by overriding prices from t.plans (translation
  // copy) with country-specific numeric prices. The "Custom" plan has
  // priceMonthly: null, so we leave it untouched.
  const plans = useMemo(() => {
    if (!t.plans || !Array.isArray(t.plans)) return [];
    return plans.map((p, idx) => {
      // Index 0 = Starter, 1 = Growth, 2 = Scale (Custom)
      if (idx === 0) {
        return { ...p, priceMonthly: countryPricing.starterMonthly, priceYearly: countryPricing.starterYearly };
      }
      if (idx === 1) {
        return { ...p, priceMonthly: countryPricing.growthMonthly, priceYearly: countryPricing.growthYearly };
      }
      // Scale stays "Custom"
      return p;
    });
  }, [t.plans, countryPricing]);
  const fmt = (n) => {
    const formatted = Math.round(n).toLocaleString("en-US");
    return currencyPos === "prefix" ? currencySymbol + formatted : formatted + currencySymbol;
  };

  const [monthlyInvoices, setMonthlyInvoices] = useState(250000);
  const [delayRate, setDelayRate] = useState(18);
  const [recoveryRate, setRecoveryRate] = useState(32);
  const [billingYearly, setBillingYearly] = useState(false);

  const estimatedLeakage = useMemo(() => {
    return Math.round(monthlyInvoices * (delayRate / 100) * 0.42);
  }, [monthlyInvoices, delayRate]);

  const recoverableCash = useMemo(() => {
    return Math.round(estimatedLeakage * (recoveryRate / 100));
  }, [estimatedLeakage, recoveryRate]);

  const annualImpact = useMemo(() => recoverableCash * 12, [recoverableCash]);

  const leakPulse = useAnimatedNumber(estimatedLeakage);
  const recoverPulse = useAnimatedNumber(recoverableCash);
  const annualPulse = useAnimatedNumber(annualImpact);

  const card = {
    borderRadius: 30,
    background: "rgba(255,255,255,.9)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 70px rgba(58,5,9,.11)",
    backdropFilter: "blur(16px)",
  };

  const ctaGradient = "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")";
  const ctaShadow = isArabic ? "0 20px 44px rgba(0,108,53,.28)" : "0 20px 44px rgba(227,10,23,.28)";
  const heroBg = "linear-gradient(180deg, #FFFFFF 0%, " + T.bgTinted + " 42%, #FFFFFF 100%)";

  // Growth plan price for the shock strip
  const growthPlan = t.plans[1];
  const growthPriceNow = billingYearly ? growthPlan.priceYearly : growthPlan.priceMonthly;
  const growthYearlySaving = (growthPlan.priceMonthly - growthPlan.priceYearly) * 12;

  const numberStyle = (pulse) => ({
    fontSize: 26,
    fontWeight: 900,
    marginTop: 6,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
    transform: pulse ? "scale(1.06)" : "scale(1)",
    transition: "transform .3s cubic-bezier(.2,.8,.2,1)",
    display: "inline-block",
  });

  return (
    <>
      <NavV2 />
      <main style={{ direction: isRTL ? "rtl" : "ltr", minHeight: "100vh", color: T.ink, background: heroBg, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{".zr-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:999px;background:rgba(0,0,0,.08);outline:none;cursor:pointer}.zr-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid currentColor;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18)}.zr-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid currentColor;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18)}"}</style>

      <section style={{ padding: "180px 32px 110px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: isArabic ? "radial-gradient(circle at 50% 12%, rgba(0,108,53,.15), transparent 48%)" : "radial-gradient(circle at 50% 12%, rgba(227,10,23,.18), transparent 48%)" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

          {/* HERO */}
          <div style={{ textAlign: "center", maxWidth: 980, margin: "0 auto 66px" }}>
            <div style={{ display: "inline-flex", padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,.86)", border: "1px solid " + T.hairline, color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.4px", marginBottom: 22, boxShadow: "0 18px 44px rgba(58,5,9,.10)" }}>
              {"\u2726 " + t.badge}
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 1.05, letterSpacing: "-0.05em", fontWeight: 900 }}>
              {t.h1Pre} <span style={{ color: themeColor }}>{t.h1Highlight}</span>
            </h1>
            <p style={{ margin: "24px auto 0", maxWidth: 760, color: T.muted, fontSize: 17, lineHeight: 1.7, fontWeight: 600 }}>
              {t.sub}
            </p>
          </div>

          {/* ROI CALCULATOR */}
          <div style={{ ...card, padding: 32, marginBottom: 36, background: "linear-gradient(135deg, rgba(255,247,237,.96), rgba(255,255,255,.92))" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 28, alignItems: "stretch" }}>
              <div>
                <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 10 }}>
                  {t.roiBadge}
                </div>
                <h2 style={{ margin: 0, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                  {t.roiTitle}
                </h2>
                <p style={{ marginTop: 14, color: T.muted, fontSize: 15, lineHeight: 1.7, fontWeight: 600 }}>
                  {t.roiSub}
                </p>
                <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: T.muted, marginBottom: 8, letterSpacing: "0.3px" }}>
                      {t.roiVolume}
                    </div>
                    <input type="number" value={monthlyInvoices} onChange={(e) => setMonthlyInvoices(Number(e.target.value || 0))} style={{ width: "100%", height: 54, borderRadius: 16, border: "1px solid " + T.hairline, padding: "0 16px", fontSize: 16, fontWeight: 900, color: T.ink, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit", direction: isRTL ? "rtl" : "ltr" }} />
                  </div>
                  <div style={{ color: "#7C3AED" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: T.muted, letterSpacing: "0.3px" }}>{t.roiDelay}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#7C3AED", fontVariantNumeric: "tabular-nums" }}>{delayRate}%</span>
                    </div>
                    <input type="range" min="3" max="45" value={delayRate} onChange={(e) => setDelayRate(Number(e.target.value))} className="zr-slider" />
                  </div>
                  <div style={{ color: themeColor }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: T.muted, letterSpacing: "0.3px" }}>{t.roiRecovery}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: themeColor, fontVariantNumeric: "tabular-nums" }}>{recoveryRate}%</span>
                    </div>
                    <input type="range" min="10" max="65" value={recoveryRate} onChange={(e) => setRecoveryRate(Number(e.target.value))} className="zr-slider" />
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: 28, padding: 26, background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")", color: "#fff", boxShadow: "0 30px 80px rgba(58,5,9,.24)" }}>
                <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px" }}>
                  {t.impactTitle}
                </div>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ padding: 18, borderRadius: 20, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.15)", boxShadow: leakPulse ? "0 0 0 3px rgba(255,26,42,.35)" : "none", transition: "box-shadow .3s ease" }}>
                    <div style={{ opacity: 0.7, fontSize: 12, fontWeight: 800 }}>{t.impactMonthly}</div>
                    <div style={numberStyle(leakPulse)}>{fmt(estimatedLeakage)}</div>
                  </div>
                  <div style={{ padding: 18, borderRadius: 20, background: "rgba(16,185,129,.18)", border: "1px solid rgba(16,185,129,.30)", boxShadow: recoverPulse ? "0 0 0 3px rgba(110,231,183,.50)" : "none", transition: "box-shadow .3s ease" }}>
                    <div style={{ opacity: 0.85, fontSize: 12, fontWeight: 800 }}>{t.impactRecover}</div>
                    <div style={{ ...numberStyle(recoverPulse), color: "#6EE7B7" }}>{fmt(recoverableCash)}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1", padding: 22, borderRadius: 22, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.16)", boxShadow: annualPulse ? "0 0 0 3px rgba(255,255,255,.35)" : "none", transition: "box-shadow .3s ease" }}>
                    <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 800 }}>{t.impactAnnual}</div>
                    <div style={{ ...numberStyle(annualPulse), fontSize: 42, color: "#fff", letterSpacing: "-0.03em" }}>
                      {fmt(annualImpact)}
                    </div>
                    <div style={{ marginTop: 10, opacity: 0.78, fontSize: 13, lineHeight: 1.55, fontWeight: 700 }}>
                      {t.impactNote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHOCK STRIP - bridges calculator to pricing */}
          <div style={{ borderRadius: 24, padding: "20px 28px", marginBottom: 28, background: "linear-gradient(135deg, rgba(227,10,23,.06), rgba(245,158,11,.06))", border: "1px solid " + T.hairline, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", boxShadow: "0 18px 44px rgba(58,5,9,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 auto", flexWrap: "wrap" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: T.muted, letterSpacing: "1.3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {t.shockBased}
              </div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.redDeep, fontVariantNumeric: "tabular-nums" }}>
                  {t.shockLosing.replace("{amt}", fmt(estimatedLeakage))}
                </div>
                <span style={{ color: T.muted, fontWeight: 800 }}>{"\u2022"}</span>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.emerald, fontVariantNumeric: "tabular-nums" }}>
                  {t.shockRecover.replace("{amt}", fmt(recoverableCash))}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: themeColor, padding: "8px 14px", borderRadius: 999, background: "#fff", border: "1px solid " + T.hairline, whiteSpace: "nowrap" }}>
              {t.shockStart.replace("{price}", currencyPos === "prefix" ? currencySymbol + growthPriceNow : growthPriceNow + currencySymbol)}
            </div>
          </div>

          {/* PLANS HEADING + BILLING TOGGLE */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 3.4vw, 40px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
              {t.plansTitle}
            </h2>
            <p style={{ marginTop: 12, color: T.muted, fontSize: 15, lineHeight: 1.65, fontWeight: 600 }}>
              {t.plansSub}
            </p>

            {/* Country / region selector */}
            <div
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(0,0,0,.04)",
                border: "1px solid " + T.hairline,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: T.muted,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {lang === "TR" ? "Bölge" : lang === "AR" ? "المنطقة" : "Region"}
              </span>
              <select
                value={pricingCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 14,
                  fontWeight: 900,
                  color: T.ink,
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "inherit",
                  appearance: "none",
                  paddingRight: 22,
                  backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2210%22 height%3D%226%22 viewBox%3D%220 0 10 6%22%3E%3Cpath fill%3D%22%23999%22 d%3D%22M5 6L0 0h10z%22%2F%3E%3C%2Fsvg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                }}
              >
                {SUPPORTED_COUNTRIES.map((code) => {
                  const cp = COUNTRY_PROFILES[code];
                  const cName = (cp.name && cp.name[lang]) || cp.name.EN || code;
                  return (
                    <option key={code} value={code}>
                      {cName} ({cp.currency})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Billing toggle */}
            <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 6, padding: 5, borderRadius: 999, background: "rgba(255,255,255,.95)", border: "1px solid " + T.hairline, boxShadow: "0 14px 32px rgba(58,5,9,.06)" }}>
              <button onClick={() => setBillingYearly(false)} style={{ padding: "10px 20px", borderRadius: 999, border: 0, cursor: "pointer", fontSize: 13, fontWeight: 900, fontFamily: "inherit", background: !billingYearly ? ctaGradient : "transparent", color: !billingYearly ? "#fff" : T.muted, transition: "all .25s ease", boxShadow: !billingYearly ? ctaShadow : "none" }}>
                {t.billingMonthly}
              </button>
              <button onClick={() => setBillingYearly(true)} style={{ padding: "10px 20px", borderRadius: 999, border: 0, cursor: "pointer", fontSize: 13, fontWeight: 900, fontFamily: "inherit", background: billingYearly ? ctaGradient : "transparent", color: billingYearly ? "#fff" : T.muted, transition: "all .25s ease", boxShadow: billingYearly ? ctaShadow : "none", display: "flex", alignItems: "center", gap: 8 }}>
                {t.billingYearly}
                <span style={{ padding: "2px 8px", borderRadius: 999, background: billingYearly ? "rgba(255,255,255,.22)" : "rgba(16,185,129,.18)", color: billingYearly ? "#fff" : C.emerald, fontSize: 10, fontWeight: 900, letterSpacing: "0.3px" }}>
                  {t.saveBadge}
                </span>
              </button>
            </div>
          </div>

          {/* PRICING CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, alignItems: "stretch", paddingTop: 28 }}>
            {plans.map((p, idx) => {
              const hot = idx === 1;
              const isCustom = p.priceMonthly == null;
              const priceNum = billingYearly ? p.priceYearly : p.priceMonthly;
              const priceLabel = isCustom ? p.priceLabel : (currencyPos === "prefix" ? currencySymbol + priceNum : priceNum + currencySymbol);
              const yearlyTotal = isCustom ? 0 : (p.priceMonthly - p.priceYearly) * 12;

              const cardStyle = {
                borderRadius: 30,
                padding: 30,
                position: "relative",
                transform: hot ? "scale(1.06) translateY(-12px)" : "none",
                border: hot ? "2px solid " + themeColor : "1px solid " + T.hairline,
                background: hot ? "linear-gradient(180deg, " + themeColor + " 0%, " + themeDeep + " 100%)" : "rgba(255,255,255,.92)",
                color: hot ? "#fff" : T.ink,
                boxShadow: hot ? (isArabic ? "0 40px 110px rgba(0,108,53,.32)" : "0 40px 120px rgba(227,10,23,.35)") : "0 20px 50px rgba(58,5,9,.08)",
                backdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                zIndex: hot ? 2 : 1,
                transition: "transform .3s ease",
              };

              return (
                <div key={p.name} style={cardStyle}>
                  {hot && (
                    <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", padding: "8px 14px", borderRadius: 999, background: "#fff", color: themeColor, fontSize: 11, fontWeight: 900, letterSpacing: "1.2px", boxShadow: "0 16px 34px rgba(58,5,9,.16)", whiteSpace: "nowrap" }}>
                      {t.bestValue}
                    </div>
                  )}
                  <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>{p.name}</h3>
                  <p style={{ margin: "8px 0 0", color: hot ? "rgba(255,255,255,.78)" : T.muted, fontSize: 14, lineHeight: 1.6, fontWeight: 700 }}>
                    {p.line}
                  </p>
                  <div style={{ marginTop: 22, display: "flex", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ fontSize: isCustom ? 36 : 50, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Inter Tight', sans-serif" }}>
                      {priceLabel}
                    </div>
                    {!isCustom && (
                      <div style={{ paddingBottom: 8, color: hot ? "rgba(255,255,255,.7)" : T.muted, fontWeight: 800, fontSize: 13 }}>
                        {billingYearly ? t.perYear : t.perMonth}
                      </div>
                    )}
                  </div>
                  {!isCustom && billingYearly && yearlyTotal > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 800, color: hot ? "rgba(255,255,255,.85)" : C.emerald, letterSpacing: "0.3px" }}>
                      {t.yearlySavings.replace("{amt}", currencyPos === "prefix" ? currencySymbol + yearlyTotal : yearlyTotal + currencySymbol)}
                    </div>
                  )}
                  {hot && (
                    <>
                      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.20)", fontSize: 12, fontWeight: 800, lineHeight: 1.5 }}>
                        {t.growthHint}
                      </div>
                      <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.15)", fontSize: 11, fontWeight: 700, lineHeight: 1.45, color: "rgba(255,255,255,.95)" }}>
                        {t.growthPressure}
                      </div>
                    </>
                  )}
                  <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                    {p.items.map((x, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: hot ? "#fff" : T.ink, fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>
                        <span style={{ color: hot ? "#fff" : themeColor, fontSize: 14, fontWeight: 900, lineHeight: 1.3, flexShrink: 0 }}>{"\u2713"}</span>
                        <span>{x}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={isCustom ? "/contact" : "/onboarding"}
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 54,
                      borderRadius: 16,
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 900,
                      background: hot ? "#fff" : ctaGradient,
                      color: hot ? T.ink : "#fff",
                      boxShadow: hot ? "0 18px 44px rgba(0,0,0,.18)" : ctaShadow,
                      letterSpacing: "0.2px",
                    }}
                  >
                    {p.cta} {"\u2192"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* VALUE COMPARISON */}
          <div style={{ ...card, padding: 36, marginTop: 80 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div style={{ color: themeColor, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.cmpBadge}
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(28px, 3.4vw, 38px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                {t.cmpTitle}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ borderRadius: 24, padding: 24, background: "rgba(0,0,0,.035)", border: "1px solid " + T.hairline }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.cmpWithout}</h3>
                <p style={{ margin: "10px 0 16px", color: T.muted, fontWeight: 600, lineHeight: 1.65, fontSize: 14 }}>
                  {t.cmpWithoutDesc}
                </p>
                <div style={{ color: themeColor, fontSize: 26, fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {t.cmpWithoutTag.replace("{amt}", fmt(estimatedLeakage))}
                </div>
              </div>
              <div style={{ borderRadius: 24, padding: 24, background: "rgba(16,185,129,.10)", border: "1px solid rgba(16,185,129,.22)" }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{t.cmpWith}</h3>
                <p style={{ margin: "10px 0 16px", color: T.muted, fontWeight: 600, lineHeight: 1.65, fontSize: 14 }}>
                  {t.cmpWithDesc}
                </p>
                <div style={{ color: C.emerald, fontSize: 26, fontWeight: 900, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {t.cmpWithTag.replace("{amt}", fmt(recoverableCash))}
                </div>
              </div>
            </div>
          </div>

          {/* TRUST */}
          <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {t.trustItems.map((x, i) => (
              <div key={i} style={{ borderRadius: 18, padding: 16, background: "#fff", border: "1px solid " + T.hairline, textAlign: "center", fontWeight: 900, fontSize: 13, color: T.ink, boxShadow: "0 14px 32px rgba(58,5,9,.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ color: themeColor }}>{"\u2713"}</span>
                <span>{x}</span>
              </div>
            ))}
          </div>

          {/* FINAL CTA */}
          <div style={{ marginTop: 72, padding: 48, borderRadius: 36, background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")", color: "#fff", textAlign: "center", boxShadow: "0 34px 90px rgba(58,5,9,.26)" }}>
            <div style={{ opacity: 0.75, fontSize: 12, fontWeight: 900, letterSpacing: "1.5px", marginBottom: 10 }}>
              {"\u26A0 " + t.finalBadge}
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 3.6vw, 42px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.2, maxWidth: 920, marginInline: "auto" }}>
              {t.finalTitle}
            </h2>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link to="/onboarding" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "20px 32px", color: T.ink, background: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 900 }}>
                {t.finalCta1}
              </Link>
              <Link to="/ai-analysis" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 22, padding: "19px 30px", color: "#fff", background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.18)", textDecoration: "none", fontSize: 16, fontWeight: 900 }}>
                {t.finalCta2}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

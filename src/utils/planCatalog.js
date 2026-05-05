// ================================================================
// Zyrix FinSuite - Plan Catalog
// Single source of truth for pricing plans, features, and provisioning.
//
// Plans match Logo Isbasi competitive structure:
//   1. eDonusum     - e-Fatura focused (463 TR / month)
//   2. onMuhasebe   - Pre-accounting focused (463 TR / month)
//   3. pro          - Both combined + Zyrix exclusives (738 TR / month) [POPULAR]
//
// Each plan has 3 feature tiers:
//   logoFeatures   - parity with Logo Isbasi
//   zyrixExclusive - Zyrix unique advantages
//   comingSoon     - Tier 1 features (60-day roadmap)
//
// Auto-provisioning ready: when wired to backend, plan selection
// triggers tenant creation with feature flags pre-enabled.
// ================================================================

export const PLAN_IDS = {
  E_DONUSUM:     "eDonusum",
  ON_MUHASEBE:   "onMuhasebe",
  PRO:           "pro",
};

// ----------------------------------------------------------------
// Country-specific pricing (TR matches Logo exactly)
// All values are MONTHLY. Yearly = 80% of monthly (20% off).
// ----------------------------------------------------------------
export const PLAN_PRICING = {
  TR: {
    eDonusum:   { monthly: 463, yearly: 370 },
    onMuhasebe: { monthly: 463, yearly: 370 },
    pro:        { monthly: 738, yearly: 590 },
  },
  SA: {
    eDonusum:   { monthly: 99,  yearly: 79  },
    onMuhasebe: { monthly: 99,  yearly: 79  },
    pro:        { monthly: 159, yearly: 127 },
  },
  AE: {
    eDonusum:   { monthly: 99,  yearly: 79  },
    onMuhasebe: { monthly: 99,  yearly: 79  },
    pro:        { monthly: 159, yearly: 127 },
  },
  EG: {
    eDonusum:   { monthly: 599, yearly: 479 },
    onMuhasebe: { monthly: 599, yearly: 479 },
    pro:        { monthly: 949, yearly: 759 },
  },
  KW: {
    eDonusum:   { monthly: 9,   yearly: 7   },
    onMuhasebe: { monthly: 9,   yearly: 7   },
    pro:        { monthly: 14,  yearly: 11  },
  },
  QA: {
    eDonusum:   { monthly: 99,  yearly: 79  },
    onMuhasebe: { monthly: 99,  yearly: 79  },
    pro:        { monthly: 159, yearly: 127 },
  },
  BH: {
    eDonusum:   { monthly: 11,  yearly: 9   },
    onMuhasebe: { monthly: 11,  yearly: 9   },
    pro:        { monthly: 17,  yearly: 14  },
  },
  OM: {
    eDonusum:   { monthly: 11,  yearly: 9   },
    onMuhasebe: { monthly: 11,  yearly: 9   },
    pro:        { monthly: 17,  yearly: 14  },
  },
  JO: {
    eDonusum:   { monthly: 21,  yearly: 17  },
    onMuhasebe: { monthly: 21,  yearly: 17  },
    pro:        { monthly: 33,  yearly: 26  },
  },
  US: {
    eDonusum:   { monthly: 29,  yearly: 23  },
    onMuhasebe: { monthly: 29,  yearly: 23  },
    pro:        { monthly: 49,  yearly: 39  },
  },
};

// ----------------------------------------------------------------
// Plan metadata (trilingual)
// ----------------------------------------------------------------
export const PLAN_META = {
  eDonusum: {
    badge: null,
    name: {
      TR: "e-Donusum Paketi",
      EN: "e-Invoicing Plan",
      AR: "باقة الفوترة الإلكترونية",
    },
    tagline: {
      TR: "e-Fatura, e-Arsiv ve dijital donusum icin eksiksiz cozum.",
      EN: "Complete e-Invoice, e-Archive, and digital transformation suite.",
      AR: "حل متكامل للفواتير الإلكترونية والأرشفة الرقمية.",
    },
  },
  onMuhasebe: {
    badge: null,
    name: {
      TR: "On Muhasebe Paketi",
      EN: "Pre-Accounting Plan",
      AR: "باقة المحاسبة الأمامية",
    },
    tagline: {
      TR: "Fatura, stok, kasa ve nakit akisi yonetimi tek panelde.",
      EN: "Invoices, inventory, cashbox, and cashflow management in one panel.",
      AR: "إدارة الفواتير والمخزون والكاش والتدفق النقدي في لوحة واحدة.",
    },
  },
  pro: {
    badge: {
      TR: "EN COK TERCIH EDILEN",
      EN: "MOST POPULAR",
      AR: "الأكثر اختياراً",
    },
    name: {
      TR: "e-Donusum + On Muhasebe Pro",
      EN: "e-Invoicing + Pre-Accounting Pro",
      AR: "باقة برو الشاملة",
    },
    tagline: {
      TR: "Tum ozelliker + Zyrix\u2019e ozel AI gucu + yakinda gelen yenilikler.",
      EN: "Everything + Zyrix-exclusive AI power + upcoming innovations.",
      AR: "كل المزايا + ذكاء Zyrix الحصري + الابتكارات القادمة.",
    },
  },
};

// ----------------------------------------------------------------
// Feature catalog per plan (3 tiers x 3 languages)
//
// Tiers:
//   logoFeatures   - what Logo Isbasi offers (we match)
//   zyrixExclusive - Zyrix unique advantages (we win)
//   comingSoon     - Tier 1 features (60-day roadmap)
// ----------------------------------------------------------------
export const PLAN_FEATURES = {
  eDonusum: {
    logoFeatures: {
      TR: [
        "Yillik 1000 e-Belge Kontor Hediyesi",
        "Ucretsiz e-Fatura/e-SMM Gecis Danismanligi",
        "Ucretsiz e-Irsaliye Gecis Danismanligi",
        "Mobil ve Web\u2019den e-Fatura/e-Arsiv/e-SMM",
        "Mobil ve Web\u2019den e-Irsaliye Gonderimi",
        "Gelen ve Giden e-Faturalarin Takibi",
        "e-Fatura Kabul ve Ret Islemleri",
        "Ucretsiz Android ve iOS Mobil Uygulama",
        "Mali Musavir Paneli",
        "e-Ticaret Entegrasyonu",
        "Online Tahsilat Entegrasyonu",
      ],
      EN: [
        "1000 e-Document credits / year (gift)",
        "Free e-Invoice / e-Receipt transition consulting",
        "Free e-Waybill transition consulting",
        "e-Invoice / e-Archive / e-Receipt from Mobile and Web",
        "e-Waybill submission from Mobile and Web",
        "Incoming and outgoing e-Invoice tracking",
        "e-Invoice accept/reject operations",
        "Free Android and iOS mobile app",
        "Accountant Panel",
        "E-commerce integration",
        "Online card payment integration",
      ],
      AR: [
        "1000 وثيقة إلكترونية سنوياً (هدية)",
        "استشارة مجانية للانتقال إلى الفاتورة الإلكترونية",
        "استشارة مجانية للانتقال إلى بوليصة الشحن الإلكترونية",
        "إصدار الفواتير من الجوال والويب",
        "إرسال بوالص الشحن الإلكترونية",
        "تتبع الفواتير الواردة والصادرة",
        "قبول ورفض الفواتير الإلكترونية",
        "تطبيق مجاني لـ Android و iOS",
        "لوحة المحاسب القانوني",
        "تكامل التجارة الإلكترونية",
        "تكامل التحصيل الإلكتروني",
      ],
    },
    zyrixExclusive: {
      TR: [
        "Otomatik Anında Aktivasyon (sıfır kurulum)",
        "Trilingual destek (TR / EN / AR)",
        "Multi-Country: Turkiye + Suudi + BAE",
        "Premium V2 tasarim sistemi",
        "WhatsApp Native Faturalama",
        "Akilli Fis Okuma OCR",
      ],
      EN: [
        "Instant auto-activation (zero setup)",
        "Trilingual support (TR / EN / AR)",
        "Multi-country: Turkey + Saudi + UAE",
        "Premium V2 design system",
        "WhatsApp-native invoicing",
        "Smart Receipt OCR scanner",
      ],
      AR: [
        "تفعيل تلقائي فوري (بدون إعداد)",
        "دعم ثلاثي اللغات (TR / EN / AR)",
        "متعدد الدول: تركيا + السعودية + الإمارات",
        "نظام تصميم V2 المميز",
        "إرسال الفواتير عبر واتساب",
        "ماسح الفواتير الذكي OCR",
      ],
    },
  },
  onMuhasebe: {
    logoFeatures: {
      TR: [
        "e-Arsiv Fatura Duzenleme",
        "Alis/Satis Faturasi Duzenleme",
        "Borc ve Alacak Takibi",
        "Teklif ve Siparis Olusturma",
        "Stok ve Urun Takibi",
        "Tahsilat ve Odeme Takibi",
        "Kasa Takibi",
        "Banka Takibi",
        "Cek Giris/Cikis Islem Takibi",
        "Akilli Fis Okuma",
        "Banka Entegrasyonu (17 banka)",
        "CRM Entegrasyonu",
        "e-Ticaret Entegrasyonu",
      ],
      EN: [
        "e-Archive invoice creation",
        "Purchase / sales invoice creation",
        "Accounts payable / receivable tracking",
        "Quote and order creation",
        "Stock and product tracking",
        "Collection and payment tracking",
        "Cashbox tracking",
        "Bank tracking",
        "Cheque in/out operations",
        "Smart receipt OCR",
        "Bank integration (17 banks)",
        "CRM integration",
        "E-commerce integration",
      ],
      AR: [
        "إصدار فواتير الأرشيف الإلكتروني",
        "فواتير الشراء والبيع",
        "تتبع الذمم المدينة والدائنة",
        "إنشاء العروض والطلبات",
        "تتبع المخزون والمنتجات",
        "تتبع التحصيل والمدفوعات",
        "إدارة الكاش",
        "تتبع البنوك",
        "إدارة الشيكات",
        "ماسح الفواتير الذكي",
        "تكامل مع 17 بنك",
        "تكامل CRM",
        "تكامل التجارة الإلكترونية",
      ],
    },
    zyrixExclusive: {
      TR: [
        "Yerlesik Zyrix CRM (entegrasyon degil, native)",
        "Zyrix Pay - 12 odeme yontemi",
        "AI nakit akisi tahminlemesi",
        "AI CFO Dashboard",
        "Otomatik Anında Aktivasyon",
        "Trendyol Otomatik Mutabakat",
        "Tahminsel Nakit Krizi Uyarilari",
      ],
      EN: [
        "Native Zyrix CRM (not integration)",
        "Zyrix Pay - 12 payment methods",
        "AI cashflow forecasting",
        "AI CFO Dashboard",
        "Instant auto-activation",
        "Trendyol auto-reconciliation",
        "Predictive cash crisis alerts",
      ],
      AR: [
        "CRM زيركس مدمج (وليس تكاملاً)",
        "Zyrix Pay - 12 طريقة دفع",
        "تنبؤات التدفق النقدي بالذكاء الاصطناعي",
        "لوحة المدير المالي الذكية AI CFO",
        "تفعيل تلقائي فوري",
        "تسوية تلقائية مع Trendyol",
        "تنبيهات التنبؤ بأزمات التدفق النقدي",
      ],
    },
  },
  pro: {
    logoFeatures: {
      TR: [
        "e-Donusum + On Muhasebe paketlerinin TUM ozellikler",
        "1 Yillik E-Imza HEDIYE",
        "Yillik 1000 e-Belge Kontor Hediyesi",
        "Ucretsiz Gecis Danismanligi",
        "Mali Musavir Paneli",
        "Banka Entegrasyonu (17 banka)",
        "Akilli Fis Okuma",
        "CRM Entegrasyonu",
      ],
      EN: [
        "ALL features of e-Invoicing + Pre-Accounting plans",
        "1-Year E-Signature FREE",
        "1000 e-Document credits / year",
        "Free transition consulting",
        "Accountant Panel",
        "Bank integration (17 banks)",
        "Smart receipt OCR",
        "CRM integration",
      ],
      AR: [
        "كل مزايا الباقتين معاً",
        "توقيع إلكتروني مجاني لمدة سنة",
        "1000 وثيقة إلكترونية سنوياً",
        "استشارة انتقال مجانية",
        "لوحة المحاسب القانوني",
        "تكامل مع 17 بنك",
        "ماسح الفواتير الذكي",
        "تكامل CRM",
      ],
    },
    zyrixExclusive: {
      TR: [
        "AI CFO Dashboard - tum nakit akisi tek bakista",
        "Yerlesik Zyrix CRM (Pipeline + Anlasma + Sadakat)",
        "Zyrix Pay (Mada, STCPay, iyzico, PayTR, Stripe + 7 daha)",
        "Multi-Country tax engine (TR/SA/AE)",
        "Ulkeye duyarli para birimi zekasi",
        "Trilingual platform (TR/EN/AR + RTL)",
        "Premium V2 tasarim sistemi",
        "Cok bankali Smart Retry odeme kurtarma",
        "Otomatik Anında Aktivasyon",
        "WhatsApp Native Faturalama",
        "AI CFO Sesli Asistan - Turkce",
        "Tahminsel Nakit Krizi Uyarilari",
        "Trendyol/Hepsiburada Otomatik Mutabakat",
        "Akilli Mali Musavir Aylik Ozet",
      ],
      EN: [
        "AI CFO Dashboard - all cashflow at a glance",
        "Native Zyrix CRM (Pipeline + Deals + Loyalty)",
        "Zyrix Pay (Mada, STCPay, iyzico, PayTR, Stripe + 7 more)",
        "Multi-Country tax engine (TR/SA/AE)",
        "Country-aware currency intelligence",
        "Trilingual platform (TR/EN/AR + RTL)",
        "Premium V2 design system",
        "Multi-bank Smart Retry payment recovery",
        "Instant auto-activation",
        "WhatsApp-native invoicing",
        "AI CFO Voice Assistant - Turkish",
        "Predictive cash crisis alerts",
        "Trendyol/Hepsiburada auto-reconciliation",
        "Smart Mali Musavir monthly export",
      ],
      AR: [
        "لوحة AI CFO - كل التدفق النقدي في نظرة",
        "CRM زيركس مدمج (خط أنابيب + صفقات + ولاء)",
        "Zyrix Pay - 12 طريقة دفع",
        "محرك ضرائب متعدد الدول",
        "ذكاء العملة حسب الدولة",
        "منصة ثلاثية اللغة + RTL",
        "نظام تصميم V2 المميز",
        "إعادة محاولة دفع ذكية متعددة البنوك",
        "تفعيل تلقائي فوري",
        "إرسال الفواتير عبر واتساب",
        "مساعد AI CFO الصوتي بالتركية",
        "تنبيهات التنبؤ بأزمات التدفق النقدي",
        "تسوية تلقائية مع Trendyol/Hepsiburada",
        "ملخص شهري ذكي للمحاسب",
      ],
    },
  },
};

// ----------------------------------------------------------------
// Section labels for the 3 feature tiers (trilingual)
// ----------------------------------------------------------------
export const TIER_LABELS = {
  logoFeatures: {
    TR: "Logo Isbasi Muadili",
    EN: "Logo Isbasi Equivalent",
    AR: "مكافئ Logo İşbaşı",
  },
  zyrixExclusive: {
    TR: "Zyrix\u2019e Ozel",
    EN: "Zyrix Exclusive",
    AR: "حصري في Zyrix",
  },
};

// ----------------------------------------------------------------
// CTA labels (trilingual)
// ----------------------------------------------------------------
export const CTA_LABELS = {
  activate: {
    TR: "Aninda Aktif Et",
    EN: "Activate Instantly",
    AR: "تفعيل فوري",
  },
  freeTrial: {
    TR: "14 gun ucretsiz dene",
    EN: "14-day free trial",
    AR: "تجربة مجانية 14 يوم",
  },
};

// ================================================================
// Helper functions
// ================================================================

/**
 * Get pricing for a plan in a country.
 * Falls back to TR pricing if country not found.
 */
export function getPlanPrice(planId, countryCode, billingCycle) {
  const country = (countryCode || "TR").toUpperCase();
  const cyclekey = billingCycle === "yearly" ? "yearly" : "monthly";
  const countryPricing = PLAN_PRICING[country] || PLAN_PRICING.TR;
  const planPricing = countryPricing[planId];
  if (!planPricing) return null;
  return planPricing[cyclekey];
}

/**
 * Get features for a plan in a language, organized by tier.
 */
export function getPlanFeatures(planId, lang) {
  const lng = lang || "EN";
  const features = PLAN_FEATURES[planId];
  if (!features) return { logoFeatures: [], zyrixExclusive: [] };
  return {
    logoFeatures:   features.logoFeatures[lng]   || features.logoFeatures.EN   || [],
    zyrixExclusive: features.zyrixExclusive[lng] || features.zyrixExclusive.EN || [],
  };
}

/**
 * Get a plan name in a language.
 */
export function getPlanName(planId, lang) {
  const lng = lang || "EN";
  const meta = PLAN_META[planId];
  if (!meta) return planId;
  return meta.name[lng] || meta.name.EN || planId;
}

/**
 * Get a plan tagline in a language.
 */
export function getPlanTagline(planId, lang) {
  const lng = lang || "EN";
  const meta = PLAN_META[planId];
  if (!meta) return "";
  return meta.tagline[lng] || meta.tagline.EN || "";
}

/**
 * Get the popular badge text for a plan, or null if not popular.
 */
export function getPlanBadge(planId, lang) {
  const lng = lang || "EN";
  const meta = PLAN_META[planId];
  if (!meta || !meta.badge) return null;
  return meta.badge[lng] || meta.badge.EN || null;
}

/**
 * Get a tier label in a language.
 */
export function getTierLabel(tier, lang) {
  const lng = lang || "EN";
  const labels = TIER_LABELS[tier];
  if (!labels) return tier;
  return labels[lng] || labels.EN || tier;
}

/**
 * Get a CTA label in a language.
 */
export function getCtaLabel(key, lang) {
  const lng = lang || "EN";
  const labels = CTA_LABELS[key];
  if (!labels) return key;
  return labels[lng] || labels.EN || key;
}

/**
 * Auto-provisioning placeholder.
 * To be wired to backend in Phase B.
 * For now, redirects to /onboarding with plan param.
 */
// ============================================================
// Backend API base URL for FinSuite auto-provisioning
// Stage 8 Phase B
// ============================================================
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_FINSUITE_API_BASE) ||
  "https://finsuite-backend-production.up.railway.app";

/**
 * Pluggable signup-modal opener.
 * The default implementation does a window.prompt() fallback so the
 * marketing site keeps working even before SignupModal.jsx is mounted.
 * PricingPage will replace this at runtime via setSignupModalOpener().
 */
let _openSignupModal = async function defaultOpener(prefill) {
  if (typeof window === "undefined") return null;
  const name = window.prompt("Adiniz Soyadiniz / Full name");
  if (!name) return null;
  const email = window.prompt("E-posta / Email");
  if (!email) return null;
  const phone = window.prompt("Telefon (+905...) / Phone");
  if (!phone) return null;
  const password = window.prompt("Sifre (min 8, harf+rakam) / Password");
  if (!password) return null;
  const businessName = window.prompt("Sirket adi (optional)") || undefined;
  return { name, email, phone, password, businessName };
};

export function setSignupModalOpener(fn) {
  if (typeof fn === "function") _openSignupModal = fn;
}

/**
 * Activate a plan: open signup modal, POST to backend, store JWT,
 * redirect to dashboard. Returns { success, error? } so callers can
 * show a toast on failure.
 */
export async function activatePlan(planId, options) {
  const opts = options || {};
  const billing  = opts.billing  || "monthly";
  const country  = opts.country  || "TR";
  const language = opts.language || "TR";

  // Helper: publish the final outcome to whoever is awaiting it
  // (PricingPage uses window.__zyrixActivationOutcome to flip modal view)
  function publish(outcome) {
    if (typeof window !== "undefined" && typeof window.__zyrixActivationOutcome === "function") {
      try { window.__zyrixActivationOutcome(outcome); } catch (e) { /* ignore */ }
    }
    return outcome;
  }

  // 1. Collect signup credentials
  const credentials = await _openSignupModal({ planId, billing, country, language });
  if (!credentials) {
    // User cancelled BEFORE modal handed control to outcome promise -
    // do NOT publish (would never be awaited).
    return { success: false, cancelled: true };
  }

  // 2. POST to backend
  let response;
  try {
    response = await fetch(API_BASE + "/api/plans/provision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": language,
      },
      body: JSON.stringify({
        planId,
        billing,
        country,
        language,
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        password: credentials.password,
        businessName: credentials.businessName,
      }),
    });
  } catch (err) {
    return publish({ success: false, error: "Network error. Please try again." });
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    return publish({ success: false, error: "Server error. Please try again." });
  }

  if (!response.ok || !data || !data.success) {
    const message =
      (data && data.error) ||
      "Provisioning failed. Please try again.";
    return publish({ success: false, error: message, status: response.status });
  }

  // 3. Persist JWT + merchant snapshot for the dashboard
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("finsuite_token", data.data.token);
      window.localStorage.setItem(
        "finsuite_user",
        JSON.stringify(data.data.merchant)
      );
    } catch (e) {
      // ignore storage failures (quota, private mode)
    }
  }

  // 4. Return rich success object. The caller (modal) decides what to
  //    show. Auto-redirect is intentionally disabled until the FinSuite
  //    dashboard is live on a separate domain.
  const redirectTo =
    (data.data && data.data.redirectTo) || "/dashboard?welcome=1";

  return publish({
    success: true,
    merchant: data.data.merchant,
    subscription: data.data.subscription,
    featuresEnabled: data.data.featuresEnabled || [],
    token: data.data.token,
    redirectTo,
  });
}

// Default export = all helpers
export default {
  PLAN_IDS,
  PLAN_PRICING,
  PLAN_META,
  PLAN_FEATURES,
  TIER_LABELS,
  CTA_LABELS,
  getPlanPrice,
  getPlanFeatures,
  getPlanName,
  getPlanTagline,
  getPlanBadge,
  getTierLabel,
  getCtaLabel,
  activatePlan,
  setSignupModalOpener,
};

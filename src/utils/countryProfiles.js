// ================================================================
// Zyrix FinSuite — Country Profiles
// Single source of truth for country-specific configuration:
//   language, currency, tax, compliance, regions, e-invoice system,
//   phone code, date format.
//
// Used by: useCountry hook, RegisterPage, Onboarding, Pricing,
//          Settings, Dashboard, footer compliance badges, etc.
//
// Adding a new country: just add a new entry below. Everything
// else (forms, dropdowns, currency display, etc.) updates
// automatically because they read from this file.
// ================================================================

export const COUNTRY_PROFILES = {
  // ============================================================
  // TURKEY
  // ============================================================
  TR: {
    code: "TR",
    name: { TR: "Türkiye",        AR: "تركيا",          EN: "Turkey"        },
    lang: "TR",
    currency: "TRY",
    currencySymbol: "₺",
    currencyName: { TR: "Türk Lirası", AR: "ليرة تركية", EN: "Turkish Lira" },
    phoneCode: "+90",
    phonePlaceholder: "+90 532 123 4567",
    dateFormat: "DD/MM/YYYY",
    weekStart: "monday",

    // Tax system
    tax: {
      name: "KDV",
      fullName: { TR: "Katma Değer Vergisi", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 20,
      additionalRates: [1, 10, 20],
    },

    // Compliance
    compliance: {
      dataProtection: "KVKK",
      dataProtectionFullName: { TR: "KVKK", AR: "KVKK (التركي)", EN: "KVKK (Turkish GDPR)" },
      eInvoice: "e-Fatura",
      eInvoiceAuthority: { TR: "GİB", AR: "GİB", EN: "GIB" },
      eInvoiceCompleteName: { TR: "GİB e-Fatura", AR: "GİB e-Fatura", EN: "Turkish e-Invoice (GIB)" },
    },

    // Regions / cities (81 provinces)
    regions: [
      "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya",
      "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir",
      "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis",
      "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
      "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
      "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
      "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş",
      "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis",
      "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya",
      "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
      "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya",
      "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas",
      "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van",
      "Yalova", "Yozgat", "Zonguldak"
    ],
    regionType: { TR: "İl",        AR: "محافظة",   EN: "Province"  },
    defaultRegion: "İstanbul",
  },

  // ============================================================
  // SAUDI ARABIA
  // ============================================================
  SA: {
    code: "SA",
    name: { TR: "Suudi Arabistan", AR: "السعودية",       EN: "Saudi Arabia" },
    lang: "AR",
    currency: "SAR",
    currencySymbol: "ر.س",
    currencyName: { TR: "Suudi Riyali", AR: "ريال سعودي", EN: "Saudi Riyal" },
    phoneCode: "+966",
    phonePlaceholder: "+966 50 123 4567",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "VAT",
      fullName: { TR: "KDV", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 15,
      additionalRates: [0, 15],
    },

    compliance: {
      dataProtection: "PDPL",
      dataProtectionFullName: { TR: "PDPL (Suudi)", AR: "نظام حماية البيانات الشخصية", EN: "Personal Data Protection Law" },
      eInvoice: "ZATCA",
      eInvoiceAuthority: { TR: "ZATCA", AR: "هيئة الزكاة والضريبة والجمارك", EN: "ZATCA" },
      eInvoiceCompleteName: { TR: "ZATCA e-Fatura", AR: "فاتورة ZATCA الإلكترونية", EN: "ZATCA e-Invoice" },
    },

    // 13 regions of Saudi Arabia
    regions: [
      "الرياض", "مكة المكرمة", "المدينة المنورة", "القصيم",
      "المنطقة الشرقية", "عسير", "تبوك", "حائل",
      "الحدود الشمالية", "جازان", "نجران", "الباحة", "الجوف"
    ],
    regionType: { TR: "Bölge", AR: "منطقة", EN: "Region" },
    defaultRegion: "الرياض",
  },

  // ============================================================
  // UAE
  // ============================================================
  AE: {
    code: "AE",
    name: { TR: "BAE",           AR: "الإمارات",       EN: "United Arab Emirates" },
    lang: "AR",
    currency: "AED",
    currencySymbol: "د.إ",
    currencyName: { TR: "BAE Dirhemi", AR: "درهم إماراتي", EN: "UAE Dirham" },
    phoneCode: "+971",
    phonePlaceholder: "+971 50 123 4567",
    dateFormat: "DD/MM/YYYY",
    weekStart: "monday",

    tax: {
      name: "VAT",
      fullName: { TR: "KDV", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 5,
      additionalRates: [0, 5],
    },

    compliance: {
      dataProtection: "UAE PDPL",
      dataProtectionFullName: { TR: "PDPL (BAE)", AR: "قانون حماية البيانات الإماراتي", EN: "UAE PDPL" },
      eInvoice: "FTA",
      eInvoiceAuthority: { TR: "FTA", AR: "الهيئة الاتحادية للضرائب", EN: "FTA" },
      eInvoiceCompleteName: { TR: "FTA e-Fatura", AR: "فاتورة FTA الإلكترونية", EN: "FTA e-Invoice" },
    },

    regions: [
      "أبوظبي", "دبي", "الشارقة", "عجمان",
      "أم القيوين", "رأس الخيمة", "الفجيرة"
    ],
    regionType: { TR: "Emirlik", AR: "إمارة", EN: "Emirate" },
    defaultRegion: "دبي",
  },

  // ============================================================
  // EGYPT
  // ============================================================
  EG: {
    code: "EG",
    name: { TR: "Mısır",         AR: "مصر",            EN: "Egypt" },
    lang: "AR",
    currency: "EGP",
    currencySymbol: "ج.م",
    currencyName: { TR: "Mısır Lirası", AR: "جنيه مصري", EN: "Egyptian Pound" },
    phoneCode: "+20",
    phonePlaceholder: "+20 100 123 4567",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "VAT",
      fullName: { TR: "KDV", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 14,
      additionalRates: [0, 5, 10, 14],
    },

    compliance: {
      dataProtection: "Egyptian Data Protection Law",
      dataProtectionFullName: { TR: "Mısır Veri Koruma Yasası", AR: "قانون حماية البيانات الشخصية", EN: "Egyptian Data Protection Law" },
      eInvoice: "ETA",
      eInvoiceAuthority: { TR: "ETA", AR: "مصلحة الضرائب المصرية", EN: "Egyptian Tax Authority" },
      eInvoiceCompleteName: { TR: "ETA e-Fatura", AR: "الفاتورة الإلكترونية المصرية", EN: "Egyptian e-Invoice (ETA)" },
    },

    regions: [
      "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر",
      "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية",
      "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان",
      "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية",
      "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا",
      "شمال سيناء", "سوهاج"
    ],
    regionType: { TR: "Vilayet", AR: "محافظة", EN: "Governorate" },
    defaultRegion: "القاهرة",
  },

  // ============================================================
  // KUWAIT
  // ============================================================
  KW: {
    code: "KW",
    name: { TR: "Kuveyt",        AR: "الكويت",         EN: "Kuwait" },
    lang: "AR",
    currency: "KWD",
    currencySymbol: "د.ك",
    currencyName: { TR: "Kuveyt Dinarı", AR: "دينار كويتي", EN: "Kuwaiti Dinar" },
    phoneCode: "+965",
    phonePlaceholder: "+965 5012 3456",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "Tax",
      fullName: { TR: "Vergi", AR: "ضريبة", EN: "Tax" },
      rate: 0,
      additionalRates: [0],
    },

    compliance: {
      dataProtection: "DPPR",
      dataProtectionFullName: { TR: "Kuveyt Veri Koruma", AR: "حماية البيانات الكويتية", EN: "Kuwait Data Protection" },
      eInvoice: "KFAS",
      eInvoiceAuthority: { TR: "KFAS", AR: "هيئة الضرائب", EN: "KFAS" },
      eInvoiceCompleteName: { TR: "Kuveyt e-Fatura", AR: "الفاتورة الكويتية", EN: "Kuwait e-Invoice" },
    },

    regions: [
      "العاصمة", "حولي", "الفروانية", "مبارك الكبير",
      "الأحمدي", "الجهراء"
    ],
    regionType: { TR: "Vilayet", AR: "محافظة", EN: "Governorate" },
    defaultRegion: "العاصمة",
  },

  // ============================================================
  // QATAR
  // ============================================================
  QA: {
    code: "QA",
    name: { TR: "Katar",         AR: "قطر",            EN: "Qatar" },
    lang: "AR",
    currency: "QAR",
    currencySymbol: "ر.ق",
    currencyName: { TR: "Katar Riyali", AR: "ريال قطري", EN: "Qatari Riyal" },
    phoneCode: "+974",
    phonePlaceholder: "+974 3012 3456",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "Tax",
      fullName: { TR: "Vergi", AR: "ضريبة", EN: "Tax" },
      rate: 0,
      additionalRates: [0],
    },

    compliance: {
      dataProtection: "PDPPL",
      dataProtectionFullName: { TR: "Katar Veri Koruma", AR: "قانون حماية البيانات القطري", EN: "Qatar Data Protection Law" },
      eInvoice: "GTA",
      eInvoiceAuthority: { TR: "GTA", AR: "الهيئة العامة للضرائب", EN: "General Tax Authority" },
      eInvoiceCompleteName: { TR: "Katar e-Fatura", AR: "الفاتورة القطرية", EN: "Qatar e-Invoice" },
    },

    regions: [
      "الدوحة", "الريان", "الوكرة", "أم صلال",
      "الخور والذخيرة", "الشمال", "الضعاين", "الشحانية"
    ],
    regionType: { TR: "Belediye", AR: "بلدية", EN: "Municipality" },
    defaultRegion: "الدوحة",
  },

  // ============================================================
  // BAHRAIN
  // ============================================================
  BH: {
    code: "BH",
    name: { TR: "Bahreyn",       AR: "البحرين",        EN: "Bahrain" },
    lang: "AR",
    currency: "BHD",
    currencySymbol: "د.ب",
    currencyName: { TR: "Bahreyn Dinarı", AR: "دينار بحريني", EN: "Bahraini Dinar" },
    phoneCode: "+973",
    phonePlaceholder: "+973 3000 1234",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "VAT",
      fullName: { TR: "KDV", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 10,
      additionalRates: [0, 10],
    },

    compliance: {
      dataProtection: "PDPL",
      dataProtectionFullName: { TR: "Bahreyn PDPL", AR: "قانون حماية البيانات البحريني", EN: "Bahrain PDPL" },
      eInvoice: "NBR",
      eInvoiceAuthority: { TR: "NBR", AR: "الجهاز الوطني للإيرادات", EN: "National Bureau for Revenue" },
      eInvoiceCompleteName: { TR: "Bahreyn e-Fatura", AR: "الفاتورة البحرينية", EN: "Bahrain e-Invoice" },
    },

    regions: [
      "العاصمة", "الجنوبية", "المحرق", "الشمالية"
    ],
    regionType: { TR: "Vilayet", AR: "محافظة", EN: "Governorate" },
    defaultRegion: "العاصمة",
  },

  // ============================================================
  // OMAN
  // ============================================================
  OM: {
    code: "OM",
    name: { TR: "Umman",         AR: "عمان",           EN: "Oman" },
    lang: "AR",
    currency: "OMR",
    currencySymbol: "ر.ع",
    currencyName: { TR: "Umman Riyali", AR: "ريال عماني", EN: "Omani Rial" },
    phoneCode: "+968",
    phonePlaceholder: "+968 9123 4567",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "VAT",
      fullName: { TR: "KDV", AR: "ضريبة القيمة المضافة", EN: "Value Added Tax" },
      rate: 5,
      additionalRates: [0, 5],
    },

    compliance: {
      dataProtection: "Oman PDPL",
      dataProtectionFullName: { TR: "Umman PDPL", AR: "قانون حماية البيانات العماني", EN: "Oman PDPL" },
      eInvoice: "OTA",
      eInvoiceAuthority: { TR: "OTA", AR: "هيئة الضرائب العمانية", EN: "Oman Tax Authority" },
      eInvoiceCompleteName: { TR: "OTA e-Fatura", AR: "الفاتورة العمانية", EN: "Oman e-Invoice" },
    },

    regions: [
      "مسقط", "ظفار", "مسندم", "البريمي",
      "الداخلية", "شمال الباطنة", "جنوب الباطنة",
      "شمال الشرقية", "جنوب الشرقية", "الظاهرة", "الوسطى"
    ],
    regionType: { TR: "Vilayet", AR: "محافظة", EN: "Governorate" },
    defaultRegion: "مسقط",
  },

  // ============================================================
  // JORDAN
  // ============================================================
  JO: {
    code: "JO",
    name: { TR: "Ürdün",         AR: "الأردن",         EN: "Jordan" },
    lang: "AR",
    currency: "JOD",
    currencySymbol: "د.أ",
    currencyName: { TR: "Ürdün Dinarı", AR: "دينار أردني", EN: "Jordanian Dinar" },
    phoneCode: "+962",
    phonePlaceholder: "+962 7 9012 3456",
    dateFormat: "DD/MM/YYYY",
    weekStart: "sunday",

    tax: {
      name: "Sales Tax",
      fullName: { TR: "Satis Vergisi", AR: "ضريبة المبيعات", EN: "Sales Tax" },
      rate: 16,
      additionalRates: [0, 4, 10, 16],
    },

    compliance: {
      dataProtection: "Jordan PDPL",
      dataProtectionFullName: { TR: "Ürdün PDPL", AR: "قانون حماية البيانات الأردني", EN: "Jordan PDPL" },
      eInvoice: "ISTD",
      eInvoiceAuthority: { TR: "ISTD", AR: "دائرة ضريبة الدخل والمبيعات", EN: "Income & Sales Tax Department" },
      eInvoiceCompleteName: { TR: "Ürdün e-Fatura", AR: "الفاتورة الأردنية", EN: "Jordan e-Invoice" },
    },

    regions: [
      "عمان", "الزرقاء", "إربد", "البلقاء", "المفرق", "الكرك",
      "العقبة", "جرش", "عجلون", "مادبا", "الطفيلة", "معان"
    ],
    regionType: { TR: "Vilayet", AR: "محافظة", EN: "Governorate" },
    defaultRegion: "عمان",
  },

  // ============================================================
  // FALLBACK (other / unknown country)
  // ============================================================
  US: {
    code: "US",
    name: { TR: "Diğer",         AR: "أخرى",           EN: "Other" },
    lang: "EN",
    currency: "USD",
    currencySymbol: "$",
    currencyName: { TR: "ABD Doları", AR: "دولار أمريكي", EN: "US Dollar" },
    phoneCode: "+1",
    phonePlaceholder: "+1 555 123 4567",
    dateFormat: "MM/DD/YYYY",
    weekStart: "sunday",

    tax: {
      name: "Sales Tax",
      fullName: { TR: "Satis Vergisi", AR: "ضريبة المبيعات", EN: "Sales Tax" },
      rate: 0,
      additionalRates: [0],
    },

    compliance: {
      dataProtection: "GDPR",
      dataProtectionFullName: { TR: "GDPR", AR: "GDPR", EN: "GDPR" },
      eInvoice: "Standard",
      eInvoiceAuthority: { TR: "Standart", AR: "قياسي", EN: "Standard" },
      eInvoiceCompleteName: { TR: "Standart e-Fatura", AR: "الفاتورة القياسية", EN: "Standard e-Invoice" },
    },

    regions: [],
    regionType: { TR: "Bölge", AR: "منطقة", EN: "Region" },
    defaultRegion: "",
  },
};

// ================================================================
// Country code groups (for bulk operations)
// ================================================================

// Countries that should default to AR language
export const ARABIC_COUNTRIES = [
  "SA", "AE", "EG", "KW", "QA", "BH", "OM", "JO",
  "LB", "SY", "IQ", "LY", "SD", "YE", "PS", "DZ", "TN", "MA", "MR", "DJ", "SO", "KM"
];

// Countries we have full profiles for
export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_PROFILES);

// ================================================================
// SOFT LAUNCH — Country visibility control
// ================================================================
//
// VISIBLE_COUNTRIES controls which countries appear in user-facing
// country selectors (NavV2 pill, Footer, Pricing, Onboarding).
//
// Hidden countries:
//   - Still have full profile data (services keep working)
//   - Won't appear in dropdowns/selectors
//   - Auto-fallback to lang-appropriate default if a user has
//     a hidden country saved in localStorage from a previous visit
//
// To re-enable a country: just add its code to VISIBLE_COUNTRIES.
// No data migration needed. No code changes elsewhere.
//
// To go global again: VISIBLE_COUNTRIES = SUPPORTED_COUNTRIES;
// ================================================================

export const VISIBLE_COUNTRIES = ["TR", "SA", "AE"];

// Smart default per language (used when a hidden country is detected/stored)
export const DEFAULT_BY_LANG = {
  AR: "SA",
  TR: "TR",
  EN: "TR",
};

// Default fallback (used when no language context available)
export const DEFAULT_COUNTRY = "TR";

// Helper: is this country code visible in selectors?
export function isCountryVisible(code) {
  if (!code) return false;
  return VISIBLE_COUNTRIES.indexOf(code.toUpperCase()) !== -1;
}

// Helper: get the smart default country code for a given language
export function getDefaultForLang(lang) {
  return DEFAULT_BY_LANG[lang] || DEFAULT_COUNTRY;
}

// ================================================================
// Helper functions
// ================================================================

/**
 * Get a country profile by code. Falls back to US if unknown.
 */
export function getCountryProfile(code) {
  if (!code) return COUNTRY_PROFILES[DEFAULT_COUNTRY];
  const upper = code.toUpperCase();
  if (COUNTRY_PROFILES[upper]) return COUNTRY_PROFILES[upper];
  // If it's an Arabic country we don't have a full profile for,
  // return Saudi as the closest match (same currency family is rare,
  // but the AR language and Arabic UX defaults are the same).
  if (ARABIC_COUNTRIES.includes(upper)) return COUNTRY_PROFILES.SA;
  return COUNTRY_PROFILES.US;
}

/**
 * Map a country code to a default UI language (TR/AR/EN).
 */
export function getLangForCountry(code) {
  if (!code) return "TR";
  const upper = code.toUpperCase();
  if (upper === "TR") return "TR";
  if (ARABIC_COUNTRIES.includes(upper)) return "AR";
  return "EN";
}

/**
 * Pretty-print currency amount with the country's symbol.
 */
export function formatCurrency(amount, countryCode) {
  const p = getCountryProfile(countryCode);
  if (typeof amount !== "number") return amount;
  // Use Intl for proper grouping. For Arabic locales we still
  // render Latin digits because most B2B users prefer them.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return p.currencySymbol + " " + formatted;
}

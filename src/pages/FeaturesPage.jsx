// ================================================================
// /features — single tabbed page driving 8 distinct product features.
// The footer ÜRÜN deep-links (/features#e-fatura, /features#crm,
// /features#tahsilat, /features#ai, /features#mobil, /features#e-arsiv,
// /features#kdv, /features#api) all land here and pre-select the
// matching tab. Only ONE tab's content is visible at a time.
// ================================================================
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";
import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

const C = {
  red: "#E30A17", redDeep: "#B30810", redBright: "#FF1A2A",
  redSoft: "#FFE3E5",
  wine900: "#3A0509", wine950: "#1F0205",
  bgTinted: "#FFF7F4", bg: "#FFF8F8",
  ink: "#1B0F11", inkSoft: "#3A2A30", muted: "#5C4F52",
  hairline: "rgba(0,0,0,.08)",
  emerald: "#10B981", emeraldSoft: "#D1FAE5", amber: "#F59E0B",
};
const SA = {
  green: "#006C35", greenDeep: "#004D26", greenBright: "#00A050",
  green900: "#00190C", green950: "#000B05",
  bgTinted: "#F4FBF7", bg: "#F5FBF7",
  hairline: "rgba(0,0,0,.08)",
};

// ── Stable tab descriptor (icon + trilingual label + colour theme) ─
// Each tab carries its own palette so the tab grid can render eight
// distinctly themed cards (light tint when idle, gradient when active).
const TABS = [
  { key: "e-fatura", icon: "🧾", labels: { TR: "E-Fatura",        EN: "E-Invoice",          AR: "الفاتورة الإلكترونية" },
    theme: { bg: "#FEE2E2", border: "#DC2626", from: "#DC2626", to: "#991B1B", icon: "#DC2626", glow: "rgba(220,38,38,0.30)" } },
  { key: "crm",      icon: "👥", labels: { TR: "CRM Yönetimi",    EN: "CRM Management",     AR: "إدارة CRM" },
    theme: { bg: "#DBEAFE", border: "#2563EB", from: "#2563EB", to: "#1E40AF", icon: "#2563EB", glow: "rgba(37,99,235,0.30)" } },
  { key: "tahsilat", icon: "💸", labels: { TR: "Akıllı Tahsilat", EN: "Smart Collections",  AR: "التحصيل الذكي" },
    theme: { bg: "#FED7AA", border: "#EA580C", from: "#EA580C", to: "#9A3412", icon: "#EA580C", glow: "rgba(234,88,12,0.30)" } },
  { key: "ai",       icon: "✨", labels: { TR: "AI Asistan",      EN: "AI Assistant",       AR: "مساعد AI" },
    theme: { bg: "#EDE9FE", border: "#7C3AED", from: "#7C3AED", to: "#5B21B6", icon: "#7C3AED", glow: "rgba(124,58,237,0.30)" } },
  { key: "mobil",    icon: "📱", labels: { TR: "Mobil Uygulama",  EN: "Mobile App",         AR: "تطبيق الجوال" },
    theme: { bg: "#D1FAE5", border: "#10B981", from: "#10B981", to: "#065F46", icon: "#10B981", glow: "rgba(16,185,129,0.30)" } },
  { key: "e-arsiv",  icon: "🗄️", labels: { TR: "e-Arşiv Fatura",  EN: "e-Archive Invoice",  AR: "الأرشيف الإلكتروني" },
    theme: { bg: "#E0F2FE", border: "#0EA5E9", from: "#0EA5E9", to: "#075985", icon: "#0EA5E9", glow: "rgba(14,165,233,0.30)" } },
  { key: "kdv",      icon: "📊", labels: { TR: "KDV Raporları",   EN: "VAT Reports",        AR: "تقارير VAT" },
    theme: { bg: "#FCE7F3", border: "#DB2777", from: "#DB2777", to: "#9F1239", icon: "#DB2777", glow: "rgba(219,39,119,0.30)" } },
  { key: "api",      icon: "🔌", labels: { TR: "API & Webhooks",  EN: "API & Webhooks",     AR: "API و Webhooks" },
    theme: { bg: "#FEF3C7", border: "#F59E0B", from: "#F59E0B", to: "#92400E", icon: "#F59E0B", glow: "rgba(245,158,11,0.30)" } },
];

const TAB_KEYS = TABS.map((t) => t.key);

// ── Distinct trilingual content per tab ────────────────────────────
const TAB_CONTENT = {
  "e-fatura": {
    TR: {
      headline: "GİB onaylı E-Fatura altyapısı",
      sub: "Saniyeler içinde profesyonel e-Fatura kesin, GİB ile entegre çalışın.",
      features: [
        "Otomatik KDV hesaplama (%1, %8, %18, %20)",
        "GİB entegrasyonu (e-Fatura + e-Arşiv)",
        "PDF, XML ve UBL formatları",
        "Tek tıkla gönderim ve canlı durum takibi",
        "Toplu fatura işlemleri ve şablonlar",
      ],
      useCase: "Bursa'daki tekstil firması ABC her ay 500+ fatura kesiyor — Zyrix ile süre 4 saatten 20 dakikaya indi.",
      stats: [
        { label: "Bu ay", value: "324", trend: "↑ 18%" },
        { label: "Onaylı", value: "298", trend: "92%" },
        { label: "Bekleyen", value: "26", trend: "8%" },
      ],
    },
    EN: {
      headline: "GİB-approved e-Invoice infrastructure",
      sub: "Issue professional e-Invoices in seconds, fully integrated with GİB.",
      features: [
        "Automatic VAT (1%, 8%, 18%, 20%)",
        "GİB integration (e-Invoice + e-Archive)",
        "PDF, XML and UBL formats",
        "One-click delivery with live status tracking",
        "Bulk invoicing and templates",
      ],
      useCase: "ABC, a textile manufacturer in Bursa, issues 500+ invoices a month — Zyrix cut the work from 4 hours to 20 minutes.",
      stats: [
        { label: "This month", value: "324", trend: "↑ 18%" },
        { label: "Approved",   value: "298", trend: "92%" },
        { label: "Pending",    value: "26",  trend: "8%" },
      ],
    },
    AR: {
      headline: "بنية فاتورة إلكترونية معتمدة من GİB",
      sub: "أصدر فواتير احترافية في ثوانٍ، بتكامل كامل مع GİB.",
      features: [
        "حساب VAT تلقائي (1%، 8%، 18%، 20%)",
        "تكامل GİB (e-Fatura + e-Arşiv)",
        "صيغ PDF وXML وUBL",
        "إرسال بنقرة مع متابعة الحالة لحظياً",
        "فوترة جماعية وقوالب جاهزة",
      ],
      useCase: "شركة ABC للنسيج في بورصة تصدر أكثر من 500 فاتورة شهرياً — وفّر Zyrix الوقت من 4 ساعات إلى 20 دقيقة.",
      stats: [
        { label: "هذا الشهر", value: "324", trend: "↑ 18%" },
        { label: "معتمدة",     value: "298", trend: "92%" },
        { label: "بالانتظار",  value: "26",  trend: "8%" },
      ],
    },
  },
  "crm": {
    TR: {
      headline: "360° Müşteri Görünümü",
      sub: "Müşterilerinizi tanıyın, büyütün, kaybetmeyin.",
      features: [
        "Customer DNA analizi (davranış skorları)",
        "Churn tahmini (yapay zeka ile)",
        "Görsel pipeline yönetimi",
        "Müşteri yaşam döngüsü takibi",
        "Otomatik segmentasyon ve etiketleme",
      ],
      useCase: "İstanbul danışmanlık firması XYZ Zyrix ile müşteri terkini %35 azalttı.",
      stats: [
        { label: "Aktif müşteri", value: "1,247", trend: "↑ 12%" },
        { label: "Risk altında",  value: "23",    trend: "↓ 35%" },
        { label: "Yeni (30 gün)", value: "156",   trend: "↑ 8%" },
      ],
    },
    EN: {
      headline: "360° Customer View",
      sub: "Know your customers — grow them, keep them.",
      features: [
        "Customer DNA scoring (behaviour profile)",
        "AI-powered churn forecasting",
        "Visual pipeline management",
        "Lifecycle tracking",
        "Automatic segmentation and tagging",
      ],
      useCase: "XYZ, an Istanbul consultancy, cut customer churn by 35% with Zyrix.",
      stats: [
        { label: "Active customers", value: "1,247", trend: "↑ 12%" },
        { label: "At risk",          value: "23",    trend: "↓ 35%" },
        { label: "New (30 days)",    value: "156",   trend: "↑ 8%" },
      ],
    },
    AR: {
      headline: "رؤية 360° للعميل",
      sub: "اعرف عملاءك — ربّيهم ولا تخسرهم.",
      features: [
        "DNA العميل (ملف سلوكي)",
        "توقع الفقد بالذكاء الاصطناعي",
        "إدارة خط مبيعات بصرية",
        "تتبع دورة حياة العميل",
        "تقسيم ووسم آلي",
      ],
      useCase: "شركة XYZ للاستشارات في إسطنبول خفّضت الفقد بنسبة 35% مع Zyrix.",
      stats: [
        { label: "عملاء نشطون", value: "1,247", trend: "↑ 12%" },
        { label: "تحت الخطر",   value: "23",    trend: "↓ 35%" },
        { label: "جدد (30 يوم)", value: "156",  trend: "↑ 8%" },
      ],
    },
  },
  "tahsilat": {
    TR: {
      headline: "Geç tahsilatları %60 azaltın",
      sub: "AI destekli akıllı takip sistemi.",
      features: [
        "WhatsApp otomatik hatırlatmalar",
        "Vade öncesi nazik hatırlatma",
        "Vade sonrası kademeli takip akışı",
        "AR aging raporları (15/30/60/90 gün)",
        "Tahsilat skorlama ve önceliklendirme",
      ],
      useCase: "Ankara market zinciri DEF tahsilat süresini 45 günden 18 güne indirdi.",
      stats: [
        { label: "Ortalama tahsilat süresi", value: "18 gün", trend: "↓ 60%" },
        { label: "Bu ay tahsil edildi",      value: "₺412K",  trend: "↑ 22%" },
        { label: "Geciken kayıt",            value: "9",      trend: "↓ 70%" },
      ],
    },
    EN: {
      headline: "Cut late collections by 60%",
      sub: "AI-driven smart follow-up system.",
      features: [
        "Automatic WhatsApp reminders",
        "Gentle pre-due-date nudges",
        "Tiered post-due-date follow-up cadence",
        "AR-aging reports (15/30/60/90 days)",
        "Collection scoring and prioritisation",
      ],
      useCase: "DEF, a supermarket chain in Ankara, cut average collection time from 45 to 18 days.",
      stats: [
        { label: "Avg. collection time", value: "18 days", trend: "↓ 60%" },
        { label: "Collected this month", value: "₺412K",   trend: "↑ 22%" },
        { label: "Late records",         value: "9",       trend: "↓ 70%" },
      ],
    },
    AR: {
      headline: "خفّض التحصيل المتأخر بـ 60%",
      sub: "نظام متابعة ذكي مدعوم بالذكاء الاصطناعي.",
      features: [
        "تذكيرات WhatsApp تلقائية",
        "تذكيرات لطيفة قبل الاستحقاق",
        "متابعات متدرجة بعد الاستحقاق",
        "تقارير أعمار الديون (15/30/60/90 يوم)",
        "تقييم التحصيل وأولوياته",
      ],
      useCase: "سلسلة سوبرماركت DEF في أنقرة قلّصت زمن التحصيل من 45 يوماً إلى 18 يوماً.",
      stats: [
        { label: "متوسط زمن التحصيل", value: "18 يوماً", trend: "↓ 60%" },
        { label: "تحصيل هذا الشهر",   value: "₺412K",    trend: "↑ 22%" },
        { label: "متأخرة",              value: "9",        trend: "↓ 70%" },
      ],
    },
  },
  "ai": {
    TR: {
      headline: "Yapay Zeka Finansal CFO'nuz",
      sub: "Cebinizdeki Tax Autopilot, Death Predictor ve Co-Founder.",
      features: [
        "Voice-to-Invoice (Türkçe ve Arapça)",
        "Tax Autopilot — KDV beyanı otomasyonu",
        "Death Predictor — firma sağlık skoru",
        "Bank Reconciliation AI",
        "Cash Flow Forecast (30/60/90 gün)",
        "AI Co-Founder modu — karar danışmanlığı",
      ],
      useCase: "İzmir lojistik firması GHI ses komutuyla günde 50 fatura kesiyor.",
      stats: [
        { label: "AI tahmin doğruluğu", value: "94.2%", trend: "↑ Gemini 2.0" },
        { label: "Risk skoru",          value: "Düşük", trend: "✓ Sağlıklı" },
        { label: "Sesli komut/gün",     value: "50+",   trend: "GHI ortalaması" },
      ],
    },
    EN: {
      headline: "Your AI Financial CFO",
      sub: "Tax Autopilot, Death Predictor and Co-Founder — in your pocket.",
      features: [
        "Voice-to-Invoice (Turkish + Arabic)",
        "Tax Autopilot — VAT-return automation",
        "Death Predictor — business health score",
        "Bank Reconciliation AI",
        "Cash-flow forecast (30/60/90 days)",
        "AI Co-Founder mode — decision sparring partner",
      ],
      useCase: "GHI, a logistics firm in İzmir, issues 50 invoices a day by voice command alone.",
      stats: [
        { label: "Forecast accuracy", value: "94.2%", trend: "↑ Gemini 2.0" },
        { label: "Risk score",        value: "Low",   trend: "✓ Healthy" },
        { label: "Voice cmds/day",    value: "50+",   trend: "GHI avg." },
      ],
    },
    AR: {
      headline: "مدير ماليّتك بالذكاء الاصطناعي",
      sub: "Tax Autopilot وDeath Predictor وCo-Founder — في جيبك.",
      features: [
        "Voice-to-Invoice (عربي وتركي)",
        "Tax Autopilot — أتمتة إقرار VAT",
        "Death Predictor — درجة صحة الشركة",
        "Bank Reconciliation AI",
        "توقع التدفق النقدي (30/60/90 يوم)",
        "AI Co-Founder — شريك للقرارات",
      ],
      useCase: "شركة GHI للوجستيات في إزمير تصدر 50 فاتورة يومياً بالأوامر الصوتية فقط.",
      stats: [
        { label: "دقة التوقع", value: "94.2%",    trend: "↑ Gemini 2.0" },
        { label: "درجة الخطر", value: "منخفضة", trend: "✓ صحية" },
        { label: "أوامر/يوم",   value: "50+",     trend: "متوسط GHI" },
      ],
    },
  },
  "mobil": {
    TR: {
      headline: "İşinizi her yerde yönetin",
      sub: "iOS ve Android için native uygulama.",
      features: [
        "Voice-to-Invoice — sesle fatura kesimi",
        "Fotoğrafla fiş işleme (OCR)",
        "Barkod ile ürün ekleme",
        "Push bildirimleri (ödeme, fatura, risk)",
        "Çevrimdışı mod — internet yokken bile çalışır",
        "Apple Watch ve Wear OS desteği",
      ],
      useCase: "Saha ekipleri Zyrix mobil ile yolda fatura kesip ödeme tahsil ediyor.",
      stats: [
        { label: "App Store puan",    value: "4.8 ★", trend: "iOS" },
        { label: "Google Play puan",  value: "4.7 ★", trend: "Android" },
        { label: "Çevrimdışı işlem",  value: "✓",     trend: "Senkron otomatik" },
      ],
    },
    EN: {
      headline: "Run your business anywhere",
      sub: "Native iOS and Android apps.",
      features: [
        "Voice-to-Invoice — talk an invoice into existence",
        "Photo receipt capture (OCR)",
        "Barcode product entry",
        "Push notifications (payment, invoice, risk)",
        "Offline mode — works without internet",
        "Apple Watch and Wear OS support",
      ],
      useCase: "Field teams issue invoices and take payments on the road with Zyrix Mobile.",
      stats: [
        { label: "App Store rating",   value: "4.8 ★", trend: "iOS" },
        { label: "Google Play rating", value: "4.7 ★", trend: "Android" },
        { label: "Offline ops",        value: "✓",     trend: "Auto-sync" },
      ],
    },
    AR: {
      headline: "أدر عملك من أي مكان",
      sub: "تطبيقات iOS وAndroid أصلية.",
      features: [
        "Voice-to-Invoice — أنشئ فاتورة بصوتك",
        "التقاط الإيصالات بالصورة (OCR)",
        "إضافة منتج بالباركود",
        "إشعارات فورية (دفع، فاتورة، خطر)",
        "وضع غير متصل — يعمل دون إنترنت",
        "دعم Apple Watch وWear OS",
      ],
      useCase: "تستخدم الفرق الميدانية تطبيق Zyrix لإصدار الفواتير وقبض المدفوعات في الطريق.",
      stats: [
        { label: "تقييم App Store",  value: "4.8 ★", trend: "iOS" },
        { label: "تقييم Google Play", value: "4.7 ★", trend: "Android" },
        { label: "العمل دون اتصال",   value: "✓",     trend: "مزامنة آلية" },
      ],
    },
  },
  "e-arsiv": {
    TR: {
      headline: "10 yıl saklama yükümlülüğü artık otomatik",
      sub: "GİB e-Arşiv entegrasyonu.",
      features: [
        "Otomatik e-Arşiv oluşturma",
        "10 yıl güvenli saklama (KVKK uyumlu)",
        "GİB'e otomatik raporlama",
        "Hızlı arama ve erişim",
        "Denetim hazırlığı — tek tıkla rapor",
      ],
      useCase: "B2C satış yapan e-ticaret işletmeleri için yasal yükümlülük artık AI tarafından yönetiliyor.",
      stats: [
        { label: "Saklama süresi",   value: "10 yıl", trend: "GİB onaylı" },
        { label: "Arama gecikmesi",  value: "<1sn",   trend: "Tüm 10 yıl" },
        { label: "KVKK uyum",         value: "✓",     trend: "Otomatik" },
      ],
    },
    EN: {
      headline: "10-year archival duty, now on autopilot",
      sub: "GİB e-Archive integration.",
      features: [
        "Automatic e-Archive generation",
        "10-year secure storage (KVKK-compliant)",
        "Auto-reporting to GİB",
        "Fast search and retrieval",
        "Audit-ready exports in one click",
      ],
      useCase: "B2C e-commerce businesses now have their archival obligation handled end-to-end by AI.",
      stats: [
        { label: "Retention",     value: "10 years", trend: "GİB approved" },
        { label: "Search latency",value: "<1s",      trend: "Across all 10 years" },
        { label: "KVKK compliance", value: "✓",      trend: "Automatic" },
      ],
    },
    AR: {
      headline: "التزام الحفظ 10 سنوات أصبح آلياً",
      sub: "تكامل GİB e-Arşiv.",
      features: [
        "إنشاء e-Arşiv آلياً",
        "حفظ آمن 10 سنوات (متوافق KVKK)",
        "تقرير آلي إلى GİB",
        "بحث واسترجاع سريع",
        "جاهز للتدقيق بنقرة",
      ],
      useCase: "شركات التجارة الإلكترونية B2C يديرها الذكاء الاصطناعي بالكامل لالتزام الأرشفة.",
      stats: [
        { label: "مدة الحفظ", value: "10 سنوات", trend: "معتمد GİB" },
        { label: "زمن البحث", value: "<1ث",       trend: "10 سنوات كاملة" },
        { label: "KVKK",       value: "✓",        trend: "آلي" },
      ],
    },
  },
  "kdv": {
    TR: {
      headline: "KDV beyannameleriniz tek tıkla",
      sub: "Otomatik KDV-1, KDV-2 ve KDV-9015 formları.",
      features: [
        "Aylık KDV beyannamesi otomatik hazırlama",
        "KDV-1 (genel)",
        "KDV-2 (kısmi tevkifat)",
        "KDV-9015 (sorumlu sıfatıyla)",
        "Otomatik mahsup hesaplama",
        "SMMM'e direkt gönderim",
      ],
      useCase: "Mali müşaviriniz Zyrix'in hazırladığı taslakları tek tıkla onaylar — hata oranı sıfıra yakın.",
      stats: [
        { label: "Aylık beyan süresi", value: "12 dk",  trend: "↓ 90%" },
        { label: "Hata oranı",          value: "0.2%",   trend: "↓ %95" },
        { label: "SMMM onay süresi",    value: "1 dk",   trend: "Tek tıkla" },
      ],
    },
    EN: {
      headline: "Your VAT returns, in one click",
      sub: "Automated VAT-1, VAT-2 and VAT-9015 forms.",
      features: [
        "Automatic monthly VAT-return drafts",
        "VAT-1 (general)",
        "VAT-2 (partial withholding)",
        "VAT-9015 (responsible-party VAT)",
        "Auto offset calculations",
        "Direct submission to your accountant",
      ],
      useCase: "Your accountant approves Zyrix-prepared drafts with one click — error rates are near zero.",
      stats: [
        { label: "Monthly filing time", value: "12 min", trend: "↓ 90%" },
        { label: "Error rate",          value: "0.2%",   trend: "↓ 95%" },
        { label: "Accountant approval", value: "1 min",  trend: "One click" },
      ],
    },
    AR: {
      headline: "إقرارات VAT الخاصة بك، بنقرة واحدة",
      sub: "نماذج VAT-1 وVAT-2 وVAT-9015 آلياً.",
      features: [
        "إعداد إقرار VAT الشهري آلياً",
        "VAT-1 (عام)",
        "VAT-2 (خصم جزئي)",
        "VAT-9015 (طرف مسؤول)",
        "حساب المقاصة تلقائياً",
        "إرسال مباشر إلى المحاسب",
      ],
      useCase: "محاسبك يعتمد المسودات التي يحضّرها Zyrix بنقرة واحدة — نسبة الخطأ تقترب من الصفر.",
      stats: [
        { label: "زمن الإقرار الشهري", value: "12 د",  trend: "↓ 90%" },
        { label: "نسبة الخطأ",            value: "0.2%",  trend: "↓ 95%" },
        { label: "اعتماد المحاسب",       value: "1 د",   trend: "بنقرة" },
      ],
    },
  },
  "api": {
    TR: {
      headline: "Sistemlerinizi Zyrix'e bağlayın",
      sub: "Modern REST API ve webhook altyapısı.",
      features: [
        "REST API (OpenAPI 3.0)",
        "Webhook events (fatura, ödeme, müşteri)",
        "Rate limiting ve fair-use politikaları",
        "API key yönetimi (multi-tenant)",
        "SDK: JavaScript, Python, PHP",
        "Sandbox ortamı (canlıya geçmeden test)",
        "Detaylı dokümantasyon ve örnekler",
      ],
      useCase: "ERP, e-ticaret ve özel iç araçlarınızı Zyrix ile dakikalar içinde entegre edin.",
      stats: [
        { label: "API çağrı/sn",   value: "1000+", trend: "Pro plan" },
        { label: "Webhook gecikmesi", value: "<200ms", trend: "P95" },
        { label: "Uptime SLA",       value: "99.95%", trend: "Aylık" },
      ],
    },
    EN: {
      headline: "Connect your systems to Zyrix",
      sub: "Modern REST API and webhook stack.",
      features: [
        "REST API (OpenAPI 3.0)",
        "Webhook events (invoice, payment, customer)",
        "Rate limiting and fair-use policies",
        "API key management (multi-tenant)",
        "SDKs: JavaScript, Python, PHP",
        "Sandbox environment (test before going live)",
        "Detailed documentation and code samples",
      ],
      useCase: "Plug your ERP, storefront or internal tools into Zyrix in minutes, not weeks.",
      stats: [
        { label: "API calls/sec",     value: "1000+",  trend: "Pro plan" },
        { label: "Webhook latency",   value: "<200ms", trend: "P95" },
        { label: "Uptime SLA",        value: "99.95%", trend: "Monthly" },
      ],
    },
    AR: {
      headline: "اربط أنظمتك بـ Zyrix",
      sub: "بنية API وWebhook حديثة.",
      features: [
        "REST API (OpenAPI 3.0)",
        "أحداث Webhook (فاتورة، دفع، عميل)",
        "حدود معدل وسياسات استخدام عادل",
        "إدارة API keys (متعدد المستأجرين)",
        "SDK: JavaScript وPython وPHP",
        "بيئة Sandbox (اختبار قبل النشر)",
        "توثيق مفصّل وأمثلة كود",
      ],
      useCase: "اربط ERP أو متجرك الإلكتروني أو أدواتك الداخلية بـ Zyrix خلال دقائق.",
      stats: [
        { label: "مكالمات/ثانية", value: "1000+",  trend: "باقة Pro" },
        { label: "زمن Webhook",    value: "<200ms", trend: "P95" },
        { label: "Uptime SLA",     value: "99.95%", trend: "شهرياً" },
      ],
    },
  },
};

const HERO_COPY = {
  TR: {
    eyebrow: "ZYRIX FİNSUITE · ÖZELLİKLER",
    h1Pre: "Fatura operasyonunun ihtiyacı olan her şey,",
    h1Highlight: "tek bir akıllı sistemde.",
    sub: "Zyrix faturayı, tahsilatı, nakit akışı sinyallerini, AI önerilerini ve ekip aksiyonlarını tek karar motorunda birleştirir.",
    backHome: "← Anasayfa",
    pickFeature: "BİR ÖZELLİĞE ODAKLAN",
    pickHint: "Detaylı bilgi için kart seçin",
  },
  EN: {
    eyebrow: "ZYRIX FINSUITE · FEATURES",
    h1Pre: "Everything an invoice operation needs,",
    h1Highlight: "in one smart system.",
    sub: "Zyrix unifies invoicing, collection, cash-flow signals, AI recommendations and team actions in a single decision engine.",
    backHome: "← Home",
    pickFeature: "PICK A FEATURE",
    pickHint: "Select a card for full details",
  },
  AR: {
    eyebrow: "ZYRIX FINSUITE · المزايا",
    h1Pre: "كل ما تحتاجه عملية الفوترة،",
    h1Highlight: "في نظام ذكي واحد.",
    sub: "يوحّد Zyrix الفوترة والتحصيل وإشارات التدفق النقدي وتوصيات AI وإجراءات الفريق في محرّك قرار واحد.",
    backHome: "← الرئيسية",
    pickFeature: "اختر ميزة",
    pickHint: "اضغط على بطاقة لعرض التفاصيل",
  },
};

// ── Helper renderers ───────────────────────────────────────────────
function StatCard({ label, value, trend, accent, themeBg }) {
  return (
    <div style={{
      background: themeBg,
      borderRadius: 14,
      padding: 16,
      border: `1px solid ${C.hairline}`,
    }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</div>
      {trend && <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 4 }}>{trend}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function FeaturesPage() {
  const i18n = useI18n();
  const lang = (i18n && i18n.lang) || "TR";
  const isRTL = (i18n && i18n.isRTL) || (lang === "AR");
  const isAr = lang === "AR";
  const T = isAr ? SA : C;
  const accent = isAr ? SA.green : C.red;
  const accentDeep = isAr ? SA.greenDeep : C.redDeep;
  const ctaGradient = `linear-gradient(135deg, ${accent}, ${accentDeep})`;
  const ctaShadow = isAr ? "0 22px 48px rgba(0,108,53,.30)" : "0 22px 48px rgba(227,10,23,.30)";

  const hero = HERO_COPY[lang] || HERO_COPY.TR;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    const initialHash = (typeof window !== "undefined" && window.location.hash || "").replace(/^#/, "");
    return TAB_KEYS.includes(initialHash) ? initialHash : "e-fatura";
  });

  // Hash → tab; re-runs on every location change so navigating
  // /features → /features#tahsilat (without remount) still updates.
  useEffect(() => {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return;
    if (!TAB_KEYS.includes(hash)) return;
    setActiveTab(hash);
    const id = setTimeout(() => {
      const el = document.getElementById("feature-tabs");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(id);
  }, [location.hash, location.pathname]);

  const data = useMemo(() => {
    const byTab = TAB_CONTENT[activeTab];
    if (!byTab) return null;
    return byTab[lang] || byTab.TR;
  }, [activeTab, lang]);

  const onTabClick = (key) => {
    setActiveTab(key);
    // Update the URL hash without triggering a full route change.
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", `#${key}`);
      } catch (_) { /* browsers can refuse history.replaceState in some sandboxes */ }
    }
  };

  return (
    <>
      <NavV2 />
      <main
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, #fff 0%, ${T.bgTinted} 46%, #fff 100%)`,
          fontFamily: isAr
            ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
            : "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
          color: C.ink,
        }}
      >
        {/* HERO */}
        <section style={{ padding: "120px 24px 56px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <Link to="/" style={{
              fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: "none",
              borderBottom: `1px dashed ${C.hairline}`, paddingBottom: 1,
            }}>{hero.backHome}</Link>

            <div style={{ marginTop: 26, maxWidth: 880 }}>
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: "0.18em",
                textTransform: "uppercase", color: accent, marginBottom: 14,
              }}>{hero.eyebrow}</div>
              <h1 style={{
                margin: 0,
                fontSize: "clamp(38px, 5.4vw, 70px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontWeight: 900,
                color: C.ink,
              }}>
                {hero.h1Pre}{" "}
                <span style={{
                  backgroundImage: ctaGradient,
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{hero.h1Highlight}</span>
              </h1>
              <p style={{
                margin: "22px 0 0",
                fontSize: 18, lineHeight: 1.65,
                color: C.muted, fontWeight: 500,
                maxWidth: 760,
              }}>{hero.sub}</p>
            </div>
          </div>
        </section>

        {/* TAB GRID — 2 rows × 4 cols on desktop, themed cards. Anchor
            target #feature-tabs is preserved for hash deep-links. */}
        <section id="feature-tabs" style={{
          padding: "32px 24px 48px",
          background: `linear-gradient(180deg, ${T.bgTinted} 0%, ${T.bgTinted}cc 100%)`,
          borderBottom: `1px solid ${C.hairline}`,
        }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                fontSize: 13, fontWeight: 800,
                letterSpacing: "0.20em",
                color: "#DC2626",
                marginBottom: 8,
              }}>{hero.pickFeature}</div>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: C.muted, lineHeight: 1.5,
              }}>{hero.pickHint}</div>
            </div>

            <div
              role="tablist"
              aria-label={hero.pickFeature}
              className="feat-tab-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {TABS.map((tab) => {
                const isActive = tab.key === activeTab;
                const label = (tab.labels && tab.labels[lang]) || tab.labels.TR;
                const th = tab.theme;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.key}`}
                    id={`tabbtn-${tab.key}`}
                    onClick={() => onTabClick(tab.key)}
                    className={"feat-tab-card" + (isActive ? " feat-tab-card--active" : "")}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      border: "none",
                      borderRadius: 16,
                      padding: "18px 16px",
                      textAlign: isRTL ? "right" : "left",
                      background: isActive
                        ? `linear-gradient(135deg, ${th.from}, ${th.to})`
                        : th.bg,
                      color: isActive ? "#fff" : C.ink,
                      borderTop: `3px solid ${th.border}`,
                      boxShadow: isActive
                        ? `0 18px 38px ${th.glow}, 0 0 0 1px ${th.border}30`
                        : "0 2px 8px rgba(15,23,42,0.05)",
                      fontFamily: "inherit",
                      transition: "transform 250ms ease, box-shadow 250ms ease, background 250ms ease",
                      overflow: "hidden",
                    }}
                  >
                    {/* Subtle dotted backdrop on idle cards (artistic touch) */}
                    {!isActive && (
                      <span aria-hidden="true" style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `radial-gradient(${th.border}22 1px, transparent 1px)`,
                        backgroundSize: "14px 14px",
                        opacity: 0.55,
                        pointerEvents: "none",
                      }} />
                    )}

                    <div style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}>
                      {/* Icon disc with theme glow */}
                      <span aria-hidden="true" style={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 20,
                        background: isActive ? "rgba(255,255,255,0.18)" : "#fff",
                        color: isActive ? "#fff" : th.icon,
                        boxShadow: isActive
                          ? `0 0 0 4px rgba(255,255,255,0.10)`
                          : `0 4px 14px ${th.glow}`,
                      }}>{tab.icon}</span>

                      <span style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        letterSpacing: "0.005em",
                        color: isActive ? "#fff" : C.ink,
                      }}>{label}</span>

                      {/* Active dot indicator */}
                      {isActive && (
                        <span aria-hidden="true" style={{
                          flexShrink: 0,
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#fff",
                          boxShadow: "0 0 0 4px rgba(255,255,255,0.30)",
                          marginInlineStart: 4,
                        }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* TAB PANEL — only the active tab's content renders */}
        <section style={{ padding: "48px 24px 96px" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            {data && (
              <div
                key={activeTab}
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                aria-labelledby={`tabbtn-${activeTab}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 36,
                  alignItems: "start",
                  animation: "featTabFade .35s ease-out",
                }}
                className="feat-tabpanel"
              >
                {/* Left — copy + features + use case */}
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 800, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: accent, marginBottom: 12,
                  }}>#{activeTab}</div>
                  <h2 style={{
                    margin: 0,
                    fontSize: "clamp(28px, 3.6vw, 42px)",
                    fontWeight: 900,
                    color: C.ink,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}>{data.headline}</h2>
                  <p style={{
                    margin: "14px 0 24px",
                    fontSize: 17, lineHeight: 1.6,
                    color: C.muted, fontWeight: 500,
                  }}>{data.sub}</p>

                  <ul style={{
                    listStyle: "none", padding: 0, margin: "0 0 24px",
                    display: "grid", gap: 10,
                  }}>
                    {data.features.map((f, i) => (
                      <li key={i} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        fontSize: 15,
                        color: C.ink,
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" style={{ flexShrink: 0, width: 20, height: 20, marginTop: 2 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {data.useCase && (
                    <div style={{
                      background: "#fff",
                      border: `1px solid ${C.hairline}`,
                      borderLeft: `4px solid ${accent}`,
                      borderRadius: 14,
                      padding: 18,
                      marginBottom: 26,
                      boxShadow: "0 8px 24px rgba(58,5,9,0.05)",
                    }}>
                      <div style={{
                        fontSize: 11, fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: accent, marginBottom: 6,
                      }}>{lang === "AR" ? "حالة استخدام" : (lang === "EN" ? "Customer story" : "Müşteri hikâyesi")}</div>
                      <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.55, fontWeight: 600 }}>
                        {data.useCase}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link to="/register" style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "14px 24px", borderRadius: 14,
                      background: ctaGradient, color: "#fff",
                      fontSize: 14, fontWeight: 900, textDecoration: "none",
                      boxShadow: ctaShadow, letterSpacing: "0.04em",
                    }}>
                      <span>{isAr ? "ابدأ مجاناً" : (lang === "EN" ? "Try free" : "Ücretsiz dene")}</span>
                      <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
                    </Link>
                    <Link to="/pricing" style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "14px 22px", borderRadius: 14,
                      background: "#fff", color: C.ink,
                      fontSize: 14, fontWeight: 800, textDecoration: "none",
                      border: `1px solid ${C.hairline}`,
                    }}>
                      {isAr ? "اطّلع على الأسعار" : (lang === "EN" ? "See pricing" : "Fiyatlandırmaya bak")}
                    </Link>
                  </div>
                </div>

                {/* Right — mockup card + stats */}
                <div>
                  <div style={{
                    background: "#fff",
                    border: `1px solid ${C.hairline}`,
                    borderRadius: 24,
                    padding: 26,
                    boxShadow: "0 24px 60px rgba(58,5,9,0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0,
                      height: 4,
                      background: ctaGradient,
                    }} />
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 18,
                      paddingBottom: 14,
                      borderBottom: `1px solid ${C.hairline}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `${accent}18`, color: accent,
                          display: "grid", placeItems: "center", fontSize: 18,
                        }}>{TABS.find((t) => t.key === activeTab)?.icon}</div>
                        <div style={{ fontWeight: 900, fontSize: 14, color: C.ink, letterSpacing: "-0.01em" }}>
                          Zyrix • {(TABS.find((t) => t.key === activeTab)?.labels[lang]) || activeTab}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999,
                        background: C.emeraldSoft, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>● Live</span>
                    </div>

                    {data.stats && data.stats.length > 0 && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(3, data.stats.length)}, 1fr)`,
                        gap: 10,
                        marginBottom: 18,
                      }}>
                        {data.stats.map((s, i) => (
                          <StatCard key={i} {...s} accent={accent} themeBg={T.bgTinted} />
                        ))}
                      </div>
                    )}

                    <div style={{
                      background: T.bgTinted,
                      borderRadius: 14,
                      padding: 16,
                      fontSize: 12,
                      color: C.muted,
                      lineHeight: 1.6,
                      fontWeight: 600,
                    }}>
                      {data.headline}
                    </div>
                  </div>

                  {/* Bottom secondary card */}
                  <div style={{
                    marginTop: 16,
                    background: `linear-gradient(135deg, ${isAr ? SA.green950 : C.wine950}, ${isAr ? SA.green900 : C.wine900})`,
                    borderRadius: 22,
                    padding: 22,
                    color: "#fff",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,215,0,0.9)", marginBottom: 6 }}>
                      {isAr ? "كل الباقات" : (lang === "EN" ? "All plans" : "Tüm planlar")}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: "rgba(255,255,255,0.92)" }}>
                      {isAr
                        ? "هذه الميزة مشمولة في كل باقات Zyrix."
                        : (lang === "EN"
                            ? "This feature ships in every Zyrix plan."
                            : "Bu özellik tüm Zyrix planlarında dahil.")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{
          padding: "72px 24px 96px",
          background: `linear-gradient(135deg, ${isAr ? SA.green950 : C.wine950}, ${isAr ? SA.green900 : C.wine900})`,
          color: "#fff",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900,
              letterSpacing: "-0.02em", margin: "0 0 14px",
            }}>{isAr
              ? "ابدأ بفوترة أذكى اليوم"
              : (lang === "EN" ? "Start invoicing smarter today" : "Bugün daha akıllı faturalamaya başlayın")}</h2>
            <p style={{
              margin: "0 0 26px",
              fontSize: 16, lineHeight: 1.7,
              color: "rgba(255,255,255,0.85)", fontWeight: 500,
            }}>{isAr
              ? "أول 14 يوماً مجاناً. الإعداد في 10 دقائق."
              : (lang === "EN" ? "First 14 days free. 10-minute setup." : "İlk 14 gün ücretsiz. 10 dakikada kurulum.")}</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 28px", borderRadius: 16,
                background: "#fff", color: accent,
                fontSize: 15, fontWeight: 900, textDecoration: "none",
                boxShadow: "0 18px 44px rgba(0,0,0,0.30)",
              }}>
                <span>{isAr ? "ابدأ مجاناً" : (lang === "EN" ? "Try free" : "Ücretsiz dene")}</span>
                <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
              </Link>
              <Link to="/contact" style={{
                display: "inline-flex", alignItems: "center",
                padding: "16px 24px", borderRadius: 16,
                background: "rgba(255,255,255,0.10)", color: "#fff",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.22)",
              }}>{isAr ? "تحدّث مع خبير" : (lang === "EN" ? "Talk to an expert" : "Uzmanla görüş")}</Link>
            </div>
          </div>
        </section>

        <style>{`
          @keyframes featTabFade {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes featTabPulse {
            0%, 100% { box-shadow: 0 18px 38px var(--feat-glow, rgba(220,38,38,0.30)),
                                  0 0 0 1px rgba(255,255,255,0.10); }
            50%      { box-shadow: 0 22px 48px var(--feat-glow, rgba(220,38,38,0.45)),
                                  0 0 0 4px rgba(255,255,255,0.16); }
          }
          .feat-tab-card { will-change: transform, box-shadow; }
          .feat-tab-card:hover:not(.feat-tab-card--active) {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 14px 28px rgba(15,23,42,0.10) !important;
          }
          .feat-tab-card:focus-visible {
            outline: 2px solid #0F172A;
            outline-offset: 3px;
          }
          .feat-tab-card--active {
            animation: featTabPulse 2.4s ease-in-out infinite;
          }
          @media (max-width: 880px) {
            .feat-tabpanel { grid-template-columns: 1fr !important; gap: 24px !important; }
          }
          @media (max-width: 1023px) {
            .feat-tab-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 480px) {
            .feat-tab-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
      <FooterV2 />
    </>
  );
}

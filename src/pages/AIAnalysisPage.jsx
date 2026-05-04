import React, { useState, useEffect } from "react";
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
    badge: "CANLI AI ANALIZI",
    h1Pre: "Faturalarınızı sadece kesmeyin —",
    h1Highlight: "nakit akışınızı AI ile kontrol edin",
    sub: "Zyrix, fatura ve tahsilat davranışınızı analiz eder, riskleri önceden gösterir, fırsatları otomatik yakalar ve bugün hangi aksiyonu almanız gerektiğini netleştirir.",
    formTitle: "İşletmenize özel parametreler",
    formSub: "Birkaç saniyede AI sizin işletmeniz için içgörü hazırlar.",
    fields: ["İşletme tipi", "Fatura hacmi", "Gecikme oranı", "İşlem yoğunluğu"],
    placeholders: ["Örn. Hizmet, Ticaret", "Örn. 250000", "Örn. 18", "Örn. 200"],
    analyzeBtn: "AI ile Analiz Et",
    analyzeSub: "Saniyeler içinde işletmenize özel içgörüler",
    analyzing: "Analiz çalışıyor...",
    msgs: ["Analiz başlatılıyor", "Fatura hareketleri taranıyor", "Tahsilat davranışı modelleniyor", "Risk modeli çalıştırılıyor", "Sonuçlar hazır"],
    pressureTitle: "{amt} önümüzdeki 30 günde risk altında",
    pressureThreat: "Aksiyon alınmazsa, geciken ödemeler artmaya devam edecek.",
    riskLabels: { low: "Kontrollü", medium: "Yüksek", high: "Kritik" },
    statCash: "Nakit Akışı Etkisi",
    statRisk: "Risk Seviyesi",
    statPriority: "Öncelikli Takip",
    statOpportunity: "Kaçırılan Fırsat",
    suggestionTitle: "BUGÜN YAPILACAK AKSIYONLAR",
    actionLine1: "{n} riskli müşteriye bugün hatırlatma gönder",
    actionLine2: "Önümüzdeki 7 günde {amt} tahsil et",
    urgencyLow: "İşletmeniz kontrollü görünüyor — fırsatları kaçırmamak için süreçlerinizi otomatikleştirin.",
    urgencyMid: "Önümüzdeki 30 gün içinde nakit kaybı riskiniz var. Bugün aksiyon alın.",
    urgencyHigh: "Kritik seviyedesiniz. Yarın değil, bugün başlamalısınız.",
    finalCtaPrimary: "Bunu Şimdi Düzeltmeye Başla",
    finalCtaSecondary: "Uzmanla Görüş",
    ctaSecondary: "Nakit Akışını Şimdi Geri Kazan",
    trustItems: ["Ücretsiz başla", "Kurulum yok", "2 dakikada hazır"],
    socialProof: "Bugün analiz başlatan işletmelerin %74 ü ilk 30 günde tahsilatını artırıyor.",
    benefits: [
      ["Geciken ödemeleri anında yakala", "Riskli kayıtları otomatik takip listesine alın."],
      ["Nakit akışını önceden gör", "30 günlük ödeme hareketini öngörün."],
      ["Tahsilatı otomatik yönet", "Hatırlatma ve aksiyonları tek akışta başlatın."],
    ],
    notice: "Zyrix sisteminizdeki gerçek faturalara bağlanır.",
    vizTitle: "Tahsilat ve nakit akışı görünümü",
    vizSubtitle: "Son 30 gün analizi",
    vizCashflowLabel: "Nakit Akışı Tahmini",
    vizRiskLabel: "Risk Dağılımı",
    vizRiskLow: "Düşük Risk",
    vizRiskMid: "Orta Risk",
    vizRiskHigh: "Yüksek Risk",
    recoBadge: "ZYRIX FINSUITE DESTEKLI ÖNERILER",
    recoTitle: "Bu sonuçlara göre bugün uygulanacak aksiyonlar",
    recoChip: "Risk seviyesi",
    actions: [
      ["01", "Riskli müşterilere hatırlatma gönder", "{n} kayıt için bugün otomatik takip başlatın."],
      ["02", "Tahsilat fırsatını takip et", "{amt} potansiyel kaybı öncelikli listeye alın."],
      ["03", "Nakit akışını korumaya al", "Önümüzdeki 30 gün için ödeme planını netleştirin."],
    ],
    waPreviewTitle: "AI tarafından hazırlanan tahsilat mesajı",
    waMessage: "Merhaba {name}, {amount} tutarındaki faturanızın vadesi yaklaşıyor.",
    waSendBtn: "WhatsApp ile Gönder",
    emailPreviewTitle: "AI tarafından hazırlanan email",
    emailTo: "Alıcı",
    emailSubject: "Konu",
    emailSubjectValue: "Yaklaşan ödeme hatırlatması",
    emailBody: "Sayın Müşterimiz, ödeme tarihi yaklaşan faturanız için kısa bir hatırlatma.",
    emailSendBtn: "Email ile Gönder",
    insightsTitle: "AI İçgörüleri",
    insightsSub: "İşletmenize özel keşifler",
    insights: [
      ["Nakit akışınız sektör ortalamasının üzerinde", "Mevcut momentumu otomatikleştirin."],
      ["Gecikme oranınız ortalamadan farklı", "Erken aksiyon kayıpları önler."],
      ["Tahsilat fırsatları fark edilmemiş durumda", "Sistem bunları öncelikli listeye alabilir."],
    ],
    benchTitle: "Sektör Karşılaştırması",
    benchYou: "Siz",
    benchAvg: "Sektör Ort.",
    activityTitle: "Canlı Aktivite",
    activityItems: [
      "12 işletme bugün analiz başlattı",
      "Ortalama tahsilat artışı: %31",
      "En hızlı iyileşme: 7 gün",
      "Şu an aktif analiz: 8",
    ],
    simTitle: "Senaryo Simülasyonu",
    simSub: "Değerleri kaydırarak sonuçları anında görün",
    simDelay: "Gecikme oranı",
    simVolume: "Fatura hacmi",
    inactionTitle: "Eğer hiçbir şey yapmazsanız",
    inactionSub: "Sistemin tahmini önümüzdeki 30 gün için",
    inactionItems: [
      "{n} fatura büyük olasılıkla gecikecek",
      "Tahmini nakit akışı düşüşü: {amt}",
      "Risk seviyesi {risk}% e çıkabilir",
    ],
  },
  AR: {
    badge: "تحليل الذكاء الاصطناعي المباشر",
    h1Pre: "لا تكتفِ بإصدار الفواتير —",
    h1Highlight: "تحكم في تدفقك النقدي بالذكاء الاصطناعي",
    sub: "Zyrix يحلل سلوك فواتيرك وتحصيلاتك، يكشف المخاطر مسبقاً، يلتقط الفرص تلقائياً، ويوضح لك الإجراء الذي يجب اتخاذه اليوم.",
    formTitle: "معطيات خاصة بعملك",
    formSub: "في ثوانٍ، يقوم الذكاء الاصطناعي بإعداد رؤى مخصصة.",
    fields: ["نوع النشاط", "حجم الفواتير", "نسبة التأخير", "كثافة العمليات"],
    placeholders: ["مثل: خدمات", "مثل: 250000", "مثل: 18", "مثل: 200"],
    analyzeBtn: "حلِّل بالذكاء الاصطناعي",
    analyzeSub: "احصل على رؤى ذكية في ثوان",
    analyzing: "جارٍ التحليل...",
    msgs: ["بدء التحليل", "فحص حركة الفواتير", "نمذجة سلوك التحصيل", "تشغيل نموذج المخاطر", "النتائج جاهزة"],
    pressureTitle: "{amt} في خطر خلال الـ 30 يوم القادمة",
    pressureThreat: "إذا لم يُتخذ إجراء، ستستمر المدفوعات المتأخرة في الزيادة.",
    riskLabels: { low: "تحت السيطرة", medium: "مرتفع", high: "حرج" },
    statCash: "تأثير التدفق النقدي",
    statRisk: "مستوى المخاطر",
    statPriority: "متابعة بالأولوية",
    statOpportunity: "فرصة ضائعة",
    suggestionTitle: "إجراءات اليوم",
    actionLine1: "أرسل تذكيراً لـ {n} عميل خطر اليوم",
    actionLine2: "حصّل حتى {amt} خلال 7 أيام",
    urgencyLow: "عملك يبدو تحت السيطرة — أتمت عملياتك حتى لا تفوتك الفرص.",
    urgencyMid: "خلال 30 يوم قد تخسر نقداً. تحرّك اليوم.",
    urgencyHigh: "أنت في مستوى حرج. ابدأ اليوم وليس غداً.",
    finalCtaPrimary: "ابدأ في إصلاح هذا الآن",
    finalCtaSecondary: "تحدّث مع خبير",
    ctaSecondary: "استرد تدفقك النقدي الآن",
    trustItems: ["ابدأ مجاناً", "بدون إعداد", "جاهز في دقيقتين"],
    socialProof: "74% من الشركات التي بدأت التحليل اليوم زادت تحصيلاتها خلال أول 30 يوم.",
    benefits: [
      ["اكتشف المدفوعات المتأخرة فوراً", "أضف السجلات الخطرة لقائمة متابعة تلقائية."],
      ["استشرف التدفق النقدي مقدماً", "توقع حركة المدفوعات لـ 30 يوم."],
      ["إدارة تحصيل تلقائية", "أطلق التذكيرات والإجراءات في تدفق واحد."],
    ],
    notice: "يتصل Zyrix بفواتيرك الفعلية.",
    vizTitle: "نظرة على التحصيل والتدفق النقدي",
    vizSubtitle: "تحليل آخر 30 يوم",
    vizCashflowLabel: "توقعات التدفق النقدي",
    vizRiskLabel: "توزيع المخاطر",
    vizRiskLow: "مخاطر منخفضة",
    vizRiskMid: "مخاطر متوسطة",
    vizRiskHigh: "مخاطر عالية",
    recoBadge: "توصيات مدعومة بـ Zyrix FinSuite",
    recoTitle: "إجراءات لتطبيقها اليوم بناءً على هذه النتائج",
    recoChip: "مستوى المخاطر",
    actions: [
      ["01", "أرسل تذكيراً للعملاء الخطرين", "ابدأ متابعة تلقائية اليوم لـ {n} سجل."],
      ["02", "تابع فرصة التحصيل", "أضف خسارة محتملة بقيمة {amt} لقائمة الأولوية."],
      ["03", "احمِ تدفقك النقدي", "حدد خطة المدفوعات لـ 30 يوم قادمة."],
    ],
    waPreviewTitle: "رسالة تحصيل أعدها الذكاء الاصطناعي",
    waMessage: "مرحباً {name}، تقترب فاتورتك بقيمة {amount} من تاريخ الاستحقاق.",
    waSendBtn: "إرسال عبر واتساب",
    emailPreviewTitle: "بريد إلكتروني أعده الذكاء الاصطناعي",
    emailTo: "المستلم",
    emailSubject: "الموضوع",
    emailSubjectValue: "تذكير بالدفع القادم",
    emailBody: "عميلنا الكريم، تذكير سريع بفاتورة تقترب من موعد الاستحقاق.",
    emailSendBtn: "إرسال بالبريد",
    insightsTitle: "رؤى الذكاء الاصطناعي",
    insightsSub: "اكتشافات خاصة بعملك",
    insights: [
      ["تدفقك النقدي أعلى من متوسط القطاع", "أتمت الزخم الحالي."],
      ["نسبة تأخيرك مختلفة عن المتوسط", "الإجراء المبكر يمنع الخسائر."],
      ["فرص تحصيل غير ملحوظة", "النظام يضعها في قائمة الأولوية."],
    ],
    benchTitle: "مقارنة بالقطاع",
    benchYou: "أنت",
    benchAvg: "متوسط القطاع",
    activityTitle: "نشاط مباشر",
    activityItems: [
      "12 شركة بدأت التحليل اليوم",
      "متوسط زيادة التحصيل: 31%",
      "أسرع تحسين: 7 أيام",
      "تحليلات نشطة الآن: 8",
    ],
    simTitle: "محاكاة السيناريو",
    simSub: "حرّك القيم لرؤية النتائج فوراً",
    simDelay: "نسبة التأخير",
    simVolume: "حجم الفواتير",
    inactionTitle: "إذا لم تفعل شيئاً",
    inactionSub: "تقدير النظام لـ 30 يوم القادمة",
    inactionItems: [
      "{n} فاتورة على الأرجح ستتأخر",
      "انخفاض متوقع في التدفق النقدي: {amt}",
      "مستوى المخاطر قد يرتفع إلى {risk}%",
    ],
  },
  EN: {
    badge: "LIVE AI ANALYSIS",
    h1Pre: "Don't just issue invoices —",
    h1Highlight: "control your cashflow with AI",
    sub: "Zyrix analyzes your invoice and collection behavior, surfaces risks early, captures opportunities automatically, and tells you exactly what to do today.",
    formTitle: "Parameters specific to your business",
    formSub: "In seconds, AI prepares insights for your business.",
    fields: ["Business type", "Invoice volume", "Delay rate", "Operations intensity"],
    placeholders: ["e.g. Services, Trade", "e.g. 250000", "e.g. 18", "e.g. 200"],
    analyzeBtn: "Analyze with AI",
    analyzeSub: "Get smart insights in seconds",
    analyzing: "Analyzing...",
    msgs: ["Starting analysis", "Scanning invoice movements", "Modeling collection behavior", "Running risk model", "Results ready"],
    pressureTitle: "{amt} at risk in the next 30 days",
    pressureThreat: "If no action is taken, delayed payments will keep increasing.",
    riskLabels: { low: "Controlled", medium: "High", high: "Critical" },
    statCash: "Cashflow Impact",
    statRisk: "Risk Level",
    statPriority: "Priority Follow-up",
    statOpportunity: "Missed Opportunity",
    suggestionTitle: "TODAY'S ACTIONS",
    actionLine1: "Send reminders to {n} risky customers today",
    actionLine2: "Recover up to {amt} in the next 7 days",
    urgencyLow: "Your business looks controlled — automate processes so you don't miss opportunities.",
    urgencyMid: "You're at cash-loss risk in the next 30 days. Act today.",
    urgencyHigh: "You're at critical level. Start today, not tomorrow.",
    finalCtaPrimary: "Start Fixing This Now",
    finalCtaSecondary: "Talk to an Expert",
    ctaSecondary: "Recover Your Cashflow Now",
    trustItems: ["Start free", "No setup", "Ready in 2 minutes"],
    socialProof: "74% of businesses that start analysis today increase collections in the first 30 days.",
    benefits: [
      ["Catch delayed payments instantly", "Add risky records to auto follow-up lists."],
      ["Forecast cashflow ahead", "Predict 30 days of payment movement."],
      ["Automate collection management", "Trigger reminders and actions in one flow."],
    ],
    notice: "Zyrix connects to your real invoices.",
    vizTitle: "Collection and cashflow view",
    vizSubtitle: "Last 30 days analysis",
    vizCashflowLabel: "Cashflow Forecast",
    vizRiskLabel: "Risk Distribution",
    vizRiskLow: "Low Risk",
    vizRiskMid: "Medium Risk",
    vizRiskHigh: "High Risk",
    recoBadge: "ZYRIX FINSUITE RECOMMENDATIONS",
    recoTitle: "Actions to take today based on these results",
    recoChip: "Risk level",
    actions: [
      ["01", "Send reminders to risky customers", "Start auto follow-up today for {n} records."],
      ["02", "Pursue the collection opportunity", "Add the {amt} potential loss to priority list."],
      ["03", "Protect your cashflow", "Lock in the payment plan for the next 30 days."],
    ],
    waPreviewTitle: "Reminder message prepared by AI",
    waMessage: "Hi {name}, your invoice of {amount} is due soon.",
    waSendBtn: "Send via WhatsApp",
    emailPreviewTitle: "Email prepared by AI",
    emailTo: "To",
    emailSubject: "Subject",
    emailSubjectValue: "Upcoming payment reminder",
    emailBody: "Dear Customer, a quick reminder for your upcoming invoice.",
    emailSendBtn: "Send Email",
    insightsTitle: "AI Insights",
    insightsSub: "Discoveries specific to your business",
    insights: [
      ["Your cashflow is above industry average", "Automate the current momentum."],
      ["Your delay rate differs from average", "Early action prevents losses."],
      ["Collection opportunities go unnoticed", "The system can prioritize them."],
    ],
    benchTitle: "Industry Comparison",
    benchYou: "You",
    benchAvg: "Industry Avg.",
    activityTitle: "Live Activity",
    activityItems: [
      "12 businesses started analysis today",
      "Average collection increase: 31%",
      "Fastest improvement: 7 days",
      "Active analyses now: 8",
    ],
    simTitle: "Scenario Simulation",
    simSub: "Move the sliders to see results instantly",
    simDelay: "Delay rate",
    simVolume: "Invoice volume",
    inactionTitle: "If you do nothing",
    inactionSub: "System estimate for the next 30 days",
    inactionItems: [
      "{n} invoices will likely be delayed",
      "Estimated cashflow drop: {amt}",
      "Risk level may rise to {risk}%",
    ],
  },
};

function donutSlice(cx, cy, r, rInner, startAngle, endAngle) {
  const toXY = (a, rad) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  const [x1, y1] = toXY(startAngle, r);
  const [x2, y2] = toXY(endAngle, r);
  const [x3, y3] = toXY(endAngle, rInner);
  const [x4, y4] = toXY(startAngle, rInner);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return ["M", x1, y1, "A", r, r, 0, largeArc, 1, x2, y2, "L", x3, y3, "A", rInner, rInner, 0, largeArc, 0, x4, y4, "Z"].join(" ");
}

function sparklinePath(values, width, height) {
  if (!values || values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  return values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
}

export default function AIAnalysisPage() {
  const { lang } = useI18n();
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;
  const t = TXT[lang] || TXT.TR;

  const themeColor = isArabic ? SA.green : C.red;
  const themeDeep = isArabic ? SA.greenDeep : C.redDeep;
  const themeBright = isArabic ? SA.greenBright : C.redBright;

  const currencySymbol = lang === "AR" ? " ر.س" : lang === "EN" ? "$" : "₺";
  const currencyPos = lang === "AR" ? "suffix" : "prefix";

  const [inputs, setInputs] = useState(["", "", "", ""]);
  const setInput = (i, v) => {
    const next = [...inputs];
    next[i] = v;
    setInputs(next);
  };

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [activityIdx, setActivityIdx] = useState(0);

  // Simulator state - drives live recompute after analysis
  const [simDelay, setSimDelay] = useState(18);
  const [simVolume, setSimVolume] = useState(250000);

  const riskClass = counts[1] >= 65 ? "high" : counts[1] >= 35 ? "medium" : "low";
  const urgencyText = riskClass === "high" ? t.urgencyHigh : riskClass === "medium" ? t.urgencyMid : t.urgencyLow;

  useEffect(() => {
    const id = setInterval(() => setActivityIdx((i) => (i + 1) % t.activityItems.length), 3500);
    return () => clearInterval(id);
  }, [t.activityItems.length]);

  const animateToTargets = (targets) => {
    const steps = 40;
    let cur = 0;
    const id = setInterval(() => {
      cur++;
      const p = cur / steps;
      setCounts(targets.map((tv) => Math.round(tv * p)));
      if (cur >= steps) clearInterval(id);
    }, 35);
  };

  const computeFromValues = (volume, delay, ops, businessLen) => {
    const cashflow = Math.max(-30, Math.min(60, Math.round((volume / 50) - delay * 0.6 + (ops / 20))));
    const risk = Math.max(0, Math.min(95, Math.round(delay * 1.2 + (volume < 100 ? 8 : 0))));
    const priority = Math.max(0, Math.min(99, Math.round((volume / 30) + (delay / 4))));
    const opportunity = Math.max(0, Math.min(999, Math.round((volume * 0.35) + (ops * 0.5) + businessLen * 2)));
    return [cashflow, risk, priority, opportunity];
  };

  const computeFallback = () => {
    const volume = parseFloat(inputs[1]) || 0;
    const delay = parseFloat(inputs[2]) || 0;
    const ops = parseFloat(inputs[3]) || 0;
    const businessLen = (inputs[0] || "").trim().length;
    return computeFromValues(volume, delay, ops, businessLen);
  };

  // Live recompute when sliders change (after first analysis)
  useEffect(() => {
    if (!analyzed) return;
    const ops = parseFloat(inputs[3]) || 0;
    const businessLen = (inputs[0] || "").trim().length;
    const next = computeFromValues(simVolume, simDelay, ops, businessLen);
    setCounts(next);
  }, [simDelay, simVolume]);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalyzed(false);
    setAiSuggestion(null);
    setCounts([0, 0, 0, 0]);
    setStep(0);

    const msgInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, t.msgs.length - 1));
    }, 600);

    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
    let targets = null;
    let suggestion = null;

    const userVolume = parseFloat(inputs[1]) || 0;
    const userDelay = parseFloat(inputs[2]) || 0;

    try {
      const res = await fetch(API + "/api/public-ai-demo/analyze-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: inputs[0] || "",
          invoiceVolume: userVolume,
          delayRate: userDelay,
          opsIntensity: parseFloat(inputs[3]) || 0,
          lang,
        }),
      });
      const json = await res.json();
      if (json && json.success && json.data) {
        targets = [json.data.cashflow, json.data.risk, json.data.priority, json.data.opportunity];
        if (Array.isArray(json.data.suggestion) && json.data.suggestion.length === 2) {
          suggestion = json.data.suggestion;
        }
      }
    } catch (err) {
      console.warn("[AIAnalysis] fallback to local", err);
    }

    if (!targets) targets = computeFallback();

    setTimeout(() => {
      clearInterval(msgInterval);
      setStep(t.msgs.length - 1);
      setLoading(false);
      setAnalyzed(true);
      // sync sliders to user inputs so they reflect what was analyzed
      if (userVolume > 0) setSimVolume(userVolume);
      if (userDelay > 0) setSimDelay(userDelay);
      if (suggestion) setAiSuggestion(suggestion);
      animateToTargets(targets);
    }, t.msgs.length * 600);
  };

  const fmtOpp = (n) =>
    currencyPos === "prefix" ? currencySymbol + n + "K" : n + "K" + currencySymbol;

  const sampleName = isArabic ? "أحمد" : "Ahmet";
  const sampleAmount = isArabic ? "12,500 ر.س" : lang === "EN" ? "$12,500" : "12.500 \u20BA";
  const filledWaMsg = t.waMessage.replace("{name}", sampleName).replace("{amount}", sampleAmount);
  const waUrl = "https://wa.me/?text=" + encodeURIComponent(filledWaMsg + " https://zyrix.co/pay/abc123");
  const mailtoUrl = "mailto:?subject=" + encodeURIComponent(t.emailSubjectValue) + "&body=" + encodeURIComponent(t.emailBody);

  const tints = [
    { bg: "rgba(16,185,129,.10)", badge: "linear-gradient(135deg,#10B981,#059669)", border: "rgba(16,185,129,.25)" },
    { bg: "rgba(245,158,11,.12)", badge: "linear-gradient(135deg,#F59E0B,#D97706)", border: "rgba(245,158,11,.28)" },
    { bg: "rgba(99,102,241,.10)", badge: "linear-gradient(135deg,#6366F1,#4F46E5)", border: "rgba(99,102,241,.28)" },
  ];

  const heroBg = "linear-gradient(180deg, #FFFFFF 0%, " + T.bgTinted + " 45%, #FFFFFF 100%)";
  const ctaGradient = "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")";

  const sparkData = [
    { values: [10, 12, 9, 14, 18, 16, 22, counts[0] + 20], color: C.emerald },
    { values: [50, 55, 48, 62, 58, 70, 68, counts[1] + 5], color: C.redDeep },
    { values: [3, 5, 4, 8, 10, 12, 11, counts[2]], color: "#6366F1" },
    { values: [40, 60, 55, 80, 100, 120, 140, counts[3]], color: C.amber },
  ];

  const donutHigh = Math.max(5, Math.min(60, counts[1]));
  const donutMid = Math.max(10, Math.min(50, Math.round(counts[1] * 0.6)));
  const donutLow = Math.max(5, 100 - donutHigh - donutMid);
  const donutTotal = donutLow + donutMid + donutHigh;
  const donutSlices = [
    { label: t.vizRiskLow, value: donutLow, color: C.emerald },
    { label: t.vizRiskMid, value: donutMid, color: C.amber },
    { label: t.vizRiskHigh, value: donutHigh, color: C.redDeep },
  ];

  const benchData = [
    { label: t.statCash, you: counts[0], avg: 12, suffix: "%", color: C.emerald },
    { label: t.statRisk, you: counts[1], avg: 28, suffix: "%", color: C.redDeep },
    { label: t.statPriority, you: counts[2], avg: 15, suffix: "", color: "#6366F1" },
  ];

  // Inaction projections (more dramatic than current state)
  const inactionN = Math.max(3, Math.round(counts[2] * 1.2));
  const inactionAmt = Math.max(20, Math.round(counts[3] * 0.6));
  const inactionRisk = Math.min(98, counts[1] + 13);

  const action1 = t.actionLine1.replace("{n}", String(counts[2] || 0));
  const action2 = t.actionLine2.replace("{amt}", fmtOpp(Math.max(10, Math.round(counts[3] * 0.4))));

  return (
    <>
      <NavV2 />
      <main style={{ direction: isRTL ? "rtl" : "ltr", minHeight: "100vh", color: C.ink, background: heroBg, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{".ai-pulse-dot{animation:ap 1.2s ease-in-out infinite}@keyframes ap{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.55}}.ai-fade-in{animation:af .5s ease}@keyframes af{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.zr-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:999px;background:rgba(0,0,0,.08);outline:none;cursor:pointer}.zr-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid currentColor;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18)}.zr-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid currentColor;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.18)}"}</style>


      <section style={{ position: "relative", padding: "120px 32px 40px" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: isArabic ? "radial-gradient(circle at 50% 30%, rgba(0,108,53,.16), transparent 50%)" : "radial-gradient(circle at 50% 30%, rgba(227,10,23,.16), transparent 50%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,.85)", border: "1px solid " + C.hairline, color: themeColor, fontSize: 11, fontWeight: 900, letterSpacing: "1.5px", boxShadow: "0 14px 32px rgba(58,5,9,.08)" }}>
              {"\u2726 " + t.badge}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.04em", fontWeight: 900, margin: 0, textAlign: "center", color: C.ink, maxWidth: 960, marginInline: "auto" }}>
            {t.h1Pre} <span style={{ color: themeColor }}>{t.h1Highlight}</span>
          </h1>
          <p style={{ margin: "20px auto 0", maxWidth: 780, fontSize: 16, lineHeight: 1.65, color: C.muted, fontWeight: 500, textAlign: "center" }}>{t.sub}</p>
        </div>
      </section>

      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32, alignItems: "stretch" }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* FORM CARD */}
            <div style={{ borderRadius: 32, padding: 32, background: "rgba(255,255,255,.9)", border: "1px solid " + C.hairline, boxShadow: "0 24px 70px rgba(58,5,9,.10)", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.ink, marginBottom: 6 }}>{t.formTitle}</div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, lineHeight: 1.55 }}>{t.formSub}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
                {t.fields.map((label, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                    <input type={i === 0 ? "text" : "number"} placeholder={t.placeholders[i]} value={inputs[i]} onChange={(e) => setInput(i, e.target.value)} style={{ width: "100%", height: 50, borderRadius: 14, border: "1px solid " + C.hairline, background: "#fff", padding: "0 14px", fontSize: 14, fontWeight: 700, color: C.ink, outline: "none", direction: isRTL ? "rtl" : "ltr", boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>
                ))}
              </div>
              <button onClick={handleAnalyze} disabled={loading} style={{ width: "100%", border: 0, cursor: loading ? "wait" : "pointer", borderRadius: 18, padding: "18px 24px", color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "inherit", background: ctaGradient, boxShadow: isArabic ? "0 22px 50px rgba(0,108,53,.28)" : "0 22px 50px rgba(227,10,23,.30)", opacity: loading ? 0.85 : 1 }}>
                {loading ? t.analyzing : t.analyzeBtn}
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, fontWeight: 700 }}>{t.analyzeSub}</div>
              </button>
              {(loading || analyzed) && (
                <div style={{ marginTop: 22, padding: "12px 16px", borderRadius: 12, background: analyzed ? "rgba(16,185,129,.08)" : (isArabic ? "rgba(0,108,53,.06)" : "rgba(227,10,23,.06)"), border: "1px solid " + C.hairline, fontSize: 13, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={loading ? "ai-pulse-dot" : ""} style={{ width: 8, height: 8, borderRadius: "50%", background: analyzed ? C.emerald : themeColor, boxShadow: "0 0 0 4px " + (analyzed ? "rgba(16,185,129,.18)" : (isArabic ? "rgba(0,108,53,.18)" : "rgba(227,10,23,.18)")) }} />
                  <span>{loading ? t.msgs[Math.min(step, t.msgs.length - 1)] : t.msgs[t.msgs.length - 1]}</span>
                </div>
              )}
            </div>

            {/* SIDE-BY-SIDE: AI INSIGHTS + INDUSTRY BENCHMARK */}
            {analyzed && (
              <div className="ai-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* AI INSIGHTS */}
                <div style={{ borderRadius: 22, padding: 18, background: "linear-gradient(135deg, rgba(99,102,241,.08), rgba(255,255,255,.92))", border: "1px solid rgba(99,102,241,.18)", boxShadow: "0 14px 40px rgba(58,5,9,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 9, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "#fff", fontSize: 13 }}>{"\u2728"}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{t.insightsTitle}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{t.insightsSub}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {t.insights.map((row, i) => {
                      const icons = ["\uD83D\uDCA1", "\u26A0\uFE0F", "\uD83C\uDFAF"];
                      return (
                        <div key={i} style={{ padding: "9px 10px", borderRadius: 10, background: "rgba(255,255,255,.85)", border: "1px solid " + C.hairline, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14, lineHeight: 1.2 }}>{icons[i]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: C.ink, lineHeight: 1.35 }}>{row[0]}</div>
                            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginTop: 2 }}>{row[1]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INDUSTRY BENCHMARK */}
                <div style={{ borderRadius: 22, padding: 18, background: "linear-gradient(135deg, rgba(16,185,129,.06), rgba(255,255,255,.92))", border: "1px solid rgba(16,185,129,.18)", boxShadow: "0 14px 40px rgba(58,5,9,.06)" }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.ink, marginBottom: 14, letterSpacing: "0.3px" }}>{t.benchTitle}</div>
                  {benchData.map((row, i) => {
                    const max = Math.max(Math.abs(row.you), row.avg) * 1.2 || 1;
                    const youW = (Math.abs(row.you) / max) * 100;
                    const avgW = (row.avg / max) * 100;
                    return (
                      <div key={i} style={{ marginBottom: i < benchData.length - 1 ? 12 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 4 }}>{row.label}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: row.color, minWidth: 28 }}>{t.benchYou}</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,.04)", overflow: "hidden" }}>
                            <div style={{ width: youW + "%", height: "100%", borderRadius: 999, background: row.color }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 900, color: row.color, fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "right" }}>{row.you + row.suffix}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, minWidth: 28 }}>{t.benchAvg}</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,0,0,.04)", overflow: "hidden" }}>
                            <div style={{ width: avgW + "%", height: "100%", borderRadius: 999, background: "rgba(0,0,0,.25)" }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, fontVariantNumeric: "tabular-nums", minWidth: 36, textAlign: "right" }}>{row.avg + row.suffix}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE ACTIVITY FEED - FULL WIDTH */}
            {analyzed && (
              <div className="ai-fade-in" style={{ borderRadius: 22, padding: 18, background: "linear-gradient(135deg," + (isArabic ? "rgba(0,108,53,.06)" : "rgba(227,10,23,.06)") + ", rgba(255,255,255,.92))", border: "1px solid " + C.hairline, boxShadow: "0 14px 40px rgba(58,5,9,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="ai-pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: C.emerald, boxShadow: "0 0 0 4px rgba(16,185,129,.18)" }} />
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, letterSpacing: "0.5px", textTransform: "uppercase" }}>{t.activityTitle}</div>
                </div>
                <div style={{ minHeight: 22, fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.5 }} key={activityIdx}>
                  <div className="ai-fade-in">{t.activityItems[activityIdx]}</div>
                </div>
              </div>
            )}

            {/* INTERACTIVE SIMULATION */}
            {analyzed && (
              <div className="ai-fade-in" style={{ borderRadius: 22, padding: 20, background: "linear-gradient(135deg, rgba(124,58,237,.06), rgba(255,255,255,.92))", border: "1px solid rgba(124,58,237,.18)", boxShadow: "0 14px 40px rgba(58,5,9,.06)" }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.ink, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 6 }}>{"\uD83C\uDFAE "}{t.simTitle}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{t.simSub}</div>
                </div>

                <div style={{ marginBottom: 14, color: "#7C3AED" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.simDelay}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#7C3AED", fontVariantNumeric: "tabular-nums" }}>{simDelay}%</span>
                  </div>
                  <input type="range" min="0" max="80" value={simDelay} onChange={(e) => setSimDelay(parseInt(e.target.value))} className="zr-slider" />
                </div>

                <div style={{ color: "#7C3AED" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.simVolume}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#7C3AED", fontVariantNumeric: "tabular-nums" }}>{simVolume.toLocaleString()}</span>
                  </div>
                  <input type="range" min="10000" max="2000000" step="10000" value={simVolume} onChange={(e) => setSimVolume(parseInt(e.target.value))} className="zr-slider" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ borderRadius: 32, padding: 32, background: "rgba(255,255,255,.85)", border: "1px solid " + C.hairline, boxShadow: "0 18px 60px rgba(58,5,9,.08)", opacity: analyzed ? 1 : 0.6, transition: "opacity .5s ease", display: "flex", flexDirection: "column" }}>
            {/* PRESSURE LAYER - threat headline */}
            <div style={{ borderRadius: 22, padding: 22, marginBottom: 20, background: riskClass === "high" ? "rgba(227,10,23,.10)" : riskClass === "medium" ? "rgba(245,158,11,.13)" : "rgba(16,185,129,.12)", border: "1px solid " + C.hairline }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: themeColor, letterSpacing: "1.5px", textTransform: "uppercase" }}>{"\u26A0 " + t.riskLabels[riskClass]}</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: C.ink, lineHeight: 1.25, letterSpacing: "-0.02em" }}>{t.pressureTitle.replace("{amt}", fmtOpp(counts[3]))}</div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: C.muted, lineHeight: 1.5 }}>{t.pressureThreat}</div>
            </div>

            {/* STAT CARDS WITH SPARKLINES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              {[
                { label: t.statCash, value: (counts[0] >= 0 ? "+" : "") + counts[0] + "%", color: C.emerald, bg: "rgba(16,185,129,.10)", spark: sparkData[0] },
                { label: t.statRisk, value: counts[1] + "%", color: C.redDeep, bg: "rgba(227,10,23,.10)", spark: sparkData[1] },
                { label: t.statPriority, value: String(counts[2]), color: "#6366F1", bg: "rgba(99,102,241,.10)", spark: sparkData[2] },
                { label: t.statOpportunity, value: fmtOpp(counts[3]), color: C.amber, bg: "rgba(245,158,11,.12)", spark: sparkData[3] },
              ].map((s, i) => (
                <div key={i} style={{ borderRadius: 16, padding: 16, background: s.bg, minHeight: 110, position: "relative", overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.5px" }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginTop: 6, fontFamily: "'Inter Tight', sans-serif", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                  {analyzed && (
                    <svg width="100%" height="32" viewBox="0 0 120 32" style={{ position: "absolute", bottom: 8, left: 0, right: 0, opacity: 0.7 }}>
                      <path d={sparklinePath(s.spark.values, 120, 28)} fill="none" stroke={s.spark.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {/* TODAY'S ACTIONS - dynamic */}
            <div style={{ borderRadius: 18, padding: 18, background: ctaGradient, color: "#fff", fontSize: 14, lineHeight: 1.6, fontWeight: 700, boxShadow: isArabic ? "0 16px 40px rgba(0,108,53,.22)" : "0 16px 40px rgba(227,10,23,.22)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{t.suggestionTitle}</div>
              <div>{"\u2022 " + action1}</div>
              <div style={{ marginTop: 6 }}>{"\u2022 " + action2}</div>
              {aiSuggestion && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.18)" }}>
                  <div>{"\u2022 " + aiSuggestion[0]}</div>
                  <div style={{ marginTop: 6 }}>{"\u2022 " + aiSuggestion[1]}</div>
                </div>
              )}
            </div>

            {analyzed && (
              <div style={{ marginTop: 18, borderRadius: 16, padding: 16, background: riskClass === "high" ? "rgba(227,10,23,.06)" : riskClass === "medium" ? "rgba(245,158,11,.08)" : "rgba(16,185,129,.08)", border: "1px dashed " + (riskClass === "high" ? "rgba(227,10,23,.35)" : riskClass === "medium" ? "rgba(245,158,11,.35)" : "rgba(16,185,129,.35)"), fontSize: 14, lineHeight: 1.55, color: C.ink, fontWeight: 700 }}>
                {urgencyText}
              </div>
            )}

            {/* DATA VISUALIZATION */}
            {analyzed && (
              <div className="ai-fade-in" style={{ marginTop: 22, borderRadius: 22, padding: 22, background: isArabic ? "linear-gradient(135deg, rgba(244,251,247,.95), rgba(255,255,255,.92))" : "linear-gradient(135deg, rgba(255,247,244,.95), rgba(255,255,255,.92))", border: "1px solid " + C.hairline, boxShadow: "0 18px 48px rgba(58,5,9,.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.5px", color: themeColor, textTransform: "uppercase", marginBottom: 6 }}>Data Visualization</div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.3 }}>{t.vizTitle}</h3>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.85)", border: "1px solid " + C.hairline, color: C.muted, fontSize: 11, fontWeight: 800 }}>{t.vizSubtitle}</div>
                </div>

                <div style={{ borderRadius: 16, padding: 16, background: "rgba(255,255,255,.86)", border: "1px solid " + C.hairline, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <strong style={{ fontSize: 13, color: C.ink }}>{t.vizCashflowLabel}</strong>
                    <span style={{ fontSize: 13, color: counts[0] >= 0 ? C.emerald : C.redDeep, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{(counts[0] >= 0 ? "+" : "") + counts[0] + "%"}</span>
                  </div>
                  <svg width="100%" height="140" viewBox="0 0 400 140" style={{ display: "block" }}>
                    <defs>
                      <linearGradient id="cashAreaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="cashLineGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const points = Array.from({ length: 12 }, (_, i) => {
                        const ratio = i / 11;
                        const target = Math.max(20, 30 + counts[0]);
                        const baseV = counts[0] >= 0 ? 30 + ratio * target * 1.3 : 90 - ratio * Math.abs(target);
                        const v = Math.max(15, Math.min(120, baseV));
                        const x = (i / 11) * 400;
                        const y = 140 - v;
                        return [x, y];
                      });
                      const linePath = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
                      const areaPath = linePath + " L 400,140 L 0,140 Z";
                      return (
                        <g>
                          <path d={areaPath} fill="url(#cashAreaGrad)" />
                          <path d={linePath} fill="none" stroke="url(#cashLineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, i) => (
                            <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke="#6366F1" strokeWidth="2" />
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                <div style={{ borderRadius: 16, padding: 16, background: "rgba(255,255,255,.86)", border: "1px solid " + C.hairline }}>
                  <strong style={{ fontSize: 13, color: C.ink, display: "block", marginBottom: 14 }}>{t.vizRiskLabel}</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      {(() => {
                        let startAngle = -Math.PI / 2;
                        return donutSlices.map((s, i) => {
                          const angle = (s.value / donutTotal) * Math.PI * 2;
                          const endAngle = startAngle + angle;
                          const path = donutSlice(60, 60, 52, 34, startAngle, endAngle);
                          startAngle = endAngle;
                          return <path key={i} d={path} fill={s.color} stroke="#fff" strokeWidth="2" />;
                        });
                      })()}
                      <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="900" fill={C.ink} fontFamily="'Inter Tight', sans-serif">{counts[1]}</text>
                      <text x="60" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.muted} letterSpacing="1">RISK</text>
                    </svg>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {donutSlices.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, color: C.ink }}>{s.label}</span>
                          <span style={{ color: C.muted, fontVariantNumeric: "tabular-nums" }}>{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FULL-WIDTH RECOMMENDATIONS */}
        {analyzed && (
          <div className="ai-fade-in" style={{ maxWidth: 1280, margin: "32px auto 0", borderRadius: 32, padding: 30, background: isArabic ? "linear-gradient(135deg, rgba(232,247,238,.95), rgba(255,255,255,.92))" : "linear-gradient(135deg, rgba(255,241,242,.95), rgba(255,255,255,.92))", border: "1px solid " + C.hairline, boxShadow: "0 28px 70px rgba(58,5,9,.10)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "1.8px", color: themeColor, textTransform: "uppercase", marginBottom: 8 }}>{t.recoBadge}</div>
                <h3 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: C.ink, lineHeight: 1.3, maxWidth: 720 }}>{t.recoTitle}</h3>
              </div>
              <div style={{ padding: "10px 16px", borderRadius: 999, background: "#fff", border: "1px solid " + C.hairline, color: C.muted, fontSize: 12, fontWeight: 800 }}>{t.recoChip}: {t.riskLabels[riskClass]}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
              {t.actions.map((row, idx) => {
                const num = row[0];
                const title = row[1];
                let descFilled = row[2];
                if (idx === 0) descFilled = descFilled.replace("{n}", String(counts[2]));
                if (idx === 1) descFilled = descFilled.replace("{amt}", fmtOpp(counts[3]));
                const tint = tints[idx % 3];
                return (
                  <div key={num} style={{ borderRadius: 20, padding: 20, background: tint.bg, border: "1px solid " + tint.border, boxShadow: "0 14px 32px rgba(58,5,9,.06)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 13, background: tint.badge, marginBottom: 14 }}>{num}</div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: C.ink, lineHeight: 1.35 }}>{title}</h4>
                    <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6, color: C.muted, fontWeight: 600 }}>{descFilled}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ borderRadius: 20, padding: 0, background: "rgba(255,255,255,.96)", border: "1px solid " + C.hairline, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ background: "#075E54", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="#fff"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9C13.4 28.4 14.7 29 16 29c6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>WhatsApp</span>
                    <span style={{ fontSize: 10, opacity: 0.8 }}>{t.waPreviewTitle}</span>
                  </div>
                </div>
                <div style={{ background: "#ECE5DD", padding: 14, flex: 1 }}>
                  <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.55, color: "#111", fontWeight: 600, boxShadow: "0 2px 5px rgba(0,0,0,.08)", maxWidth: "94%" }}>
                    <div>{filledWaMsg}</div>
                    <a href="https://zyrix.co/pay/abc123" target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, color: "#075E54", fontWeight: 800, fontSize: 12, textDecoration: "underline" }}>https://zyrix.co/pay/abc123</a>
                  </div>
                </div>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "#25D366", color: "#fff", fontWeight: 900, fontSize: 13, textDecoration: "none", letterSpacing: ".3px" }}>
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="#fff"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9C13.4 28.4 14.7 29 16 29c6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>
                  {t.waSendBtn}
                </a>
              </div>

              <div style={{ borderRadius: 20, padding: 0, background: "rgba(255,255,255,.96)", border: "1px solid " + C.hairline, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 16px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6h16zM4 18v-7.8l8 5 8-5V18z"/></svg>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>Email</span>
                    <span style={{ fontSize: 10, opacity: 0.9 }}>{t.emailPreviewTitle}</span>
                  </div>
                </div>
                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.ink }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}><strong style={{ color: C.ink }}>{t.emailTo}:</strong> ahmet@firmaornek.com</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}><strong style={{ color: C.ink }}>{t.emailSubject}:</strong> {t.emailSubjectValue}</div>
                  <div style={{ marginTop: 6, padding: 10, background: "rgba(0,0,0,.03)", borderRadius: 10, lineHeight: 1.55, fontWeight: 600 }}>{t.emailBody}</div>
                </div>
                <a href={mailtoUrl} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff", fontWeight: 900, fontSize: 13, textDecoration: "none", letterSpacing: ".3px" }}>
                  {t.emailSendBtn}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* "WHAT IF YOU DO NOTHING" - before CTA */}
        {analyzed && (
          <div className="ai-fade-in" style={{ maxWidth: 1280, margin: "32px auto 0", borderRadius: 32, padding: 32, background: "linear-gradient(135deg, rgba(227,10,23,.10), rgba(31,2,5,.92))", border: "1px solid rgba(227,10,23,.30)", boxShadow: "0 28px 70px rgba(227,10,23,.18)", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(255,26,42,.20)", border: "1px solid rgba(255,255,255,.18)", fontSize: 22 }}>{"\u26A0"}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "1.8px", color: "#FF6B7A", textTransform: "uppercase" }}>{t.inactionSub}</div>
                <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t.inactionTitle}</h3>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                t.inactionItems[0].replace("{n}", String(inactionN)),
                t.inactionItems[1].replace("{amt}", fmtOpp(inactionAmt)),
                t.inactionItems[2].replace("{risk}", String(inactionRisk)),
              ].map((line, i) => (
                <div key={i} style={{ borderRadius: 18, padding: 18, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, color: "#FF1A2A", fontWeight: 900 }}>{"\u2022"}</span>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>{line}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 1280, marginInline: "auto" }}>
          {t.benefits.map((row, i) => (
            <div key={i} style={{ borderRadius: 22, padding: "24px 26px", background: "rgba(255,255,255,.92)", border: "1px solid " + C.hairline, boxShadow: "0 16px 40px rgba(58,5,9,.07)", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.ink, lineHeight: 1.3 }}>{row[0]}</div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: C.muted, fontWeight: 600 }}>{row[1]}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: "60px auto 0", maxWidth: 860, borderRadius: 28, padding: 32, background: "rgba(255,255,255,.92)", border: "1px solid " + C.hairline, boxShadow: "0 24px 60px rgba(58,5,9,.10)", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: themeColor, letterSpacing: "1.5px", textTransform: "uppercase" }}>{t.socialProof}</div>
          <div style={{ marginTop: 18, fontSize: 22, fontWeight: 900, color: C.ink, lineHeight: 1.4 }}>{urgencyText}</div>

          <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link to="/register" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 20, padding: "20px 38px", color: "#fff", fontSize: 17, fontWeight: 900, textDecoration: "none", background: ctaGradient, boxShadow: isArabic ? "0 24px 60px rgba(0,108,53,.30)" : "0 24px 60px rgba(227,10,23,.32)" }}>
              {analyzed ? t.finalCtaPrimary + " \u2192" : t.ctaSecondary}
            </Link>
            <a href="mailto:hello@zyrix.co" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 20, padding: "20px 32px", color: C.ink, fontSize: 16, fontWeight: 900, textDecoration: "none", background: "#fff", border: "1px solid " + C.hairline }}>
              {t.finalCtaSecondary}
            </a>
          </div>

          <div style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", color: C.muted, fontSize: 13, fontWeight: 800 }}>
            {t.trustItems.map((item, i) => (
              <React.Fragment key={i}>
                <span>{item}</span>
                {i < t.trustItems.length - 1 && <span>{"\u2022"}</span>}
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: 22, fontSize: 11, color: C.muted, fontWeight: 600, opacity: 0.7 }}>{t.notice}</div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ---------- Palettes ----------
const C = {
  red:        "#E30A17",
  redDeep:    "#B30810",
  redBright:  "#FF1A2A",
  redSoft:    "#FFE3E5",
  wine900:    "#3A0509",
  wine950:    "#1F0205",
  bgTinted:   "#FFF7F4",
  ink:        "#1B0F11",
  muted:      "#5C4F52",
  hairline:   "rgba(0,0,0,.08)",
  emerald:    "#10B981",
  amber:      "#F59E0B",
  indigo:     "#6366F1",
};

const SA = {
  green:        "#006C35",
  greenDeep:    "#004D26",
  greenBright:  "#00A050",
  greenSoft:    "#DDF3E6",
  green900:     "#00190C",
  green950:     "#000B05",
  bgTinted:     "#F4FBF7",
  ink:          "#0B1A12",
  muted:        "#4A5C50",
  hairline:     "rgba(0,0,0,.08)",
  emerald:      "#10B981",
  amber:        "#F59E0B",
  indigo:       "#6366F1",
};

// ---------- Module IDs (stable across languages) ----------
const MODULE_IDS = ["invoice", "collection", "cashflow", "risk", "ai", "team"];

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    back: "Geri",
    badge: "ZYRIX ZEKA PLATFORMU",
    h1a: "Fatura operasyonunun ihtiyaci olan her sey",
    h1b: "tek bir akilli sistemde",
    sub: "Zyrix faturalari, tahsilatlari, nakit akisi sinyallerini, AI tavsiyelerini ve ekip aksiyonlarini, daha hizli nakit kazanmana yardim eden tek bir karar motorunda birlestirir.",
    ctaPrimary: "AI Nakit Akisi Analizini Baslat",
    ctaSecondary: "Nasil calistigini gor",

    mapEyebrow: "ZEKA HARITASI",
    mapTitle: "Alti motor. Tek nakit akisi komuta merkezi.",

    activeEyebrow: "AKTIF MOTOR",
    livePanel: "CANLI ZEKA PANELI",
    aiInsight: "AI Icgorusu",
    nextAction: "Onerilen sonraki aksiyon: AI analizini baslat ve ilk nakit akisi aksiyon planini olustur.",
    runThis: "Bu analizi calistir",

    dangerEyebrow: "ZYRIX NEDEN HER AKSIYONLA DAHA ZEKI",
    dangerTitle: "Her fatura, sinyal ve aksiyon, bir sonraki karari daha keskin hale getirir.",
    layer1Title: "Veri Katmani",
    layer1Desc: "Fatura ve odeme davranisi, yapilandirilmis bir zekaya donusur.",
    layer2Title: "AI Kararlari",
    layer2Desc: "Sistem ne olduguyla yetinmez, sirada ne yapilmasi gerektigini soyler.",
    layer3Title: "Otomasyon Katmani",
    layer3Desc: "Ekipler zaman kaybetmeden takipler ve aksiyonlar hazirlanir.",
    layer4Title: "Geri Besleme Dongusu",
    layer4Desc: "Her aksiyon, bir sonraki tavsiye dongusunu daha iyi yapar.",

    useEyebrow: "KULLANIM SENARYOLARI",
    useTitle: "Nakit akisini koruyan gunluk kararlar icin tasarlandi.",
    use1Title: "Geciken odemeleri azalt",
    use1Desc: "Gecikme riskini erken yakala, sorun buyumeden takip baslat.",
    use1Metric: "-18% gecikme",
    use2Title: "Nakit akisini ongor",
    use2Desc: "Nakdin nerede daralacagini, raporlara dusmeden once gor.",
    use2Metric: "+24% nakit gorunurlugu",
    use3Title: "Musterileri onceliklendir",
    use3Desc: "Ekibinin enerjisini en yuksek riskli ve en yuksek etkili musterilere yonlendir.",
    use3Metric: "12 oncelikli hesap",
    use4Title: "Takipleri otomatize et",
    use4Desc: "Mesajlar, aksiyonlar ve sonraki adimlar manuel kovalama olmadan hazirlanir.",
    use4Metric: "37 aksiyon hazir",

    cmpEyebrow: "PLATFORM KARSILASTIRMASI",
    cmpTitle: "Geleneksel araclar kayit yonetir. Zyrix kararlari yonetir.",
    cmpRows: [
      ["Statik fatura listeleri", "Canli fatura zekasi"],
      ["Manuel tahsilat", "AI ile onceliklendirilmis takipler"],
      ["Sorunlardan sonra raporlar", "Kayiplar buyumeden once risk sinyalleri"],
      ["Birbirinden kopuk araclar", "Nakit akisi aksiyonlari icin tek isletim sistemi"],
    ],

    finalEyebrow: "VERILERINLE BASLA",
    finalTitle: "Ilk AI nakit akisi analizinle basla.",
    finalSub: "Faturalarinin ne soyledigini gor, gizli riski kesfet ve ilk aksiyon planini olustur.",
    finalCta1: "Analizimi Calistir",
    finalCta2: "Fiyatlandirmayi gor",

    // Compliance Trust Strip
    trustEyebrow: "GUVEN ALTYAPISI",
    trustTitle: "Duzenlenmis fatura operasyonlari icin tasarlandi.",
    trustSub: "Zyrix kullanicinin pazar baglamina, diline ve is akisina uyum saglar; ekipleri jenerik finans surecine zorlamadan.",
    trust1Title: "Yerellesmis uyumluluk motoru",
    trust1Desc: "Fatura akislarini pazar baglamina gore uyarlar.",
    trust2Title: "Guvenli fatura verisi",
    trust2Desc: "Finansal kayitlari korumali ve yapili tutar.",
    trust3Title: "Denetim hazir akislar",
    trust3Desc: "Aksiyonlar ve fatura olaylari izlenebilir kalir.",
    trust4Title: "Rol tabanli erisim",
    trust4Desc: "Ekipler dogru seviyede dogru kontrol alir.",
    trust5Title: "API hazir mimari",
    trust5Desc: "Entegrasyonlar ve bagli sistemler icin tasarlanmis.",
    trust6Title: "Kurumsal seviyede kontrol",
    trust6Desc: "Guven ve gorunurluk gerektiren ekipler icin.",

    modules: {
      invoice: {
        name: "Fatura Zekasi",
        icon: "01",
        desc: "Her faturayi bir sinyale donustur. Zyrix hacmi, zamanlamayi, davranisi, gecikmeleri ve tahsilat hareketini okur.",
        benefits: [
          "Fatura davranisini anlik anla",
          "Olagandisi gecikme kaliplarini tespit et",
          "Onceligi gereken faturalari hemen gor",
        ],
        insight: "Son fatura davranisinda %18 gecikme riski tespit edildi.",
        metric: "%92",
        metricLabel: "gorunurluk",
      },
      collection: {
        name: "Tahsilat Otomasyonu",
        icon: "02",
        desc: "Manuel takipten cikip, musteri tabaninda akilli ve onceliklendirilmis tahsilat aksiyonlarina gec.",
        benefits: [
          "Riskli musterileri otomatik onceliklendir",
          "Takip mesajlarini hazirla",
          "Manuel tahsilat yukunu azalt",
        ],
        insight: "37 takip bugun otomatik olarak hazirlanabilir.",
        metric: "37",
        metricLabel: "aksiyon",
      },
      cashflow: {
        name: "Nakit Akisi Tahmini",
        icon: "03",
        desc: "Sorunlar raporlarda gorunmeden once, nakit akisinin nasil olabilecegini ongor.",
        benefits: [
          "Gelen nakit hareketini tahmin et",
          "Gelecekteki nakit bosluklarini fark et",
          "Baski gelmeden kararlari planla",
        ],
        insight: "Tahmini yillik geri kazanilabilir etki: 72.000.",
        metric: "72K",
        metricLabel: "etki",
      },
      risk: {
        name: "Musteri Risk Sinyalleri",
        icon: "04",
        desc: "Musterileri odeme davranisi, zamanlama degisikligi, risk hareketi ve takip aciliyetine gore puanla.",
        benefits: [
          "Kim odemeyi geciktirebilir, bil",
          "Musteri risk hareketini izle",
          "Ekibini en yuksek etkili hesaplara odakla",
        ],
        insight: "12 musteri oncelikli risk durumuna gecti.",
        metric: "12",
        metricLabel: "riskli hesap",
      },
      ai: {
        name: "AI Aksiyon Motoru",
        icon: "05",
        desc: "Zyrix icgorulerle yetinmez. Sonraki aksiyonu onerir ve uygulama yolunu hazirlar.",
        benefits: [
          "Icgoruleri aksiyona cevir",
          "Akilli oneriler uret",
          "Hatirlatmalari ve sonraki adimlari otomatik hazirla",
        ],
        insight: "AI, 9 yuksek riskli hesaba hatirlatma gondermeyi oneriyor.",
        metric: "9",
        metricLabel: "AI aksiyonu",
      },
      team: {
        name: "Ekip Kontrolu",
        icon: "06",
        desc: "Yoneticiler ve ekipler icin fatura operasyonlari, takipler, risk ve sonuclari tek komuta merkezinde topla.",
        benefits: [
          "Ekip aksiyonlarini takip et",
          "Onceliklere hakim ol",
          "Herkesi nakit akisi etrafinda hizala",
        ],
        insight: "Tekrarlayan takiplerin otomasyonu ile is yuku azaltilabilir.",
        metric: "%41",
        metricLabel: "daha az manuel is",
      },
    },
  },

  EN: {
    back: "Back",
    badge: "ZYRIX INTELLIGENCE PLATFORM",
    h1a: "Everything your invoice operation needs",
    h1b: "in one intelligent system",
    sub: "Zyrix connects invoices, collections, cashflow signals, AI recommendations, and team actions into one decision engine built to help you recover cash faster.",
    ctaPrimary: "Start AI Cashflow Analysis",
    ctaSecondary: "See how it works",

    mapEyebrow: "INTELLIGENCE MAP",
    mapTitle: "Six engines. One cashflow command center.",

    activeEyebrow: "ACTIVE ENGINE",
    livePanel: "LIVE INTELLIGENCE PANEL",
    aiInsight: "AI Insight",
    nextAction: "Recommended next action: start AI analysis and generate your first cashflow action plan.",
    runThis: "Run this analysis",

    dangerEyebrow: "WHY ZYRIX GETS SMARTER WITH EVERY ACTION",
    dangerTitle: "Each invoice, signal, and action makes the next decision sharper.",
    layer1Title: "Data Layer",
    layer1Desc: "Invoice and payment behavior becomes structured intelligence.",
    layer2Title: "AI Decisions",
    layer2Desc: "The system recommends what to do next, not just what happened.",
    layer3Title: "Automation Layer",
    layer3Desc: "Follow-ups and actions are prepared before teams waste time.",
    layer4Title: "Feedback Loop",
    layer4Desc: "Every action improves the next recommendation cycle.",

    useEyebrow: "USE CASES",
    useTitle: "Built for the daily decisions that protect cashflow.",
    use1Title: "Reduce delayed payments",
    use1Desc: "Catch delay risk earlier and trigger follow-ups before the problem grows.",
    use1Metric: "-18% delays",
    use2Title: "Predict cashflow",
    use2Desc: "See where cash may tighten before it appears in reports.",
    use2Metric: "+24% cashflow visibility",
    use3Title: "Prioritize customers",
    use3Desc: "Focus your team on customers with the highest risk and highest impact.",
    use3Metric: "12 priority accounts",
    use4Title: "Automate follow-ups",
    use4Desc: "Prepare messages, actions, and next steps without manual chasing.",
    use4Metric: "37 actions ready",

    cmpEyebrow: "PLATFORM COMPARISON",
    cmpTitle: "Traditional tools manage records. Zyrix manages decisions.",
    cmpRows: [
      ["Static invoice lists", "Live invoice intelligence"],
      ["Manual collections", "AI-prioritized follow-ups"],
      ["Reports after problems happen", "Risk signals before losses grow"],
      ["Separated tools", "One operating system for cashflow actions"],
    ],

    finalEyebrow: "START WITH YOUR DATA",
    finalTitle: "Start with your first AI cashflow analysis.",
    finalSub: "See what your invoices are telling you, discover hidden risk, and generate your first action plan.",
    finalCta1: "Run My Analysis",
    finalCta2: "See Pricing",

    // Compliance Trust Strip
    trustEyebrow: "COMPLIANCE TRUST LAYER",
    trustTitle: "Built for regulated invoice operations.",
    trustSub: "Zyrix adapts to the user's market context, language, and business workflow without forcing teams into generic finance processes.",
    trust1Title: "Localized compliance engine",
    trust1Desc: "Adapts invoice workflows to market context.",
    trust2Title: "Secure invoice data",
    trust2Desc: "Keeps financial records protected and structured.",
    trust3Title: "Audit-ready workflows",
    trust3Desc: "Actions and invoice events stay traceable.",
    trust4Title: "Role-based access",
    trust4Desc: "Teams get the right control at the right level.",
    trust5Title: "API-ready architecture",
    trust5Desc: "Designed for integrations and connected systems.",
    trust6Title: "Enterprise-grade controls",
    trust6Desc: "Built for teams that need trust and visibility.",

    modules: {
      invoice: {
        name: "Invoice Intelligence",
        icon: "01",
        desc: "Turn every invoice into a signal. Zyrix reads volume, timing, behavior, delays, and collection movement.",
        benefits: [
          "Understand invoice behavior instantly",
          "Detect unusual delay patterns",
          "See which invoices need attention first",
        ],
        insight: "18% delay risk detected across recent invoice behavior.",
        metric: "92%",
        metricLabel: "visibility",
      },
      collection: {
        name: "Collection Automation",
        icon: "02",
        desc: "Move from manual follow-up to smart, prioritized collection actions across your customer base.",
        benefits: [
          "Auto-prioritize risky customers",
          "Prepare follow-up messages",
          "Reduce manual collection workload",
        ],
        insight: "37 follow-ups can be prepared automatically today.",
        metric: "37",
        metricLabel: "actions",
      },
      cashflow: {
        name: "Cashflow Forecasting",
        icon: "03",
        desc: "Forecast what your cashflow may look like before problems appear in reports.",
        benefits: [
          "Predict incoming cash movement",
          "Spot future cashflow gaps",
          "Plan decisions before pressure hits",
        ],
        insight: "Estimated annual recoverable impact: 72,000.",
        metric: "72K",
        metricLabel: "impact",
      },
      risk: {
        name: "Customer Risk Signals",
        icon: "04",
        desc: "Score customers by payment behavior, timing changes, risk movement, and follow-up urgency.",
        benefits: [
          "Know who may delay payment",
          "Track customer risk movement",
          "Focus your team on the highest-impact accounts",
        ],
        insight: "12 customers moved into priority risk status.",
        metric: "12",
        metricLabel: "risk accounts",
      },
      ai: {
        name: "AI Action Engine",
        icon: "05",
        desc: "Zyrix does not stop at insights. It recommends the next action and prepares the execution path.",
        benefits: [
          "Turn insights into actions",
          "Generate smart recommendations",
          "Prepare reminders and next steps automatically",
        ],
        insight: "AI recommends sending reminders to 9 high-risk accounts.",
        metric: "9",
        metricLabel: "AI actions",
      },
      team: {
        name: "Team Control",
        icon: "06",
        desc: "Give managers and teams one command center for invoice operations, follow-ups, risk, and results.",
        benefits: [
          "Track team actions",
          "Control priorities",
          "Keep everyone aligned around cashflow",
        ],
        insight: "Team workload can be reduced by automating repeated follow-ups.",
        metric: "41%",
        metricLabel: "less manual work",
      },
    },
  },

  AR: {
    back: "\u0631\u062C\u0648\u0639",
    badge: "\u0645\u0646\u0635\u0629 \u0632\u064A\u0631\u0643\u0633 \u0627\u0644\u0630\u0643\u064A\u0629",
    h1a: "\u0643\u0644 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0641\u0648\u062A\u0631\u0629",
    h1b: "\u0641\u064A \u0646\u0638\u0627\u0645 \u0648\u0627\u062D\u062F \u0630\u0643\u064A",
    sub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u0631\u0628\u0637 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0648\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0623\u0641\u0639\u0627\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u0641\u064A \u0645\u062D\u0631\u0643 \u0642\u0631\u0627\u0631 \u0648\u0627\u062D\u062F \u064A\u0633\u0627\u0639\u062F\u0643 \u0639\u0644\u0649 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0646\u0642\u062F\u0643 \u0623\u0633\u0631\u0639.",
    ctaPrimary: "\u0627\u0628\u062F\u0623 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
    ctaSecondary: "\u0634\u0627\u0647\u062F \u0643\u064A\u0641 \u064A\u0639\u0645\u0644",

    mapEyebrow: "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0630\u0643\u0627\u0621",
    mapTitle: "\u0633\u062A\u0629 \u0645\u062D\u0631\u0643\u0627\u062A. \u0645\u0631\u0643\u0632 \u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u062D\u062F \u0644\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A.",

    activeEyebrow: "\u0627\u0644\u0645\u062D\u0631\u0643 \u0627\u0644\u0646\u0634\u0637",
    livePanel: "\u0644\u0648\u062D\u0629 \u0630\u0643\u0627\u0621 \u0645\u0628\u0627\u0634\u0631\u0629",
    aiInsight: "\u0631\u0624\u064A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    nextAction: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647: \u0627\u0628\u062F\u0623 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0623\u0646\u0634\u0626 \u062E\u0637\u0629 \u0639\u0645\u0644 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u0623\u0648\u0644\u0649.",
    runThis: "\u0646\u0641\u0651\u0630 \u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u0644\u064A\u0644",

    dangerEyebrow: "\u0644\u0645\u0627\u0630\u0627 \u064A\u0635\u0628\u062D \u0632\u064A\u0631\u0643\u0633 \u0623\u0630\u0643\u0649 \u0645\u0639 \u0643\u0644 \u0625\u062C\u0631\u0627\u0621",
    dangerTitle: "\u0643\u0644 \u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0625\u0634\u0627\u0631\u0629 \u0648\u0625\u062C\u0631\u0627\u0621\u060C \u064A\u062C\u0639\u0644 \u0627\u0644\u0642\u0631\u0627\u0631 \u0627\u0644\u062A\u0627\u0644\u064A \u0623\u0643\u062B\u0631 \u062F\u0642\u0651\u0629.",
    layer1Title: "\u0637\u0628\u0642\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
    layer1Desc: "\u0633\u0644\u0648\u0643 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062F\u0641\u0639 \u064A\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0630\u0643\u0627\u0621 \u0645\u0646\u0638\u0651\u0645.",
    layer2Title: "\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    layer2Desc: "\u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0648\u0635\u064A \u0628\u0645\u0627 \u064A\u062C\u0628 \u0641\u0639\u0644\u0647\u060C \u0644\u0627 \u064A\u0643\u062A\u0641\u064A \u0628\u0639\u0631\u0636 \u0645\u0627 \u062D\u062F\u062B.",
    layer3Title: "\u0637\u0628\u0642\u0629 \u0627\u0644\u0623\u062A\u0645\u062A\u0629",
    layer3Desc: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u0651\u062C\u0647\u0651\u0632 \u0642\u0628\u0644 \u0623\u0646 \u062A\u0636\u064A\u0639 \u0627\u0644\u0641\u0631\u0642 \u0648\u0642\u062A\u0647\u0627.",
    layer4Title: "\u062D\u0644\u0642\u0629 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0631\u0627\u062C\u0639\u0629",
    layer4Desc: "\u0643\u0644 \u0625\u062C\u0631\u0627\u0621 \u064A\u062D\u0633\u0651\u0646 \u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629.",

    useEyebrow: "\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
    useTitle: "\u0645\u0635\u0645\u0651\u0645 \u0644\u0644\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0627\u0644\u062A\u064A \u062A\u062D\u0645\u064A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A.",
    use1Title: "\u0642\u0644\u0644 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629",
    use1Desc: "\u0627\u0631\u0635\u062F \u062E\u0637\u0631 \u0627\u0644\u062A\u0623\u062E\u0631 \u0645\u0628\u0643\u0631\u0627\u064B \u0648\u0627\u0628\u062F\u0623 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0642\u0628\u0644 \u0623\u0646 \u062A\u0643\u0628\u0631 \u0627\u0644\u0645\u0634\u0643\u0644\u0629.",
    use1Metric: "-18% \u062A\u0623\u062E\u0631",
    use2Title: "\u062A\u0648\u0642\u0651\u0639 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
    use2Desc: "\u0634\u0648\u0641 \u0623\u064A\u0646 \u0633\u064A\u0636\u064A\u0642 \u0627\u0644\u0646\u0642\u062F \u0642\u0628\u0644 \u0623\u0646 \u064A\u0638\u0647\u0631 \u0641\u064A \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.",
    use2Metric: "+24% \u0648\u0636\u0648\u062D \u0627\u0644\u062A\u062F\u0641\u0642",
    use3Title: "\u0631\u062A\u0651\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    use3Desc: "\u0627\u062C\u0639\u0644 \u0641\u0631\u064A\u0642\u0643 \u064A\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0630\u0648\u064A \u0623\u0639\u0644\u0649 \u062E\u0637\u0631 \u0648\u0623\u0639\u0644\u0649 \u0623\u062B\u0631.",
    use3Metric: "12 \u062D\u0633\u0627\u0628 \u0623\u0648\u0644\u0648\u064A\u0629",
    use4Title: "\u0623\u062A\u0645\u062A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A",
    use4Desc: "\u0631\u0633\u0627\u0626\u0644 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u062E\u0637\u0648\u0627\u062A \u062A\u0627\u0644\u064A\u0629 \u0628\u062F\u0648\u0646 \u0645\u0644\u0627\u062D\u0642\u0629 \u064A\u062F\u0648\u064A\u0629.",
    use4Metric: "37 \u0625\u062C\u0631\u0627\u0621 \u062C\u0627\u0647\u0632",

    cmpEyebrow: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0645\u0646\u0635\u0627\u062A",
    cmpTitle: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629 \u062A\u062F\u064A\u0631 \u0627\u0644\u0633\u062C\u0644\u0627\u062A. \u0632\u064A\u0631\u0643\u0633 \u064A\u062F\u064A\u0631 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A.",
    cmpRows: [
      ["\u0642\u0648\u0627\u0626\u0645 \u0641\u0648\u0627\u062A\u064A\u0631 \u062B\u0627\u0628\u062A\u0629", "\u0630\u0643\u0627\u0621 \u0641\u0648\u0627\u062A\u064A\u0631 \u062D\u064A"],
      ["\u062A\u062D\u0635\u064A\u0644 \u064A\u062F\u0648\u064A", "\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0628\u0623\u0648\u0644\u0648\u064A\u0629 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064A"],
      ["\u062A\u0642\u0627\u0631\u064A\u0631 \u0628\u0639\u062F \u0648\u0642\u0648\u0639 \u0627\u0644\u0645\u0634\u0627\u0643\u0644", "\u0625\u0634\u0627\u0631\u0627\u062A \u062E\u0637\u0631 \u0642\u0628\u0644 \u062A\u0641\u0627\u0642\u0645 \u0627\u0644\u062E\u0633\u0627\u0626\u0631"],
      ["\u0623\u062F\u0648\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629", "\u0646\u0638\u0627\u0645 \u062A\u0634\u063A\u064A\u0644 \u0648\u0627\u062D\u062F \u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A"],
    ],

    finalEyebrow: "\u0627\u0628\u062F\u0623 \u0628\u0628\u064A\u0627\u0646\u0627\u062A\u0643",
    finalTitle: "\u0627\u0628\u062F\u0623 \u0628\u0623\u0648\u0644 \u062A\u062D\u0644\u064A\u0644 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0644\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A.",
    finalSub: "\u0634\u0648\u0641 \u0645\u0627\u0630\u0627 \u062A\u0642\u0648\u0644 \u0641\u0648\u0627\u062A\u064A\u0631\u0643\u060C \u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u062E\u0637\u0631 \u0627\u0644\u062E\u0641\u064A\u060C \u0648\u0623\u0646\u0634\u0626 \u062E\u0637\u0629 \u0639\u0645\u0644\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.",
    finalCta1: "\u0634\u063A\u0651\u0644 \u062A\u062D\u0644\u064A\u0644\u064A",
    finalCta2: "\u0634\u0627\u0647\u062F \u0627\u0644\u0623\u0633\u0639\u0627\u0631",

    // Compliance Trust Strip
    trustEyebrow: "طبقة الثقة والامتثال",
    trustTitle: "مصمَّم لعمليات الفواتير الخاضعة للتنظيم.",
    trustSub: "زيركس يتكيّف مع السياق السوقي للمستخدم ولغته وسير عمل أعماله، دون إجبار الفرق على عملية مالية عامة.",
    trust1Title: "محرّك امتثال محلي",
    trust1Desc: "يكيّف سير عمل الفواتير للسياق السوقي.",
    trust2Title: "بيانات فواتير آمنة",
    trust2Desc: "يحافظ على السجلات المالية محميّة ومنظّمة.",
    trust3Title: "سير عمل جاهز للتدقيق",
    trust3Desc: "تبقى الإجراءات وأحداث الفواتير قابلة للتتبّع.",
    trust4Title: "وصول حسب الدور",
    trust4Desc: "تحصل الفرق على الصلاحيات المناسبة في المستوى المناسب.",
    trust5Title: "بنية جاهزة لـ API",
    trust5Desc: "مصمَّمة للتكاملات والأنظمة المتصلة.",
    trust6Title: "ضوابط بمستوى المؤسسات",
    trust6Desc: "مصمَّم للفرق التي تحتاج إلى الثقة والوضوح.",

    modules: {
      invoice: {
        name: "\u0630\u0643\u0627\u0621 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
        icon: "01",
        desc: "\u062D\u0648\u0651\u0644 \u0643\u0644 \u0641\u0627\u062A\u0648\u0631\u0629 \u0625\u0644\u0649 \u0625\u0634\u0627\u0631\u0629. \u0632\u064A\u0631\u0643\u0633 \u064A\u0642\u0631\u0623 \u0627\u0644\u062D\u062C\u0645 \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0648\u0627\u0644\u0633\u0644\u0648\u0643 \u0648\u0627\u0644\u062A\u0623\u062E\u0631 \u0648\u062D\u0631\u0643\u0629 \u0627\u0644\u062A\u062D\u0635\u064A\u0644.",
        benefits: [
          "\u0627\u0641\u0647\u0645 \u0633\u0644\u0648\u0643 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0641\u0648\u0631\u0627\u064B",
          "\u0627\u0631\u0635\u062F \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062A\u0623\u062E\u0631 \u063A\u064A\u0631 \u0627\u0644\u0639\u0627\u062F\u064A\u0629",
          "\u0634\u0648\u0641 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u062A\u064A \u062A\u062D\u062A\u0627\u062C \u0627\u0646\u062A\u0628\u0627\u0647\u0627\u064B \u0623\u0648\u0644\u0627\u064B",
        ],
        insight: "\u062E\u0637\u0631 \u062A\u0623\u062E\u0631 \u0628\u0646\u0633\u0628\u0629 18% \u0641\u064A \u0633\u0644\u0648\u0643 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0623\u062E\u064A\u0631.",
        metric: "92%",
        metricLabel: "\u0648\u0636\u0648\u062D",
      },
      collection: {
        name: "\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u062A\u062D\u0635\u064A\u0644",
        icon: "02",
        desc: "\u0627\u0646\u062A\u0642\u0644 \u0645\u0646 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u064A\u062F\u0648\u064A\u0629 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u062D\u0635\u064A\u0644 \u0630\u0643\u064A\u0629 \u0648\u0645\u0631\u062A\u0651\u0628\u0629 \u0628\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 \u0639\u0628\u0631 \u0642\u0627\u0639\u062F\u0629 \u0639\u0645\u0644\u0627\u0626\u0643.",
        benefits: [
          "\u0631\u062A\u0651\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062E\u0637\u0631\u064A\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B",
          "\u062C\u0647\u0651\u0632 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
          "\u0642\u0644\u0651\u0644 \u0639\u0628\u0621 \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u064A\u062F\u0648\u064A",
        ],
        insight: "37 \u0645\u062A\u0627\u0628\u0639\u0629 \u064A\u0645\u0643\u0646 \u062A\u062C\u0647\u064A\u0632\u0647\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0627\u0644\u064A\u0648\u0645.",
        metric: "37",
        metricLabel: "\u0625\u062C\u0631\u0627\u0621",
      },
      cashflow: {
        name: "\u062A\u0648\u0642\u0651\u0639 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
        icon: "03",
        desc: "\u062A\u0648\u0642\u0651\u0639 \u0643\u064A\u0641 \u0633\u064A\u0628\u062F\u0648 \u062A\u062F\u0641\u0642\u0643 \u0627\u0644\u0646\u0642\u062F\u064A \u0642\u0628\u0644 \u0623\u0646 \u062A\u0638\u0647\u0631 \u0627\u0644\u0645\u0634\u0627\u0643\u0644 \u0641\u064A \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.",
        benefits: [
          "\u062A\u0648\u0642\u0651\u0639 \u062D\u0631\u0643\u0629 \u0627\u0644\u0646\u0642\u062F \u0627\u0644\u0648\u0627\u0631\u062F",
          "\u0627\u0631\u0635\u062F \u0641\u062C\u0648\u0627\u062A \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644\u064A\u0629",
          "\u062E\u0637\u0651\u0637 \u0642\u0631\u0627\u0631\u0627\u062A\u0643 \u0642\u0628\u0644 \u0648\u0635\u0648\u0644 \u0627\u0644\u0636\u063A\u0637",
        ],
        insight: "\u0627\u0644\u0623\u062B\u0631 \u0627\u0644\u0633\u0646\u0648\u064A \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F: 72,000.",
        metric: "72K",
        metricLabel: "\u0623\u062B\u0631",
      },
      risk: {
        name: "\u0625\u0634\u0627\u0631\u0627\u062A \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
        icon: "04",
        desc: "\u0631\u062A\u0651\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062D\u0633\u0628 \u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639\u060C \u062A\u063A\u064A\u0631 \u0627\u0644\u062A\u0648\u0642\u064A\u062A\u060C \u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062E\u0627\u0637\u0631\u060C \u0648\u0623\u0648\u0644\u0648\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629.",
        benefits: [
          "\u0627\u0639\u0631\u0641 \u0645\u0646 \u0642\u062F \u064A\u062A\u0623\u062E\u0631 \u0641\u064A \u0627\u0644\u062F\u0641\u0639",
          "\u062A\u062A\u0628\u0651\u0639 \u062D\u0631\u0643\u0629 \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
          "\u0631\u0643\u0651\u0632 \u0641\u0631\u064A\u0642\u0643 \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0623\u0639\u0644\u0649 \u0623\u062B\u0631\u0627\u064B",
        ],
        insight: "12 \u0639\u0645\u064A\u0644\u0627\u064B \u0627\u0646\u062A\u0642\u0644\u0648\u0627 \u0625\u0644\u0649 \u062D\u0627\u0644\u0629 \u0627\u0644\u062E\u0637\u0631 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629.",
        metric: "12",
        metricLabel: "\u062D\u0633\u0627\u0628 \u062E\u0637\u0631",
      },
      ai: {
        name: "\u0645\u062D\u0631\u0643 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        icon: "05",
        desc: "\u0632\u064A\u0631\u0643\u0633 \u0644\u0627 \u064A\u062A\u0648\u0642\u0641 \u0639\u0646\u062F \u0627\u0644\u0631\u0624\u0649. \u064A\u0648\u0635\u064A \u0628\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A \u0648\u064A\u062C\u0647\u0651\u0632 \u0645\u0633\u0627\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630.",
        benefits: [
          "\u062D\u0648\u0651\u0644 \u0627\u0644\u0631\u0624\u0649 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621\u0627\u062A",
          "\u0648\u0644\u0651\u062F \u062A\u0648\u0635\u064A\u0627\u062A \u0630\u0643\u064A\u0629",
          "\u062C\u0647\u0651\u0632 \u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B",
        ],
        insight: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u0648\u0635\u064A \u0628\u0625\u0631\u0633\u0627\u0644 \u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0625\u0644\u0649 9 \u062D\u0633\u0627\u0628\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062E\u0637\u0631.",
        metric: "9",
        metricLabel: "\u0625\u062C\u0631\u0627\u0621 \u0630\u0643\u064A",
      },
      team: {
        name: "\u062A\u062D\u0643\u0651\u0645 \u0627\u0644\u0641\u0631\u064A\u0642",
        icon: "06",
        desc: "\u0627\u0639\u0637\u0650 \u0627\u0644\u0645\u062F\u064A\u0631\u064A\u0646 \u0648\u0627\u0644\u0641\u0631\u0642 \u0645\u0631\u0643\u0632 \u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u062D\u062F\u0627\u064B \u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u0627\u0644\u062E\u0637\u0631 \u0648\u0627\u0644\u0646\u062A\u0627\u0626\u062C.",
        benefits: [
          "\u062A\u062A\u0628\u0651\u0639 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642",
          "\u062A\u062D\u0643\u0651\u0645 \u0641\u064A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0627\u062A",
          "\u0627\u062D\u0641\u0638 \u0627\u0644\u062C\u0645\u064A\u0639 \u0645\u062A\u0648\u0627\u0641\u0642\u064A\u0646 \u062D\u0648\u0644 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
        ],
        insight: "\u064A\u0645\u0643\u0646 \u062A\u0642\u0644\u064A\u0644 \u0639\u0628\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u0628\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629.",
        metric: "41%",
        metricLabel: "\u0639\u0645\u0644 \u064A\u062F\u0648\u064A \u0623\u0642\u0644",
      },
    },
  },
};


// ---------- Module icons (inline SVG paths) ----------
function renderModuleIcon(id, color) {
  const stroke = color || "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: stroke,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (id) {
    case "invoice":
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      );
    case "collection":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case "cashflow":
      return (
        <svg {...common}>
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="14 7 21 7 21 14" />
        </svg>
      );
    case "risk":
      return (
        <svg {...common}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M5.6 5.6l2.1 2.1" />
          <path d="M16.3 16.3l2.1 2.1" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="M5.6 18.4l2.1-2.1" />
          <path d="M16.3 7.7l2.1-2.1" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------- Component ----------
export default function FeaturesPage() {
  const i18n = useI18n();
  const lang = (i18n && i18n.lang) || "TR";
  const t = TXT[lang] || TXT.TR;
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;

  const themeColor   = isArabic ? SA.green       : C.red;
  const themeDeep    = isArabic ? SA.greenDeep   : C.redDeep;
  const themeBright  = isArabic ? SA.greenBright : C.redBright;
  const themeNight   = isArabic ? SA.green950    : C.wine950;

  const ctaShadow = isArabic
    ? "0 26px 64px rgba(0,108,53,.30)"
    : "0 26px 64px rgba(227,10,23,.30)";

  const cardShadow = isArabic
    ? "0 28px 74px rgba(0,77,38,.11)"
    : "0 28px 74px rgba(58,5,9,.11)";

  const heavyShadow = isArabic
    ? "0 34px 90px rgba(0,77,38,.22)"
    : "0 34px 90px rgba(58,5,9,.26)";

  const activeCardShadow = isArabic
    ? "0 24px 70px rgba(0,108,53,.28)"
    : "0 24px 70px rgba(227,10,23,.28)";

  const arrow = isRTL ? "\u2190" : "\u2192";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.86)",
    border: "1px solid " + T.hairline,
    boxShadow: cardShadow,
    backdropFilter: "blur(16px)",
  };

  // ---------- State ----------
  const [activeId, setActiveId] = useState("invoice");

  const activeModule = useMemo(() => {
    return t.modules[activeId] || t.modules.invoice;
  }, [activeId, t]);

  const moduleList = MODULE_IDS.map((id) => ({ id: id, ...t.modules[id] }));

  // ---------- Bar chart data ----------
  const barHeights = [42, 58, 70, 96, 88, 118, 132, 146];

  // ---------- Comparison rows ----------
  const cmpRows = t.cmpRows;

  return (
    <>
      <NavV2 />
      <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        direction: isRTL ? "rtl" : "ltr",
        minHeight: "100vh",
        color: T.ink,
        background: "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 46%,#fff 100%)",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <section style={{ padding: "148px 32px 78px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isArabic
              ? "radial-gradient(circle at 50% 12%, rgba(0,108,53,.16), transparent 50%)"
              : "radial-gradient(circle at 50% 12%, rgba(227,10,23,.18), transparent 50%)",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* NAV */}
          
          {/* HERO */}
          <div style={{ textAlign: "center", maxWidth: 980, margin: "0 auto 56px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,.86)",
                border: "1px solid " + T.hairline,
                color: themeColor,
                fontSize: 13,
                fontWeight: 950,
                letterSpacing: "1.3px",
                marginBottom: 20,
                boxShadow: "0 18px 44px rgba(58,5,9,.10)",
              }}
            >
              ✦ {t.badge}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px,5vw,68px)",
                lineHeight: 1.04,
                letterSpacing: "-0.06em",
                fontWeight: 950,
              }}
            >
              {t.h1a} <span style={{ color: themeColor }}>{t.h1b}</span>
            </h1>

            <p
              style={{
                margin: "24px auto 0",
                maxWidth: 780,
                color: T.muted,
                fontSize: 19,
                lineHeight: 1.75,
                fontWeight: 650,
              }}
            >
              {t.sub}
            </p>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/onboarding"
                style={{
                  borderRadius: 22,
                  padding: "20px 34px",
                  color: "#fff",
                  background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                  textDecoration: "none",
                  fontSize: 17,
                  fontWeight: 950,
                  boxShadow: ctaShadow,
                }}
              >
                {t.ctaPrimary} {arrow}
              </Link>

              <Link
                to="/how-it-works"
                style={{
                  borderRadius: 22,
                  padding: "19px 30px",
                  color: T.ink,
                  background: "#fff",
                  border: "1px solid " + T.hairline,
                  textDecoration: "none",
                  fontSize: 17,
                  fontWeight: 950,
                }}
              >
                {t.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* INTELLIGENCE MAP */}
          <div style={{ ...cardBase, padding: 34, marginBottom: 78 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 34px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                {t.mapEyebrow}
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.1,
                }}
              >
                {t.mapTitle}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 18,
              }}
            >
              {moduleList.map((m) => {
                const isActive = activeId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    style={{
                      textAlign: isRTL ? "right" : "left",
                      cursor: "pointer",
                      border: isActive
                        ? "2px solid " + themeColor
                        : "1px solid " + T.hairline,
                      borderRadius: 28,
                      padding: 24,
                      background: isActive
                        ? "linear-gradient(135deg, " + themeColor + ", " + themeDeep + ")"
                        : "rgba(255,255,255,.92)",
                      color: isActive ? "#fff" : T.ink,
                      boxShadow: isActive
                        ? activeCardShadow
                        : "0 16px 40px rgba(58,5,9,.06)",
                      transition: "transform .25s ease, box-shadow .25s ease",
                      transform: isActive ? "translateY(-2px)" : "translateY(0)",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 16,
                          display: "grid",
                          placeItems: "center",
                          background: isActive
                            ? "rgba(255,255,255,.16)"
                            : (isArabic ? "rgba(0,108,53,.10)" : "rgba(227,10,23,.08)"),
                          color: isActive ? "#fff" : themeColor,
                          flexShrink: 0,
                        }}
                      >
                        {renderModuleIcon(m.id, isActive ? "#fff" : themeColor)}
                      </div>
                      <div
                        style={{
                          fontWeight: 950,
                          fontSize: 15,
                          color: isActive ? "rgba(255,255,255,.78)" : T.muted,
                          letterSpacing: "1.2px",
                          fontFamily: "'Inter Tight', system-ui, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {m.icon}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 950,
                        letterSpacing: "-0.035em",
                      }}
                    >
                      {m.name}
                    </div>

                    <p
                      style={{
                        margin: "10px 0 0",
                        color: isActive ? "rgba(255,255,255,.78)" : T.muted,
                        fontSize: 14,
                        lineHeight: 1.65,
                        fontWeight: 650,
                      }}
                    >
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE FEATURE DETAIL */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: ".9fr 1.1fr",
              gap: 28,
              alignItems: "stretch",
              marginBottom: 78,
            }}
          >
            <div style={{ ...cardBase, padding: 36 }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 10,
                }}
              >
                {t.activeEyebrow}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: 950,
                  letterSpacing: "-0.055em",
                  lineHeight: 1.08,
                }}
              >
                {activeModule.name}
              </h2>

              <p
                style={{
                  marginTop: 16,
                  color: T.muted,
                  fontSize: 17,
                  lineHeight: 1.75,
                  fontWeight: 650,
                }}
              >
                {activeModule.desc}
              </p>

              <div style={{ display: "grid", gap: 14, marginTop: 28 }}>
                {activeModule.benefits.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 18,
                      borderRadius: 20,
                      background: "rgba(255,255,255,.92)",
                      border: "1px solid " + T.hairline,
                      fontWeight: 850,
                      color: T.ink,
                    }}
                  >
                    <span style={{ color: themeColor, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0, fontWeight: 950 }}>
                      ✓
                    </span>
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 36,
                padding: 34,
                background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                color: "#fff",
                boxShadow: heavyShadow,
              }}
            >
              <div style={{ opacity: 0.72, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px" }}>
                {t.livePanel}
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: "grid",
                  gridTemplateColumns: "1fr .75fr",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    padding: 24,
                    borderRadius: 26,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                >
                  <div style={{ opacity: 0.72, fontSize: 13, fontWeight: 850 }}>
                    {t.aiInsight}
                  </div>
                  <h3
                    style={{
                      margin: "10px 0 0",
                      fontSize: 26,
                      lineHeight: 1.18,
                      fontWeight: 950,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {activeModule.insight}
                  </h3>
                </div>

                <div
                  style={{
                    padding: 24,
                    borderRadius: 26,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                    display: "grid",
                    alignContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 950,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {activeModule.metric}
                  </div>
                  <div style={{ opacity: 0.72, fontWeight: 850, fontSize: 13, marginTop: 4 }}>
                    {activeModule.metricLabel}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 22,
                  borderRadius: 26,
                  padding: 24,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.13)",
                }}
              >
                <svg viewBox="0 0 360 170" width="100%" height="170" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGradFeat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={themeBright} stopOpacity="1" />
                      <stop offset="100%" stopColor={themeColor} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {barHeights.map((h, i) => {
                    const barWidth = 30;
                    const gap = 12;
                    const x = i * (barWidth + gap) + 8;
                    const y = 170 - h - 6;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={h}
                        rx={10}
                        fill="url(#barGradFeat)"
                        opacity={0.85 + (i / barHeights.length) * 0.15}
                      />
                    );
                  })}
                </svg>
              </div>

              <div
                style={{
                  marginTop: 22,
                  padding: 20,
                  borderRadius: 24,
                  background: "#fff",
                  color: T.ink,
                  fontWeight: 900,
                  lineHeight: 1.55,
                }}
              >
                {t.nextAction}
              </div>

              <div style={{ marginTop: 18, display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
                <Link
                  to="/onboarding"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 18,
                    padding: "13px 22px",
                    color: "#fff",
                    background: "rgba(255,255,255,.14)",
                    border: "1px solid rgba(255,255,255,.22)",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 950,
                    letterSpacing: "0.3px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {t.runThis} {arrow}
                </Link>
              </div>
            </div>
          </div>

          {/* DANGEROUS / HARD-TO-CATCH SECTION */}
          <div
            style={{
              borderRadius: 40,
              padding: 44,
              background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
              color: "#fff",
              boxShadow: heavyShadow,
              marginBottom: 78,
            }}
          >
            <div
              style={{
                opacity: 0.75,
                fontSize: 13,
                fontWeight: 950,
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              {t.dangerEyebrow}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                maxWidth: 860,
                lineHeight: 1.1,
              }}
            >
              {t.dangerTitle}
            </h2>

            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 16,
              }}
            >
              {[
                [t.layer1Title, t.layer1Desc],
                [t.layer2Title, t.layer2Desc],
                [t.layer3Title, t.layer3Desc],
                [t.layer4Title, t.layer4Desc],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 26,
                    padding: 24,
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {row[0]}
                  </h3>
                  <p style={{ margin: "10px 0 0", opacity: 0.78, lineHeight: 1.65, fontWeight: 650 }}>
                    {row[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* USE CASES */}
          <div style={{ marginBottom: 78 }}>
            <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 34px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                {t.useEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 42, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.1 }}>
                {t.useTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
              {[
                [t.use1Title, t.use1Desc, t.use1Metric],
                [t.use2Title, t.use2Desc, t.use2Metric],
                [t.use3Title, t.use3Desc, t.use3Metric],
                [t.use4Title, t.use4Desc, t.use4Metric],
              ].map((row, i) => (
                <div key={i} style={{ ...cardBase, padding: 26, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: "-0.035em" }}>
                    {row[0]}
                  </h3>
                  <p style={{ marginTop: 12, color: T.muted, lineHeight: 1.65, fontWeight: 650, flex: 1 }}>
                    {row[1]}
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      alignSelf: isRTL ? "flex-end" : "flex-start",
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: isArabic ? "rgba(0,108,53,.10)" : "rgba(227,10,23,.08)",
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "0.3px",
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row[2]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPARISON */}
          <div style={{ ...cardBase, padding: 38, marginBottom: 78 }}>
            <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 30px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                {t.cmpEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 38, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.cmpTitle}
              </h2>
            </div>

            {cmpRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  padding: "12px 0",
                  borderTop: "1px solid " + T.hairline,
                }}
              >
                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: "rgba(0,0,0,.035)",
                    color: T.muted,
                    fontWeight: 850,
                  }}
                >
                  {row[0]}
                </div>

                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: isArabic ? "rgba(0,108,53,.08)" : "rgba(227,10,23,.07)",
                    color: T.ink,
                    fontWeight: 950,
                  }}
                >
                  {row[1]}
                </div>
              </div>
            ))}
          </div>

          {/* COMPLIANCE TRUST STRIP */}
          <div
            style={{
              borderRadius: 40,
              padding: 42,
              marginBottom: 78,
              background: isArabic
                ? "linear-gradient(135deg, rgba(244,251,247,.96), rgba(255,255,255,.92))"
                : "linear-gradient(135deg, rgba(255,247,244,.96), rgba(255,255,255,.92))",
              border: "1px solid " + T.hairline,
              boxShadow: "0 28px 74px rgba(58,5,9,.10)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 34px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                {t.trustEyebrow}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                  color: T.ink,
                  lineHeight: 1.1,
                }}
              >
                {t.trustTitle}
              </h2>

              <p
                style={{
                  margin: "14px auto 0",
                  maxWidth: 720,
                  color: T.muted,
                  fontSize: 16,
                  lineHeight: 1.75,
                  fontWeight: 650,
                }}
              >
                {t.trustSub}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {[
                [t.trust1Title, t.trust1Desc],
                [t.trust2Title, t.trust2Desc],
                [t.trust3Title, t.trust3Desc],
                [t.trust4Title, t.trust4Desc],
                [t.trust5Title, t.trust5Desc],
                [t.trust6Title, t.trust6Desc],
              ].map((row, i) => {
                const isHighlighted = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: 26,
                      padding: 24,
                      background: isHighlighted
                        ? "linear-gradient(135deg, " + themeColor + ", " + themeDeep + ")"
                        : "rgba(255,255,255,.88)",
                      color: isHighlighted ? "#fff" : T.ink,
                      border: "1px solid " + T.hairline,
                      boxShadow: isHighlighted
                        ? (isArabic ? "0 24px 64px rgba(0,108,53,.24)" : "0 24px 64px rgba(227,10,23,.24)")
                        : "0 16px 40px rgba(58,5,9,.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        display: "grid",
                        placeItems: "center",
                        marginBottom: 16,
                        background: isHighlighted
                          ? "rgba(255,255,255,.18)"
                          : (isArabic ? "rgba(0,108,53,.10)" : "rgba(227,10,23,.08)"),
                        color: isHighlighted ? "#fff" : themeColor,
                        fontSize: 18,
                        fontWeight: 950,
                      }}
                    >
                      ✓
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 950,
                        letterSpacing: "-0.035em",
                        lineHeight: 1.25,
                      }}
                    >
                      {row[0]}
                    </h3>

                    <p
                      style={{
                        margin: "10px 0 0",
                        color: isHighlighted ? "rgba(255,255,255,.82)" : T.muted,
                        fontSize: 14,
                        lineHeight: 1.65,
                        fontWeight: 650,
                      }}
                    >
                      {row[1]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FINAL CTA */}
          <div
            style={{
              borderRadius: 40,
              padding: 38,
              background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
              color: "#fff",
              textAlign: "center",
              boxShadow: heavyShadow,
            }}
          >
            <div
              style={{
                opacity: 0.75,
                fontSize: 13,
                fontWeight: 950,
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              {t.finalEyebrow}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 38,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                lineHeight: 1.08,
              }}
            >
              {t.finalTitle}
            </h2>

            <p
              style={{
                margin: "14px auto 0",
                maxWidth: 650,
                opacity: 0.78,
                fontSize: 17,
                lineHeight: 1.7,
                fontWeight: 650,
              }}
            >
              {t.finalSub}
            </p>

            <div style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/onboarding"
                style={{
                  borderRadius: 22,
                  padding: "18px 32px",
                  color: T.ink,
                  background: "#fff",
                  textDecoration: "none",
                  fontSize: 17,
                  fontWeight: 950,
                }}
              >
                {t.finalCta1} {arrow}
              </Link>

              <Link
                to="/pricing"
                style={{
                  borderRadius: 22,
                  padding: "19px 34px",
                  color: "#fff",
                  background: "rgba(255,255,255,.10)",
                  border: "1px solid rgba(255,255,255,.18)",
                  textDecoration: "none",
                  fontSize: 17,
                  fontWeight: 950,
                }}
              >
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
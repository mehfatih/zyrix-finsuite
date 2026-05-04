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

// ---------- Stable industry IDs ----------
const CASE_IDS = ["ecommerce", "services", "trade", "manufacturing"];

// ---------- Numeric data shared across languages ----------
// Numbers are typed once; each language gets formatted versions.
const CASE_NUMBERS = {
  ecommerce:     { before: 42000, after: 13400, riskFrom: 31, riskTo: 18, delayDrop: 22, actions: 48, score: 92 },
  services:      { before: 18000, after: 5700,  riskFrom: 24, riskTo: 14, delayDrop: 17, actions: 29, score: 89 },
  trade:         { before: 63000, after: 20100, riskFrom: 38, riskTo: 21, delayDrop: 26, actions: 64, score: 94 },
  manufacturing: { before: 91000, after: 29100, riskFrom: 42, riskTo: 24, delayDrop: 31, actions: 77, score: 96 },
};

// ---------- Per-case visual identity ----------
// Each case gets its own accent (gradient + chart color) + chart type.
// Picked from the 6 primary colors, all cinematic / saturated.
const CASE_ACCENTS = {
  ecommerce: {
    bright:  "#FB923C",  // orange — energy, transactions, conversion urgency
    deep:    "#C2410C",
    night:   "#2A0F02",
    glowRGB: "251,146,60",
    chart:   "bar",
  },
  services: {
    bright:  "#A855F7",  // violet — AI, pattern detection, smart automation
    deep:    "#7E22CE",
    night:   "#1A0633",
    glowRGB: "168,85,247",
    chart:   "line",
  },
  trade: {
    bright:  "#3B82F6",  // blue — trust, B2B relationships, structured commerce
    deep:    "#1E40AF",
    night:   "#0A1B3D",
    glowRGB: "59,130,246",
    chart:   "stacked",
  },
  manufacturing: {
    bright:  "#10B981",  // green — growth, supply-chain health, recovery curve
    deep:    "#047857",
    night:   "#022C1F",
    glowRGB: "16,185,129",
    chart:   "area",
  },
};

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    back: "Geri",
    badge: "SONUC MOTORU",
    h1a: "Gercek nakit akisi sorunlari.",
    h1b: "Net iyilesme yollari.",
    sub: "Zyrix gizli fatura riskini, aksiyona hazir nakit kurtarma firsatlarina nasil cevirir gor.",
    ctaPrimary: "Gizli Nakdimi Goster",
    ctaSecondary: "Fiyatlandirmayi gor",

    socialProof: "Aylik 10M+ fatura hacmi yoneten ekipler tarafindan kullaniliyor",
    proofs: [
      ["2.300+", "simule edilen analiz"],
      ["4.2M", "haritalanan nakit akisi"],
      ["%92",   "risk gorunurlugu"],
      ["37",    "ortalama hazir aksiyon"],
    ],

    switcherEyebrow: "INTERAKTIF VAKA INCELEMESI",
    switcherTitle: "Hangisi senin durumuna en yakin?",

    caseEyebrow: "SECILEN VAKA",
    before: "Once",
    after: "Sonra",
    beforeNarrative: "her ay sessizce sizan",
    afterNarrative: "aktif olarak geri kazanilabilir",
    actionEyebrow: "ZYRIX AKSIYONU",

    breakdownEyebrow: "IYILESME ANALIZI",
    riskMovement: "risk hareketi",
    delayReduction: "gecikme azalmasi",
    actionsReady: "hazir aksiyon",
    chartBefore: "Onceki risk",
    chartAfter: "Aksiyon sonrasi",
    aiRecHeader: "Senin gibi paternlere dayanarak:",
    aiRec: "AI tavsiyesi: yuksek riskli musterileri onceliklendir, akilli hatirlatmalari calistir, sonraki 30 gunluk beklenen nakit akisini izle.",

    timelineEyebrow: "AKSIYON ZAMAN CIZGISI",
    timelineTitle: "Zyrix akisa girdikten sonra ne degisti.",
    day1Title: "Risk kaliplari tespit edildi",
    day1Desc:  "Gizli gecikmeler artik gorunur.",
    day3Title: "Musteriler onceliklendirildi",
    day3Desc:  "Ekip kime ilk dokunulmasi gerektigini goruyor.",
    day7Title: "Takipler hazirlandi",
    day7Desc:  "Mesajlar ve aksiyonlar uygulanmaya hazir.",
    day30Title: "Nakit iyilesmesi haritalandi",
    day30Desc:  "Isletme neyin geri kazanilabilecegini goruyor.",
    timeToValue: "Cogu ekip ilk iyilesme firsatini 7 gun icinde gorur.",
    dayLabels: ["Gun 1", "Gun 3", "Gun 7", "Gun 30"],

    changedEyebrow: "NE DEGISTI",
    changedTitle: "Isletme reaktif tahsilattan AI rehberli iyilesmeye gecti.",
    changedRows: [
      ["Manuel kovalama", "Onceliklendirilmis aksiyonlar"],
      ["Gec raporlama",   "Erken risk sinyalleri"],
      ["Tahmin ederek karar verme", "AI rehberli iyilesme"],
    ],

    buildEyebrow: "KENDI VAKANI OLUSTUR",
    buildTitle: "Muhtemelen su an bunu kaybediyorsun.",
    buildSub: "Hadi rakamlastiralim.",
    inputVolume: "Aylik fatura hacmi",
    inputDelay:  "Gecikme orani",
    yourCase: "TAHMINI VAKAN",
    out1: "Aylik kayip",
    out2: "Geri kazanilabilir nakit",
    out3: "Yillik firsat",
    buildCta: "Gizli Nakdimi Goster",

    realityLine1: "Bu tanidik geliyorsa,",
    realityLine2: "muhtemelen su an para kaybediyorsun.",
    realityLine3: "Tek soru:",
    realityLine4: "ne kadar daha gormezden gelmeye devam edeceksin.",
    finalEyebrow: "SIRA SENDE",
    finalTitle: "Kendi iyilesme hikayeni olustur.",
    finalSub: "Fatura davranisinla basla, gizli nakit riskini kesfet ve ilk aksiyon planini olustur.",
    finalCta1: "Gizli Nakdimi Goster",
    finalCta2: "Ozellikleri kesfet",

    cases: {
      ecommerce: {
        industry: "E-ticaret",
        title: "Yuksek hacimli faturalar, gorunmeyen geciken odemeler",
        problem: "Hizli buyuyen bir online operasyonun fatura hacmi artiyordu ama geciken tahsilatlar icin erken uyari yoktu.",
        action: "Zyrix riskli faturalari onceliklendirdi ve otomatik takip aksiyonlarini hazirladi.",
        reco1: "En riskli %12 musteriye once odaklan",
        reco2: "48 saat icinde otomatik takip baslat",
        reco3: "Sonraki 30 gun nakit bosluklarini izle",
      },
      services: {
        industry: "Hizmetler",
        title: "Manuel takipler nakit iyilesmesini yavaslattyordu",
        problem: "Ekip manuel takibe guveniyordu, takipler gec ve tutarsiz oluyordu.",
        action: "Zyrix gecikme kaliplarini tespit etti ve gunluk takip oncelikleri uretti.",
        reco1: "Manuel kovalama yerine gunluk oncelik listesi olustur",
        reco2: "Gecikme paterni gosteren musterileri ana ekrana cek",
        reco3: "Hafta basinda tek kararla 29 takip baslat",
      },
      trade: {
        industry: "Ticaret",
        title: "Musteri riski fatura gecmisinin icinde gizliydi",
        problem: "Birden fazla musterinin odeme davranisi degisti ama risk ancak gecikmeler olduktan sonra gorulebildi.",
        action: "Zyrix musterileri odeme davranisina gore puanladi ve riskli hesaplari oncelikli takibe aldi.",
        reco1: "12 oncelikli hesabi acil takip kuyruguna al",
        reco2: "Odeme davranisi degisen musterilere risk skoru ata",
        reco3: "Kritik 64 aksiyonu sonraki 7 gune yay",
      },
      manufacturing: {
        industry: "Uretim",
        title: "Nakit akisi bosluklari cok gec goruluyordu",
        problem: "Operasyonel nakit akisi odeme zamanlamasina baglydi ama tahmin gucu yoktu.",
        action: "Zyrix nakit akisi baskisini ongorerek daha erken tahsilat aksiyonlari onerdi.",
        reco1: "Sonraki 30 gunluk nakit baskisini onceden raporla",
        reco2: "Yuksek tutarli 24 fatura icin daha erken takip baslat",
        reco3: "Operasyonel nakit akisi pencereni 31% genislet",
      },
    },
  },

  EN: {
    back: "Back",
    badge: "RESULTS ENGINE",
    h1a: "Real cashflow problems.",
    h1b: "Clear recovery paths.",
    sub: "See how Zyrix turns hidden invoice risk into prioritized actions, automated follow-ups, and recoverable cashflow opportunities.",
    ctaPrimary: "Show Me My Hidden Cash",
    ctaSecondary: "See Pricing",

    socialProof: "Used by teams managing $10M+ invoice volume monthly",
    proofs: [
      ["2,300+", "analyses simulated"],
      ["$4.2M",  "cashflow mapped"],
      ["92%",    "risk visibility"],
      ["37",     "actions ready average"],
    ],

    switcherEyebrow: "INTERACTIVE CASE BREAKDOWN",
    switcherTitle: "Which one looks closest to your situation?",

    caseEyebrow: "SELECTED CASE",
    before: "Before",
    after: "After",
    beforeNarrative: "quietly leaking every month",
    afterNarrative: "actively recoverable",
    actionEyebrow: "ZYRIX ACTION",

    breakdownEyebrow: "RECOVERY BREAKDOWN",
    riskMovement: "risk movement",
    delayReduction: "delay reduction",
    actionsReady: "actions ready",
    chartBefore: "Before risk",
    chartAfter: "After actions",
    aiRecHeader: "Based on patterns like yours:",
    aiRec: "AI recommendation: prioritize high-risk customers, trigger smart reminders, and monitor the next 30 days of expected cashflow.",

    timelineEyebrow: "ACTION TIMELINE",
    timelineTitle: "What changed after Zyrix entered the flow.",
    day1Title: "Risk patterns detected",
    day1Desc:  "Hidden delays become visible.",
    day3Title: "Customers prioritized",
    day3Desc:  "The team sees who needs attention first.",
    day7Title: "Follow-ups prepared",
    day7Desc:  "Messages and actions are ready to execute.",
    day30Title: "Cashflow recovery mapped",
    day30Desc:  "The business sees what can be recovered.",
    timeToValue: "Most teams see their first recovery opportunity within 7 days.",
    dayLabels: ["Day 1", "Day 3", "Day 7", "Day 30"],

    changedEyebrow: "WHAT CHANGED",
    changedTitle: "The business moved from reactive collection to AI-guided recovery.",
    changedRows: [
      ["Manual chasing",      "Prioritized actions"],
      ["Late reporting",      "Early risk signals"],
      ["Guessing what to do", "AI-guided recovery"],
    ],

    buildEyebrow: "BUILD YOUR OWN CASE",
    buildTitle: "You're probably already losing this much.",
    buildSub: "Let's quantify it.",
    inputVolume: "Monthly invoice volume",
    inputDelay:  "Delay rate",
    yourCase: "YOUR ESTIMATED CASE",
    out1: "Monthly leakage",
    out2: "Recoverable cash",
    out3: "Annual opportunity",
    buildCta: "Show Me My Hidden Cash",

    realityLine1: "If this looks familiar,",
    realityLine2: "you're already losing money.",
    realityLine3: "The only question is:",
    realityLine4: "how long you keep ignoring it.",
    finalEyebrow: "YOUR TURN",
    finalTitle: "Create your own recovery story.",
    finalSub: "Start with your invoice behavior, discover hidden cashflow risk, and generate your first action plan.",
    finalCta1: "Show Me My Hidden Cash",
    finalCta2: "Explore Features",

    cases: {
      ecommerce: {
        industry: "E-commerce",
        title: "High-volume invoices, invisible delayed payments",
        problem: "A fast-moving online operation had growing invoice volume but no early warning for delayed collections.",
        action: "Zyrix prioritized risky invoices and prepared automated follow-up actions.",
        reco1: "Focus on the top 12% riskiest customers first",
        reco2: "Trigger automated follow-ups within 48 hours",
        reco3: "Monitor the next 30-day cashflow gap",
      },
      services: {
        industry: "Services",
        title: "Manual follow-ups were slowing down cash recovery",
        problem: "The team relied on manual tracking, causing follow-ups to happen late and inconsistently.",
        action: "Zyrix detected delay patterns and generated daily follow-up priorities.",
        reco1: "Replace manual chasing with a daily priority list",
        reco2: "Surface customers with new delay patterns to the top",
        reco3: "Launch 29 follow-ups with a single weekly decision",
      },
      trade: {
        industry: "Trade",
        title: "Customer risk was hidden inside invoice history",
        problem: "Payment behavior changed across multiple customers, but the risk was only visible after delays happened.",
        action: "Zyrix scored customers by payment behavior and moved risky accounts to priority follow-up.",
        reco1: "Move 12 priority accounts into the urgent follow-up queue",
        reco2: "Assign risk scores to customers shifting payment behavior",
        reco3: "Spread the critical 64 actions across the next 7 days",
      },
      manufacturing: {
        industry: "Manufacturing",
        title: "Cashflow gaps were appearing too late",
        problem: "Operational cashflow depended on payment timing, but the business had no predictive view.",
        action: "Zyrix forecasted cashflow pressure and recommended earlier collection actions.",
        reco1: "Pre-report cashflow pressure for the next 30 days",
        reco2: "Trigger earlier follow-ups on the 24 highest-value invoices",
        reco3: "Widen your operational cashflow window by 31%",
      },
    },
  },

  AR: {
    back: "\u0631\u062C\u0648\u0639",
    badge: "\u0645\u062D\u0631\u0643 \u0627\u0644\u0646\u062A\u0627\u0626\u062C",
    h1a: "\u0645\u0634\u0627\u0643\u0644 \u062A\u062F\u0641\u0642 \u0646\u0642\u062F\u064A \u062D\u0642\u064A\u0642\u064A\u0629.",
    h1b: "\u0645\u0633\u0627\u0631\u0627\u062A \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u0627\u0636\u062D\u0629.",
    sub: "\u0634\u0627\u0647\u062F \u0643\u064A\u0641 \u064A\u062D\u0648\u0651\u0644 \u0632\u064A\u0631\u0643\u0633 \u062E\u0637\u0631 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u062E\u0641\u064A \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u0631\u062A\u0628\u0629 \u0628\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629\u060C \u0648\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0622\u0644\u064A\u0629\u060C \u0648\u0641\u0631\u0635 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0646\u0642\u062F\u064A.",
    ctaPrimary: "\u0627\u0643\u0634\u0641 \u0646\u0642\u062F\u064A \u0627\u0644\u0645\u062E\u0641\u064A",
    ctaSecondary: "\u0634\u0627\u0647\u062F \u0627\u0644\u0623\u0633\u0639\u0627\u0631",

    proofs: [
      ["+2,300", "\u062A\u062D\u0644\u064A\u0644 \u0645\u062D\u0627\u0643\u0649"],
      ["4.2M",   "\u0646\u0642\u062F \u0645\u062F\u0631\u0648\u0633"],
      ["92%",    "\u0648\u0636\u0648\u062D \u0627\u0644\u0645\u062E\u0627\u0637\u0631"],
      ["37",     "\u0625\u062C\u0631\u0627\u0621 \u062C\u0627\u0647\u0632 \u0641\u064A \u0627\u0644\u0645\u062A\u0648\u0633\u0637"],
    ],

    switcherEyebrow: "\u062A\u062D\u0644\u064A\u0644 \u062A\u0641\u0627\u0639\u0644\u064A \u0644\u0644\u062D\u0627\u0644\u0627\u062A",
    switcherTitle: "\u0623\u064A \u062D\u0627\u0644\u0629 \u062A\u0634\u0628\u0647 \u0648\u0636\u0639\u0643 \u0623\u0643\u062B\u0631\u061F",

    caseEyebrow: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629",
    before: "\u0642\u0628\u0644",
    after: "\u0628\u0639\u062F",
    beforeNarrative: "\u064A\u062A\u0633\u0631\u0651\u0628 \u0628\u0635\u0645\u062A \u0643\u0644 \u0634\u0647\u0631",
    afterNarrative: "\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0641\u0639\u0644\u064A\u0651\u0627\u064B",
    actionEyebrow: "\u0625\u062C\u0631\u0627\u0621 \u0632\u064A\u0631\u0643\u0633",

    breakdownEyebrow: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
    riskMovement: "\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062E\u0627\u0637\u0631",
    delayReduction: "\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u062A\u0623\u062E\u0631",
    actionsReady: "\u0625\u062C\u0631\u0627\u0621 \u062C\u0627\u0647\u0632",
    chartBefore: "\u0627\u0644\u062E\u0637\u0631 \u0627\u0644\u0633\u0627\u0628\u0642",
    chartAfter: "\u0628\u0639\u062F \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
    aiRecHeader: "\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0623\u0646\u0645\u0627\u0637 \u062A\u0634\u0628\u0647 \u0648\u0636\u0639\u0643:",
    aiRec: "\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A: \u0631\u062A\u0651\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0623\u0639\u0644\u0649 \u062E\u0637\u0631\u0627\u064B\u060C \u0648\u0634\u063A\u0651\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u0630\u0643\u064A\u0629\u060C \u0648\u0631\u0627\u0642\u0628 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0651\u0639 \u0644\u0640 30 \u064A\u0648\u0645\u0627\u064B \u0627\u0644\u0642\u0627\u062F\u0645\u0629.",

    timelineEyebrow: "\u062E\u0637 \u0632\u0645\u0646\u064A \u0644\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
    timelineTitle: "\u0645\u0627\u0630\u0627 \u062A\u063A\u064A\u0651\u0631 \u0628\u0639\u062F \u062F\u062E\u0648\u0644 \u0632\u064A\u0631\u0643\u0633.",
    day1Title: "\u0631\u0635\u062F \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062E\u0637\u0631",
    day1Desc:  "\u0627\u0644\u062A\u0623\u062E\u0631 \u0627\u0644\u062E\u0641\u064A \u0623\u0635\u0628\u062D \u0648\u0627\u0636\u062D\u0627\u064B.",
    day3Title: "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    day3Desc:  "\u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0631\u0649 \u0645\u0646 \u064A\u062D\u062A\u0627\u062C \u0627\u0646\u062A\u0628\u0627\u0647\u0627\u064B \u0623\u0648\u0644\u0627\u064B.",
    day7Title: "\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A",
    day7Desc:  "\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630.",
    day30Title: "\u0631\u0633\u0645 \u0645\u0633\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0646\u0642\u062F\u064A",
    day30Desc:  "\u0627\u0644\u0639\u0645\u0644 \u064A\u0631\u0649 \u0645\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0631\u062F\u0627\u062F\u0647.",
    timeToValue: "\u0645\u0639\u0638\u0645 \u0627\u0644\u0641\u0631\u0642 \u062A\u0631\u0649 \u0623\u0648\u0644 \u0641\u0631\u0635\u0629 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645.",
    dayLabels: ["\u0627\u0644\u064A\u0648\u0645 1", "\u0627\u0644\u064A\u0648\u0645 3", "\u0627\u0644\u064A\u0648\u0645 7", "\u0627\u0644\u064A\u0648\u0645 30"],

    changedEyebrow: "\u0645\u0627\u0630\u0627 \u062A\u063A\u064A\u0651\u0631",
    changedTitle: "\u0627\u0646\u062A\u0642\u0644 \u0627\u0644\u0639\u0645\u0644 \u0645\u0646 \u062A\u062D\u0635\u064A\u0644 \u0627\u0646\u0641\u0639\u0627\u0644\u064A \u0625\u0644\u0649 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0628\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A.",
    changedRows: [
      ["\u0645\u0644\u0627\u062D\u0642\u0629 \u064A\u062F\u0648\u064A\u0629", "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0628\u0623\u0648\u0644\u0648\u064A\u0629"],
      ["\u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u062A\u0623\u062E\u0631\u0629", "\u0625\u0634\u0627\u0631\u0627\u062A \u062E\u0637\u0631 \u0645\u0628\u0643\u0631\u0629"],
      ["\u0642\u0631\u0627\u0631\u0627\u062A \u0628\u0627\u0644\u062A\u062E\u0645\u064A\u0646", "\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0628\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A"],
    ],

    buildEyebrow: "\u0627\u0628\u0646\u0650 \u062D\u0627\u0644\u062A\u0643",
    buildTitle: "\u063A\u0627\u0644\u0628\u0627\u064B \u0623\u0646\u062A \u062A\u062E\u0633\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0622\u0646.",
    buildSub: "\u0647\u064A\u0627 \u0646\u0642\u064A\u0633\u0647.",
    inputVolume: "\u062D\u062C\u0645 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0634\u0647\u0631\u064A",
    inputDelay:  "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0623\u062E\u0631",
    yourCase: "\u062D\u0627\u0644\u062A\u0643 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629",
    out1: "\u062A\u0633\u0631\u0651\u0628 \u0634\u0647\u0631\u064A",
    out2: "\u0646\u0642\u062F \u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
    out3: "\u0641\u0631\u0635\u0629 \u0633\u0646\u0648\u064A\u0629",
    buildCta: "\u0627\u0643\u0634\u0641 \u0646\u0642\u062F\u064A \u0627\u0644\u0645\u062E\u0641\u064A",

    realityLine1: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0647\u0630\u0627 \u064A\u0628\u062F\u0648 \u0645\u0623\u0644\u0648\u0641\u0627\u064B\u060C",
    realityLine2: "\u0641\u0623\u0646\u062A \u062A\u062E\u0633\u0631 \u0627\u0644\u0645\u0627\u0644 \u0627\u0644\u0622\u0646.",
    realityLine3: "\u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0648\u062D\u064A\u062F:",
    realityLine4: "\u0643\u0645 \u0633\u062A\u0633\u062A\u0645\u0631 \u0641\u064A \u062A\u062C\u0627\u0647\u0644 \u0630\u0644\u0643.",
    finalEyebrow: "\u062F\u0648\u0631\u0643",
    finalTitle: "\u0623\u0646\u0634\u0626 \u0642\u0635\u0629 \u0627\u0633\u062A\u0631\u062F\u0627\u062F\u0643 \u0627\u0644\u062E\u0627\u0635\u0629.",
    finalSub: "\u0627\u0628\u062F\u0623 \u0628\u0633\u0644\u0648\u0643 \u0641\u0648\u0627\u062A\u064A\u0631\u0643\u060C \u0627\u0643\u062A\u0634\u0641 \u0627\u0644\u062E\u0637\u0631 \u0627\u0644\u062E\u0641\u064A\u060C \u0648\u0623\u0646\u0634\u0626 \u062E\u0637\u0629 \u0639\u0645\u0644\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.",
    finalCta1: "\u0627\u0643\u0634\u0641 \u0646\u0642\u062F\u064A \u0627\u0644\u0645\u062E\u0641\u064A",
    finalCta2: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u064A\u0632\u0627\u062A",

    cases: {
      ecommerce: {
        industry: "\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629",
        title: "\u0641\u0648\u0627\u062A\u064A\u0631 \u0628\u062D\u062C\u0645 \u0639\u0627\u0644\u064D\u060C \u0648\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0645\u062A\u0623\u062E\u0631\u0629 \u063A\u064A\u0631 \u0645\u0631\u0626\u064A\u0629",
        problem: "\u0639\u0645\u0644\u064A\u0629 \u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u0646\u0645\u0648 \u0644\u062F\u064A\u0647\u0627 \u062D\u062C\u0645 \u0641\u0648\u0627\u062A\u064A\u0631 \u0645\u062A\u0632\u0627\u064A\u062F\u060C \u0644\u0643\u0646 \u0628\u062F\u0648\u0646 \u0625\u0646\u0630\u0627\u0631 \u0645\u0628\u0643\u0631 \u0644\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0645\u062A\u0623\u062E\u0631.",
        action: "\u0632\u064A\u0631\u0643\u0633 \u0631\u062A\u0651\u0628 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u062E\u0637\u0631\u0629 \u0648\u062C\u0647\u0651\u0632 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u062A\u0627\u0628\u0639\u0629 \u0622\u0644\u064A\u0629.",
        reco1: "\u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0623\u0639\u0644\u0649 12% \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062E\u0637\u0631\u0627\u064B \u0623\u0648\u0644\u0627\u064B",
        reco2: "\u0634\u063A\u0651\u0644 \u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0622\u0644\u064A\u0629 \u062E\u0644\u0627\u0644 48 \u0633\u0627\u0639\u0629",
        reco3: "\u0631\u0627\u0642\u0628 \u0641\u062C\u0648\u0629 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0644\u0644\u0640 30 \u064A\u0648\u0645\u0627\u064B \u0627\u0644\u0642\u0627\u062F\u0645\u0629",
      },
      services: {
        industry: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A",
        title: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0627\u0644\u064A\u062F\u0648\u064A\u0629 \u0628\u0637\u0651\u0623\u062A \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
        problem: "\u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062A\u062A\u0628\u0651\u0639 \u064A\u062F\u0648\u064A\u060C \u0641\u0628\u0627\u062A\u062A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0645\u062A\u0623\u062E\u0631\u0629 \u0648\u063A\u064A\u0631 \u0645\u0648\u062D\u062F\u0629.",
        action: "\u0632\u064A\u0631\u0643\u0633 \u0627\u0643\u062A\u0634\u0641 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062A\u0623\u062E\u0631 \u0648\u0648\u0644\u0651\u062F \u0623\u0648\u0644\u0648\u064A\u0627\u062A \u0645\u062A\u0627\u0628\u0639\u0629 \u064A\u0648\u0645\u064A\u0629.",
        reco1: "\u0627\u0633\u062A\u0628\u062F\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u0642\u0629 \u0627\u0644\u064A\u062F\u0648\u064A\u0629 \u0628\u0642\u0627\u0626\u0645\u0629 \u0623\u0648\u0644\u0648\u064A\u0629 \u064A\u0648\u0645\u064A\u0629",
        reco2: "\u0627\u0631\u0641\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0628\u0623\u0646\u0645\u0627\u0637 \u062A\u0623\u062E\u0631 \u062C\u062F\u064A\u062F\u0629 \u0644\u0623\u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629",
        reco3: "\u0623\u0637\u0644\u0642 29 \u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0642\u0631\u0627\u0631 \u0623\u0633\u0628\u0648\u0639\u064A \u0648\u0627\u062D\u062F",
      },
      trade: {
        industry: "\u0627\u0644\u062A\u062C\u0627\u0631\u0629",
        title: "\u062E\u0637\u0631 \u0627\u0644\u0639\u0645\u064A\u0644 \u0643\u0627\u0646 \u0645\u062E\u0641\u064A\u0651\u0627\u064B \u062F\u0627\u062E\u0644 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
        problem: "\u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639 \u062A\u063A\u064A\u0651\u0631 \u0644\u062F\u0649 \u0639\u062F\u0629 \u0639\u0645\u0644\u0627\u0621\u060C \u0644\u0643\u0646 \u0627\u0644\u062E\u0637\u0631 \u0644\u0645 \u064A\u0638\u0647\u0631 \u0625\u0644\u0651\u0627 \u0628\u0639\u062F \u062D\u062F\u0648\u062B \u0627\u0644\u062A\u0623\u062E\u0631.",
        action: "\u0632\u064A\u0631\u0643\u0633 \u0642\u064A\u0651\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062D\u0633\u0628 \u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639 \u0648\u0646\u0642\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062E\u0637\u0631\u0629 \u0625\u0644\u0649 \u0645\u062A\u0627\u0628\u0639\u0629 \u0623\u0648\u0644\u0648\u064A\u0629.",
        reco1: "\u0627\u0646\u0642\u0644 12 \u062D\u0633\u0627\u0628 \u0623\u0648\u0644\u0648\u064A\u0629 \u0625\u0644\u0649 \u0637\u0627\u0628\u0648\u0631 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0627\u062C\u0644\u0629",
        reco2: "\u062E\u0635\u0651\u0635 \u062F\u0631\u062C\u0627\u062A \u062E\u0637\u0631 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0630\u064A\u0646 \u062A\u063A\u064A\u0651\u0631 \u0633\u0644\u0648\u0643 \u062F\u0641\u0639\u0647\u0645",
        reco3: "\u0648\u0632\u0651\u0639 \u0627\u0644\u0640 64 \u0625\u062C\u0631\u0627\u0621\u0627\u064B \u0627\u0644\u062D\u0631\u062C\u0629 \u0639\u0644\u0649 \u0627\u0644\u0640 7 \u0623\u064A\u0627\u0645 \u0627\u0644\u0642\u0627\u062F\u0645\u0629",
      },
      manufacturing: {
        industry: "\u0627\u0644\u062A\u0635\u0646\u064A\u0639",
        title: "\u0641\u062C\u0648\u0627\u062A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u062A\u0638\u0647\u0631 \u0645\u062A\u0623\u062E\u0631\u0629",
        problem: "\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A \u0645\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062A\u0648\u0642\u064A\u062A \u0627\u0644\u062F\u0641\u0639\u060C \u0644\u0643\u0646 \u0627\u0644\u0639\u0645\u0644 \u0644\u0627 \u064A\u0645\u0644\u0643 \u0631\u0624\u064A\u0629 \u062A\u0646\u0628\u0624\u064A\u0629.",
        action: "\u0632\u064A\u0631\u0643\u0633 \u062A\u0648\u0642\u0651\u0639 \u0636\u063A\u0648\u0637 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0648\u0623\u0648\u0635\u0649 \u0628\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u062D\u0635\u064A\u0644 \u0623\u0628\u0643\u0631.",
        reco1: "\u0623\u0628\u0644\u063A \u0645\u0633\u0628\u0642\u0627\u064B \u0639\u0646 \u0636\u063A\u0637 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0644\u0644\u0640 30 \u064A\u0648\u0645\u0627\u064B \u0627\u0644\u0642\u0627\u062F\u0645\u0629",
        reco2: "\u0623\u0637\u0644\u0642 \u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0623\u0628\u0643\u0631 \u0639\u0644\u0649 \u0623\u0639\u0644\u0649 24 \u0641\u0627\u062A\u0648\u0631\u0629 \u0642\u064A\u0645\u0629",
        reco3: "\u0648\u0633\u0651\u0639 \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A \u0628\u0646\u0633\u0628\u0629 31%",
      },
    },
  },
};

// ---------- Per-case chart renderer ----------
function renderCaseChart(accent, delayDrop) {
  const c = accent || { bright: "#fff", deep: "#888", chart: "bar" };
  const seed = delayDrop || 22;

  if (c.chart === "line") {
    // Line chart with dots — pattern detection over time
    const points = [];
    const heightFactor = Math.max(0.65, 1 - (seed - 17) * 0.018);
    const yVals = [110, 96, 118, 84, 70, 58, 48, 38].map((y) =>
      y * heightFactor + 22
    );
    yVals.forEach((y, i) => {
      const x = 12 + i * 44;
      points.push([x, y]);
    });
    const pathD = points
      .map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1])
      .join(" ");
    const areaD =
      pathD +
      " L " + points[points.length - 1][0] + " 158" +
      " L " + points[0][0] + " 158 Z";
    return (
      <svg viewBox="0 0 360 170" width="100%" height="170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineFillCS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={c.bright} stopOpacity="0.45" />
            <stop offset="100%" stopColor={c.bright} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineFillCS)" style={{ transition: "d .5s ease" }} />
        <path
          d={pathD}
          fill="none"
          stroke={c.bright}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "d .5s ease" }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={i === points.length - 1 ? 6 : 4}
            fill={c.bright}
            stroke="#fff"
            strokeWidth={i === points.length - 1 ? 2.5 : 1.5}
            style={{ transition: "cx .5s ease, cy .5s ease" }}
          />
        ))}
      </svg>
    );
  }

  if (c.chart === "stacked") {
    // Stacked horizontal bars — risk distribution by customer tier
    const tiers = [
      { label: "Tier A", high: 18, mid: 28, low: 54 },
      { label: "Tier B", high: 32, mid: 38, low: 30 },
      { label: "Tier C", high: 48 + Math.min(20, seed - 17), mid: 32, low: 20 - Math.min(15, seed - 17) },
    ];
    const rowH = 28;
    const rowGap = 14;
    const totalH = tiers.length * rowH + (tiers.length - 1) * rowGap;
    const startY = (170 - totalH) / 2;
    const fullW = 336;

    return (
      <svg viewBox="0 0 360 170" width="100%" height="170" preserveAspectRatio="none">
        {tiers.map((t, i) => {
          const y = startY + i * (rowH + rowGap);
          const highW = (t.high / 100) * fullW;
          const midW  = (t.mid / 100) * fullW;
          const lowW  = (t.low / 100) * fullW;
          return (
            <g key={i}>
              <rect x={12} y={y} width={highW} height={rowH} rx={6}
                fill={c.bright} opacity={0.95}
                style={{ transition: "width .5s ease" }} />
              <rect x={12 + highW} y={y} width={midW} height={rowH}
                fill="rgba(255,255,255,.32)"
                style={{ transition: "width .5s ease, x .5s ease" }} />
              <rect x={12 + highW + midW} y={y} width={lowW} height={rowH}
                rx={6}
                fill="rgba(255,255,255,.14)"
                style={{ transition: "width .5s ease, x .5s ease" }} />
            </g>
          );
        })}
      </svg>
    );
  }

  if (c.chart === "area") {
    // Area chart — cashflow forecast curve
    const heightFactor = Math.max(0.6, 1 - (seed - 17) * 0.02);
    const yVals = [128, 122, 134, 118, 92, 70, 50, 36].map((y) => y * heightFactor + 18);
    const pts = yVals.map((y, i) => [12 + i * 48, y]);
    const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
    const areaD =
      pathD +
      " L " + pts[pts.length - 1][0] + " 158" +
      " L " + pts[0][0] + " 158 Z";
    return (
      <svg viewBox="0 0 360 170" width="100%" height="170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFillCS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={c.bright} stopOpacity="0.65" />
            <stop offset="100%" stopColor={c.bright} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaFillCS)" style={{ transition: "d .5s ease" }} />
        <path
          d={pathD}
          fill="none"
          stroke={c.bright}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "d .5s ease" }}
        />
      </svg>
    );
  }

  // Default: bar chart (E-commerce)
  const baseHeights = [132, 118, 104, 86, 74, 62, 52, 44];
  const heights = baseHeights.map((h, i) => {
    if (i < 3) return h;
    const factor = 1 - (seed - 17) * 0.012;
    return Math.max(28, Math.round(h * Math.max(0.7, Math.min(1.1, factor))));
  });
  return (
    <svg viewBox="0 0 360 170" width="100%" height="170" preserveAspectRatio="none">
      <defs>
        <linearGradient id="barGradCS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={c.bright} stopOpacity="1" />
          <stop offset="100%" stopColor={c.deep}  stopOpacity="1" />
        </linearGradient>
      </defs>
      {heights.map((h, i) => {
        const barWidth = 30;
        const gap = 12;
        const x = i * (barWidth + gap) + 8;
        const y = 170 - h - 6;
        const isBefore = i < 3;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={10}
            fill={isBefore ? "rgba(255,255,255,.32)" : "url(#barGradCS)"}
            opacity={isBefore ? 0.75 : 1}
            style={{
              transition: "y .45s cubic-bezier(.2,.8,.2,1), height .45s cubic-bezier(.2,.8,.2,1)",
            }}
          />
        );
      })}
    </svg>
  );
}

// ---------- Component ----------
export default function CaseStudiesPage() {
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

  // Risk = always red, recovery = emerald
  const riskColor    = C.redDeep;
  const recoverColor = C.emerald;

  const ctaShadow = isArabic
    ? "0 26px 64px rgba(0,108,53,.30)"
    : "0 26px 64px rgba(227,10,23,.30)";

  const cardShadow = isArabic
    ? "0 28px 74px rgba(0,77,38,.11)"
    : "0 28px 74px rgba(58,5,9,.11)";

  const heavyShadow = isArabic
    ? "0 34px 90px rgba(0,77,38,.22)"
    : "0 34px 90px rgba(58,5,9,.26)";

  const activeChipShadow = isArabic
    ? "0 18px 44px rgba(0,108,53,.24)"
    : "0 18px 44px rgba(227,10,23,.24)";

  const arrow = isRTL ? "\u2190" : "\u2192";
  const riskArrow = "\u2192"; // semantic, always LTR
  const arrowBackLink = "\u2190";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.86)",
    border: "1px solid " + T.hairline,
    boxShadow: cardShadow,
    backdropFilter: "blur(16px)",
  };

  // Currency formatting per language
  const currencySymbol = lang === "AR" ? " \u0631.\u0633" : "$";
  const currencyPos    = lang === "AR" ? "suffix" : "prefix";
  const fmtMoney = (n) => {
    const f = Math.round(n).toLocaleString("en-US");
    if (n >= 1000 && n < 1000000) {
      const k = (n / 1000).toFixed(1).replace(/\.0$/, "");
      return currencyPos === "prefix" ? currencySymbol + k + "K" : k + "K" + currencySymbol;
    }
    return currencyPos === "prefix" ? currencySymbol + f : f + currencySymbol;
  };
  const fmtFull = (n) => {
    const f = Math.round(n).toLocaleString("en-US");
    return currencyPos === "prefix" ? currencySymbol + f : f + currencySymbol;
  };

  // ---------- State ----------
  const [activeId, setActiveId]         = useState("ecommerce");
  const [hoveredId, setHoveredId]       = useState(null);
  const [monthlyVolume, setMonthlyVol]  = useState(250000);
  const [delayRate, setDelayRate]       = useState(18);

  // Mini calculator
  const monthlyLeakage = useMemo(
    () => Math.round(monthlyVolume * (delayRate / 100) * 0.42),
    [monthlyVolume, delayRate]
  );
  const recoverable    = useMemo(() => Math.round(monthlyLeakage * 0.32), [monthlyLeakage]);
  const annualOpp      = useMemo(() => recoverable * 12, [recoverable]);

  // Selected case
  const caseList = CASE_IDS.map((id) => ({
    id: id,
    ...t.cases[id],
    nums: CASE_NUMBERS[id],
  }));
  const selected = caseList.find((c) => c.id === activeId) || caseList[0];

  // Hover-preview: show hovered case in panel; fallback to active.
  const displayId = hoveredId || activeId;
  const displayCase = caseList.find((c) => c.id === displayId) || selected;

  // Per-case accent (overrides language theme inside Live panels + active chip)
  const caseAccent = CASE_ACCENTS[displayId] || CASE_ACCENTS.ecommerce;
  const activeAccent = CASE_ACCENTS[activeId] || CASE_ACCENTS.ecommerce;

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
      <style>{`
        @keyframes zyrixChipShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .zyrix-chip-active {
          animation: zyrixChipShimmer 5s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .zyrix-chip-active { animation: none; }
        }
      `}</style>
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
                margin: "22px auto 0",
                maxWidth: 780,
                color: T.muted,
                fontSize: 18,
                lineHeight: 1.75,
                fontWeight: 650,
              }}
            >
              {t.sub}
            </p>

            <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/onboarding"
                style={{
                  borderRadius: 22,
                  padding: "20px 32px",
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
                to="/pricing"
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

          {/* PROOF METRICS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 64 }}>
            {t.proofs.map((row, i) => (
              <div key={i} style={{ ...cardBase, padding: 26, textAlign: "center" }}>
                <div
                  style={{
                    color: themeColor,
                    fontSize: 36,
                    fontWeight: 950,
                    letterSpacing: "-0.04em",
                    fontFamily: "'Inter Tight', system-ui, sans-serif",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {row[0]}
                </div>
                <div style={{ marginTop: 6, color: T.muted, fontSize: 14, fontWeight: 850 }}>
                  {row[1]}
                </div>
              </div>
            ))}
          </div>

          {/* SOCIAL PROOF BAR */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              padding: "14px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,.78)",
              border: "1px solid " + T.hairline,
              boxShadow: "0 14px 38px rgba(58,5,9,.06)",
              maxWidth: 760,
              margin: "0 auto 64px",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: recoverColor,
                boxShadow: "0 0 0 4px rgba(16,185,129,.18)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: T.ink,
                fontSize: 14,
                fontWeight: 850,
                letterSpacing: "0.1px",
                textAlign: "center",
              }}
            >
              {t.socialProof}
            </span>
          </div>

          {/* SWITCHER */}
          <div style={{ ...cardBase, padding: 30, marginBottom: 28 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 24px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                {t.switcherEyebrow}
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.12,
                }}
              >
                {t.switcherTitle}
              </h2>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {caseList.map((c) => {
                const isActive = activeId === c.id;
                const isHovered = hoveredId === c.id;
                const isLifted = isActive || isHovered;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(c.id)}
                    onBlur={() => setHoveredId(null)}
                    className={isActive ? "zyrix-chip-active" : ""}
                    style={{
                      cursor: "pointer",
                      border: isActive
                        ? "2px solid " + (CASE_ACCENTS[c.id] ? CASE_ACCENTS[c.id].bright : themeColor)
                        : (isHovered
                            ? "1px solid " + (CASE_ACCENTS[c.id] ? CASE_ACCENTS[c.id].bright : themeColor)
                            : "1px solid " + T.hairline),
                      borderRadius: 999,
                      padding: "14px 22px",
                      background: isActive
                        ? "linear-gradient(135deg, " + CASE_ACCENTS[c.id].bright + ", " + CASE_ACCENTS[c.id].deep + ")"
                        : (isHovered
                            ? "rgba(" + CASE_ACCENTS[c.id].glowRGB + ",.06)"
                            : "#fff"),
                      color: isActive ? "#fff" : T.ink,
                      fontSize: 15,
                      fontWeight: 950,
                      boxShadow: isActive
                        ? "0 18px 44px rgba(" + CASE_ACCENTS[c.id].glowRGB + ",.30)"
                        : (isHovered
                            ? "0 12px 28px rgba(" + CASE_ACCENTS[c.id].glowRGB + ",.18)"
                            : "none"),
                      transition: "all .35s ease",
                      transform: isLifted ? "translateY(-2px)" : "translateY(0)",
                      fontFamily: "inherit",
                      backgroundSize: isActive ? "200% 200%" : "100% 100%",
                    }}
                  >
                    {c.industry}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CASE DETAIL */}
          <div style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 28, marginBottom: 64 }}>
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
                {t.caseEyebrow}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                  lineHeight: 1.12,
                }}
              >
                {displayCase.title}
              </h2>

              <p
                style={{
                  marginTop: 16,
                  color: T.muted,
                  fontSize: 16,
                  lineHeight: 1.75,
                  fontWeight: 650,
                }}
              >
                {displayCase.problem}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 26 }}>
                <div
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(227,10,23,.08)",
                    border: "1px solid " + T.hairline,
                  }}
                >
                  <div style={{ color: T.muted, fontSize: 13, fontWeight: 900, letterSpacing: "0.3px" }}>
                    {t.before}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: riskColor,
                      fontSize: 26,
                      fontWeight: 950,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {fmtMoney(displayCase.nums.before)}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: riskColor,
                      fontSize: 13,
                      fontWeight: 800,
                      opacity: 0.85,
                      lineHeight: 1.4,
                    }}
                  >
                    {t.beforeNarrative}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(16,185,129,.10)",
                    border: "1px solid " + T.hairline,
                  }}
                >
                  <div style={{ color: T.muted, fontSize: 13, fontWeight: 900, letterSpacing: "0.3px" }}>
                    {t.after}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: recoverColor,
                      fontSize: 26,
                      fontWeight: 950,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {fmtMoney(displayCase.nums.after)}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      color: recoverColor,
                      fontSize: 13,
                      fontWeight: 800,
                      opacity: 0.9,
                      lineHeight: 1.4,
                    }}
                  >
                    {t.afterNarrative}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  borderRadius: 26,
                  padding: 22,
                  background: isArabic ? "rgba(221,243,230,.55)" : "rgba(255,247,237,.88)",
                  border: "1px solid " + T.hairline,
                }}
              >
                <div
                  style={{
                    color: themeColor,
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    marginBottom: 8,
                  }}
                >
                  {t.actionEyebrow}
                </div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, fontWeight: 800, color: T.ink }}>
                  {displayCase.action}
                </p>
              </div>
            </div>

            {/* VISUAL PANEL */}
            <div
              style={{
                borderRadius: 36,
                padding: 30,
                background: "linear-gradient(135deg, " + caseAccent.deep + ", " + caseAccent.night + ")",
                color: "#fff",
                boxShadow: "0 34px 90px rgba(" + caseAccent.glowRGB + ",.32)",
                transition: "background .5s ease, box-shadow .5s ease",
              }}
            >
              <div style={{ opacity: 0.72, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px" }}>
                {t.breakdownEyebrow}
              </div>

              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  [displayCase.nums.riskFrom + "% " + riskArrow + " " + displayCase.nums.riskTo + "%", t.riskMovement],
                  ["-" + displayCase.nums.delayDrop + "%", t.delayReduction],
                  [String(displayCase.nums.actions),       t.actionsReady],
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      background: "rgba(255,255,255,.10)",
                      border: "1px solid rgba(255,255,255,.14)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 950,
                        letterSpacing: "-0.025em",
                        fontFamily: "'Inter Tight', system-ui, sans-serif",
                        fontVariantNumeric: "tabular-nums",
                        direction: "ltr",
                      }}
                    >
                      {row[0]}
                    </div>
                    <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 850, marginTop: 6 }}>
                      {row[1]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-case chart (bar / line / stacked / area) */}
              <div
                style={{
                  marginTop: 20,
                  borderRadius: 26,
                  padding: 22,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.13)",
                }}
              >
                {renderCaseChart(caseAccent, displayCase.nums.delayDrop)}

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    opacity: 0.72,
                    fontWeight: 850,
                    fontSize: 13,
                  }}
                >
                  <span>{t.chartBefore}</span>
                  <span>{t.chartAfter}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  borderRadius: 24,
                  padding: 22,
                  background: "#fff",
                  color: T.ink,
                  lineHeight: 1.55,
                }}
              >
                <div
                  style={{
                    color: themeColor,
                    fontSize: 12,
                    fontWeight: 950,
                    letterSpacing: "1.3px",
                    marginBottom: 12,
                  }}
                >
                  {t.aiRecHeader}
                </div>
                {[displayCase.reco1, displayCase.reco2, displayCase.reco3].map((reco, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "8px 0",
                      borderTop: i === 0 ? "none" : "1px solid " + T.hairline,
                      fontWeight: 800,
                      fontSize: 14.5,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: themeColor,
                        fontWeight: 950,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {isRTL ? "←" : "→"}
                    </span>
                    <span>{reco}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION TIMELINE */}
          <div style={{ ...cardBase, padding: 34, marginBottom: 64 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div
                style={{
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                {t.timelineEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.timelineTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                [t.dayLabels[0], t.day1Title,  t.day1Desc],
                [t.dayLabels[1], t.day3Title,  t.day3Desc],
                [t.dayLabels[2], t.day7Title,  t.day7Desc],
                [t.dayLabels[3], t.day30Title, t.day30Desc],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(255,255,255,.92)",
                    border: "1px solid " + T.hairline,
                  }}
                >
                  <div
                    style={{
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "0.6px",
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row[0]}
                  </div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 20, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {row[1]}
                  </h3>
                  <p style={{ marginTop: 10, color: T.muted, lineHeight: 1.65, fontWeight: 650, fontSize: 14 }}>
                    {row[2]}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 22,
                padding: "16px 22px",
                borderRadius: 999,
                background: isArabic ? "rgba(0,108,53,.08)" : "rgba(227,10,23,.07)",
                border: "1px solid " + T.hairline,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 900,
                color: themeColor,
                letterSpacing: "0.2px",
              }}
            >
              {t.timeToValue}
            </div>
          </div>

          {/* WHAT CHANGED */}
          <div
            style={{
              borderRadius: 40,
              padding: 40,
              background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
              color: "#fff",
              boxShadow: heavyShadow,
              marginBottom: 64,
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
              {t.changedEyebrow}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 38,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                maxWidth: 860,
                lineHeight: 1.12,
              }}
            >
              {t.changedTitle}
            </h2>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {t.changedRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                >
                  <div style={{ opacity: 0.62, fontWeight: 850, textDecoration: "line-through", fontSize: 14 }}>
                    {row[0]}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 22,
                      fontWeight: 950,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {row[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BUILD YOUR OWN CASE */}
          <div style={{ ...cardBase, padding: 34, marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 28, alignItems: "stretch" }}>
              <div>
                <div
                  style={{
                    color: themeColor,
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    marginBottom: 10,
                  }}
                >
                  {t.buildEyebrow}
                </div>
                <h2 style={{ margin: 0, fontSize: 34, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                  {t.buildTitle}
                </h2>
                <p style={{ marginTop: 14, color: T.muted, lineHeight: 1.7, fontWeight: 650, fontSize: 15 }}>
                  {t.buildSub}
                </p>

                <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 900, color: T.muted, marginBottom: 8 }}>
                      {t.inputVolume}
                    </div>
                    <input
                      type="number"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVol(Number(e.target.value || 0))}
                      style={{
                        width: "100%",
                        height: 56,
                        borderRadius: 18,
                        border: "1px solid " + T.hairline,
                        padding: "0 18px",
                        fontSize: 18,
                        fontWeight: 900,
                        color: T.ink,
                        outline: "none",
                        background: "#fff",
                        fontFamily: "'Inter Tight', system-ui, sans-serif",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    />
                  </label>

                  <label>
                    <div style={{ fontSize: 13, fontWeight: 900, color: T.muted, marginBottom: 8 }}>
                      {t.inputDelay}: {delayRate}%
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="45"
                      value={delayRate}
                      onChange={(e) => setDelayRate(Number(e.target.value))}
                      style={{ width: "100%", accentColor: themeColor }}
                    />
                  </label>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 30,
                  padding: 26,
                  background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                  color: "#fff",
                  boxShadow: heavyShadow,
                }}
              >
                <div
                  style={{
                    opacity: 0.72,
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                  }}
                >
                  {t.yourCase}
                </div>

                <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
                  {[
                    [t.out1, fmtFull(monthlyLeakage)],
                    [t.out2, fmtFull(recoverable)],
                    [t.out3, fmtFull(annualOpp)],
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 18,
                        borderRadius: 22,
                        background: "rgba(255,255,255,.10)",
                        border: "1px solid rgba(255,255,255,.14)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 18,
                      }}
                    >
                      <span style={{ opacity: 0.72, fontWeight: 850, fontSize: 14 }}>{row[0]}</span>
                      <strong
                        style={{
                          fontSize: 22,
                          fontFamily: "'Inter Tight', system-ui, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "-0.025em",
                          direction: "ltr",
                        }}
                      >
                        {row[1]}
                      </strong>
                    </div>
                  ))}
                </div>

                <Link
                  to="/onboarding"
                  style={{
                    marginTop: 22,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 58,
                    borderRadius: 20,
                    background: "#fff",
                    color: T.ink,
                    textDecoration: "none",
                    fontWeight: 950,
                    fontSize: 16,
                    letterSpacing: "0.2px",
                  }}
                >
                  {t.buildCta} {arrow}
                </Link>
              </div>
            </div>
          </div>

          {/* REALITY TRIGGER */}
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 42px",
              padding: "32px 24px",
            }}
          >
            <div
              style={{
                fontSize: "clamp(24px,3vw,34px)",
                fontWeight: 950,
                letterSpacing: "-0.04em",
                lineHeight: 1.25,
                color: T.ink,
              }}
            >
              <div>{t.realityLine1}</div>
              <div style={{ color: themeColor }}>{t.realityLine2}</div>
              <div style={{ marginTop: 14, color: T.muted, fontSize: "0.78em" }}>
                {t.realityLine3}
              </div>
              <div style={{ color: T.ink, fontSize: "0.92em", marginTop: 4 }}>
                {t.realityLine4}
              </div>
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
                to="/features"
                style={{
                  borderRadius: 22,
                  padding: "17px 30px",
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

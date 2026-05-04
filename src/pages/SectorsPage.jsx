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

// ---------- Stable sector IDs ----------
const SECTOR_IDS = ["ecommerce", "services", "trade", "manufacturing", "agencies", "wholesale", "healthcare", "construction", "logistics", "fnb", "realestate", "professional"];

// ---------- Per-sector numeric data ----------
const SECTOR_NUMBERS = {
  ecommerce:     { recoverable: 13400, score: 92, actions: 48, delay: 18, bars: [42, 58, 66, 82, 74, 98, 122, 136] },
  services:      { recoverable: 5700,  score: 89, actions: 29, delay: 14, bars: [32, 44, 54, 62, 77, 69, 86, 94] },
  trade:         { recoverable: 20100, score: 94, actions: 64, delay: 21, bars: [58, 76, 91, 104, 116, 109, 133, 150] },
  manufacturing: { recoverable: 29100, score: 96, actions: 77, delay: 24, bars: [70, 88, 106, 124, 118, 140, 154, 168] },
  agencies:      { recoverable: 8200,  score: 91, actions: 34, delay: 16, bars: [38, 46, 55, 71, 68, 83, 92, 105] },
  wholesale:     { recoverable: 24600, score: 95, actions: 71, delay: 23, bars: [62, 82, 96, 115, 132, 126, 148, 162] },
  healthcare:    { recoverable: 17800, score: 93, actions: 52, delay: 27, bars: [54, 68, 82, 99, 88, 116, 138, 152] },
  construction:  { recoverable: 38400, score: 96, actions: 81, delay: 29, bars: [78, 94, 112, 130, 124, 148, 162, 174] },
  logistics:     { recoverable: 15600, score: 92, actions: 47, delay: 19, bars: [50, 64, 78, 90, 84, 104, 124, 140] },
  fnb:           { recoverable:  9400, score: 88, actions: 36, delay: 15, bars: [40, 52, 60, 73, 67, 86, 98, 112] },
  realestate:    { recoverable: 21300, score: 94, actions: 58, delay: 22, bars: [56, 72, 88, 102, 96, 120, 136, 150] },
  professional:  { recoverable:  6800, score: 90, actions: 31, delay: 13, bars: [34, 46, 56, 64, 71, 68, 84, 96] },
};

// ---------- Per-sector visual identity ----------
const SECTOR_ACCENTS = {
  ecommerce:     { bright: "#FB923C", deep: "#C2410C", night: "#2A0F02", glowRGB: "251,146,60"  },
  services:      { bright: "#A855F7", deep: "#7E22CE", night: "#1A0633", glowRGB: "168,85,247"  },
  trade:         { bright: "#3B82F6", deep: "#1E40AF", night: "#0A1B3D", glowRGB: "59,130,246"  },
  manufacturing: { bright: "#10B981", deep: "#047857", night: "#022C1F", glowRGB: "16,185,129"  },
  agencies:      { bright: "#FF1A2A", deep: "#B30810", night: "#1F0205", glowRGB: "255,26,42"   },
  wholesale:     { bright: "#F59E0B", deep: "#B45309", night: "#2A1605", glowRGB: "245,158,11"  },
  healthcare:    { bright: "#14B8A6", deep: "#0F766E", night: "#022C2A", glowRGB: "20,184,166"   },
  construction:  { bright: "#EA580C", deep: "#9A3412", night: "#1F0A02", glowRGB: "234,88,12"    },
  logistics:     { bright: "#6366F1", deep: "#4338CA", night: "#0F0F2C", glowRGB: "99,102,241"   },
  fnb:           { bright: "#F43F5E", deep: "#9F1239", night: "#1F0610", glowRGB: "244,63,94"    },
  realestate:    { bright: "#0891B2", deep: "#155E75", night: "#022431", glowRGB: "8,145,178"    },
  professional:  { bright: "#84CC16", deep: "#4D7C0F", night: "#101F02", glowRGB: "132,204,22"   },
};

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    back: "Geri",
    badge: "SEKTOR ZEKA MOTORU",
    h1a: "Her sektorun nakit akisi riskleri farklidir.",
    h1b: "Zyrix seninkini ogrenir.",
    sub: "Zyrix fatura zekasini, tahsilat onceliklerini ve AI aksiyonlarini, isletmenin gercek calisma sekline gore uyarlar.",
    ctaPrimary: "Sektor Riskimi Analiz Et",
    ctaSecondary: "Sonuclari Gor",

    switcherEyebrow: "IS TIPINI SEC",
    switcherTitle: "Zyrix senin sektorunde nasil dusunuyor gor.",

    intelEyebrow: "ZEKASI",
    intelTitle: "Zyrix faturalarinin arkasindaki nakit akisi paternini anlar.",
    labelProblem: "Yaygin sorun",
    labelRisk: "Gizli risk",
    labelAction: "Zyrix AI aksiyonu",

    profileEyebrow: "SEKTOR RISK PROFILI",
    statRecover: "geri kazanilabilir",
    statScore:   "risk gorunurlugu",
    statActions: "hazir aksiyon",
    chartLeft:   "Fatura baskisi",
    chartRight:  "AI aksiyonlari",
    aiRec:       "AI tavsiyesi: tekrarlayan gecikmeler ve en yuksek geri kazanilabilir etkisi olan hesaplara once odaklan.",

    playbookEyebrow: "SEKTOR OYUN KITABI",
    playbookTitle: "Sektor paternlerinden gunluk nakit akisi aksiyonlarina.",
    play1Title: "Paternleri tespit et",
    play1Desc:  "Zyrix fatura zamanlamasini, hacmini ve odeme davranisini okur.",
    play2Title: "Musterileri puanla",
    play2Desc:  "Musteriler riske, aciliyete ve geri kazanilabilir etkiye gore siralanir.",
    play3Title: "Baskiyi ongor",
    play3Desc:  "Nakit akisi baskisi, aci hale gelmeden once tahmin edilir.",
    play4Title: "Aksiyon tetikle",
    play4Desc:  "Takipler ve sonraki adimlar otomatik hazirlanir.",

    failEyebrow: "GENEL ARACLAR NEDEN BASARISIZ",
    failTitle: "Genel araclar her isletmeye ayni ekrani gosterir. Zyrix sektorunun risk yaratma sekline uyum saglar.",
    genericTitle: "Genel fatura araclari",
    genericItems: ["Statik listeler", "Herkes icin ayni akis", "Gec raporlama", "Manuel takipler"],
    zyrixTitle: "Zyrix sektor zekasi",
    zyrixItems: ["Sektor farkindali risk paternleri", "AI aksiyon plani", "Erken uyari sinyalleri", "Otomatik kurtarma akislari"],

    flowEyebrow: "AKIS SIMULASYONU",
    flowTitle: "Bir fatura olayi bir kurtarma aksiyonuna donusur.",
    flow1Title: "Fatura olayi",
    flow1Desc:  "Yeni bir gecikme paterni belirir",
    flow2Title: "Risk sinyali",
    flow2Suffix: "sektor gecikme riski",
    flow3Title: "AI tavsiyesi",
    flow3Desc:  "Yuksek etkili hesaplari onceliklendir",
    flow4Title: "Aksiyon hazir",
    flow4Desc:  "Hatirlatma ve gorev olusturuldu",
    flow5Title: "Nakit kazanildi",
    flow5Suffix: "firsat",

    useEyebrow: "SEKTOR KULLANIM SENARYOLARI",
    useTitle: "Farkli is hareketleri icin tasarlandi.",
    useRecoverableSuffix: "geri kazanilabilir firsat",

    finalEyebrow: "SEKTORUNUN BIR PATERNI VAR",
    finalTitle: "Birak Zyrix sektorune ozel nakit akisi riskini analiz etsin.",
    finalSub: "Fatura davranisinla basla ve sektorunun seni sessizce neye mal oldugunu kesfet.",
    finalCta1: "Sektorumu Analiz Et",
    finalCta2: "Sonuclari Gor",

    sectors: {
      ecommerce: {
        name: "E-ticaret",
        problem: "Yuksek siparis hacmi hizli fatura hareketi yaratir, ama geciken odemeleri manuel takip etmek zorlasir.",
        risk:    "Odeme gecikmeleri hacim icinde gizlenir ve cok gec gorunur olur.",
        action:  "Zyrix riskli siparisleri onceliklendirir, tahsilat baskisini ongorur ve takip aksiyonlarini hazirlar.",
      },
      services: {
        name: "Hizmetler",
        problem: "Tekrarlayan musteriler ve proje bazli faturalandirma, takipleri ekipler arasinda tutarsiz hale getirir.",
        risk:    "Hizmet teslimi ve faturalama ekipleri ayri oldugunda manuel hatirlatmalar gec olur.",
        action:  "Zyrix takip bosluklarini tespit eder ve hesap bazli tahsilat aksiyonlari onerir.",
      },
      trade: {
        name: "Ticaret",
        problem: "Birden fazla musteri, degisken odeme aliskanliklari ve buyuk faturalar tahmin edilemez nakit hareketi yaratir.",
        risk:    "Musteri riski, finans ekibinin fark etmesinden once degisir.",
        action:  "Zyrix musterileri odeme davranisina gore puanlar ve riskli hesaplari oncelikli takibe alir.",
      },
      manufacturing: {
        name: "Uretim",
        problem: "Nakit akisi uretim dongulerine, tedarikci zamanlamasina ve buyuk musteri odeme planlarina baglidir.",
        risk:    "Gelecekteki nakit bosluklari, operasyonel taahhutler verildikten sonra ortaya cikar.",
        action:  "Zyrix baski noktalarini ongorur ve daha erken kurtarma aksiyonlari tetikler.",
      },
      agencies: {
        name: "Ajanslar",
        problem: "Asama odemeleri, retainerlar ve musteri onaylari, normal hissedilen ama nakit akisini incinen tahsilat gecikmeleri yaratir.",
        risk:    "Faturalar net bir eskalasyon olmadan onay donguleri icinde bekler.",
        action:  "Zyrix onay-risk paternlerini tespit eder ve musteriye ozel hatirlatmalar hazirlar.",
      },
      wholesale: {
        name: "Toptan",
        problem: "Buyuk musteri hesaplari ve tekrarlayan siparisler, bakiyeler agirlasana kadar artan odeme riskini gizleyebilir.",
        risk:    "Birkac geciken hesap tum nakit akisi dongusunu etkileyebilir.",
        action:  "Zyrix hesaplari geri kazanilabilir etkiye gore siralar ve oncelikli aksiyon planlarini tetikler.",
      },
      healthcare: {
        name: "Saglik",
        problem: "Sigorta tahsilat dongulerl uzun ve red oranlari yuksek; kucuk hatalar buyuk gecikmeler yaratir.",
        risk:    "Reddedilen talepler ve onay bekleyen faturalar gizli nakit blokajlari olusturur.",
        action:  "Zyrix tahsilat patternlerini ogrenir, red riskini erken isaretler ve oncelikli takipler hazirlar.",
      },
      construction: {
        name: "Insaat",
        problem: "Hakedis odemeleri, teminat kesintilerl ve uzun musteri dongulerl nakit akisini parcalara boler.",
        risk:    "Bir gec kalan hakedis tum operasyonel takvimi sarsabilir.",
        action:  "Zyrix hakedis takvimini izler, gecikme baskisini ongorur ve mufettis-hazir aksiyonlar tetikler.",
      },
      logistics: {
        name: "Lojistik",
        problem: "Yakit, soforler ve operasyon haftalik nakit ister; musteriler net 30-60 ile odeme yapar.",
        risk:    "Gunluk maliyetler ile haftalarca bekleyen tahsilat arasindaki uçurum sessizce buyur.",
        action:  "Zyrix tahsilat hizini ölçer, riskli rotalari onceliklendirir ve musteri bazli planlar hazirlar.",
      },
      fnb: {
        name: "Restoran ve Catering",
        problem: "Tedarikciler gunluk odeme bekler, B2B catering ve teslimat platformlari haftalik veya iki haftalik öder.",
        risk:    "Volume yuksek olsa bile tedarikci-musteri zamanlama farki nakit krizi yaratir.",
        action:  "Zyrix tahsilat ritmini ogrenir, oncelikli musterileri belirler ve nakit baskisini onceden uyarir.",
      },
      realestate: {
        name: "Gayrimenkul",
        problem: "Kira tahsilatlari, gecikmis kiraciler ve coklu mulkiyet portfoyleri elle takip edildikce karmasiklasir.",
        risk:    "Gec kiralar ve odenmeyen aidatlar zamanla bilanco baskisina donusur.",
        action:  "Zyrix kiraci risk skorunu olusturur, gecikme paternlerini ogrenir ve mulk-bazli aksiyonlar onerir.",
      },
      professional: {
        name: "Profesyonel Hizmetler",
        problem: "Retainerlar, saatlik faturalandirma ve milestone karisimi tahsilati öngorülemez yapar.",
        risk:    "Calisma tamamlandi ama fatura veya onay zincirinde takildi — nakit akisi durdu.",
        action:  "Zyrix hizmet türlerine gore tahsilati siniflandirir ve müsteri bazli takip plani uretir.",
      },
    },
  },

  EN: {
    back: "Back",
    badge: "SECTOR INTELLIGENCE ENGINE",
    h1a: "Every sector has different cashflow risks.",
    h1b: "Zyrix learns yours.",
    sub: "Zyrix adapts invoice intelligence, collection priorities, and AI actions to the way your business actually operates.",
    ctaPrimary: "Analyze My Sector Risk",
    ctaSecondary: "See Results",

    switcherEyebrow: "CHOOSE YOUR BUSINESS TYPE",
    switcherTitle: "See how Zyrix thinks inside your sector.",

    intelEyebrow: "INTELLIGENCE",
    intelTitle: "Zyrix understands the cashflow pattern behind your invoices.",
    labelProblem: "Common problem",
    labelRisk: "Hidden risk",
    labelAction: "Zyrix AI action",

    profileEyebrow: "SECTOR RISK PROFILE",
    statRecover: "recoverable",
    statScore:   "risk visibility",
    statActions: "actions ready",
    chartLeft:   "Invoice pressure",
    chartRight:  "AI actions",
    aiRec:       "AI recommendation: focus first on accounts with repeated delays and highest recoverable impact.",

    playbookEyebrow: "SECTOR PLAYBOOK",
    playbookTitle: "From sector patterns to daily cashflow actions.",
    play1Title: "Detect patterns",
    play1Desc:  "Zyrix reads invoice timing, volume, and payment behavior.",
    play2Title: "Score customers",
    play2Desc:  "Customers are ranked by risk, urgency, and recoverable impact.",
    play3Title: "Forecast pressure",
    play3Desc:  "Cashflow pressure is estimated before it becomes painful.",
    play4Title: "Trigger actions",
    play4Desc:  "Follow-ups and next steps are prepared automatically.",

    failEyebrow: "WHY GENERIC TOOLS FAIL",
    failTitle: "Generic tools show the same screen to every business. Zyrix adapts to the way your sector creates risk.",
    genericTitle: "Generic invoice tools",
    genericItems: ["Static lists", "Same workflow for everyone", "Late reporting", "Manual follow-ups"],
    zyrixTitle: "Zyrix sector intelligence",
    zyrixItems: ["Sector-aware risk patterns", "AI action plan", "Early warning signals", "Automated recovery workflows"],

    flowEyebrow: "WORKFLOW SIMULATION",
    flowTitle: "One invoice event becomes a recovery action.",
    flow1Title: "Invoice event",
    flow1Desc:  "New delay pattern appears",
    flow2Title: "Risk signal",
    flow2Suffix: "sector delay risk",
    flow3Title: "AI recommendation",
    flow3Desc:  "Prioritize high-impact accounts",
    flow4Title: "Action prepared",
    flow4Desc:  "Reminder + task generated",
    flow5Title: "Cashflow recovered",
    flow5Suffix: "opportunity",

    useEyebrow: "SECTOR USE CASES",
    useTitle: "Built for different business motions.",
    useRecoverableSuffix: "recoverable opportunity",

    finalEyebrow: "YOUR SECTOR HAS A PATTERN",
    finalTitle: "Let Zyrix analyze your sector-specific cashflow risk.",
    finalSub: "Start with your invoice behavior and discover what your sector is silently costing you.",
    finalCta1: "Analyze My Sector",
    finalCta2: "See Results",

    sectors: {
      ecommerce: {
        name: "E-commerce",
        problem: "High order volume creates fast invoice movement, but delayed payments become difficult to track manually.",
        risk:    "Payment delays hide inside volume and become visible too late.",
        action:  "Zyrix prioritizes risky orders, predicts collection pressure, and prepares follow-up actions.",
      },
      services: {
        name: "Services",
        problem: "Recurring clients and project-based billing make follow-ups inconsistent across teams.",
        risk:    "Manual reminders happen late, especially when service delivery and billing teams are separated.",
        action:  "Zyrix detects follow-up gaps and recommends account-level collection actions.",
      },
      trade: {
        name: "Trade",
        problem: "Multiple customers, variable payment habits, and large invoices create unpredictable cashflow movement.",
        risk:    "Customer risk changes before the finance team notices it.",
        action:  "Zyrix scores customers by payment behavior and moves risky accounts to priority follow-up.",
      },
      manufacturing: {
        name: "Manufacturing",
        problem: "Cashflow depends on production cycles, supplier timing, and large customer payment schedules.",
        risk:    "Future cash gaps appear after operational commitments are already made.",
        action:  "Zyrix forecasts pressure points and triggers earlier recovery actions.",
      },
      agencies: {
        name: "Agencies",
        problem: "Milestone payments, retainers, and client approvals create collection delays that feel normal but hurt cashflow.",
        risk:    "Invoices wait inside approval loops without clear escalation.",
        action:  "Zyrix identifies approval-risk patterns and prepares client-specific reminders.",
      },
      wholesale: {
        name: "Wholesale",
        problem: "Large customer accounts and repeated orders can hide growing payment risk until balances become heavy.",
        risk:    "A few delayed accounts can impact the entire cashflow cycle.",
        action:  "Zyrix ranks accounts by recoverable impact and triggers priority action plans.",
      },
      healthcare: {
        name: "Healthcare",
        problem: "Insurance collection cycles are long and rejection rates are high; small errors create big delays.",
        risk:    "Rejected claims and pending approvals create silent cash blockages.",
        action:  "Zyrix learns claim patterns, flags rejection risk early, and prepares priority follow-ups.",
      },
      construction: {
        name: "Construction",
        problem: "Milestone payments, retention deductions, and long client cycles fragment cashflow into pieces.",
        risk:    "One late milestone can shake the entire operational schedule.",
        action:  "Zyrix tracks milestone schedules, forecasts delay pressure, and triggers audit-ready actions.",
      },
      logistics: {
        name: "Logistics",
        problem: "Fuel, drivers, and operations need weekly cash; customers pay net 30-60.",
        risk:    "The gap between daily costs and weeks-long collections quietly grows.",
        action:  "Zyrix measures collection speed, prioritizes risky routes, and prepares customer-specific plans.",
      },
      fnb: {
        name: "Food & Beverage",
        problem: "Suppliers expect daily payment, B2B catering and delivery platforms pay weekly or biweekly.",
        risk:    "Even with high volume, the supplier-customer timing gap creates cash crises.",
        action:  "Zyrix learns collection rhythm, identifies priority customers, and warns of cash pressure ahead.",
      },
      realestate: {
        name: "Real Estate",
        problem: "Rent collections, late tenants, and multi-property portfolios become complex when tracked manually.",
        risk:    "Late rents and unpaid dues turn into balance sheet pressure over time.",
        action:  "Zyrix builds tenant risk scores, learns delay patterns, and recommends property-level actions.",
      },
      professional: {
        name: "Professional Services",
        problem: "Retainers, hourly billing, and milestone mixes make collection unpredictable.",
        risk:    "Work is done but the invoice or approval chain stalls — cashflow halts.",
        action:  "Zyrix classifies collection by service type and produces client-specific follow-up plans.",
      },
    },
  },

  AR: {
    back: "\u0631\u062C\u0648\u0639",
    badge: "\u0645\u062D\u0631\u0643 \u0630\u0643\u0627\u0621 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A",
    h1a: "\u0644\u0643\u0644 \u0642\u0637\u0627\u0639 \u0645\u062E\u0627\u0637\u0631 \u062A\u062F\u0641\u0642 \u0646\u0642\u062F\u064A \u0645\u062E\u062A\u0644\u0641\u0629.",
    h1b: "\u0632\u064A\u0631\u0643\u0633 \u064A\u062A\u0639\u0644\u0651\u0645 \u0642\u0637\u0627\u0639\u0643.",
    sub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u0643\u064A\u0651\u0641 \u0630\u0643\u0627\u0621 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0623\u0648\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u0639 \u0627\u0644\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u064A \u062A\u0639\u0645\u0644 \u0628\u0647\u0627 \u0623\u0639\u0645\u0627\u0644\u0643 \u0641\u0639\u0644\u064A\u0627\u064B.",
    ctaPrimary: "\u062D\u0644\u0651\u0644 \u062E\u0637\u0631 \u0642\u0637\u0627\u0639\u064A",
    ctaSecondary: "\u0634\u0627\u0647\u062F \u0627\u0644\u0646\u062A\u0627\u0626\u062C",

    switcherEyebrow: "\u0627\u062E\u062A\u0631 \u0646\u0648\u0639 \u0639\u0645\u0644\u0643",
    switcherTitle: "\u0634\u0627\u0647\u062F \u0643\u064A\u0641 \u064A\u0641\u0643\u0631 \u0632\u064A\u0631\u0643\u0633 \u062F\u0627\u062E\u0644 \u0642\u0637\u0627\u0639\u0643.",

    intelEyebrow: "\u0630\u0643\u0627\u0621",
    intelTitle: "\u0632\u064A\u0631\u0643\u0633 \u064A\u0641\u0647\u0645 \u0646\u0645\u0637 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u062E\u0644\u0641 \u0641\u0648\u0627\u062A\u064A\u0631\u0643.",
    labelProblem: "\u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629",
    labelRisk:    "\u0627\u0644\u062E\u0637\u0631 \u0627\u0644\u062E\u0641\u064A",
    labelAction:  "\u0625\u062C\u0631\u0627\u0621 \u0632\u064A\u0631\u0643\u0633 \u0627\u0644\u0630\u0643\u064A",

    profileEyebrow: "\u0628\u0631\u0648\u0641\u0627\u064A\u0644 \u062E\u0637\u0631 \u0627\u0644\u0642\u0637\u0627\u0639",
    statRecover: "\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
    statScore:   "\u0648\u0636\u0648\u062D \u0627\u0644\u0645\u062E\u0627\u0637\u0631",
    statActions: "\u0625\u062C\u0631\u0627\u0621 \u062C\u0627\u0647\u0632",
    chartLeft:   "\u0636\u063A\u0637 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    chartRight:  "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621",
    aiRec:       "\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A: \u0631\u0643\u0651\u0632 \u0623\u0648\u0644\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u062A\u0623\u062E\u0631 \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0648\u0623\u0639\u0644\u0649 \u0623\u062B\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F.",

    playbookEyebrow: "\u062F\u0644\u064A\u0644 \u0627\u0644\u0642\u0637\u0627\u0639",
    playbookTitle: "\u0645\u0646 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0642\u0637\u0627\u0639 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u062F\u0641\u0642 \u0646\u0642\u062F\u064A \u064A\u0648\u0645\u064A\u0629.",
    play1Title: "\u0631\u0635\u062F \u0627\u0644\u0623\u0646\u0645\u0627\u0637",
    play1Desc:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u0642\u0631\u0623 \u062A\u0648\u0642\u064A\u062A \u0648\u062D\u062C\u0645 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639.",
    play2Title: "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    play2Desc:  "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062D\u0633\u0628 \u0627\u0644\u062E\u0637\u0631 \u0648\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 \u0648\u0627\u0644\u0623\u062B\u0631 \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F.",
    play3Title: "\u062A\u0648\u0642\u0651\u0639 \u0627\u0644\u0636\u063A\u0637",
    play3Desc:  "\u062A\u0642\u062F\u064A\u0631 \u0636\u063A\u0637 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0642\u0628\u0644 \u0623\u0646 \u064A\u0635\u0628\u062D \u0645\u0624\u0644\u0645\u0627\u064B.",
    play4Title: "\u062A\u062D\u0641\u064A\u0632 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
    play4Desc:  "\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.",

    failEyebrow: "\u0644\u0645\u0627\u0630\u0627 \u062A\u0641\u0634\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629",
    failTitle: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629 \u062A\u0639\u0631\u0636 \u0646\u0641\u0633 \u0627\u0644\u0634\u0627\u0634\u0629 \u0644\u0643\u0644 \u0639\u0645\u0644. \u0632\u064A\u0631\u0643\u0633 \u064A\u062A\u0643\u064A\u0651\u0641 \u0645\u0639 \u0627\u0644\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u064A \u064A\u0635\u0646\u0639 \u0628\u0647\u0627 \u0642\u0637\u0627\u0639\u0643 \u0627\u0644\u062E\u0637\u0631.",
    genericTitle: "\u0623\u062F\u0648\u0627\u062A \u0641\u0648\u0627\u062A\u064A\u0631 \u0639\u0627\u0645\u0629",
    genericItems: ["\u0642\u0648\u0627\u0626\u0645 \u062B\u0627\u0628\u062A\u0629", "\u0646\u0641\u0633 \u0627\u0644\u062A\u062F\u0641\u0642 \u0644\u0644\u062C\u0645\u064A\u0639", "\u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u062A\u0623\u062E\u0631\u0629", "\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u064A\u062F\u0648\u064A\u0629"],
    zyrixTitle: "\u0630\u0643\u0627\u0621 \u0632\u064A\u0631\u0643\u0633 \u0627\u0644\u0642\u0637\u0627\u0639\u064A",
    zyrixItems: ["\u0623\u0646\u0645\u0627\u0637 \u062E\u0637\u0631 \u0648\u0627\u0639\u064A\u0629 \u0628\u0627\u0644\u0642\u0637\u0627\u0639", "\u062E\u0637\u0629 \u0625\u062C\u0631\u0627\u0621 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", "\u0625\u0634\u0627\u0631\u0627\u062A \u062A\u062D\u0630\u064A\u0631 \u0645\u0628\u0643\u0631\u0629", "\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0622\u0644\u064A\u0629"],

    flowEyebrow: "\u0645\u062D\u0627\u0643\u0627\u0629 \u062A\u062F\u0641\u0642 \u0627\u0644\u0639\u0645\u0644",
    flowTitle: "\u062D\u062F\u062B \u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0627\u062D\u062F \u064A\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621 \u0627\u0633\u062A\u0631\u062F\u0627\u062F.",
    flow1Title: "\u062D\u062F\u062B \u0641\u0627\u062A\u0648\u0631\u0629",
    flow1Desc:  "\u0646\u0645\u0637 \u062A\u0623\u062E\u0631 \u062C\u062F\u064A\u062F \u064A\u0638\u0647\u0631",
    flow2Title: "\u0625\u0634\u0627\u0631\u0629 \u062E\u0637\u0631",
    flow2Suffix: "\u062E\u0637\u0631 \u062A\u0623\u062E\u0631 \u0627\u0644\u0642\u0637\u0627\u0639",
    flow3Title: "\u062A\u0648\u0635\u064A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621",
    flow3Desc:  "\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0623\u062B\u0631",
    flow4Title: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u062C\u0627\u0647\u0632",
    flow4Desc:  "\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u062A\u0630\u0643\u064A\u0631 \u0648\u0645\u0647\u0645\u0629",
    flow5Title: "\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0646\u0642\u062F",
    flow5Suffix: "\u0641\u0631\u0635\u0629",

    useEyebrow: "\u062D\u0627\u0644\u0627\u062A \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A",
    useTitle: "\u0645\u0635\u0645\u0651\u0645 \u0644\u062D\u0631\u0643\u0627\u062A \u0623\u0639\u0645\u0627\u0644 \u0645\u062E\u062A\u0644\u0641\u0629.",
    useRecoverableSuffix: "\u0641\u0631\u0635\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",

    finalEyebrow: "\u0642\u0637\u0627\u0639\u0643 \u0644\u0647 \u0646\u0645\u0637",
    finalTitle: "\u062F\u0639 \u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u0644\u0644 \u062E\u0637\u0631 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u062E\u0627\u0635 \u0628\u0642\u0637\u0627\u0639\u0643.",
    finalSub: "\u0627\u0628\u062F\u0623 \u0628\u0633\u0644\u0648\u0643 \u0641\u0648\u0627\u062A\u064A\u0631\u0643 \u0648\u0627\u0643\u062A\u0634\u0641 \u0645\u0627 \u064A\u0643\u0644\u0641\u0643 \u0642\u0637\u0627\u0639\u0643 \u0628\u0635\u0645\u062A.",
    finalCta1: "\u062D\u0644\u0651\u0644 \u0642\u0637\u0627\u0639\u064A",
    finalCta2: "\u0634\u0627\u0647\u062F \u0627\u0644\u0646\u062A\u0627\u0626\u062C",

    sectors: {
      ecommerce: {
        name: "\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629",
        problem: "\u062D\u062C\u0645 \u0637\u0644\u0628\u0627\u062A \u0639\u0627\u0644\u064D \u064A\u062E\u0644\u0642 \u062D\u0631\u0643\u0629 \u0641\u0648\u0627\u062A\u064A\u0631 \u0633\u0631\u064A\u0639\u0629\u060C \u0644\u0643\u0646 \u062A\u062A\u0628\u0651\u0639 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629 \u064A\u062F\u0648\u064A\u0627\u064B \u064A\u0635\u0628\u062D \u0635\u0639\u0628\u0627\u064B.",
        risk:    "\u062A\u062A\u0639\u0631\u0641 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u062D\u062C\u0645 \u0648\u062A\u0638\u0647\u0631 \u0645\u062A\u0623\u062E\u0631\u0629 \u062C\u062F\u0627\u064B.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u0631\u062A\u0651\u0628 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062E\u0637\u0631\u0629 \u0648\u064A\u062A\u0648\u0642\u0651\u0639 \u0636\u063A\u0637 \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u064A\u062C\u0647\u0651\u0632 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629.",
      },
      services: {
        name: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A",
        problem: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0648\u0646 \u0648\u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u062A\u062C\u0639\u0644 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0633\u0642\u0629 \u0628\u064A\u0646 \u0627\u0644\u0641\u0631\u0642.",
        risk:    "\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u064A\u062F\u0648\u064A\u0629 \u062A\u062D\u062F\u062B \u0645\u062A\u0623\u062E\u0631\u0629\u060C \u062E\u0627\u0635\u0629 \u062D\u064A\u0646 \u062A\u0643\u0648\u0646 \u0641\u0631\u0642 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0648\u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0645\u0646\u0641\u0635\u0644\u0629.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u0643\u062A\u0634\u0641 \u0641\u062C\u0648\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u064A\u0648\u0635\u064A \u0628\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u062D\u0635\u064A\u0644 \u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062D\u0633\u0627\u0628.",
      },
      trade: {
        name: "\u0627\u0644\u062A\u062C\u0627\u0631\u0629",
        problem: "\u0639\u0645\u0644\u0627\u0621 \u0645\u062A\u0639\u062F\u062F\u0648\u0646 \u0648\u0639\u0627\u062F\u0627\u062A \u062F\u0641\u0639 \u0645\u062A\u063A\u064A\u0651\u0631\u0629 \u0648\u0641\u0648\u0627\u062A\u064A\u0631 \u0643\u0628\u064A\u0631\u0629 \u062A\u062E\u0644\u0642 \u062D\u0631\u0643\u0629 \u0646\u0642\u062F\u064A\u0629 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0651\u0639\u0629.",
        risk:    "\u062E\u0637\u0631 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u062A\u063A\u064A\u0651\u0631 \u0642\u0628\u0644 \u0623\u0646 \u064A\u0644\u0627\u062D\u0638\u0647 \u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0627\u0644\u064A\u0629.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u0642\u064A\u0651\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062D\u0633\u0628 \u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639 \u0648\u064A\u0646\u0642\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u062E\u0637\u0631\u0629 \u0625\u0644\u0649 \u0645\u062A\u0627\u0628\u0639\u0629 \u0623\u0648\u0644\u0648\u064A\u0629.",
      },
      manufacturing: {
        name: "\u0627\u0644\u062A\u0635\u0646\u064A\u0639",
        problem: "\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u064A\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u062A\u0648\u0642\u064A\u062A \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u062C\u062F\u0627\u0648\u0644 \u062F\u0641\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0643\u0628\u0627\u0631.",
        risk:    "\u0641\u062C\u0648\u0627\u062A \u0627\u0644\u0646\u0642\u062F \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644\u064A\u0629 \u062A\u0638\u0647\u0631 \u0628\u0639\u062F \u0623\u0646 \u062A\u062A\u0645 \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u062A\u0648\u0642\u0651\u0639 \u0646\u0642\u0627\u0637 \u0627\u0644\u0636\u063A\u0637 \u0648\u064A\u0637\u0644\u0642 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0623\u0628\u0643\u0631.",
      },
      agencies: {
        name: "\u0627\u0644\u0648\u0643\u0627\u0644\u0627\u062A",
        problem: "\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0648\u0627\u0644\u0645\u0628\u0627\u0644\u063A \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0648\u0645\u0648\u0627\u0641\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062A\u0635\u0646\u0639 \u062A\u0623\u062E\u0631\u0627\u062A \u062A\u062D\u0635\u064A\u0644 \u062A\u0628\u062F\u0648 \u0639\u0627\u062F\u064A\u0629 \u0644\u0643\u0646\u0647\u0627 \u062A\u0624\u0630\u064A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A.",
        risk:    "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u062A\u0646\u062A\u0638\u0631 \u062F\u0627\u062E\u0644 \u062F\u0648\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u062F\u0648\u0646 \u062A\u0635\u0639\u064A\u062F \u0648\u0627\u0636\u062D.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u062F\u0651\u062F \u0623\u0646\u0645\u0627\u0637 \u062E\u0637\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u064A\u062C\u0647\u0651\u0632 \u062A\u0630\u0643\u064A\u0631\u0627\u062A \u062E\u0627\u0635\u0629 \u0628\u0643\u0644 \u0639\u0645\u064A\u0644.",
      },
      wholesale: {
        name: "\u0627\u0644\u062C\u0645\u0644\u0629",
        problem: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629 \u062A\u062E\u0641\u064A \u062E\u0637\u0631 \u062F\u0641\u0639 \u0645\u062A\u0646\u0627\u0645\u064A \u062D\u062A\u0649 \u062A\u062B\u0642\u0644 \u0627\u0644\u0623\u0631\u0635\u062F\u0629.",
        risk:    "\u0628\u0636\u0639\u0629 \u062D\u0633\u0627\u0628\u0627\u062A \u0645\u062A\u0623\u062E\u0631\u0629 \u062A\u0624\u062B\u0631 \u0639\u0644\u0649 \u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0628\u0631\u0645\u0651\u062A\u0647\u0627.",
        action:  "\u0632\u064A\u0631\u0643\u0633 \u064A\u0631\u062A\u0651\u0628 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0623\u062B\u0631 \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u064A\u0637\u0644\u0642 \u062E\u0637\u0637 \u0625\u062C\u0631\u0627\u0621 \u0623\u0648\u0644\u0648\u064A\u0629.",
      },
      healthcare: {
        name: "الرعاية الصحية",
        problem: "دورات تحصيل التأمين طويلة ومعدلات الرفض عالية؛ أخطاء صغيرة تخلق تأخيرات كبيرة.",
        risk:    "المطالبات المرفوضة والفواتير بانتظار الموافقة تخلق انسدادات نقدية صامتة.",
        action:  "زيركس يتعلّم أنماط المطالبات ويرصد خطر الرفض مبكراً ويجهّز متابعات بأولوية.",
      },
      construction: {
        name: "الإنشاءات",
        problem: "دفعات المراحل واستقطاعات الضمان ودورات العملاء الطويلة تفتت التدفق النقدي.",
        risk:    "دفعة متأخرة واحدة تهز الجدول التشغيلي بأكمله.",
        action:  "زيركس يتابع جداول المراحل ويتوقّع ضغط التأخر ويطلق إجراءات مستندية.",
      },
      logistics: {
        name: "اللوجستيات",
        problem: "الوقود والسائقون والتشغيل تحتاج نقداً أسبوعياً؛ العملاء يدفعون بـ 30 إلى 60 يوماً.",
        risk:    "الفجوة بين التكاليف اليومية والتحصيل خلال أسابيع تتسع بصمت.",
        action:  "زيركس يقيس سرعة التحصيل ويرتّب المسارات الخطرة ويجهّز خططاً بحسب العميل.",
      },
      fnb: {
        name: "المطاعم والإعاشة",
        problem: "الموردون ينتظرون دفعاً يومياً ومنصّات التوصيل والتموين B2B تدفع أسبوعياً.",
        risk:    "حتّى مع الحجم العالي، فجوة توقيت الموردين والعملاء تخلق أزمات نقدية.",
        action:  "زيركس يتعلّم إيقاع التحصيل ويحدّد العملاء المهمّين وينبّه للضغط النقدي مسبقاً.",
      },
      realestate: {
        name: "العقارات",
        problem: "تحصيلات الإيجار والمستأجرون المتأخرون ومحفظة عقارات متعدّدة تعقّد المتابعة اليدوية.",
        risk:    "الإيجارات المتأخّرة والرسوم غير المدفوعة تتحوّل إلى ضغط في الميزانية.",
        action:  "زيركس يبني درجات خطر للمستأجرين ويتعلّم أنماط التأخر ويوصي بإجراءات على مستوى العقار.",
      },
      professional: {
        name: "الخدمات المهنية",
        problem: "الرسوم الثابتة والفوترة بالساعة ودفعات المراحل تجعل التحصيل غير قابل للتوقّع.",
        risk:    "العمل إنتهى لكن الفاتورة أو سلسلة الموافقة توقّفت — التدفق توقّف.",
        action:  "زيركس يصنّف التحصيل حسب نوع الخدمة وينتج خطط متابعة خاصة بكل عميل.",
      },
    },
  },
};

// ---------- Component ----------
export default function SectorsPage() {
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
  const themeGlowRGB = isArabic ? "0,108,53"     : "227,10,23";

  const ctaShadow   = "0 26px 64px rgba(" + themeGlowRGB + ",.30)";
  const cardShadow  = "0 28px 74px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.11)";
  const heavyShadow = "0 34px 90px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.26)";

  const recoverColor = C.emerald;
  const arrow = isRTL ? "\u2190" : "\u2192";
  const flowArrow = "\u2192"; // semantic, always LTR

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
    if (n >= 1000 && n < 1000000) {
      const k = (n / 1000).toFixed(1).replace(/\.0$/, "");
      return currencyPos === "prefix" ? currencySymbol + k + "K" : k + "K" + currencySymbol;
    }
    const f = Math.round(n).toLocaleString("en-US");
    return currencyPos === "prefix" ? currencySymbol + f : f + currencySymbol;
  };

  // ---------- State ----------
  const [activeId, setActiveId]   = useState("ecommerce");
  const [hoveredId, setHoveredId] = useState(null);

  const sectorList = SECTOR_IDS.map((id) => ({
    id: id,
    ...t.sectors[id],
    nums: SECTOR_NUMBERS[id],
    accent: SECTOR_ACCENTS[id],
  }));

  const selected = useMemo(
    () => sectorList.find((s) => s.id === activeId) || sectorList[0],
    [activeId, lang]
  );

  // Hover preview: panel follows hover; falls back to active
  const displayId   = hoveredId || activeId;
  const displayCase = sectorList.find((s) => s.id === displayId) || selected;
  const accent      = displayCase.accent;

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
        @keyframes zyrixSecChipShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .zyrix-sec-chip-active {
          animation: zyrixSecChipShimmer 5s ease infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .zyrix-sec-chip-active { animation: none; }
        }
      `}</style>

      <section style={{ padding: "148px 32px 96px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle at 50% 12%, rgba(" + themeGlowRGB + ",.16), transparent 50%)",
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
                boxShadow: "0 18px 44px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.10)",
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
              {t.h1a}<br />
              <span style={{ color: themeColor }}>{t.h1b}</span>
            </h1>

            <p style={{ margin: "22px auto 0", maxWidth: 780, color: T.muted, fontSize: 18, lineHeight: 1.75, fontWeight: 650 }}>
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
                to="/case-studies"
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
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.switcherTitle}
              </h2>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {sectorList.map((s) => {
                const isActive  = activeId === s.id;
                const isHovered = hoveredId === s.id;
                const isLifted  = isActive || isHovered;
                const acc       = s.accent;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(s.id)}
                    onBlur={() => setHoveredId(null)}
                    className={isActive ? "zyrix-sec-chip-active" : ""}
                    style={{
                      cursor: "pointer",
                      border: isActive
                        ? "2px solid " + acc.bright
                        : (isHovered ? "1px solid " + acc.bright : "1px solid " + T.hairline),
                      borderRadius: 999,
                      padding: "14px 22px",
                      background: isActive
                        ? "linear-gradient(135deg, " + acc.bright + ", " + acc.deep + ")"
                        : (isHovered
                            ? "rgba(" + acc.glowRGB + ",.06)"
                            : "#fff"),
                      color: isActive ? "#fff" : T.ink,
                      fontSize: 15,
                      fontWeight: 950,
                      boxShadow: isActive
                        ? "0 18px 44px rgba(" + acc.glowRGB + ",.30)"
                        : (isHovered
                            ? "0 12px 28px rgba(" + acc.glowRGB + ",.18)"
                            : "none"),
                      transition: "all .35s ease",
                      transform: isLifted ? "translateY(-2px)" : "translateY(0)",
                      fontFamily: "inherit",
                      backgroundSize: isActive ? "200% 200%" : "100% 100%",
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTOR INTELLIGENCE PANEL */}
          <div style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 28, marginBottom: 64 }}>
            {/* Left: text-side intelligence */}
            <div style={{ ...cardBase, padding: 36 }}>
              <div
                style={{
                  color: accent.bright,
                  fontSize: 13,
                  fontWeight: 950,
                  letterSpacing: "1.5px",
                  marginBottom: 10,
                  transition: "color .4s ease",
                }}
              >
                {displayCase.name.toUpperCase()} {t.intelEyebrow}
              </div>

              <h2 style={{ margin: 0, fontSize: 34, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.14 }}>
                {t.intelTitle}
              </h2>

              {[
                [t.labelProblem, displayCase.problem, accent.bright,  false],
                [t.labelRisk,    displayCase.risk,    accent.bright,  false],
                [t.labelAction,  displayCase.action,  recoverColor,   true ],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: 16,
                    padding: 22,
                    borderRadius: 24,
                    background: row[3]
                      ? "rgba(16,185,129,.10)"
                      : "rgba(" + accent.glowRGB + ",.07)",
                    border: "1px solid " + T.hairline,
                    transition: "background .4s ease",
                  }}
                >
                  <div
                    style={{
                      color: row[2],
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "1.2px",
                    }}
                  >
                    {row[0]}
                  </div>
                  <p style={{ margin: "8px 0 0", color: T.ink, lineHeight: 1.7, fontWeight: 750 }}>
                    {row[1]}
                  </p>
                </div>
              ))}
            </div>

            {/* Right: risk profile panel — uses sector accent gradient */}
            <div
              style={{
                borderRadius: 36,
                padding: 30,
                background: "linear-gradient(135deg, " + accent.deep + ", " + accent.night + ")",
                color: "#fff",
                boxShadow: "0 34px 90px rgba(" + accent.glowRGB + ",.32)",
                transition: "background .5s ease, box-shadow .5s ease",
              }}
            >
              <div style={{ opacity: 0.78, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px" }}>
                {t.profileEyebrow}
              </div>

              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  [fmtMoney(displayCase.nums.recoverable), t.statRecover],
                  [displayCase.nums.score + "%",            t.statScore],
                  [String(displayCase.nums.actions),        t.statActions],
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
                        fontSize: 24,
                        fontWeight: 950,
                        letterSpacing: "-0.025em",
                        fontFamily: "'Inter Tight', system-ui, sans-serif",
                        fontVariantNumeric: "tabular-nums",
                        direction: "ltr",
                      }}
                    >
                      {row[0]}
                    </div>
                    <div style={{ opacity: 0.78, fontSize: 12, fontWeight: 850, marginTop: 6 }}>
                      {row[1]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar chart — first half muted (pressure), second half bright (AI actions) */}
              <div
                style={{
                  marginTop: 20,
                  borderRadius: 26,
                  padding: 22,
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.13)",
                }}
              >
                <svg viewBox="0 0 360 180" width="100%" height="180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="secBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor={accent.bright} stopOpacity="1" />
                      <stop offset="100%" stopColor={accent.deep}   stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {displayCase.nums.bars.map((h, i) => {
                    const barWidth = 30;
                    const gap = 12;
                    const x = i * (barWidth + gap) + 8;
                    const y = 180 - h - 6;
                    const isPressure = i < 4;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={h}
                        rx={10}
                        fill={isPressure ? "rgba(255,255,255,.32)" : "url(#secBarGrad)"}
                        opacity={isPressure ? 0.72 : 1}
                        style={{
                          transition: "y .45s cubic-bezier(.2,.8,.2,1), height .45s cubic-bezier(.2,.8,.2,1)",
                        }}
                      />
                    );
                  })}
                </svg>

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
                  <span>{t.chartLeft}</span>
                  <span>{t.chartRight}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  borderRadius: 24,
                  padding: 20,
                  background: "#fff",
                  color: T.ink,
                  fontWeight: 900,
                  lineHeight: 1.55,
                }}
              >
                {t.aiRec}
              </div>
            </div>
          </div>

          {/* SECTOR PLAYBOOK */}
          <div style={{ ...cardBase, padding: 34, marginBottom: 64 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.playbookEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.playbookTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                ["01", t.play1Title, t.play1Desc],
                ["02", t.play2Title, t.play2Desc],
                ["03", t.play3Title, t.play3Desc],
                ["04", t.play4Title, t.play4Desc],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 26,
                    padding: 24,
                    background: "rgba(255,255,255,.92)",
                    border: "1px solid " + T.hairline,
                    boxShadow: "0 16px 40px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.06)",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                      color: "#fff",
                      fontWeight: 950,
                      marginBottom: 16,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row[0]}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {row[1]}
                  </h3>
                  <p style={{ marginTop: 10, color: T.muted, lineHeight: 1.65, fontWeight: 650, fontSize: 14 }}>
                    {row[2]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* WHY GENERIC TOOLS FAIL */}
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
            <div style={{ opacity: 0.78, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
              {t.failEyebrow}
            </div>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.055em", maxWidth: 860, lineHeight: 1.12 }}>
              {t.failTitle}
            </h2>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div
                style={{
                  borderRadius: 24,
                  padding: 26,
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950, opacity: 0.85 }}>
                  {t.genericTitle}
                </h3>
                {t.genericItems.map((x, i) => (
                  <div
                    key={i}
                    style={{
                      marginTop: 12,
                      opacity: 0.72,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,.5)", fontWeight: 950 }}>✕</span>
                    {x}
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderRadius: 24,
                  padding: 26,
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.20)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>
                  {t.zyrixTitle}
                </h3>
                {t.zyrixItems.map((x, i) => (
                  <div
                    key={i}
                    style={{
                      marginTop: 12,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: C.emerald, fontWeight: 950 }}>✓</span>
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WORKFLOW SIMULATION */}
          <div style={{ ...cardBase, padding: 34, marginBottom: 64 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.flowEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.flowTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
              {[
                [t.flow1Title, t.flow1Desc, false],
                [t.flow2Title, displayCase.nums.delay + "% " + t.flow2Suffix, false],
                [t.flow3Title, t.flow3Desc, false],
                [t.flow4Title, t.flow4Desc, false],
                [t.flow5Title, fmtMoney(displayCase.nums.recoverable) + " " + t.flow5Suffix, true],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 24,
                    padding: 20,
                    background: row[2] ? "rgba(16,185,129,.10)" : "rgba(255,255,255,.92)",
                    border: "1px solid " + T.hairline,
                    minHeight: 158,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      color: row[2] ? recoverColor : themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 17, fontWeight: 950, letterSpacing: "-0.025em" }}>
                    {row[0]}
                  </h3>
                  <p style={{ marginTop: 8, color: T.muted, lineHeight: 1.55, fontWeight: 650, fontSize: 13 }}>
                    {row[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTOR USE CASES GRID */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 8 }}>
                {t.useEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.useTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {sectorList.map((s) => (
                <div
                  key={s.id}
                  style={{
                    ...cardBase,
                    padding: 26,
                    borderTop: "3px solid " + s.accent.bright,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 950,
                      letterSpacing: "-0.035em",
                      color: T.ink,
                    }}
                  >
                    {s.name}
                  </h3>
                  <p style={{ marginTop: 12, color: T.muted, lineHeight: 1.65, fontWeight: 650, fontSize: 14 }}>
                    {s.risk}
                  </p>
                  <div
                    style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(16,185,129,.10)",
                      color: recoverColor,
                      fontWeight: 950,
                      fontSize: 13,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtMoney(s.nums.recoverable)} {t.useRecoverableSuffix}
                  </div>
                </div>
              ))}
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
            <div style={{ opacity: 0.78, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
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
                maxWidth: 660,
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
                to="/case-studies"
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

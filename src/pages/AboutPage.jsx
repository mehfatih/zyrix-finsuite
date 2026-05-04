import React from "react";
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
};

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    back: "Geri",
    badge: "ZYRIX HAKKINDA",
    h1a: "Isletmeler icin",
    h1b: "finansal zeka katmanini",
    h1c: "insa ediyoruz.",
    sub: "Zyrix; faturalari, tahsilati ve nakit akisi sinyallerini, ekibinin risk kayba donusmeden once harekete gecebilecegi kararlara cevirir.",
    ctaPrimary: "AI Nakit Analizini Baslat",
    ctaSecondary: "Zyrix nasil calisir",

    missionEyebrow: "MISYONUMUZ",
    missionTitle: "Dagilmis finansal veriyi gunluk kararlara cevirmek.",
    missionBody: "Cogu isletme ihtiyac duydugu bilgiye zaten sahip — faturalar, odeme davranisi, musteri tarihcesi ve ekip aktivitesi icinde. Sorun, bu bilginin parcali, gec ve uzerinde harekete gecmesi zor olmasi. Zyrix bu sinyalleri bir araya getirir ve onlari acik onceliklere, risk uyarilarina ve aksiyon-hazir tavsiyelere donusturur.",

    whyEyebrow: "NEDEN SIMDI",
    whyTitle: "Sirketlerin daha cok araci var — ama daha az net karar.",
    why1Title: "Daha cok veri",
    why1Desc:  "Faturalar, odemeler, musteriler, mesajlar ve raporlar buyumeye devam ediyor.",
    why2Title: "Daha cok gurultu",
    why2Desc:  "Ekipler hala onemli olani manuel kovaliyor, cogu zaman sorun ortaya ciktiktan sonra.",
    why3Title: "Daha cok baski",
    why3Desc:  "Nakit akisi kararlarinin daha erken, daha hizli ve daha yuksek guvenle alinmasi gerekiyor.",

    beliefEyebrow: "NEYE INANIYORUZ",
    beliefTitle: "Finans, raporlamadan harekete gecmeye gecmeli.",
    belief1Title: "Tahmin eden finans",
    belief1Desc:  "Finans, sadece olmus olani degil, sirada ne olabilecegini de gostermeli.",
    belief2Title: "Faturalar aksiyon tetikler",
    belief2Desc:  "Her fatura bir sinyal, oncelik veya sonraki adim olusturmali.",
    belief3Title: "AI kararlari yonlendirir",
    belief3Desc:  "AI tahmin etmeyi azaltmali ve ekiplerin guvenle daha hizli hareket etmesine yardim etmeli.",
    belief4Title: "Ekipler kovalamayi birakir",
    belief4Desc:  "Insanlar yazilimin yuzeye cikarabilecegi seyi manuel takip etmek icin zaman harcamamali.",

    wayEyebrow: "ZYRIX YOLU",
    wayTitle: "Bagla → Anla → Karar Ver → Harekete Gec",
    way1Title: "Bagla",
    way1Desc:  "Fatura, tahsilat ve musteri sinyallerini bir araya getir.",
    way2Title: "Anla",
    way2Desc:  "Davranisi, riski, zamanlamayi ve nakit baskisini analiz et.",
    way3Title: "Karar Ver",
    way3Desc:  "Sinyalleri oncelik kararlarina ve onerilen aksiyonlara cevir.",
    way4Title: "Harekete Gec",
    way4Desc:  "Para kaybedilmeden once takipleri, gorevleri ve sonraki adimlari hazirla.",

    visionEyebrow: "VIZYONUMUZ",
    visionTitle: "Daha erken hareket etmek isteyen isletmeler icin finansal komuta katmanini kurmak.",
    visionBody: "Bir sonraki nesil isletme finansinin sadece dashboard'larla tanimlanmayacagina inaniyoruz. Neyin degistigini anlayan, neden onemli oldugunu aciklayan ve baski gelmeden once ekiplerin harekete gecmesine yardim eden sistemlerle tanimlanacak.",

    becomeEyebrow: "ZYRIX NEYE DONUSUYOR",
    becomeTitle: "Sinyalleri aksiyona cevirerek nakit akisini koruyan bir sistem.",
    become1: "Her fatura bir sinyale donusur.",
    become2: "Her risk daha erken gorunur olur.",
    become3: "Her ekip daha net oncelikler alir.",
    become4: "Her aksiyon bir sonraki karari iyilestirir.",

    finalEyebrow: "VERINLE BASLA",
    finalTitle: "Ilk AI nakit analizini baslat.",
    finalSub: "Faturalarinin sana ne soyledigini gor, gizli nakit riskini kesfet ve ilk aksiyon planini olustur.",
    finalCta1: "AI Analizi Baslat",
    finalCta2: "Platformu Kesfet",
  },

  EN: {
    back: "Back",
    badge: "ABOUT ZYRIX",
    h1a: "We are building the",
    h1b: "intelligence layer",
    h1c: "for business finance.",
    sub: "Zyrix exists to turn invoices, collections, and cashflow signals into decisions your team can act on before risk becomes loss.",
    ctaPrimary: "Start AI Cashflow Analysis",
    ctaSecondary: "See how Zyrix works",

    missionEyebrow: "OUR MISSION",
    missionTitle: "Convert scattered financial data into daily decisions.",
    missionBody: "Most businesses already have the information they need — inside invoices, payment behavior, customer history, and team activity. The problem is that this information is fragmented, delayed, and difficult to act on. Zyrix brings these signals together and transforms them into clear priorities, risk alerts, and action-ready recommendations.",

    whyEyebrow: "WHY NOW",
    whyTitle: "Companies have more tools than ever — but fewer clear decisions.",
    why1Title: "More data",
    why1Desc:  "Invoices, payments, customers, messages, and reports keep growing.",
    why2Title: "More noise",
    why2Desc:  "Teams still chase what matters manually, often after the problem appears.",
    why3Title: "More pressure",
    why3Desc:  "Cashflow decisions need to happen earlier, faster, and with more confidence.",

    beliefEyebrow: "WHAT WE BELIEVE",
    beliefTitle: "Finance should move from reporting to acting.",
    belief1Title: "Predictive finance",
    belief1Desc:  "Finance should show what may happen next, not only what already happened.",
    belief2Title: "Invoices trigger actions",
    belief2Desc:  "Every invoice should create a signal, priority, or next step.",
    belief3Title: "AI guides decisions",
    belief3Desc:  "AI should reduce guessing and help teams move faster with confidence.",
    belief4Title: "Teams stop chasing",
    belief4Desc:  "People should not waste time manually tracking what software can surface.",

    wayEyebrow: "THE ZYRIX WAY",
    wayTitle: "Connect → Understand → Decide → Act",
    way1Title: "Connect",
    way1Desc:  "Bring invoice, collection, and customer signals together.",
    way2Title: "Understand",
    way2Desc:  "Analyze behavior, risk, timing, and cashflow pressure.",
    way3Title: "Decide",
    way3Desc:  "Turn signals into priority decisions and recommended actions.",
    way4Title: "Act",
    way4Desc:  "Prepare follow-ups, tasks, and next steps before money is lost.",

    visionEyebrow: "OUR VISION",
    visionTitle: "Build the financial command layer for businesses that want to act earlier.",
    visionBody: "We believe the next generation of business finance will not be defined by dashboards alone. It will be defined by systems that understand what is changing, explain why it matters, and help teams act before the pressure arrives.",

    becomeEyebrow: "WHAT ZYRIX BECOMES",
    becomeTitle: "A system that protects cashflow by turning signals into action.",
    become1: "Every invoice becomes a signal.",
    become2: "Every risk becomes visible earlier.",
    become3: "Every team gets clearer priorities.",
    become4: "Every action improves the next decision.",

    finalEyebrow: "START WITH YOUR DATA",
    finalTitle: "Start your first AI cashflow analysis.",
    finalSub: "See what your invoices are telling you, discover hidden cashflow risk, and generate your first action plan.",
    finalCta1: "Start AI Analysis",
    finalCta2: "Explore Platform",
  },

  AR: {
    back: "\u0631\u062C\u0648\u0639",
    badge: "\u0639\u0646 \u0632\u064A\u0631\u0643\u0633",
    h1a: "\u0646\u062D\u0646 \u0646\u0628\u0646\u064A",
    h1b: "\u0637\u0628\u0642\u0629 \u0627\u0644\u0630\u0643\u0627\u0621",
    h1c: "\u0644\u0644\u062A\u0645\u0648\u064A\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.",
    sub: "\u0632\u064A\u0631\u0643\u0633 \u0648\u062C\u062F \u0644\u064A\u062D\u0648\u0651\u0644 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0625\u0644\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u064A\u0633\u062A\u0637\u064A\u0639 \u0641\u0631\u064A\u0642\u0643 \u062A\u0646\u0641\u064A\u0630\u0647\u0627 \u0642\u0628\u0644 \u0623\u0646 \u064A\u062A\u062D\u0648\u0651\u0644 \u0627\u0644\u062E\u0637\u0631 \u0625\u0644\u0649 \u062E\u0633\u0627\u0631\u0629.",
    ctaPrimary: "\u0627\u0628\u062F\u0623 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    ctaSecondary: "\u0634\u0627\u0647\u062F \u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0632\u064A\u0631\u0643\u0633",

    missionEyebrow: "\u0645\u0647\u0645\u062A\u0646\u0627",
    missionTitle: "\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u062A\u0641\u0631\u0651\u0642\u0629 \u0625\u0644\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u064A\u0648\u0645\u064A\u0629.",
    missionBody: "\u0645\u0639\u0638\u0645 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u062A\u0645\u0644\u0643 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u062D\u062A\u0627\u062C\u0647\u0627 \u0628\u0627\u0644\u0641\u0639\u0644 \u2014 \u062F\u0627\u062E\u0644 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0633\u0644\u0648\u0643 \u0627\u0644\u062F\u0641\u0639 \u0648\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0646\u0634\u0627\u0637 \u0627\u0644\u0641\u0631\u064A\u0642. \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0623\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u062C\u0632\u0623\u0629 \u0648\u0645\u062A\u0623\u062E\u0631\u0629 \u0648\u064A\u0635\u0639\u0628 \u0627\u062A\u062E\u0627\u0630 \u0625\u062C\u0631\u0627\u0621 \u062D\u064A\u0627\u0644\u0647\u0627. \u0632\u064A\u0631\u0643\u0633 \u064A\u062C\u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0648\u064A\u062D\u0648\u0644\u0647\u0627 \u0625\u0644\u0649 \u0623\u0648\u0644\u0648\u064A\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0644\u0644\u062E\u0637\u0631 \u0648\u062A\u0648\u0635\u064A\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630.",

    whyEyebrow: "\u0644\u0645\u0627\u0630\u0627 \u0627\u0644\u0622\u0646",
    whyTitle: "\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u062A\u0645\u0644\u0643 \u0623\u062F\u0648\u0627\u062A \u0623\u0643\u062B\u0631 \u0645\u0646 \u0623\u064A \u0648\u0642\u062A \u2014 \u0644\u0643\u0646 \u0642\u0631\u0627\u0631\u0627\u062A \u0623\u0642\u0644 \u0648\u0636\u0648\u062D\u0627\u064B.",
    why1Title: "\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0643\u062B\u0631",
    why1Desc:  "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u062A\u062A\u0632\u0627\u064A\u062F.",
    why2Title: "\u0636\u0648\u0636\u0627\u0621 \u0623\u0643\u062B\u0631",
    why2Desc:  "\u0627\u0644\u0641\u0631\u0642 \u0644\u0627 \u062A\u0632\u0627\u0644 \u062A\u0644\u0627\u062D\u0642 \u0627\u0644\u0645\u0647\u0645 \u064A\u062F\u0648\u064A\u0627\u064B\u060C \u063A\u0627\u0644\u0628\u0627\u064B \u0628\u0639\u062F \u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u0634\u0643\u0644\u0629.",
    why3Title: "\u0636\u063A\u0637 \u0623\u0643\u0628\u0631",
    why3Desc:  "\u0642\u0631\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u062A\u062D\u062A\u0627\u062C \u0644\u062A\u062D\u062F\u062B \u0623\u0628\u0643\u0631 \u0648\u0623\u0633\u0631\u0639 \u0648\u0628\u062B\u0642\u0629 \u0623\u0639\u0644\u0649.",

    beliefEyebrow: "\u0628\u0645\u0627\u0630\u0627 \u0646\u0624\u0645\u0646",
    beliefTitle: "\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0642\u0644 \u0645\u0646 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0625\u0644\u0649 \u0627\u0644\u0641\u0639\u0644.",
    belief1Title: "\u062A\u0645\u0648\u064A\u0644 \u062A\u0646\u0628\u0624\u064A",
    belief1Desc:  "\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0631\u064A \u0645\u0627 \u0642\u062F \u064A\u062D\u062F\u062B \u0644\u0627\u062D\u0642\u0627\u064B\u060C \u0644\u064A\u0633 \u0641\u0642\u0637 \u0645\u0627 \u062D\u062F\u062B \u0628\u0627\u0644\u0641\u0639\u0644.",
    belief2Title: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u062A\u062D\u0641\u0651\u0632 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
    belief2Desc:  "\u0643\u0644 \u0641\u0627\u062A\u0648\u0631\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0635\u0646\u0639 \u0625\u0634\u0627\u0631\u0629 \u0623\u0648 \u0623\u0648\u0644\u0648\u064A\u0629 \u0623\u0648 \u062E\u0637\u0648\u0629 \u062A\u0627\u0644\u064A\u0629.",
    belief3Title: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u0648\u062C\u0651\u0647 \u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A",
    belief3Desc:  "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0642\u0644\u0644 \u0627\u0644\u062A\u062E\u0645\u064A\u0646 \u0648\u064A\u0633\u0627\u0639\u062F \u0627\u0644\u0641\u0631\u0642 \u0639\u0644\u0649 \u0627\u0644\u062A\u062D\u0631\u0643 \u0623\u0633\u0631\u0639 \u0628\u062B\u0642\u0629.",
    belief4Title: "\u0627\u0644\u0641\u0631\u0642 \u062A\u062A\u0648\u0642\u0651\u0641 \u0639\u0646 \u0627\u0644\u0645\u0644\u0627\u062D\u0642\u0629",
    belief4Desc:  "\u0627\u0644\u0646\u0627\u0633 \u0644\u0627 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0647\u062F\u0631 \u0648\u0642\u062A\u0647\u0627 \u0641\u064A \u062A\u062A\u0628\u0651\u0639 \u064A\u062F\u0648\u064A \u0644\u0645\u0627 \u064A\u0645\u0643\u0646 \u0644\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0625\u0628\u0631\u0627\u0632\u0647.",

    wayEyebrow: "\u0637\u0631\u064A\u0642\u0629 \u0632\u064A\u0631\u0643\u0633",
    wayTitle: "\u0627\u0631\u0628\u0637 \u2192 \u0627\u0641\u0647\u0645 \u2192 \u0642\u0631\u0651\u0631 \u2192 \u062A\u0635\u0631\u0651\u0641",
    way1Title: "\u0627\u0631\u0628\u0637",
    way1Desc:  "\u0627\u062C\u0645\u0639 \u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0645\u0639\u0627\u064B.",
    way2Title: "\u0627\u0641\u0647\u0645",
    way2Desc:  "\u062D\u0644\u0644 \u0627\u0644\u0633\u0644\u0648\u0643 \u0648\u0627\u0644\u062E\u0637\u0631 \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A \u0648\u0636\u063A\u0637 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A.",
    way3Title: "\u0642\u0631\u0651\u0631",
    way3Desc:  "\u062D\u0648\u0651\u0644 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0625\u0644\u0649 \u0642\u0631\u0627\u0631\u0627\u062A \u0623\u0648\u0644\u0648\u064A\u0629 \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u0648\u0635\u0649 \u0628\u0647\u0627.",
    way4Title: "\u062A\u0635\u0631\u0651\u0641",
    way4Desc:  "\u062C\u0647\u0651\u0632 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0642\u0628\u0644 \u0641\u0642\u062F\u0627\u0646 \u0627\u0644\u0646\u0642\u062F.",

    visionEyebrow: "\u0631\u0624\u064A\u062A\u0646\u0627",
    visionTitle: "\u0628\u0646\u0627\u0621 \u0637\u0628\u0642\u0629 \u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0644\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0627\u0644\u062A\u062D\u0631\u0643 \u0623\u0628\u0643\u0631.",
    visionBody: "\u0646\u0624\u0645\u0646 \u0628\u0623\u0646 \u0627\u0644\u062C\u064A\u0644 \u0627\u0644\u0642\u0627\u062F\u0645 \u0645\u0646 \u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0644\u0646 \u064A\u062A\u0645 \u062A\u0639\u0631\u064A\u0641\u0647 \u0628\u0627\u0644\u0644\u0648\u062D\u0627\u062A \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u064A\u0629 \u0648\u062D\u062F\u0647\u0627. \u0633\u064A\u062A\u0645 \u062A\u0639\u0631\u064A\u0641\u0647 \u0628\u0623\u0646\u0638\u0645\u0629 \u062A\u0641\u0647\u0645 \u0645\u0627 \u064A\u062A\u063A\u064A\u0631 \u0648\u062A\u0634\u0631\u062D \u0644\u0645\u0627\u0630\u0627 \u0647\u0648 \u0645\u0647\u0645 \u0648\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0641\u0631\u0642 \u0639\u0644\u0649 \u0627\u0644\u062A\u062D\u0631\u0643 \u0642\u0628\u0644 \u0648\u0635\u0648\u0644 \u0627\u0644\u0636\u063A\u0637.",

    becomeEyebrow: "\u0625\u0644\u0649 \u0645\u0627 \u064A\u062A\u062D\u0648\u0644 \u0632\u064A\u0631\u0643\u0633",
    becomeTitle: "\u0646\u0638\u0627\u0645 \u064A\u062D\u0645\u064A \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0628\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0625\u0644\u0649 \u0641\u0639\u0644.",
    become1: "\u0643\u0644 \u0641\u0627\u062A\u0648\u0631\u0629 \u062A\u0635\u0628\u062D \u0625\u0634\u0627\u0631\u0629.",
    become2: "\u0643\u0644 \u062E\u0637\u0631 \u064A\u0635\u0628\u062D \u0645\u0631\u0626\u064A\u0627\u064B \u0623\u0628\u0643\u0631.",
    become3: "\u0643\u0644 \u0641\u0631\u064A\u0642 \u064A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0623\u0648\u0644\u0648\u064A\u0627\u062A \u0623\u0648\u0636\u062D.",
    become4: "\u0643\u0644 \u0625\u062C\u0631\u0627\u0621 \u064A\u062D\u0633\u0651\u0646 \u0627\u0644\u0642\u0631\u0627\u0631 \u0627\u0644\u062A\u0627\u0644\u064A.",

    finalEyebrow: "\u0627\u0628\u062F\u0623 \u0628\u0628\u064A\u0627\u0646\u0627\u062A\u0643",
    finalTitle: "\u0627\u0628\u062F\u0623 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0623\u0648\u0644 \u0644\u062A\u062F\u0641\u0642\u0643 \u0627\u0644\u0646\u0642\u062F\u064A.",
    finalSub: "\u0634\u0627\u0647\u062F \u0645\u0627\u0630\u0627 \u062A\u0642\u0648\u0644 \u0641\u0648\u0627\u062A\u064A\u0631\u0643 \u0648\u0627\u0643\u062A\u0634\u0641 \u062E\u0637\u0631 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u0645\u062E\u0641\u064A \u0648\u0627\u0628\u0646 \u062E\u0637\u0629 \u0623\u0648\u0644 \u0625\u062C\u0631\u0627\u0621.",
    finalCta1: "\u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u062D\u0644\u064A\u0644",
    finalCta2: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u0646\u0635\u0651\u0629",
  },
};

// ---------- Component ----------
export default function AboutPage() {
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
  const shadowRGB    = isArabic ? "0,77,38"      : "58,5,9";

  const ctaShadow   = "0 26px 64px rgba(" + themeGlowRGB + ",.30)";
  const cardShadow  = "0 28px 74px rgba(" + shadowRGB    + ",.10)";
  const heavyShadow = "0 34px 90px rgba(" + shadowRGB    + ",.26)";
  const arrow = isRTL ? "\u2190" : "\u2192";

  const cardBase = {
    borderRadius: 32,
    background: "rgba(255,255,255,.88)",
    border: "1px solid " + T.hairline,
    boxShadow: cardShadow,
    backdropFilter: "blur(18px)",
  };

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
      <section style={{ padding: "148px 32px 110px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle at 50% 12%, rgba(" + themeGlowRGB + ",.14), transparent 50%)",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* NAV */}
          
          {/* HERO */}
          <div style={{ textAlign: "center", maxWidth: 1040, margin: "0 auto 90px" }}>
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
                marginBottom: 22,
                boxShadow: "0 18px 44px rgba(" + shadowRGB + ",.10)",
              }}
            >
              ✦ {t.badge}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(44px,5.5vw,82px)",
                lineHeight: 1.04,
                letterSpacing: "-0.065em",
                fontWeight: 950,
              }}
            >
              {t.h1a} <span style={{ color: themeColor }}>{t.h1b}</span> {t.h1c}
            </h1>

            <p
              style={{
                margin: "26px auto 0",
                maxWidth: 820,
                color: T.muted,
                fontSize: 19,
                lineHeight: 1.78,
                fontWeight: 650,
              }}
            >
              {t.sub}
            </p>

            <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/onboarding"
                style={{
                  borderRadius: 22,
                  padding: "20px 36px",
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
                  padding: "19px 32px",
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

          {/* MISSION — split layout: title left, narrative right */}
          <div
            style={{
              ...cardBase,
              padding: 46,
              marginBottom: 74,
              display: "grid",
              gridTemplateColumns: ".85fr 1.15fr",
              gap: 38,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 12 }}>
                {t.missionEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 42, lineHeight: 1.08, letterSpacing: "-0.055em", fontWeight: 950 }}>
                {t.missionTitle}
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: T.muted,
                fontSize: 18,
                lineHeight: 1.92,
                fontWeight: 650,
              }}
            >
              {t.missionBody}
            </p>
          </div>

          {/* WHY NOW — dark gradient panel + 3 columns */}
          <div
            style={{
              borderRadius: 40,
              padding: 48,
              background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
              color: "#fff",
              boxShadow: heavyShadow,
              marginBottom: 74,
            }}
          >
            <div style={{ opacity: 0.78, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 12 }}>
              {t.whyEyebrow}
            </div>

            <h2
              style={{
                margin: 0,
                maxWidth: 920,
                fontSize: 46,
                lineHeight: 1.08,
                letterSpacing: "-0.058em",
                fontWeight: 950,
              }}
            >
              {t.whyTitle}
            </h2>

            <div
              style={{
                marginTop: 36,
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 18,
              }}
            >
              {[
                [t.why1Title, t.why1Desc],
                [t.why2Title, t.why2Desc],
                [t.why3Title, t.why3Desc],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 28,
                    padding: 26,
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.14)",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 23, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {row[0]}
                  </h3>
                  <p
                    style={{
                      margin: "12px 0 0",
                      opacity: 0.78,
                      fontSize: 15,
                      lineHeight: 1.72,
                      fontWeight: 650,
                    }}
                  >
                    {row[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT WE BELIEVE — 4 cards */}
          <div style={{ marginBottom: 74 }}>
            <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 36px" }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                {t.beliefEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 42, letterSpacing: "-0.055em", fontWeight: 950, lineHeight: 1.1 }}>
                {t.beliefTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
              {[
                [t.belief1Title, t.belief1Desc],
                [t.belief2Title, t.belief2Desc],
                [t.belief3Title, t.belief3Desc],
                [t.belief4Title, t.belief4Desc],
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    ...cardBase,
                    padding: 28,
                    minHeight: 252,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 18,
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 950,
                      background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                      marginBottom: 20,
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: "-0.035em", lineHeight: 1.18 }}>
                    {row[0]}
                  </h3>
                  <p style={{ margin: "12px 0 0", color: T.muted, fontSize: 14.5, lineHeight: 1.72, fontWeight: 650 }}>
                    {row[1]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* THE ZYRIX WAY — 4 steps, step 3 (Decide) highlighted */}
          <div style={{ ...cardBase, padding: 42, marginBottom: 74 }}>
            <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 34px" }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                {t.wayEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 38, letterSpacing: "-0.055em", fontWeight: 950, lineHeight: 1.1 }}>
                {t.wayTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[
                [t.way1Title, t.way1Desc],
                [t.way2Title, t.way2Desc],
                [t.way3Title, t.way3Desc],
                [t.way4Title, t.way4Desc],
              ].map((row, i) => {
                const highlighted = i === 2; // Decide step
                return (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      borderRadius: 28,
                      padding: 26,
                      background: highlighted
                        ? "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")"
                        : "rgba(255,255,255,.92)",
                      color: highlighted ? "#fff" : T.ink,
                      border: highlighted
                        ? "1px solid rgba(" + themeGlowRGB + ",.30)"
                        : "1px solid " + T.hairline,
                      minHeight: 200,
                      boxShadow: highlighted
                        ? "0 22px 56px rgba(" + themeGlowRGB + ",.30)"
                        : "0 14px 32px rgba(" + shadowRGB + ",.05)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 950,
                        opacity: highlighted ? 0.82 : 0.55,
                        fontFamily: "'Inter Tight', system-ui, sans-serif",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 style={{ margin: "14px 0 0", fontSize: 24, fontWeight: 950, letterSpacing: "-0.035em" }}>
                      {row[0]}
                    </h3>
                    <p
                      style={{
                        marginTop: 12,
                        color: highlighted ? "rgba(255,255,255,.82)" : T.muted,
                        fontSize: 14.5,
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

          {/* VISION + WHAT ZYRIX BECOMES — split layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              alignItems: "stretch",
              marginBottom: 74,
            }}
          >
            <div style={{ ...cardBase, padding: 40 }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                {t.visionEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 38, lineHeight: 1.12, letterSpacing: "-0.055em", fontWeight: 950 }}>
                {t.visionTitle}
              </h2>
              <p style={{ marginTop: 18, color: T.muted, fontSize: 16.5, lineHeight: 1.85, fontWeight: 650 }}>
                {t.visionBody}
              </p>
            </div>

            <div
              style={{
                borderRadius: 40,
                padding: 40,
                background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                color: "#fff",
                boxShadow: heavyShadow,
              }}
            >
              <div style={{ opacity: 0.78, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                {t.becomeEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, lineHeight: 1.12, letterSpacing: "-0.055em", fontWeight: 950 }}>
                {t.becomeTitle}
              </h2>

              <div style={{ marginTop: 26, display: "grid", gap: 12 }}>
                {[t.become1, t.become2, t.become3, t.become4].map((x, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 20,
                      padding: 18,
                      background: "rgba(255,255,255,.09)",
                      border: "1px solid rgba(255,255,255,.14)",
                      fontWeight: 850,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ color: C.emerald, fontWeight: 950, fontSize: 17 }}>✓</span>
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FINAL CTA */}
          <div
            style={{
              borderRadius: 40,
              padding: 50,
              background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
              color: "#fff",
              textAlign: "center",
              boxShadow: heavyShadow,
            }}
          >
            <div
              style={{
                opacity: 0.78,
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
                fontSize: 44,
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: "-0.055em",
              }}
            >
              {t.finalTitle}
            </h2>

            <p
              style={{
                margin: "14px auto 0",
                maxWidth: 680,
                opacity: 0.78,
                fontSize: 17,
                lineHeight: 1.7,
                fontWeight: 650,
              }}
            >
              {t.finalSub}
            </p>

            <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/onboarding"
                style={{
                  borderRadius: 22,
                  padding: "20px 36px",
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

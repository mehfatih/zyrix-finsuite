import React, { useState, useMemo } from "react";
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

// ---------- Pipeline node IDs (stable) ----------
const NODE_IDS = ["invoices", "payments", "crm", "behavior", "risk", "actions"];

// ---------- Integration category IDs ----------
const CATEGORY_IDS = ["accounting", "payments", "crm", "communication", "erp", "api"];

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    back: "Geri",
    badge: "BAGLANTI MOTORU",
    h1a: "Araclarinda zaten cevaplar var.",
    h1b: "Zyrix onlari birbirine baglar.",
    sub: "Faturalari, odemeleri, CRM ve iletisim kanallarini tek bir gercek zamanli nakit akisi zekasina baglar.",
    ctaPrimary: "Sistemlerimi Bagla",
    ctaSecondary: "Nasil calisir gor",

    pipelineEyebrow: "CANLI VERI AKISI",
    pipelineTitle: "Dagilmis sistemlerden tek karar akisina.",
    nodes: {
      invoices: "Faturalar",
      payments: "Odemeler",
      crm: "CRM",
      behavior: "Davranis",
      risk: "Risk",
      actions: "Aksiyon",
    },
    nodeStatus: " bagli — AI nakit akisi sinyali olusturuldu",

    catEyebrow: "ENTEGRASYON KATMANI",
    catTitle: "Zaten kullandigin her seyle baglan.",
    cats: {
      accounting:    { name: "Muhasebe", desc: "Fatura kayitlari, bakiyeler, musteri defterleri" },
      payments:      { name: "Odemeler", desc: "Odeme durumu, basarisiz denemeler, tahsilat hareketi" },
      crm:           { name: "CRM",      desc: "Musteri gecmisi, segmentler, hesap sahipligi" },
      communication: { name: "Iletisim", desc: "WhatsApp, e-posta, hatirlatmalar, takip aktivitesi" },
      erp:           { name: "ERP",      desc: "Operasyonel veri, siparisler, envanter sinyalleri" },
      api:           { name: "API / Webhooks", desc: "Ozel veri akislari ve gercek zamanli olay tetikleyicileri" },
    },
    liveSyncReady: "Canli senkronizasyon hazir",

    chaosEyebrow: "ONCE",
    chaosTitle: "Birbirinden kopuk araclar gizli risk yaratir.",
    chaosItems: [
      "Fatura verisi yalniz duruyor",
      "Odeme durumu gec guncelleniyor",
      "CRM baglami ayri kaliyor",
      "Ekipler manuel kovaliyor",
    ],

    commandEyebrow: "ZYRIX ILE",
    commandTitle: "Tek komuta merkezi veriyi aksiyona cevirir.",
    commandItems: [
      "Risk sinyalleri gorunur olur",
      "Takipler oncelik kazanir",
      "AI sonraki aksiyonu hazirlar",
      "Nakit akisi tahmin edilebilir hale gelir",
    ],

    aiEyebrow: "AI KATMANI",
    aiTitleA: "Sadece bagli degil.",
    aiTitleB: "Anlasilmis.",
    aiSub: "Zyrix araclarinin arasindaki sinyalleri okur ve onlari risk tespiti, nakit akisi tahminleri ve onerilen aksiyonlara cevirir.",
    aiSignals: [
      ["Fatura gecikmesi tespit edildi", "Risk seviyesi guncellendi"],
      ["Musteri davranisi degisti", "Oncelikli takip onerildi"],
      ["Odeme bosluugu ongoruldu", "Nakit akisi izleme listesi olusturuldu"],
    ],

    simEyebrow: "GERCEK ZAMANLI SIMULASYON",
    simTitle: "Bir sistem degistiginde, Zyrix karari guncelliyor.",
    simSteps: [
      ["01", "Odeme gecikti", "Musteri risk skoru artar."],
      ["02", "CRM baglami bulundu", "Hesap sahibine oncelikli gorev gider."],
      ["03", "Aksiyon tetiklendi", "Hatirlatma otomatik hazirlanir."],
    ],

    trust: ["Agir kurulum yok", "Guvenli API katmani", "Webhooks hazir", "Dakikalar icinde calisir"],

    finalEyebrow: "BAGLAN → ANLA → HAREKET ET",
    finalTitle: "Sistemlerini bagla. Nakdini geri kazanmaya basla.",
    finalSub: "Zyrix mevcut verini risk sinyallerine, geri kazanim firsatlarina ve aksiyona hazir kararlara cevirir.",
    finalCta1: "Sistemlerimi Bagla",
    finalCta2: "Ozellikleri kesfet",
  },

  EN: {
    back: "Back",
    badge: "CONNECTIVITY ENGINE",
    h1a: "Your tools already have the answers.",
    h1b: "Zyrix connects them.",
    sub: "Connect invoices, payments, CRM, and communication channels into one real-time cashflow intelligence engine.",
    ctaPrimary: "Connect My Systems",
    ctaSecondary: "See How It Works",

    pipelineEyebrow: "LIVE DATA FLOW",
    pipelineTitle: "From scattered systems to one decision stream.",
    nodes: {
      invoices: "Invoices",
      payments: "Payments",
      crm: "CRM",
      behavior: "Behavior",
      risk: "Risk",
      actions: "Actions",
    },
    nodeStatus: " connected — AI cashflow signal generated",

    catEyebrow: "INTEGRATION LAYER",
    catTitle: "Connect everything you already use.",
    cats: {
      accounting:    { name: "Accounting",    desc: "Invoice records, balances, customer ledgers" },
      payments:      { name: "Payments",      desc: "Payment status, failed attempts, settlement movement" },
      crm:           { name: "CRM",           desc: "Customer history, segments, account ownership" },
      communication: { name: "Communication", desc: "WhatsApp, email, reminders, follow-up activity" },
      erp:           { name: "ERP",           desc: "Operational data, orders, inventory-linked signals" },
      api:           { name: "API / Webhooks", desc: "Custom data flows and real-time event triggers" },
    },
    liveSyncReady: "Live sync ready",

    chaosEyebrow: "BEFORE",
    chaosTitle: "Disconnected tools create hidden risk.",
    chaosItems: [
      "Invoice data sits alone",
      "Payment status updates late",
      "CRM context is separated",
      "Teams chase manually",
    ],

    commandEyebrow: "WITH ZYRIX",
    commandTitle: "One command center turns data into action.",
    commandItems: [
      "Risk signals become visible",
      "Follow-ups are prioritized",
      "AI prepares next actions",
      "Cashflow becomes predictable",
    ],

    aiEyebrow: "AI LAYER",
    aiTitleA: "Not just connected.",
    aiTitleB: "Understood.",
    aiSub: "Zyrix reads signals across your tools and turns them into risk detection, cashflow forecasts, and recommended actions.",
    aiSignals: [
      ["Invoice delay detected",     "Risk level updated"],
      ["Customer behavior changed",  "Priority follow-up suggested"],
      ["Payment gap forecasted",     "Cashflow watchlist created"],
    ],

    simEyebrow: "REAL-TIME SIMULATION",
    simTitle: "When one system changes, Zyrix updates the decision.",
    simSteps: [
      ["01", "Payment delayed",   "Customer risk score increases."],
      ["02", "CRM context found", "Account owner gets priority task."],
      ["03", "Action triggered",  "Reminder is prepared automatically."],
    ],

    trust: ["No heavy setup", "Secure API layer", "Webhooks ready", "Works in minutes"],

    finalEyebrow: "CONNECT → UNDERSTAND → ACT",
    finalTitle: "Plug in your systems. Start recovering cashflow.",
    finalSub: "Zyrix turns your existing data into risk signals, recovery opportunities, and action-ready decisions.",
    finalCta1: "Connect My Systems",
    finalCta2: "Explore Features",
  },

  AR: {
    back: "\u0631\u062C\u0648\u0639",
    badge: "\u0645\u062D\u0631\u0643 \u0627\u0644\u0627\u062A\u0635\u0627\u0644",
    h1a: "\u0623\u062F\u0648\u0627\u062A\u0643 \u0644\u062F\u064A\u0647\u0627 \u0627\u0644\u0625\u062C\u0627\u0628\u0627\u062A \u0628\u0627\u0644\u0641\u0639\u0644.",
    h1b: "\u0632\u064A\u0631\u0643\u0633 \u064A\u0631\u0628\u0637\u0647\u0627.",
    sub: "\u0627\u0631\u0628\u0637 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0648CRM \u0648\u0642\u0646\u0648\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0645\u062D\u0631\u0643 \u0648\u0627\u062D\u062F \u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0627\u0644\u0641\u0648\u0631\u064A.",
    ctaPrimary: "\u0627\u0631\u0628\u0637 \u0623\u0646\u0638\u0645\u062A\u064A",
    ctaSecondary: "\u0634\u0627\u0647\u062F \u0643\u064A\u0641 \u064A\u0639\u0645\u0644",

    pipelineEyebrow: "\u062A\u062F\u0641\u0642 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0628\u0627\u0634\u0631",
    pipelineTitle: "\u0645\u0646 \u0623\u0646\u0638\u0645\u0629 \u0645\u062A\u0641\u0631\u0642\u0629 \u0625\u0644\u0649 \u062A\u062F\u0641\u0642 \u0642\u0631\u0627\u0631 \u0648\u0627\u062D\u062F.",
    nodes: {
      invoices: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
      payments: "\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A",
      crm:      "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
      behavior: "\u0627\u0644\u0633\u0644\u0648\u0643",
      risk:     "\u0627\u0644\u0645\u062E\u0627\u0637\u0631",
      actions:  "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A",
    },
    nodeStatus: " \u0645\u062A\u0635\u0644 \u2014 \u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0625\u0634\u0627\u0631\u0629 \u062A\u062F\u0641\u0642 \u0646\u0642\u062F\u064A",

    catEyebrow: "\u0637\u0628\u0642\u0629 \u0627\u0644\u062A\u0643\u0627\u0645\u0644",
    catTitle: "\u0627\u0631\u0628\u0637 \u0643\u0644 \u0645\u0627 \u062A\u0633\u062A\u062E\u062F\u0645\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.",
    cats: {
      accounting:    { name: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629", desc: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0623\u0631\u0635\u062F\u0629 \u0648\u062F\u0641\u0627\u062A\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621" },
      payments:      { name: "\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A", desc: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0641\u0627\u0634\u0644\u0629 \u0648\u062D\u0631\u0643\u0629 \u0627\u0644\u062A\u0633\u0648\u064A\u0629" },
      crm:           { name: "CRM", desc: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0627\u0644\u0634\u0631\u0627\u0626\u062D \u0648\u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u062D\u0633\u0627\u0628" },
      communication: { name: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644", desc: "\u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0625\u064A\u0645\u064A\u0644 \u0648\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0648\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629" },
      erp:           { name: "ERP", desc: "\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0637\u0644\u0628\u0627\u062A \u0648\u0625\u0634\u0627\u0631\u0627\u062A \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0645\u062E\u0632\u0648\u0646" },
      api:           { name: "API / Webhooks", desc: "\u062A\u062F\u0641\u0642\u0627\u062A \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062E\u0635\u0651\u0635\u0629 \u0648\u0645\u062D\u0641\u0651\u0632\u0627\u062A \u0623\u062D\u062F\u0627\u062B \u0641\u0648\u0631\u064A\u0629" },
    },
    liveSyncReady: "\u0645\u0632\u0627\u0645\u0646\u0629 \u062D\u064A\u0651\u0629 \u062C\u0627\u0647\u0632\u0629",

    chaosEyebrow: "\u0642\u0628\u0644",
    chaosTitle: "\u0623\u062F\u0648\u0627\u062A \u0645\u0641\u0635\u0648\u0644\u0629 \u062A\u0635\u0646\u0639 \u062E\u0637\u0631\u0627\u064B \u0645\u062E\u0641\u064A\u0651\u0627\u064B.",
    chaosItems: [
      "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u062A\u062C\u0644\u0633 \u0648\u062D\u062F\u0647\u0627",
      "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u062A\u062A\u062D\u062F\u0651\u062B \u0645\u062A\u0623\u062E\u0631\u0629",
      "\u0633\u064A\u0627\u0642 CRM \u0645\u0641\u0635\u0648\u0644",
      "\u0627\u0644\u0641\u0631\u0642 \u062A\u0644\u0627\u062D\u0642 \u064A\u062F\u0648\u064A\u0627\u064B",
    ],

    commandEyebrow: "\u0645\u0639 \u0632\u064A\u0631\u0643\u0633",
    commandTitle: "\u0645\u0631\u0643\u0632 \u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u062D\u062F \u064A\u062D\u0648\u0651\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621.",
    commandItems: [
      "\u0625\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0637\u0631 \u062A\u0635\u0628\u062D \u0648\u0627\u0636\u062D\u0629",
      "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u062A\u0623\u062E\u0630 \u0623\u0648\u0644\u0648\u064A\u0629",
      "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u062C\u0647\u0651\u0632 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A",
      "\u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u064A\u0635\u0628\u062D \u0642\u0627\u0628\u0644\u0627\u064B \u0644\u0644\u062A\u0648\u0642\u0651\u0639",
    ],

    aiEyebrow: "\u0637\u0628\u0642\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    aiTitleA: "\u0644\u064A\u0633 \u0645\u062A\u0635\u0644\u0627\u064B \u0641\u0642\u0637.",
    aiTitleB: "\u0628\u0644 \u0645\u0641\u0647\u0648\u0645.",
    aiSub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u0642\u0631\u0623 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062A \u0639\u0628\u0631 \u0623\u062F\u0648\u0627\u062A\u0643 \u0648\u064A\u062D\u0648\u0651\u0644\u0647\u0627 \u0625\u0644\u0649 \u0631\u0635\u062F \u0644\u0644\u0645\u062E\u0627\u0637\u0631 \u0648\u062A\u0648\u0642\u0651\u0639\u0627\u062A \u0644\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0648\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u0648\u0635\u0649 \u0628\u0647\u0627.",
    aiSignals: [
      ["\u0631\u0635\u062F \u062A\u0623\u062E\u0631 \u0641\u064A \u0641\u0627\u062A\u0648\u0631\u0629", "\u062A\u062D\u062F\u064A\u062B \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062E\u0637\u0631"],
      ["\u062A\u063A\u064A\u0651\u0631 \u0633\u0644\u0648\u0643 \u0627\u0644\u0639\u0645\u064A\u0644", "\u0627\u0642\u062A\u0631\u0627\u062D \u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0623\u0648\u0644\u0648\u064A\u0629"],
      ["\u062A\u0648\u0642\u0651\u0639 \u0641\u062C\u0648\u0629 \u062F\u0641\u0639", "\u0625\u0646\u0634\u0627\u0621 \u0642\u0627\u0626\u0645\u0629 \u0645\u062A\u0627\u0628\u0639\u0629 \u0644\u0644\u062A\u062F\u0641\u0642"],
    ],

    simEyebrow: "\u0645\u062D\u0627\u0643\u0627\u0629 \u0641\u0648\u0631\u064A\u0629",
    simTitle: "\u062D\u064A\u0646 \u064A\u062A\u063A\u064A\u0651\u0631 \u0646\u0638\u0627\u0645 \u0648\u0627\u062D\u062F\u060C \u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u062F\u0651\u062B \u0627\u0644\u0642\u0631\u0627\u0631.",
    simSteps: [
      ["01", "\u062A\u0623\u062E\u0651\u0631 \u0627\u0644\u062F\u0641\u0639",       "\u062F\u0631\u062C\u0629 \u062E\u0637\u0631 \u0627\u0644\u0639\u0645\u064A\u0644 \u062A\u0631\u062A\u0641\u0639."],
      ["02", "\u0633\u064A\u0627\u0642 CRM \u062A\u0645\u0651 \u0625\u064A\u062C\u0627\u062F\u0647", "\u0635\u0627\u062D\u0628 \u0627\u0644\u062D\u0633\u0627\u0628 \u064A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0645\u0647\u0645\u0651\u0629 \u0628\u0623\u0648\u0644\u0648\u064A\u0629."],
      ["03", "\u062A\u0645\u0651 \u062A\u062D\u0641\u064A\u0632 \u0627\u0644\u0625\u062C\u0631\u0627\u0621",        "\u062A\u0630\u0643\u064A\u0631 \u064A\u062A\u0645\u0651 \u062A\u062C\u0647\u064A\u0632\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B."],
    ],

    trust: ["\u0628\u0644\u0627 \u0625\u0639\u062F\u0627\u062F \u062B\u0642\u064A\u0644", "\u0637\u0628\u0642\u0629 API \u0622\u0645\u0646\u0629", "Webhooks \u062C\u0627\u0647\u0632\u0629", "\u062C\u0627\u0647\u0632 \u062E\u0644\u0627\u0644 \u062F\u0642\u0627\u0626\u0642"],

    finalEyebrow: "\u0631\u0627\u0628\u0637 \u2192 \u0627\u0641\u0647\u0645 \u2192 \u062A\u0635\u0631\u0651\u0641",
    finalTitle: "\u0627\u0631\u0628\u0637 \u0623\u0646\u0638\u0645\u062A\u0643. \u0627\u0628\u062F\u0623 \u0628\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u062A\u062F\u0641\u0642\u0643 \u0627\u0644\u0646\u0642\u062F\u064A.",
    finalSub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u0648\u0651\u0644 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0625\u0644\u0649 \u0625\u0634\u0627\u0631\u0627\u062A \u062E\u0637\u0631 \u0648\u0641\u0631\u0635 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u0642\u0631\u0627\u0631\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630.",
    finalCta1: "\u0627\u0631\u0628\u0637 \u0623\u0646\u0638\u0645\u062A\u064A",
    finalCta2: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u064A\u0632\u0627\u062A",
  },
};

// ---------- Category icon (inline SVG paths) ----------
function renderCatIcon(id, color) {
  const stroke = color || "currentColor";
  const common = {
    width: 24, height: 24, viewBox: "0 0 24 24",
    fill: "none", stroke: stroke,
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (id) {
    case "accounting":
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M9 14h6" />
          <path d="M9 18h4" />
        </svg>
      );
    case "payments":
      return (
        <svg {...common}>
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <line x1="2" y1="11" x2="22" y2="11" />
          <line x1="6" y1="15" x2="9" y2="15" />
        </svg>
      );
    case "crm":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "communication":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
        </svg>
      );
    case "erp":
      return (
        <svg {...common}>
          <rect x="3" y="3"  width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "api":
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------- Component ----------
export default function IntegrationsPage() {
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

  const ctaShadow = "0 26px 64px rgba(" + themeGlowRGB + ",.30)";
  const cardShadow = "0 28px 74px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.11)";
  const heavyShadow = "0 34px 90px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.26)";

  const arrow = isRTL ? "\u2190" : "\u2192";
  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.86)",
    border: "1px solid " + T.hairline,
    boxShadow: cardShadow,
    backdropFilter: "blur(16px)",
  };

  const [activeNode, setActiveNode] = useState("invoices");

  const nodeList = NODE_IDS.map((id, i) => ({
    id: id,
    name: t.nodes[id],
    index: i,
  }));
  const activeNodeMeta = nodeList.find((n) => n.id === activeNode) || nodeList[0];

  const catList = CATEGORY_IDS.map((id) => ({ id: id, ...t.cats[id] }));

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
        @keyframes zyrixPulse {
          0%   { transform: scale(1);   opacity: .55; }
          50%  { transform: scale(1.45); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes zyrixFlow {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0;   }
        }
        @keyframes zyrixDot {
          0%   { offset-distance: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes zyrixSimRow {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0);   opacity: 1; }
        }
        @keyframes zyrixSimRowAR {
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0);   opacity: 1; }
        }
        .zyrix-node-pulse::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 0 currentColor;
          animation: zyrixPulse 2.4s ease-out infinite;
          pointer-events: none;
        }
        .zyrix-flow-line {
          stroke-dasharray: 6 8;
          animation: zyrixFlow 4s linear infinite;
        }
        .zyrix-sim-row {
          animation: zyrixSimRow .55s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .zyrix-node-pulse::after,
          .zyrix-flow-line,
          .zyrix-sim-row { animation: none; }
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

          {/* LIVE DATA FLOW PIPELINE */}
          <div
            style={{
              ...cardBase,
              padding: 34,
              marginBottom: 64,
              boxShadow: "0 40px 100px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.16), 0 8px 24px rgba(0,0,0,.04)",
              border: "1.5px solid rgba(" + themeGlowRGB + ",.35)",
              background: "rgba(255,255,255,.92)",
            }}
          >
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
                {t.pipelineEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.pipelineTitle}
              </h2>
            </div>

            {/* SVG pipeline */}
            <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
              <svg
                viewBox="0 0 1200 220"
                width="100%"
                height="220"
                preserveAspectRatio="xMidYMid meet"
                style={{ display: "block", overflow: "visible" }}
              >
                <defs>
                  <filter id="dotGlowInteg" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Base line — direct theme color, high opacity */}
                <line
                  x1="80" y1="100" x2="1120" y2="100"
                  stroke={themeColor}
                  strokeOpacity="0.35"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Three traveling dots — theme-colored with glow */}
                <circle r="6" fill={themeBright} filter="url(#dotGlowInteg)">
                  <animate attributeName="cx" from="80" to="1120" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;100" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill={themeBright} filter="url(#dotGlowInteg)">
                  <animate attributeName="cx" from="80" to="1120" dur="4s" begin="1.33s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;100" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4s" begin="1.33s" repeatCount="indefinite" />
                </circle>
                <circle r="6" fill={themeBright} filter="url(#dotGlowInteg)">
                  <animate attributeName="cx" from="80" to="1120" dur="4s" begin="2.66s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;100" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="4s" begin="2.66s" repeatCount="indefinite" />
                </circle>

                {/* Nodes — circles + numbers + labels */}
                {nodeList.map((n, i) => {
                  const cx = 80 + (i * (1040 / 5));
                  const isActive = n.id === activeNode;
                  return (
                    <g key={n.id} style={{ cursor: "pointer" }} onClick={() => setActiveNode(n.id)}>
                      <circle
                        cx={cx} cy={100} r={isActive ? 36 : 30}
                        fill={isActive ? themeColor : "#fff"}
                        stroke={isActive ? themeDeep : T.hairline}
                        strokeWidth={isActive ? 3 : 1.5}
                        style={{
                          transition: "r .35s ease, fill .35s ease",
                          filter: isActive
                            ? "drop-shadow(0 8px 24px rgba(" + themeGlowRGB + ",.45))"
                            : "drop-shadow(0 4px 10px rgba(0,0,0,.08))",
                        }}
                      />
                      <text
                        x={cx} y={108}
                        textAnchor="middle"
                        fontSize="22"
                        fontWeight="950"
                        fontFamily="'Inter Tight', system-ui, sans-serif"
                        fill={isActive ? "#fff" : themeColor}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </text>
                      <text
                        x={cx} y={170}
                        textAnchor="middle"
                        fontSize="26"
                        fontWeight="900"
                        fill={T.ink}
                      >
                        {n.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Node status banner */}
            <div
              style={{
                marginTop: 22,
                borderRadius: 24,
                padding: "20px 24px",
                background: "linear-gradient(135deg, rgba(" + themeGlowRGB + ",.08), rgba(" + themeGlowRGB + ",.02))",
                border: "1px solid " + T.hairline,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10, height: 10, borderRadius: 999,
                    background: C.emerald,
                    boxShadow: "0 0 0 4px rgba(16,185,129,.18)",
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: 18, color: T.ink }}>
                  {activeNodeMeta.name}
                  {t.nodeStatus}
                </strong>
              </div>
              <span style={{ color: themeColor, fontWeight: 950, fontSize: 15 }}>
                {arrow}
              </span>
            </div>
          </div>

          {/* INTEGRATION CATEGORIES */}
          <div style={{ marginBottom: 64 }}>
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
                {t.catEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.12 }}>
                {t.catTitle}
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {catList.map((cat) => (
                <div key={cat.id} style={{ ...cardBase, padding: 28, textAlign: "center" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(" + themeGlowRGB + ",.08)",
                      color: themeColor,
                      marginBottom: 18,
                      marginInline: "auto",
                    }}
                  >
                    {renderCatIcon(cat.id, themeColor)}
                  </div>

                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: "-0.035em" }}>
                    {cat.name}
                  </h3>
                  <p style={{ marginTop: 10, color: T.muted, lineHeight: 1.7, fontWeight: 650, fontSize: 14.5 }}>
                    {cat.desc}
                  </p>

                  <div
                    style={{
                      marginTop: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "rgba(16,185,129,.10)",
                      color: C.emerald,
                      fontSize: 12,
                      fontWeight: 950,
                      letterSpacing: "0.4px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 7, height: 7, borderRadius: 999,
                        background: C.emerald,
                        boxShadow: "0 0 0 3px rgba(16,185,129,.20)",
                      }}
                    />
                    {t.liveSyncReady}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAOS -> COMMAND */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 64 }}>
            <div style={{ ...cardBase, padding: 32, position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  color: T.muted,
                  fontWeight: 950,
                  letterSpacing: "1.4px",
                  marginBottom: 12,
                  fontSize: 13,
                }}
              >
                {t.chaosEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 950, letterSpacing: "-0.045em", lineHeight: 1.18 }}>
                {t.chaosTitle}
              </h2>

              <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
                {t.chaosItems.map((x, i) => {
                  const tilt = ["-1.2deg", "0.8deg", "-0.6deg", "1.4deg"][i % 4];
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 16,
                        background: "rgba(0,0,0,.035)",
                        color: T.muted,
                        fontWeight: 850,
                        fontSize: 14,
                        transform: "rotate(" + tilt + ")",
                        border: "1px solid " + T.hairline,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ color: C.redDeep, fontWeight: 950, fontSize: 16 }}>✕</span>
                      {x}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                borderRadius: 36,
                padding: 32,
                background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                color: "#fff",
                boxShadow: heavyShadow,
              }}
            >
              <div style={{ opacity: 0.78, fontWeight: 950, letterSpacing: "1.4px", marginBottom: 12, fontSize: 13 }}>
                {t.commandEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 950, letterSpacing: "-0.045em", lineHeight: 1.18 }}>
                {t.commandTitle}
              </h2>

              <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
                {t.commandItems.map((x, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,.10)",
                      border: "1px solid rgba(255,255,255,.16)",
                      fontWeight: 850,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: C.emerald, fontWeight: 950, fontSize: 16 }}>✓</span>
                    {x}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI LAYER */}
          <div style={{ ...cardBase, padding: 36, marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 28, alignItems: "center" }}>
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
                  {t.aiEyebrow}
                </div>
                <h2 style={{ margin: 0, fontSize: 38, fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.1 }}>
                  {t.aiTitleA} <span style={{ color: themeColor }}>{t.aiTitleB}</span>
                </h2>
                <p style={{ marginTop: 16, color: T.muted, lineHeight: 1.75, fontWeight: 650, fontSize: 16 }}>
                  {t.aiSub}
                </p>
              </div>

              <div
                style={{
                  borderRadius: 28,
                  padding: 22,
                  background: "linear-gradient(135deg, rgba(" + themeGlowRGB + ",.06), rgba(255,255,255,.96))",
                  border: "1px solid " + T.hairline,
                }}
              >
                {t.aiSignals.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px 18px",
                      borderRadius: 18,
                      background: "#fff",
                      border: "1px solid " + T.hairline,
                      marginBottom: i < t.aiSignals.length - 1 ? 10 : 0,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 14,
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ fontSize: 14.5 }}>{row[0]}</strong>
                    <span style={{ color: themeColor, fontWeight: 950, fontSize: 13.5, textAlign: isRTL ? "left" : "right" }}>
                      {row[1]} {arrow}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* REAL-TIME SIMULATION */}
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
                opacity: 0.78,
                fontSize: 13,
                fontWeight: 950,
                letterSpacing: "1.5px",
                marginBottom: 10,
              }}
            >
              {t.simEyebrow}
            </div>
            <h2 style={{ margin: 0, fontSize: 38, fontWeight: 950, letterSpacing: "-0.055em", lineHeight: 1.1 }}>
              {t.simTitle}
            </h2>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {t.simSteps.map((row, i) => (
                <div
                  key={i}
                  className="zyrix-sim-row"
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(255,255,255,.09)",
                    border: "1px solid rgba(255,255,255,.16)",
                    animationDelay: (i * 0.18) + "s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      opacity: 0.78,
                      fontWeight: 950,
                      letterSpacing: "0.5px",
                      fontFamily: "'Inter Tight', system-ui, sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row[0]}
                  </div>
                  <h3 style={{ margin: "10px 0 0", fontSize: 21, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {row[1]}
                  </h3>
                  <p style={{ marginTop: 10, opacity: 0.78, lineHeight: 1.65, fontWeight: 650, fontSize: 14 }}>
                    {row[2]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TRUST STRIP */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 64 }}>
            {t.trust.map((x, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 22,
                  padding: 18,
                  background: "#fff",
                  border: "1px solid " + T.hairline,
                  textAlign: "center",
                  fontWeight: 950,
                  boxShadow: "0 16px 36px rgba(" + (isArabic ? "0,77,38" : "58,5,9") + ",.07)",
                  fontSize: 14,
                }}
              >
                <span style={{ color: C.emerald, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>✓</span>
                {x}
              </div>
            ))}
          </div>

          {/* FINAL CTA */}
          <div
            style={{
              borderRadius: 40,
              padding: 40,
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
                fontSize: 40,
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

            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
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

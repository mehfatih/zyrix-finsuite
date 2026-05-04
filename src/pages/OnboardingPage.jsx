import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";
import { useCountry } from "../hooks/useCountry.jsx";
import { COUNTRY_PROFILES } from "../utils/countryProfiles.js";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";
import CountrySelectorPill from "../components/CountrySelectorPill.jsx";

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

// ---------- Trilingual copy ----------
const TXT = {
  TR: {
    backToPricing: "Fiyatlandirmaya don",
    badge: "AI REHBERLI KURULUM",
    h1a: "Gercek nakit akisi durumunu",
    h1b: "60 saniyede gor",
    sub: "Zyrix faturalarinin davranisini analiz eder, nereden para sizdigini gosterir, neyi geri kazanabilecegini hesaplar ve ilk adimi senin yerine hazirlar.",
    steps: ["Kurulum", "Gercek", "Cozum", "Simulasyon", "Kaydet", "Aktif"],

    s0Eyebrow: "HIZLI KURULUM",
    s0Title: "3 sayiyla baslat. Gerisini Zyrix yapar.",
    s0Sub: "Hesap acmana gerek yok. Once faturalarinin davranisi ne soyluyor, onu gor.",
    s0Volume: "Aylik fatura hacmi",
    s0Delay: "Ortalama gecikme orani",
    s0Industry: "Sektor",
    s0Cta: "Nakit akisi gercegimi goster",
    s0Preview: "CANLI ONIZLEME",
    s0PreviewTitle: "Ilk icgorun bir tikla.",
    s0LblVolume: "Fatura hacmi",
    s0LblDelay: "Gecikme orani",
    s0LblIndustry: "Sektor",
    s0PreviewNext: "Sirada: kayip ve geri kazanilabilir nakit hesaplaniyor.",
    s0CtaMicro: "Henuz kayit gerekmiyor.",
    industries: ["Ticaret", "Hizmet", "E-ticaret", "Uretim", "Profesyonel hizmet"],

    s1Eyebrow: "GERCEK ORTAYA CIKIYOR",
    s1Title: "Sadece fatura kesmiyorsun. Sessizce para da kaybediyor olabilirsin.",
    s1Monthly: "Tahmini aylik kayip",
    s1Annual: "Tahmini yillik kayip",
    s1Recoverable: "Geri kazanilabilir nakit",
    s1Pressure: "Hicbir sey yapilmazsa, geciken odemeler buyumeye devam eder.",
    s1PressureSub: "Zyrix bu riski, ekibinin hemen uygulayabilecegi oncelikli bir aksiyon planina cevirir.",
    back: "Geri",
    s1Cta: "Bunu simdi cozelim",

    s2Eyebrow: "ZYRIX BUNU NASIL COZER",
    s2Title: "Zyrix nakit akisi riskini net aksiyonlara cevirir.",
    s2_1Title: "Gecikmeleri otomatik tespit et",
    s2_1Desc: "Gecikmis fatura kaliplarini, daha buyuk bir nakit akisi sorununa donusmeden once yakalar.",
    s2_2Title: "Riskli musterileri onceliklendir",
    s2_2Desc: "Once kime dokunulmasi gerektigini gorursun. Tek tek kontrol etme zorundaligi biter.",
    s2_3Title: "Akilli takip baslat",
    s2_3Desc: "Risk ve zamana gore WhatsApp ve e-posta hatirlatmalari hazirlar.",
    s2Cta: "Aksiyon planimi goster",

    s3Eyebrow: "CANLI SIMULASYON",
    s3Title: "Zyrix isletmenin icinde tam bunu yakalardi.",
    s3InvHigh: "Fatura #1287",
    s3StatusHigh: "14 gun gecikti",
    s3RiskHigh: "Yuksek risk",
    s3ActionHigh: "WhatsApp hatirlatma gonder",
    s3InvMid: "Fatura #1311",
    s3StatusMid: "Odeme paterni degisti",
    s3RiskMid: "Orta risk",
    s3ActionMid: "E-posta takibi planla",
    s3InvLow: "Fatura #1320",
    s3StatusLow: "Beklenen gecikme tespit edildi",
    s3RiskLow: "Oncelik",
    s3ActionLow: "Nakit akisi izlemeye al",
    s3WhatsTitle: "AI tarafindan hazirlanmis WhatsApp hatirlatma",
    s3WhatsBody1: "Merhaba Ahmet, ",
    s3WhatsBody2: " tutarindaki faturanizin son odeme tarihi yaklasiyor.",
    s3WhatsLink: "https://zyrix.co/pay/abc123",
    s3MailTitle: "AI tarafindan hazirlanmis e-posta takibi",
    s3MailSubject: "Konu: Yaklasan odeme hatirlatmasi",
    s3MailBody: "Sayin musterimiz, yaklasan faturaniz icin kisa bir hatirlatma.",
    s3Cta: "Ilk aksiyonu calistir",

    s4Eyebrow: "ANALIZINI KAYDET",
    s4Title: "Nakit akisi analizin hazir. Devam etmek icin kaydet.",
    s4Sub: "Hesabini olustur, analizini koru, gercek faturalarini bagla ve sizintiyi kapatmaya basla.",
    s4Email: "E-posta",
    s4Password: "Sifre",
    s4Cta: "Kaydet ve devam et",
    s4Ready: "KAYDA HAZIR",
    s4Risky: "Tespit edilen riskli faturalar",
    s4FollowUps: "Hazirlanan takipler",
    s4Recover: "Tahmini aylik kazanim",

    s5Eyebrow: "AKTIVASYON HAZIR",
    s5Title: "Ilk nakit akisi aksiyonlarin hazir.",
    s5Sub: "Zyrix riskli faturalari buldu, takipleri hazirladi, geri kazanilabilir nakdi tahmin etti. Sirada gercek verini baglamak ve ilk hatirlatmayi gondermek var.",
    s5Risky: "Riskli fatura",
    s5FollowUps: "Hazir takip",
    s5Recover: "Aylik kazanim",
    s5CtaPrimary: "Ilk hatirlatmayi gonder",
    s5CtaSecondary: "Tam analizi calistir",

    trust: ["Kurulum yok", "Gercek veriyle calisir", "Aksiyona hazir icgoru", "Dakikalar icinde hazir"],
  },

  EN: {
    backToPricing: "Back to pricing",
    badge: "AI GUIDED SETUP",
    h1a: "See your real",
    h1b: "cashflow situation in 60 seconds",
    sub: "Zyrix analyzes your invoice behavior, shows where cash is leaking, calculates what you can recover, and prepares the first action for you.",
    steps: ["Setup", "Reality", "Fix", "Simulation", "Save", "Activate"],

    s0Eyebrow: "QUICK SETUP",
    s0Title: "Start with 3 numbers. Zyrix does the rest.",
    s0Sub: "No account needed yet. First, see what your invoice behavior is telling you.",
    s0Volume: "Monthly invoice volume",
    s0Delay: "Average delay rate",
    s0Industry: "Industry",
    s0Cta: "Reveal my cashflow reality",
    s0Preview: "LIVE PREVIEW",
    s0PreviewTitle: "Your first insight is one click away.",
    s0LblVolume: "Invoice volume",
    s0LblDelay: "Delay rate",
    s0LblIndustry: "Industry",
    s0PreviewNext: "Next: we calculate your leakage and recoverable cash.",
    s0CtaMicro: "No signup required yet.",
    industries: ["Trade", "Services", "E-commerce", "Manufacturing", "Professional Services"],

    s1Eyebrow: "REALITY REVEAL",
    s1Title: "You are not just issuing invoices. You may be losing money silently.",
    s1Monthly: "Estimated monthly leakage",
    s1Annual: "Estimated annual leakage",
    s1Recoverable: "Recoverable cash",
    s1Pressure: "If no action is taken, delayed payments may keep growing.",
    s1PressureSub: "Zyrix turns this risk into a prioritized action plan your team can execute immediately.",
    back: "Back",
    s1Cta: "Fix this now",

    s2Eyebrow: "HOW ZYRIX FIXES IT",
    s2Title: "Zyrix turns cashflow risk into clear actions.",
    s2_1Title: "Detect delays automatically",
    s2_1Desc: "Find delayed invoice patterns before they become bigger cashflow problems.",
    s2_2Title: "Prioritize risky customers",
    s2_2Desc: "Know who needs attention first instead of manually checking every record.",
    s2_3Title: "Trigger smart follow-ups",
    s2_3Desc: "Prepare WhatsApp and email reminders based on risk and timing.",
    s2Cta: "Show my action plan",

    s3Eyebrow: "LIVE SIMULATION",
    s3Title: "This is what Zyrix would catch inside your business.",
    s3InvHigh: "Invoice #1287",
    s3StatusHigh: "14 days delayed",
    s3RiskHigh: "High risk",
    s3ActionHigh: "Send WhatsApp reminder",
    s3InvMid: "Invoice #1311",
    s3StatusMid: "Payment pattern changed",
    s3RiskMid: "Medium risk",
    s3ActionMid: "Schedule email follow-up",
    s3InvLow: "Invoice #1320",
    s3StatusLow: "Expected delay detected",
    s3RiskLow: "Priority",
    s3ActionLow: "Move to cashflow watchlist",
    s3WhatsTitle: "WhatsApp reminder prepared by AI",
    s3WhatsBody1: "Hi Ahmet, your invoice of ",
    s3WhatsBody2: " is due soon.",
    s3WhatsLink: "https://zyrix.co/pay/abc123",
    s3MailTitle: "Email follow-up prepared by AI",
    s3MailSubject: "Subject: Upcoming payment reminder",
    s3MailBody: "Dear Customer, a quick reminder for your upcoming invoice.",
    s3Cta: "Run first action",

    s4Eyebrow: "SAVE YOUR ANALYSIS",
    s4Title: "Your cashflow analysis is ready. Save it to continue.",
    s4Sub: "Create your account to keep your analysis, connect your real invoices, and start fixing leakage.",
    s4Email: "Email",
    s4Password: "Password",
    s4Cta: "Save and continue",
    s4Ready: "READY TO SAVE",
    s4Risky: "Risky invoices detected",
    s4FollowUps: "Follow-ups ready",
    s4Recover: "Estimated monthly recovery",

    s5Eyebrow: "ACTIVATION READY",
    s5Title: "Your first cashflow actions are ready.",
    s5Sub: "Zyrix found risky invoices, prepared follow-ups, and estimated recoverable cash. The next step is to connect your real data and send your first reminder.",
    s5Risky: "Risky invoices",
    s5FollowUps: "Follow-ups ready",
    s5Recover: "Monthly recovery",
    s5CtaPrimary: "Send first reminder",
    s5CtaSecondary: "Run full analysis",

    trust: ["No setup", "Works with real data", "Action-ready insights", "Ready in minutes"],
  },

  AR: {
    backToPricing: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0623\u0633\u0639\u0627\u0631",
    badge: "\u0625\u0639\u062F\u0627\u062F \u0628\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    h1a: "\u0634\u0648\u0641 \u0648\u0636\u0639 \u062A\u062F\u0641\u0642\u0627\u062A\u0643 \u0627\u0644\u0646\u0642\u062F\u064A\u0629",
    h1b: "\u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0641\u064A 60 \u062B\u0627\u0646\u064A\u0629",
    sub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u0644\u0644 \u0633\u0644\u0648\u0643 \u0641\u0648\u0627\u062A\u064A\u0631\u0643\u060C \u064A\u0643\u0634\u0641 \u0623\u064A\u0646 \u062A\u0636\u064A\u0639 \u0623\u0645\u0648\u0627\u0644\u0643\u060C \u064A\u062D\u0633\u0628 \u0645\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0631\u062F\u0627\u062F\u0647\u060C \u0648\u064A\u062C\u0647\u0632 \u0644\u0643 \u0623\u0648\u0644 \u062E\u0637\u0648\u0629.",
    steps: ["\u0627\u0644\u0625\u0639\u062F\u0627\u062F", "\u0627\u0644\u062D\u0642\u064A\u0642\u0629", "\u0627\u0644\u062D\u0644", "\u0645\u062D\u0627\u0643\u0627\u0629", "\u062D\u0641\u0638", "\u062A\u0641\u0639\u064A\u0644"],

    s0Eyebrow: "\u0625\u0639\u062F\u0627\u062F \u0633\u0631\u064A\u0639",
    s0Title: "\u0627\u0628\u062F\u0623 \u0628\u062B\u0644\u0627\u062B\u0629 \u0623\u0631\u0642\u0627\u0645. \u0632\u064A\u0631\u0643\u0633 \u064A\u062A\u0648\u0644\u0651\u0649 \u0627\u0644\u0628\u0627\u0642\u064A.",
    s0Sub: "\u0644\u0627 \u062A\u062D\u062A\u0627\u062C \u062D\u0633\u0627\u0628 \u0627\u0644\u0622\u0646. \u0623\u0648\u0644\u0627\u064B \u0634\u0648\u0641 \u0645\u0627 \u0627\u0644\u0630\u064A \u062A\u0642\u0648\u0644\u0647 \u0641\u0648\u0627\u062A\u064A\u0631\u0643.",
    s0Volume: "\u062D\u062C\u0645 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0634\u0647\u0631\u064A",
    s0Delay: "\u0645\u062A\u0648\u0633\u0637 \u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0623\u062E\u064A\u0631",
    s0Industry: "\u0627\u0644\u0642\u0637\u0627\u0639",
    s0Cta: "\u0627\u0643\u0634\u0641 \u062D\u0642\u064A\u0642\u0629 \u062A\u062F\u0641\u0642\u064A",
    s0Preview: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
    s0PreviewTitle: "\u0623\u0648\u0644 \u0631\u0624\u064A\u0629 \u0639\u0644\u0649 \u0628\u0639\u062F \u0646\u0642\u0631\u0629 \u0648\u0627\u062D\u062F\u0629.",
    s0LblVolume: "\u062D\u062C\u0645 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    s0LblDelay: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0623\u062E\u064A\u0631",
    s0LblIndustry: "\u0627\u0644\u0642\u0637\u0627\u0639",
    s0PreviewNext: "\u0627\u0644\u062A\u0627\u0644\u064A: \u0646\u062D\u0633\u0628 \u0627\u0644\u062A\u0633\u0631\u064A\u0628 \u0648\u0627\u0644\u0646\u0642\u062F \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F.",
    s0CtaMicro: "\u0644\u0627 \u062D\u0627\u062C\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u0627\u0644\u0622\u0646.",
    industries: ["\u062A\u062C\u0627\u0631\u0629", "\u062E\u062F\u0645\u0627\u062A", "\u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u062A\u0635\u0646\u064A\u0639", "\u062E\u062F\u0645\u0627\u062A \u0645\u0647\u0646\u064A\u0629"],

    s1Eyebrow: "\u062D\u0642\u064A\u0642\u0629 \u062A\u0638\u0647\u0631",
    s1Title: "\u0623\u0646\u062A \u0644\u0627 \u062A\u0635\u062F\u0631 \u0641\u0648\u0627\u062A\u064A\u0631 \u0641\u0642\u0637. \u0631\u0628\u0645\u0627 \u062A\u062E\u0633\u0631 \u0623\u0645\u0648\u0627\u0644\u0627\u064B \u0628\u0635\u0645\u062A.",
    s1Monthly: "\u062A\u0633\u0631\u064A\u0628 \u0634\u0647\u0631\u064A \u062A\u0642\u062F\u064A\u0631\u064A",
    s1Annual: "\u062A\u0633\u0631\u064A\u0628 \u0633\u0646\u0648\u064A \u062A\u0642\u062F\u064A\u0631\u064A",
    s1Recoverable: "\u0646\u0642\u062F \u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
    s1Pressure: "\u0625\u0630\u0627 \u0644\u0645 \u062A\u0623\u062E\u0630 \u0625\u062C\u0631\u0627\u0621\u060C \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629 \u0633\u062A\u0633\u062A\u0645\u0631 \u0641\u064A \u0627\u0644\u0646\u0645\u0648.",
    s1PressureSub: "\u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u0648\u0651\u0644 \u0647\u0630\u0627 \u0627\u0644\u062E\u0637\u0631 \u0625\u0644\u0649 \u062E\u0637\u0629 \u0639\u0645\u0644 \u0645\u0631\u062A\u0651\u0628\u0629 \u0628\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629\u060C \u064A\u0633\u062A\u0637\u064A\u0639 \u0641\u0631\u064A\u0642\u0643 \u062A\u0646\u0641\u064A\u0630\u0647\u0627 \u0641\u0648\u0631\u0627\u064B.",
    back: "\u0631\u062C\u0648\u0639",
    s1Cta: "\u062D\u0644\u0651 \u0647\u0630\u0627 \u0627\u0644\u0622\u0646",

    s2Eyebrow: "\u0643\u064A\u0641 \u064A\u062D\u0644\u0651\u0647 \u0632\u064A\u0631\u0643\u0633",
    s2Title: "\u0632\u064A\u0631\u0643\u0633 \u064A\u062D\u0648\u0651\u0644 \u062E\u0637\u0631 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0625\u0644\u0649 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0648\u0627\u0636\u062D\u0629.",
    s2_1Title: "\u0631\u0635\u062F \u0627\u0644\u062A\u0623\u062E\u0631 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B",
    s2_1Desc: "\u0627\u0639\u062B\u0631 \u0639\u0644\u0649 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062A\u0623\u062E\u0631 \u0642\u0628\u0644 \u0623\u0646 \u062A\u062A\u062D\u0648\u0651\u0644 \u0625\u0644\u0649 \u0623\u0632\u0645\u0629 \u0633\u064A\u0648\u0644\u0629.",
    s2_2Title: "\u0631\u062A\u0651\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0623\u0643\u062B\u0631 \u062E\u0637\u0648\u0631\u0629",
    s2_2Desc: "\u0627\u0639\u0631\u0641 \u0645\u0646 \u064A\u062D\u062A\u0627\u062C \u0627\u0646\u062A\u0628\u0627\u0647\u0627\u064B \u0623\u0648\u0644\u0627\u064B \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u0641\u062D\u0635 \u0643\u0644 \u0633\u062C\u0644 \u064A\u062F\u0648\u064A\u0627\u064B.",
    s2_3Title: "\u062A\u0634\u063A\u064A\u0644 \u0645\u062A\u0627\u0628\u0639\u0629 \u0630\u0643\u064A\u0629",
    s2_3Desc: "\u0623\u0646\u0634\u0626 \u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0625\u064A\u0645\u064A\u0644 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u0631 \u0648\u0627\u0644\u062A\u0648\u0642\u064A\u062A.",
    s2Cta: "\u0623\u0631\u0646\u064A \u062E\u0637\u0629 \u0627\u0644\u0639\u0645\u0644",

    s3Eyebrow: "\u0645\u062D\u0627\u0643\u0627\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
    s3Title: "\u0647\u0630\u0627 \u0645\u0627 \u0633\u064A\u0631\u0635\u062F\u0647 \u0632\u064A\u0631\u0643\u0633 \u062F\u0627\u062E\u0644 \u0623\u0639\u0645\u0627\u0644\u0643.",
    s3InvHigh: "\u0641\u0627\u062A\u0648\u0631\u0629 #1287",
    s3StatusHigh: "\u0645\u062A\u0623\u062E\u0631\u0629 14 \u064A\u0648\u0645\u0627\u064B",
    s3RiskHigh: "\u062E\u0637\u0631 \u0645\u0631\u062A\u0641\u0639",
    s3ActionHigh: "\u0623\u0631\u0633\u0644 \u062A\u0630\u0643\u064A\u0631\u0627\u064B \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628",
    s3InvMid: "\u0641\u0627\u062A\u0648\u0631\u0629 #1311",
    s3StatusMid: "\u0646\u0645\u0637 \u0627\u0644\u062F\u0641\u0639 \u062A\u063A\u064A\u0651\u0631",
    s3RiskMid: "\u062E\u0637\u0631 \u0645\u062A\u0648\u0633\u0637",
    s3ActionMid: "\u062C\u062F\u0648\u0644\u0629 \u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0644\u0625\u064A\u0645\u064A\u0644",
    s3InvLow: "\u0641\u0627\u062A\u0648\u0631\u0629 #1320",
    s3StatusLow: "\u062A\u0648\u0642\u0651\u0639 \u062A\u0623\u062E\u0651\u0631",
    s3RiskLow: "\u0623\u0648\u0644\u0648\u064A\u0629",
    s3ActionLow: "\u0646\u0642\u0644 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
    s3WhatsTitle: "\u062A\u0630\u0643\u064A\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u062C\u0647\u0651\u0632\u0647 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    s3WhatsBody1: "\u0645\u0631\u062D\u0628\u0627\u064B \u0623\u062D\u0645\u062F\u060C \u0641\u0627\u062A\u0648\u0631\u062A\u0643 \u0628\u0642\u064A\u0645\u0629 ",
    s3WhatsBody2: " \u0633\u062A\u0633\u062A\u062D\u0642 \u0642\u0631\u064A\u0628\u0627\u064B.",
    s3WhatsLink: "https://zyrix.co/pay/abc123",
    s3MailTitle: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0625\u064A\u0645\u064A\u0644 \u062C\u0647\u0651\u0632\u0647\u0627 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
    s3MailSubject: "\u0627\u0644\u0645\u0648\u0636\u0648\u0639: \u062A\u0630\u0643\u064A\u0631 \u0628\u062F\u0641\u0639\u0629 \u0642\u0627\u062F\u0645\u0629",
    s3MailBody: "\u0639\u0645\u064A\u0644\u0646\u0627 \u0627\u0644\u0639\u0632\u064A\u0632\u060C \u062A\u0630\u0643\u064A\u0631 \u0633\u0631\u064A\u0639 \u0628\u0641\u0627\u062A\u0648\u0631\u062A\u0643 \u0627\u0644\u0642\u0627\u062F\u0645\u0629.",
    s3Cta: "\u0634\u063A\u0651\u0644 \u0623\u0648\u0644 \u0625\u062C\u0631\u0627\u0621",

    s4Eyebrow: "\u0627\u062D\u0641\u0638 \u062A\u062D\u0644\u064A\u0644\u0643",
    s4Title: "\u062A\u062D\u0644\u064A\u0644 \u062A\u062F\u0641\u0642\u0627\u062A\u0643 \u062C\u0627\u0647\u0632. \u0627\u062D\u0641\u0638\u0647 \u0644\u062A\u0633\u062A\u0643\u0645\u0644.",
    s4Sub: "\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0643 \u0644\u062A\u062D\u062A\u0641\u0638 \u0628\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u060C \u062A\u0631\u0628\u0637 \u0641\u0648\u0627\u062A\u064A\u0631\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629\u060C \u0648\u062A\u0628\u062F\u0623 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0633\u0631\u064A\u0628.",
    s4Email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    s4Password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631",
    s4Cta: "\u0627\u062D\u0641\u0638 \u0648\u0627\u0633\u062A\u0645\u0631",
    s4Ready: "\u062C\u0627\u0647\u0632 \u0644\u0644\u062D\u0641\u0638",
    s4Risky: "\u0641\u0648\u0627\u062A\u064A\u0631 \u062E\u0637\u0631\u0629 \u0631\u064F\u0635\u062F\u062A",
    s4FollowUps: "\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u062C\u0627\u0647\u0632\u0629",
    s4Recover: "\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0634\u0647\u0631\u064A \u062A\u0642\u062F\u064A\u0631\u064A",

    s5Eyebrow: "\u062C\u0627\u0647\u0632 \u0644\u0644\u062A\u0641\u0639\u064A\u0644",
    s5Title: "\u0623\u0648\u0644 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u062A\u062F\u0641\u0642\u0627\u062A\u0643 \u062C\u0627\u0647\u0632\u0629.",
    s5Sub: "\u0632\u064A\u0631\u0643\u0633 \u0648\u062C\u062F \u0641\u0648\u0627\u062A\u064A\u0631 \u062E\u0637\u0631\u0629\u060C \u0648\u0623\u0639\u062F\u0651 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0627\u062A\u060C \u0648\u0642\u062F\u0651\u0631 \u0627\u0644\u0646\u0642\u062F \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F. \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0631\u0628\u0637 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629 \u0648\u0625\u0631\u0633\u0627\u0644 \u0623\u0648\u0644 \u062A\u0630\u0643\u064A\u0631.",
    s5Risky: "\u0641\u0648\u0627\u062A\u064A\u0631 \u062E\u0637\u0631\u0629",
    s5FollowUps: "\u0645\u062A\u0627\u0628\u0639\u0627\u062A \u062C\u0627\u0647\u0632\u0629",
    s5Recover: "\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0634\u0647\u0631\u064A",
    s5CtaPrimary: "\u0623\u0631\u0633\u0644 \u0623\u0648\u0644 \u062A\u0630\u0643\u064A\u0631",
    s5CtaSecondary: "\u0634\u063A\u0651\u0644 \u062A\u062D\u0644\u064A\u0644\u0627\u064B \u0643\u0627\u0645\u0644\u0627\u064B",

    trust: ["\u0628\u0644\u0627 \u0625\u0639\u062F\u0627\u062F", "\u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u062D\u0642\u064A\u0642\u064A\u0629", "\u0631\u0624\u0649 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0646\u0641\u064A\u0630", "\u062C\u0627\u0647\u0632 \u062E\u0644\u0627\u0644 \u062F\u0642\u0627\u0626\u0642"],
  },
};

// ---------- Component ----------
export default function OnboardingPage() {
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

  // Risk color stays semantic — always red
  const riskColor      = C.redDeep;
  const emeraldColor   = C.emerald;
  const amberColor     = C.amber;

  const ctaShadow = isArabic
    ? "0 22px 50px rgba(0,108,53,.28)"
    : "0 22px 50px rgba(227,10,23,.30)";

  const heavyShadow = isArabic
    ? "0 34px 90px rgba(0,77,38,.22)"
    : "0 34px 90px rgba(58,5,9,.24)";

  // Country-aware market context
  const { country, profile } = useCountry();
  const activeProfile = COUNTRY_PROFILES[country] || profile;
  const countryName = (activeProfile.name && activeProfile.name[lang])
    || (activeProfile.name && activeProfile.name.EN)
    || country;

  const marketContextLabel =
    lang === "AR" ? "السياق السوقي" :
    lang === "TR" ? "Pazar Baglami" :
    "Market Context";

  const marketContextCopy =
    lang === "AR"
      ? "زيركس سيكيف اللغة وقواعد الفواتير وسير العمل تلقائيا حسب موقعك واعدادات مساحة عملك."
      : lang === "TR"
      ? "Zyrix dilini, fatura kurallarini ve is akislarini konumuna ve calisma alani ayarlarina gore otomatik uyarlayacak."
      : "Zyrix will adapt language, invoice rules, and workflows based on your location and workspace settings.";

  const marketAwareBadge =
    lang === "AR"
      ? "التحليل واعي للسوق نشط"
      : lang === "TR"
      ? "Pazar bilincli analiz aktif"
      : "Market-aware analysis active";

  // Currency
  const currencySymbol = lang === "AR" ? " \u0631.\u0633" : lang === "EN" ? "$" : "\u20BA";
  const currencyPos    = lang === "AR" ? "suffix" : "prefix";
  const fmt = (n) => {
    const f = Math.round(n).toLocaleString("en-US");
    return currencyPos === "prefix" ? currencySymbol + f : f + currencySymbol;
  };

  // ---------- State ----------
  const [step, setStep]                 = useState(0);
  const [monthlyVolume, setMonthlyVol]  = useState(250000);
  const [delayRate, setDelayRate]       = useState(18);
  const [industry, setIndustry]         = useState(0);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");

  // ---------- Dynamic numbers ----------
  const leakage = useMemo(
    () => Math.round(monthlyVolume * (delayRate / 100) * 0.42),
    [monthlyVolume, delayRate]
  );
  const recoverable  = useMemo(() => Math.round(leakage * 0.32), [leakage]);
  const annualLeak   = useMemo(() => leakage * 12, [leakage]);

  const riskyInvoices = useMemo(() => {
    if (delayRate >= 30) return 128;
    if (delayRate >= 20) return 99;
    if (delayRate >= 12) return 42;
    return 18;
  }, [delayRate]);

  const followUps = useMemo(
    () => Math.max(8, Math.round(riskyInvoices * 0.36)),
    [riskyInvoices]
  );

  const sampleInvoiceAmount = useMemo(
    () => Math.max(1500, Math.round(monthlyVolume * 0.05)),
    [monthlyVolume]
  );

  // ---------- Shared styles ----------
  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.86)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 70px rgba(58,5,9,.10)",
    backdropFilter: "blur(16px)",
  };

  const steps = t.steps;

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const arrow = isRTL ? "\u2190" : "\u2192";

  // ---------- Buttons ----------
  const PrimaryBtn = (props) => (
    <button
      onClick={props.onClick || goNext}
      style={{
        border: 0,
        cursor: "pointer",
        borderRadius: 22,
        padding: "19px 32px",
        color: "#fff",
        fontSize: 16,
        fontWeight: 950,
        background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
        boxShadow: ctaShadow,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {props.label} {arrow}
    </button>
  );

  const SecondaryBtn = (props) => (
    <button
      onClick={props.onClick || goBack}
      style={{
        border: "1px solid " + T.hairline,
        cursor: "pointer",
        borderRadius: 22,
        padding: "18px 28px",
        color: T.ink,
        fontSize: 16,
        fontWeight: 950,
        background: "rgba(255,255,255,.92)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {props.label}
    </button>
  );

  // ---------- Page background ----------
  const pageBg = "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 48%,#fff 100%)";

  return (
    <>
      <NavV2 />
      <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        direction: isRTL ? "rtl" : "ltr",
        minHeight: "100vh",
        color: T.ink,
        background: pageBg,
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <section style={{ padding: "130px 32px 60px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isArabic
              ? "radial-gradient(circle at 50% 16%, rgba(0,108,53,.15), transparent 48%)"
              : "radial-gradient(circle at 50% 16%, rgba(227,10,23,.18), transparent 48%)",
          }}
        />

        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >

          {/* HEADER */}
          <div style={{ textAlign: "center", maxWidth: 880, margin: "0 auto 28px" }}>
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
                marginBottom: 18,
                boxShadow: "0 18px 44px rgba(58,5,9,.10)",
              }}
            >
              ✦ {t.badge}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(34px,4.4vw,58px)",
                lineHeight: 1.04,
                letterSpacing: "-0.06em",
                fontWeight: 950,
              }}
            >
              {t.h1a} <span style={{ color: themeColor }}>{t.h1b}</span>
            </h1>

            <p
              style={{
                margin: "20px auto 0",
                maxWidth: 720,
                color: T.muted,
                fontSize: 18,
                lineHeight: 1.7,
                fontWeight: 650,
              }}
            >
              {t.sub}
            </p>
          </div>

          {/* PROGRESS */}
          <div
            style={{
              ...cardBase,
              padding: 16,
              marginBottom: 32,
              display: "grid",
              gridTemplateColumns: "repeat(" + steps.length + ", 1fr)",
              gap: 10,
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 999,
                  padding: "12px 10px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 950,
                  color: i <= step ? "#fff" : T.muted,
                  background:
                    i <= step
                      ? "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")"
                      : "rgba(0,0,0,.04)",
                  letterSpacing: "0.4px",
                  boxShadow:
                    i === step
                      ? (isArabic
                          ? "0 10px 22px rgba(0,108,53,.35), 0 0 0 3px rgba(0,160,80,.18)"
                          : "0 10px 22px rgba(227,10,23,.32), 0 0 0 3px rgba(255,26,42,.18)")
                      : "none",
                  transition: "box-shadow .25s ease",
                }}
              >
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {/* STEP CARD */}
          <div
            style={{
              ...cardBase,
              padding: 42,
              minHeight: 560,
            }}
          >
            {/* ============== STEP 0 — Setup ============== */}
            {step === 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: ".9fr 1.1fr",
                  gap: 34,
                  alignItems: "center",
                }}
              >
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
                    {t.s0Eyebrow}
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
                    {t.s0Title}
                  </h2>

                  <p
                    style={{
                      marginTop: 14,
                      color: T.muted,
                      fontSize: 16,
                      lineHeight: 1.7,
                      fontWeight: 650,
                    }}
                  >
                    {t.s0Sub}
                  </p>

                  <div style={{ display: "grid", gap: 18, marginTop: 30 }}>
                    <label>
                      <div style={{ fontSize: 13, fontWeight: 900, color: T.muted, marginBottom: 8 }}>
                        {t.s0Volume}
                      </div>
                      <input
                        type="number"
                        value={monthlyVolume}
                        onChange={(e) => setMonthlyVol(Number(e.target.value || 0))}
                        style={{
                          width: "100%",
                          height: 60,
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
                        {t.s0Delay}: {delayRate}%
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

                    <label>
                      <div style={{ fontSize: 13, fontWeight: 900, color: T.muted, marginBottom: 8 }}>
                        {t.s0Industry}
                      </div>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(Number(e.target.value))}
                        style={{
                          width: "100%",
                          height: 60,
                          borderRadius: 18,
                          border: "1px solid " + T.hairline,
                          padding: "0 18px",
                          fontSize: 17,
                          fontWeight: 850,
                          color: T.ink,
                          outline: "none",
                          background: "#fff",
                        }}
                      >
                        {t.industries.map((label, i) => (
                          <option key={i} value={i}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* MARKET CONTEXT CARD (country-aware) */}
                  <div
                    style={{
                      borderRadius: 26,
                      padding: 22,
                      background: isArabic
                        ? "linear-gradient(135deg, rgba(244,251,247,.96), rgba(255,255,255,.92))"
                        : "linear-gradient(135deg, rgba(255,247,244,.96), rgba(255,255,255,.92))",
                      border: "1px solid " + T.hairline,
                      boxShadow: "0 16px 40px rgba(58,5,9,.06)",
                      marginTop: 14,
                      display: "grid",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: themeColor,
                            fontSize: 12,
                            fontWeight: 950,
                            letterSpacing: "1.4px",
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          {marketContextLabel}
                        </div>
                        <strong
                          style={{
                            fontSize: 20,
                            fontWeight: 950,
                            color: T.ink,
                          }}
                        >
                          {countryName}
                        </strong>
                      </div>

                      <CountrySelectorPill mode="light" compact={false} />
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: T.muted,
                        fontSize: 14,
                        lineHeight: 1.65,
                        fontWeight: 700,
                      }}
                    >
                      {marketContextCopy}
                    </p>
                  </div>

                  <div style={{ marginTop: 30 }}>
                    <button
                      onClick={goNext}
                      style={{
                        border: 0,
                        cursor: "pointer",
                        borderRadius: 24,
                        padding: "23px 40px",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 950,
                        letterSpacing: "0.2px",
                        background:
                          "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                        boxShadow: ctaShadow,
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                      }}
                    >
                      {t.s0Cta} {arrow}
                    </button>
                    <div
                      style={{
                        marginTop: 12,
                        color: T.muted,
                        fontSize: 13,
                        fontWeight: 850,
                        letterSpacing: "0.2px",
                      }}
                    >
                      {t.s0CtaMicro}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 34,
                    padding: 32,
                    background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                    color: "#fff",
                    boxShadow: heavyShadow,
                  }}
                >
                  <div style={{ opacity: 0.7, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px" }}>
                    {t.s0Preview}
                  </div>

                  <h3
                    style={{
                      margin: "18px 0 0",
                      fontSize: 32,
                      fontWeight: 950,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.15,
                    }}
                  >
                    {t.s0PreviewTitle}
                  </h3>

                  <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
                    {[
                      [t.s0LblVolume, fmt(monthlyVolume)],
                      [t.s0LblDelay, delayRate + "%"],
                      [t.s0LblIndustry, t.industries[industry]],
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
                          gap: 14,
                        }}
                      >
                        <span style={{ opacity: 0.72, fontWeight: 800 }}>{row[0]}</span>
                        <strong style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}>
                          {row[1]}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 22,
                      padding: "14px 18px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,.07)",
                      border: "1px dashed rgba(255,255,255,.22)",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.2px",
                      opacity: 0.86,
                    }}
                  >
                    {t.s0PreviewNext}
                  </div>
                </div>
              </div>
            )}

            {/* ============== STEP 1 — Reality ============== */}
            {step === 1 && (
              <div>
                <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 34px" }}>
                  <div
                    style={{
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "1.5px",
                      marginBottom: 10,
                    }}
                  >
                    {t.s1Eyebrow}
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 44,
                      fontWeight: 950,
                      letterSpacing: "-0.05em",
                      lineHeight: 1.1,
                    }}
                  >
                    {t.s1Title}
                  </h2>
                </div>

                {/* MARKET-AWARE ANALYSIS BADGE */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      borderRadius: 999,
                      background: isArabic ? "rgba(0,108,53,.10)" : "rgba(227,10,23,.08)",
                      border: "1px solid " + T.hairline,
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: ".8px",
                    }}
                  >
                    <span style={{ fontSize: 8 }}>●</span>
                    <span>{marketAwareBadge} · {countryName}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 18,
                    marginBottom: 30,
                  }}
                >
                  {[
                    [t.s1Monthly, fmt(leakage), "rgba(227,10,23,.10)", riskColor],
                    [t.s1Annual, fmt(annualLeak), "rgba(245,158,11,.14)", amberColor],
                    [t.s1Recoverable, fmt(recoverable), "rgba(16,185,129,.12)", emeraldColor],
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 28,
                        padding: 28,
                        background: row[2],
                        border: "1px solid " + T.hairline,
                      }}
                    >
                      <div style={{ color: T.muted, fontSize: 13, fontWeight: 900 }}>{row[0]}</div>
                      <div
                        style={{
                          marginTop: 10,
                          color: row[3],
                          fontSize: 42,
                          fontWeight: 950,
                          letterSpacing: "-0.045em",
                          fontFamily: "'Inter Tight', system-ui, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {row[1]}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderRadius: 30,
                    padding: 30,
                    background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                    color: "#fff",
                    textAlign: "center",
                    boxShadow: "0 28px 70px rgba(58,5,9,.22)",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 30, fontWeight: 950, lineHeight: 1.2 }}>
                    {t.s1Pressure}
                  </h3>
                  <p
                    style={{
                      margin: "12px auto 0",
                      maxWidth: 620,
                      opacity: 0.78,
                      lineHeight: 1.7,
                      fontWeight: 700,
                    }}
                  >
                    {t.s1PressureSub}
                  </p>
                </div>

                <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: 14 }}>
                  <SecondaryBtn label={t.back} />
                  <PrimaryBtn label={t.s1Cta} />
                </div>
              </div>
            )}

            {/* ============== STEP 2 — Fix ============== */}
            {step === 2 && (
              <div>
                <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 40px" }}>
                  <div
                    style={{
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "1.5px",
                      marginBottom: 10,
                    }}
                  >
                    {t.s2Eyebrow}
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 44,
                      fontWeight: 950,
                      letterSpacing: "-0.05em",
                      lineHeight: 1.1,
                    }}
                  >
                    {t.s2Title}
                  </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                  {[
                    ["01", t.s2_1Title, t.s2_1Desc],
                    ["02", t.s2_2Title, t.s2_2Desc],
                    ["03", t.s2_3Title, t.s2_3Desc],
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 30,
                        padding: 30,
                        background: "rgba(255,255,255,.9)",
                        border: "1px solid " + T.hairline,
                        boxShadow: "0 20px 54px rgba(58,5,9,.08)",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 16,
                          display: "grid",
                          placeItems: "center",
                          color: "#fff",
                          fontWeight: 950,
                          background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                          marginBottom: 20,
                        }}
                      >
                        {row[0]}
                      </div>

                      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 950, lineHeight: 1.2 }}>
                        {row[1]}
                      </h3>
                      <p
                        style={{
                          marginTop: 12,
                          color: T.muted,
                          lineHeight: 1.7,
                          fontWeight: 650,
                        }}
                      >
                        {row[2]}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 14 }}>
                  <SecondaryBtn label={t.back} />
                  <PrimaryBtn label={t.s2Cta} />
                </div>
              </div>
            )}

            {/* ============== STEP 3 — Simulation ============== */}
            {step === 3 && (
              <div>
                <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 34px" }}>
                  <div
                    style={{
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 950,
                      letterSpacing: "1.5px",
                      marginBottom: 10,
                    }}
                  >
                    {t.s3Eyebrow}
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 44,
                      fontWeight: 950,
                      letterSpacing: "-0.05em",
                      lineHeight: 1.1,
                    }}
                  >
                    {t.s3Title}
                  </h2>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    [t.s3InvHigh, t.s3StatusHigh, t.s3RiskHigh, t.s3ActionHigh, "high"],
                    [t.s3InvMid, t.s3StatusMid, t.s3RiskMid, t.s3ActionMid, "mid"],
                    [t.s3InvLow, t.s3StatusLow, t.s3RiskLow, t.s3ActionLow, "low"],
                  ].map((row, i) => {
                    const tone = row[4];
                    const bg = tone === "high"
                      ? "rgba(227,10,23,.08)"
                      : tone === "mid"
                      ? "rgba(245,158,11,.10)"
                      : "rgba(255,255,255,.92)";
                    const riskTone = tone === "high"
                      ? riskColor
                      : tone === "mid"
                      ? amberColor
                      : C.indigo;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 1.2fr",
                          gap: 12,
                          alignItems: "center",
                          padding: 18,
                          borderRadius: 24,
                          background: bg,
                          border: "1px solid " + T.hairline,
                        }}
                      >
                        <strong>{row[0]}</strong>
                        <span style={{ color: T.muted, fontWeight: 750 }}>{row[1]}</span>
                        <span style={{ color: riskTone, fontWeight: 950 }}>{row[2]}</span>
                        <span style={{ color: T.ink, fontWeight: 850 }}>{row[3]}</span>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 26,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  {/* WhatsApp */}
                  <div
                    style={{
                      borderRadius: 28,
                      overflow: "hidden",
                      border: "1px solid " + T.hairline,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        padding: 18,
                        background: "#075E54",
                        color: "#fff",
                        fontWeight: 950,
                      }}
                    >
                      {t.s3WhatsTitle}
                    </div>
                    <div style={{ padding: 22 }}>
                      <div
                        style={{
                          padding: 18,
                          borderRadius: 18,
                          background: "rgba(0,0,0,.04)",
                          lineHeight: 1.65,
                          fontWeight: 750,
                        }}
                      >
                        {t.s3WhatsBody1}{fmt(sampleInvoiceAmount)}{t.s3WhatsBody2}
                        <br />
                        <span style={{ color: "#075E54", fontWeight: 950 }}>{t.s3WhatsLink}</span>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    style={{
                      borderRadius: 28,
                      overflow: "hidden",
                      border: "1px solid " + T.hairline,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        padding: 18,
                        background: "#6737E8",
                        color: "#fff",
                        fontWeight: 950,
                      }}
                    >
                      {t.s3MailTitle}
                    </div>
                    <div style={{ padding: 22 }}>
                      <div
                        style={{
                          padding: 18,
                          borderRadius: 18,
                          background: "rgba(0,0,0,.04)",
                          lineHeight: 1.65,
                          fontWeight: 750,
                        }}
                      >
                        {t.s3MailSubject}
                        <br />
                        {t.s3MailBody}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 14 }}>
                  <SecondaryBtn label={t.back} />
                  <PrimaryBtn label={t.s3Cta} />
                </div>
              </div>
            )}

            {/* ============== STEP 4 — Save ============== */}
            {step === 4 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: ".9fr 1.1fr",
                  gap: 34,
                  alignItems: "center",
                }}
              >
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
                    {t.s4Eyebrow}
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
                    {t.s4Title}
                  </h2>

                  <p
                    style={{
                      marginTop: 14,
                      color: T.muted,
                      fontSize: 16,
                      lineHeight: 1.7,
                      fontWeight: 650,
                    }}
                  >
                    {t.s4Sub}
                  </p>

                  <div style={{ display: "grid", gap: 16, marginTop: 30 }}>
                    <input
                      type="email"
                      placeholder={t.s4Email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        height: 60,
                        borderRadius: 18,
                        border: "1px solid " + T.hairline,
                        padding: "0 18px",
                        fontSize: 17,
                        fontWeight: 800,
                        outline: "none",
                        background: "#fff",
                        color: T.ink,
                      }}
                    />

                    <input
                      type="password"
                      placeholder={t.s4Password}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        height: 60,
                        borderRadius: 18,
                        border: "1px solid " + T.hairline,
                        padding: "0 18px",
                        fontSize: 17,
                        fontWeight: 800,
                        outline: "none",
                        background: "#fff",
                        color: T.ink,
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 28, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <SecondaryBtn label={t.back} />
                    <PrimaryBtn label={t.s4Cta} />
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 34,
                    padding: 32,
                    background: "linear-gradient(135deg, rgba(255,247,237,.96), rgba(255,255,255,.92))",
                    border: "1px solid " + T.hairline,
                  }}
                >
                  <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px" }}>
                    {t.s4Ready}
                  </div>

                  {[
                    [t.s4Risky, String(riskyInvoices)],
                    [t.s4FollowUps, String(followUps)],
                    [t.s4Recover, fmt(recoverable)],
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        marginTop: 18,
                        padding: 20,
                        borderRadius: 22,
                        background: "#fff",
                        border: "1px solid " + T.hairline,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: T.muted, fontWeight: 800 }}>{row[0]}</span>
                      <strong
                        style={{
                          fontSize: 24,
                          color: themeColor,
                          fontFamily: "'Inter Tight', system-ui, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {row[1]}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============== STEP 5 — Activate ============== */}
            {step === 5 && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 32,
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 22px",
                    color: "#fff",
                    fontSize: 42,
                    fontWeight: 950,
                    background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                    boxShadow: ctaShadow,
                  }}
                >
                  ✓
                </div>

                <div
                  style={{
                    color: themeColor,
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "1.5px",
                    marginBottom: 10,
                  }}
                >
                  {t.s5Eyebrow}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 50,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                    lineHeight: 1.05,
                  }}
                >
                  {t.s5Title}
                </h2>

                <p
                  style={{
                    margin: "16px auto 0",
                    maxWidth: 680,
                    color: T.muted,
                    fontSize: 17,
                    lineHeight: 1.7,
                    fontWeight: 650,
                  }}
                >
                  {t.s5Sub}
                </p>

                <div
                  style={{
                    marginTop: 36,
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 18,
                  }}
                >
                  {[
                    [t.s5Risky, String(riskyInvoices)],
                    [t.s5FollowUps, String(followUps)],
                    [t.s5Recover, fmt(recoverable)],
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 28,
                        padding: 28,
                        background: "rgba(255,255,255,.9)",
                        border: "1px solid " + T.hairline,
                        boxShadow: "0 20px 54px rgba(58,5,9,.08)",
                      }}
                    >
                      <div style={{ color: T.muted, fontSize: 13, fontWeight: 900 }}>{row[0]}</div>
                      <div
                        style={{
                          marginTop: 8,
                          color: themeColor,
                          fontSize: 34,
                          fontWeight: 950,
                          fontFamily: "'Inter Tight', system-ui, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {row[1]}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 36,
                    display: "flex",
                    justifyContent: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to="/register"
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
                    {t.s5CtaPrimary} {arrow}
                  </Link>

                  <Link
                    to="/ai-analysis"
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
                    {t.s5CtaSecondary}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* MICRO TRUST */}
          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
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
                  boxShadow: "0 16px 36px rgba(58,5,9,.07)",
                  color: T.ink,
                }}
              >
                ✓ {x}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

// ================================================================
// /webinarlar — Zyrix Webinars (coming soon).
// ================================================================
import React from "react";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "ZYRIX WEBİNARLAR",
    title: "Yakında: Canlı webinarlar",
    subtitle: "30-45 dakika, soru-cevaplı, MENA ve Türkiye'deki KOBİ'ler için pratik oturumlar.",
    newsletter: {
      tagline: "OTURUM TAKVİMİ AÇILDIĞINDA HABERDAR OLUN",
      email: "E-posta",
      emailPh: "ornek@sirket.com",
      submit: "Bana Bildir",
      busy: "Gönderiliyor...",
      successMsg: "Aldık — ilk oturum yayınlandığında size haber vereceğiz.",
      errEmail: "Geçerli bir e-posta adresi girin.",
    },
    listEyebrow: "İLK OTURUMLAR",
    listTitle: "Açılış serisinde ne var?",
    items: [
      { icon: "🧾", title: "GİB e-Fatura'ya geçiş — pratik rehber", host: "Zyrix Ürün ekibi",       lengthLabel: "45 dk", date: "Q3 2026" },
      { icon: "💸", title: "Tahsilat sürelerini yarıya indirme",     host: "Zyrix CFO Stüdyosu",     lengthLabel: "30 dk", date: "Q3 2026" },
      { icon: "🤖", title: "AI ile fatura ve banka mutabakatı",      host: "Zyrix AI ekibi",         lengthLabel: "45 dk", date: "Q4 2026" },
    ],
    soonBadge: "Takvim yakında",
  },
  EN: {
    eyebrow: "ZYRIX WEBINARS",
    title: "Coming Soon: Live Webinars",
    subtitle: "30–45 minutes, with Q&A, practical sessions for SMBs in MENA and Turkey.",
    newsletter: {
      tagline: "GET NOTIFIED WHEN THE SCHEDULE OPENS",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Notify me",
      busy: "Sending...",
      successMsg: "Got it — we'll let you know the moment the first session goes live.",
      errEmail: "Enter a valid email address.",
    },
    listEyebrow: "OPENING SESSIONS",
    listTitle: "What's in the launch lineup?",
    items: [
      { icon: "🧾", title: "Switching to GİB e-Invoice — practical guide", host: "Zyrix Product Team",     lengthLabel: "45 min", date: "Q3 2026" },
      { icon: "💸", title: "Cutting collection time in half",               host: "Zyrix CFO Studio",       lengthLabel: "30 min", date: "Q3 2026" },
      { icon: "🤖", title: "AI for invoicing & bank reconciliation",        host: "Zyrix AI Team",          lengthLabel: "45 min", date: "Q4 2026" },
    ],
    soonBadge: "Schedule soon",
  },
  AR: {
    eyebrow: "ندوات ZYRIX",
    title: "قريباً: ندوات مباشرة",
    subtitle: "30-45 دقيقة، مع أسئلة وأجوبة، جلسات عملية للشركات الصغيرة والمتوسطة في MENA وتركيا.",
    newsletter: {
      tagline: "أبلغني عند فتح الجدول",
      email: "البريد الإلكتروني",
      emailPh: "you@company.com",
      submit: "أبلغني",
      busy: "جاري الإرسال...",
      successMsg: "وصل — سنخبرك لحظة بث أول جلسة.",
      errEmail: "أدخل بريداً إلكترونيّاً صالحاً.",
    },
    listEyebrow: "جلسات الافتتاح",
    listTitle: "ماذا في قائمة الإطلاق؟",
    items: [
      { icon: "🧾", title: "التحوّل إلى الفاتورة الإلكترونية GİB — دليل عملي", host: "فريق منتج Zyrix",       lengthLabel: "45 د",  date: "الربع 3 2026" },
      { icon: "💸", title: "تقليص زمن التحصيل إلى النصف",                       host: "استوديو CFO في Zyrix", lengthLabel: "30 د",  date: "الربع 3 2026" },
      { icon: "🤖", title: "الذكاء الاصطناعي للفوترة والمطابقة البنكية",        host: "فريق AI في Zyrix",     lengthLabel: "45 د",  date: "الربع 4 2026" },
    ],
    soonBadge: "الجدول قريباً",
  },
};

const ITEM_THEMES = [
  { bg: "#FEE2E2", icon: "#DC2626" },
  { bg: "#FED7AA", icon: "#EA580C" },
  { bg: "#EDE9FE", icon: "#7C3AED" },
];

export default function WebinarsPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage
      eyebrow={t.eyebrow}
      title={t.title}
      subtitle={t.subtitle}
      showNewsletter
      newsletterTagline={t.newsletter.tagline}
      newsletterLabels={t.newsletter}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.listEyebrow}</div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.listTitle}</h2>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {t.items.map((item, i) => {
          const th = ITEM_THEMES[i % ITEM_THEMES.length];
          return (
            <div key={i} style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 18,
              padding: 22,
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr) auto",
              gap: 18,
              alignItems: "center",
              boxShadow: "0 10px 28px rgba(58,5,9,0.05)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: th.bg, color: th.icon,
                display: "grid", placeItems: "center",
                fontSize: 26,
                flexShrink: 0,
              }}>{item.icon}</div>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{item.title}</h3>
                <div style={{ fontSize: 12.5, color: "#5C4F52", fontWeight: 600 }}>{item.host} · ⏱ {item.lengthLabel}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{
                  background: "#FEE2E2", color: "#991B1B",
                  fontSize: 10, fontWeight: 900,
                  padding: "3px 10px", borderRadius: 999,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>{t.soonBadge}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1B0F11" }}>{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ResourcePage>
  );
}

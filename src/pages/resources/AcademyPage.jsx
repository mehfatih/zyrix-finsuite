// ================================================================
// /akademi — Zyrix Academy (coming soon).
// Brand-consistent shell via ResourcePage, with preview tracks.
// ================================================================
import React from "react";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const COPY = {
  TR: {
    eyebrow: "ZYRIX AKADEMİ",
    title: "Yakında: Zyrix Akademi",
    subtitle: "Faturalama, tahsilat, vergi ve AI üzerine kısa videolu kurslar — uygulamalı, sektörel, ölçülebilir.",
    newsletter: {
      tagline: "İLK KURSLAR YAYINLANDIĞINDA HABERDAR OLUN",
      email: "E-posta",
      emailPh: "ornek@sirket.com",
      submit: "Bekleme Listesine Katıl",
      busy: "Gönderiliyor...",
      successMsg: "Bekleme listesindesiniz — ilk kurslar açıldığında haber vereceğiz.",
      errEmail: "Geçerli bir e-posta adresi girin.",
    },
    tracksEyebrow: "ÖĞRENME PATİKALARI",
    tracksTitle: "Açacağımız ilk patikalar",
    tracks: [
      { icon: "🧾", level: "Başlangıç", title: "e-Fatura 101", duration: "45 dk", desc: "GİB onayı, KDV, e-Arşiv ve günlük operasyon — sıfırdan uçtan uca." },
      { icon: "💰", level: "Orta",      title: "Tahsilat Operasyonu",  duration: "60 dk", desc: "Hatırlatma akışları, AR aging, AI önceliklendirme — gerçek senaryolarla." },
      { icon: "🤖", level: "İleri",     title: "AI ile Finans",         duration: "90 dk", desc: "Voice-to-Invoice, Tax Autopilot, Death Predictor — pratik uygulamalar." },
      { icon: "📊", level: "Uzman",      title: "Yönetici için Veri",    duration: "75 dk", desc: "Cohort analizi, churn modeli, nakit akışı projeksiyonu — karar için." },
    ],
    levelLabel: "Seviye",
    durLabel: "Süre",
  },
  EN: {
    eyebrow: "ZYRIX ACADEMY",
    title: "Coming Soon: Zyrix Academy",
    subtitle: "Short video courses on invoicing, collections, tax and AI — applied, sector-specific, measurable.",
    newsletter: {
      tagline: "BE FIRST TO LEARN WHEN COURSES OPEN",
      email: "Email",
      emailPh: "you@company.com",
      submit: "Join the waitlist",
      busy: "Sending...",
      successMsg: "You're on the waitlist — we'll let you know when courses open.",
      errEmail: "Enter a valid email address.",
    },
    tracksEyebrow: "LEARNING TRACKS",
    tracksTitle: "First tracks we'll open",
    tracks: [
      { icon: "🧾", level: "Beginner",     title: "e-Invoice 101",         duration: "45 min", desc: "GİB approval, VAT, e-Archive and daily ops — zero to end-to-end." },
      { icon: "💰", level: "Intermediate", title: "Collections operations", duration: "60 min", desc: "Reminder flows, AR aging, AI prioritisation — real-world scenarios." },
      { icon: "🤖", level: "Advanced",     title: "Finance with AI",        duration: "90 min", desc: "Voice-to-Invoice, Tax Autopilot, Death Predictor — applied." },
      { icon: "📊", level: "Expert",       title: "Data for leaders",       duration: "75 min", desc: "Cohort analysis, churn modelling, cash-flow projection — for decisions." },
    ],
    levelLabel: "Level",
    durLabel: "Duration",
  },
  AR: {
    eyebrow: "أكاديمية ZYRIX",
    title: "قريباً: أكاديمية Zyrix",
    subtitle: "دورات فيديو قصيرة في الفوترة والتحصيل والضرائب وAI — تطبيقية، خاصة بالقطاع، قابلة للقياس.",
    newsletter: {
      tagline: "كن الأول في التعلم عند الإطلاق",
      email: "البريد الإلكتروني",
      emailPh: "you@company.com",
      submit: "انضم لقائمة الانتظار",
      busy: "جاري الإرسال...",
      successMsg: "أنت في قائمة الانتظار — سنخبرك عند فتح الدورات.",
      errEmail: "أدخل بريداً إلكترونيّاً صالحاً.",
    },
    tracksEyebrow: "مسارات التعلم",
    tracksTitle: "أول المسارات التي نفتحها",
    tracks: [
      { icon: "🧾", level: "مبتدئ",   title: "الفاتورة الإلكترونية 101", duration: "45 د",   desc: "اعتماد GİB، VAT، e-Arşiv والعمليات اليومية — من الصفر للنهاية." },
      { icon: "💰", level: "متوسط",   title: "عمليات التحصيل",          duration: "60 د",   desc: "سلاسل التذكير، أعمار الديون، أولويات AI — سيناريوهات حقيقية." },
      { icon: "🤖", level: "متقدم",   title: "المالية مع AI",            duration: "90 د",   desc: "Voice-to-Invoice، Tax Autopilot، Death Predictor — تطبيقي." },
      { icon: "📊", level: "خبير",    title: "البيانات للقادة",           duration: "75 د",   desc: "تحليل المجموعات، نمذجة الفقد، إسقاط النقد — للقرار." },
    ],
    levelLabel: "المستوى",
    durLabel: "المدة",
  },
};

const TRACK_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#FED7AA", border: "#EA580C", icon: "#EA580C" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
];

export default function AcademyPage() {
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
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.tracksEyebrow}</div>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.tracksTitle}</h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
      }}>
        {t.tracks.map((tr, i) => {
          const th = TRACK_THEMES[i % TRACK_THEMES.length];
          return (
            <div key={i} style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderTop: `3px solid ${th.border}`,
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 12px 32px rgba(58,5,9,0.06)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: th.bg, color: th.icon,
                display: "grid", placeItems: "center",
                fontSize: 22, marginBottom: 14,
              }}>{tr.icon}</div>
              <div style={{
                display: "inline-block",
                background: th.bg,
                color: th.icon,
                fontSize: 10, fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 999,
                marginBottom: 8,
              }}>{tr.level}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{tr.title}</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{tr.desc}</p>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5C4F52", letterSpacing: "0.04em" }}>⏱ {tr.duration}</div>
            </div>
          );
        })}
      </div>
    </ResourcePage>
  );
}

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ---------- Palettes (matching the rest of V2) ----------
const C = {
  red:        "#E30A17",
  redDeep:    "#B30810",
  redBright:  "#FF1A2A",
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
  green900:     "#00190C",
  green950:     "#000B05",
  bgTinted:     "#F4FBF7",
  ink:          "#0B1A12",
  muted:        "#4A5C50",
  hairline:     "rgba(0,0,0,.08)",
  emerald:      "#10B981",
};

// ---------- Translations ----------
const TXT = {
  TR: {
    eyebrow: "ZYRIX ILE ILETISIM",
    h1a: "Dogru ekiple konus",
    h1b: "nakit akisi riski buyumeden once.",
    sub: "Fatura riskini analiz etmek, otomasyonu konusmak, sistemleri baglamak veya destek almak icin Zyrix seni en hizli yola yonlendirir.",

    paths: [
      { id: "ai",        title: "AI Analizi Baslat",        desc: "Kimseyle konusmadan once gizli fatura riskini ve nakit akisi firsatlarini gor.",         cta: "Analizi calistir" },
      { id: "sales",     title: "Satis ile Konus",          desc: "Fatura operasyonlari, tahsilat ve nakit akisi kontrolu icin Zyrix'i degerlendiren ekipler.", cta: "Satisa ulas" },
      { id: "support",   title: "Destek",                   desc: "Hesabin, kurulumun veya urun sorularinda yardim mi gerekiyor?",                          cta: "Destek iste" },
      { id: "partner",   title: "Is Birligi / Entegrasyon", desc: "Entegrasyonlar, API akislari, is ortagi firsatlari veya ozel baglanti hakkinda konus.",  cta: "Is birligini kesfet" },
    ],

    formEyebrow: "ILETISIM FORMU",
    formTitle: "Cozmek istedigini anlat.",
    formSelected: "Secilen yol",
    formName: "Adin",
    formEmail: "Is e-postasi",
    formCompany: "Sirket",
    formTeam: "Ekip buyuklugu",
    formMessage: "Mesaj",
    formMessagePh: "Fatura, tahsilat, nakit akisi veya entegrasyon sorununuzu anlatin...",
    formSubmit: "Mesaji Gonder",
    formAlt: "Once AI Analizi Calistir",

    successTitle: "Mesaj alindi.",
    successBody: "Yakinda sana donecegiz.",

    assistEyebrow: "AKILLI ILETISIM ASISTANI",
    assist: {
      ai:      { title: "Sonraki adim: ilk analizini calistir",     text: "Bir cagri rezervasyonundan once kisisellestirilmis bir nakit akisi risk gorunumu alabilirsin.", action: "Fatura hacmi ve gecikme orani ile basla." },
      sales:   { title: "Sonraki adim: nakit akisi sorununu anlat", text: "Fatura hacmi, tahsilat zorlugu, ekip buyuklugu ve Zyrix'in size yardim etmesini istediginiz karari paylasin.", action: "Satis, deger yaratmanin en hizli yolunu haritalandirir." },
      support: { title: "Sonraki adim: sorunu net anlat",           text: "Hesap e-postasi, is akisi ve nerede takildiginizi ekleyin ki ekip daha hizli yanit verebilsin.", action: "Destek talepleri urun baglami ile yonlendirilir." },
      partner: { title: "Sonraki adim: veri akisini acikla",        text: "Hangi sistemleri baglamak istediginizi ve hangi nakit akisi kararini otomatiklestirmek istediginizi anlatin.", action: "Entegrasyon talepleri API ve is akisi uyumu icin incelenir." },
    },

    trust: ["Hizli yanit", "Guvenli iletisim", "B2B hazir", "Kurulum destegi"],

    ctaEyebrow: "DEGERE EN HIZLI YOL",
    ctaTitle: "Ilk AI nakit akisi analizinle basla.",
    ctaText: "Ne soracaginizdan emin degilseniz, verilerinizle baslayin. Zyrix riskin nerede oldugunu gosterecek.",
    ctaBtn: "AI Analizi Calistir",
  },

  EN: {
    eyebrow: "CONTACT ZYRIX",
    h1a: "Talk to the right team",
    h1b: "before cashflow risk grows.",
    sub: "Whether you want to analyze invoice risk, discuss automation, connect your systems, or get support, Zyrix routes you to the fastest path.",

    paths: [
      { id: "ai",      title: "Start AI Analysis",          desc: "See hidden invoice risk and cashflow opportunities before talking to anyone.", cta: "Run analysis" },
      { id: "sales",   title: "Talk to Sales",              desc: "For teams evaluating Zyrix for invoice operations, collections, and cashflow control.", cta: "Contact sales" },
      { id: "support", title: "Support",                    desc: "Need help with your account, onboarding, setup, or product questions?", cta: "Ask support" },
      { id: "partner", title: "Partnerships / Integrations", desc: "Discuss integrations, API workflows, partner opportunities, or custom connectivity.", cta: "Explore partnership" },
    ],

    formEyebrow: "CONTACT FORM",
    formTitle: "Tell us what you want to solve.",
    formSelected: "Selected path",
    formName: "Name",
    formEmail: "Work email",
    formCompany: "Company",
    formTeam: "Team size",
    formMessage: "Message",
    formMessagePh: "Tell us about your invoice, collection, cashflow, or integration challenge...",
    formSubmit: "Send Message",
    formAlt: "Run AI Analysis First",

    successTitle: "Message received.",
    successBody: "We will get back to you shortly.",

    assistEyebrow: "SMART CONTACT ASSISTANT",
    assist: {
      ai:      { title: "Best next step: run your first analysis", text: "You can get a personalized cashflow risk view before booking a call.", action: "Start with invoice volume and delay rate." },
      sales:   { title: "Best next step: tell us your cashflow problem", text: "Share invoice volume, collection pain, team size, and the decision you want Zyrix to help with.", action: "Sales will help map the fastest path to value." },
      support: { title: "Best next step: describe the issue clearly", text: "Include account email, workflow, and where you got stuck so the team can respond faster.", action: "Support requests are routed with product context." },
      partner: { title: "Best next step: explain the data flow", text: "Tell us what systems you want to connect and what cashflow decision you want to automate.", action: "Integration requests are reviewed for API and workflow fit." },
    },

    trust: ["Fast response", "Secure communication", "B2B-ready", "Onboarding support"],

    ctaEyebrow: "FASTEST PATH TO VALUE",
    ctaTitle: "Start with your first AI cashflow analysis.",
    ctaText: "If you are not sure what to ask, start with your data. Zyrix will show where the risk is.",
    ctaBtn: "Run AI Analysis",
  },

  AR: {
    eyebrow: "تواصل مع زيركس",
    h1a: "تحدّث إلى الفريق المناسب",
    h1b: "قبل أن تكبر مخاطر التدفّق النقدي.",
    sub: "سواءً أردت تحليل مخاطر الفواتير، أو مناقشة الأتمتة، أو ربط أنظمتك، أو الحصول على الدعم، توجّهك زيركس إلى أسرع مسار.",

    paths: [
      { id: "ai",      title: "ابدأ التحليل بالذكاء الاصطناعي", desc: "شاهد مخاطر الفواتير الخفية وفرص التدفّق النقدي قبل التحدّث مع أحد.", cta: "شغّل التحليل" },
      { id: "sales",   title: "تحدّث مع المبيعات",   desc: "للفرق التي تقيّم زيركس لعمليات الفوترة والتحصيل وتدفّق النقد.", cta: "تواصل" },
      { id: "support", title: "الدعم",                                                                                                                                                              desc: "تحتاج مساعدة في حسابك أو الإعداد أو المنتج؟", cta: "اطلب الدعم" },
      { id: "partner", title: "شراكات / تكاملات",                                                                                                  desc: "ناقش التكاملات، وسير عمل API، وفرص الشراكة، أو الربط المخصص.", cta: "استكشف الشراكة" },
    ],

    formEyebrow: "نموذج التواصل",
    formTitle: "أخبرنا عمّا تريد حلّه.",
    formSelected: "المسار المختار",
    formName: "الاسم",
    formEmail: "البريد الإلكتروني",
    formCompany: "الشركة",
    formTeam: "حجم الفريق",
    formMessage: "الرسالة",
    formMessagePh: "أخبرنا عن تحدّيات الفوترة أو التحصيل أو التدفّق النقدي أو التكامل...",
    formSubmit: "إرسال الرسالة",
    formAlt: "شغّل تحليل AI أولاً",

    successTitle: "تم استلام الرسالة.",
    successBody: "سنعود إليك قريباً.",

    assistEyebrow: "مساعد التواصل الذكي",
    assist: {
      ai:      { title: "أفضل خطوة تالية: شغّل تحليلك الأول",                  text: "تستطيع الحصول على عرض مخصّص لمخاطر التدفّق النقدي قبل حجز مكالمة.", action: "ابدأ بحجم الفواتير ومعدل التأخير." },
      sales:   { title: "أفضل خطوة تالية: أخبرنا بمشكلتك",                                                                  text: "شارك حجم الفواتير، وتحدّي التحصيل، وحجم الفريق، والقرار الذي تريد من زيركس أن يساعدك فيه.", action: "المبيعات ستساعد في رسم المسار الأسرع للقيمة." },
      support: { title: "أفضل خطوة تالية: صف المشكلة بوضوح",                                            text: "أدرج بريد الحساب وسير العمل وأين علقت حتّى يرد الفريق أسرع.", action: "توجيه طلبات الدعم بسياق المنتج." },
      partner: { title: "أفضل خطوة تالية: اشرح تدفّق البيانات",                  text: "أخبرنا بالأنظمة التي تريد ربطها وبالقرار الذي تريد أتمتته.", action: "تراجع طلبات التكامل للتوافق مع API وسير العمل." },
    },

    trust: ["استجابة سريعة", "تواصل آمن", "جاهز لـ B2B", "دعم الإعداد"],

    ctaEyebrow: "أسرع مسار للقيمة",
    ctaTitle: "ابدأ بتحليل AI أوّل لتدفّقك النقدي.",
    ctaText: "إذا لم تكن متأكداً ممّا تسأل، ابدأ ببياناتك. سيوضّح زيركس أين تكمن المخاطر.",
    ctaBtn: "شغّل تحليل AI",
  },
};

export default function ContactPage() {
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
  const arrow = isRTL ? "←" : "→";

  const [reasonId, setReasonId] = useState("sales");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", team: "", message: "" });

  const selectedPath = t.paths.find((p) => p.id === reasonId) || t.paths[1];
  const assistant = useMemo(() => t.assist[reasonId] || t.assist.sales, [reasonId, t]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.88)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
    backdropFilter: "blur(16px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 16,
    border: "1px solid " + T.hairline,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    color: T.ink,
    background: "rgba(255,255,255,.95)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "1.2px",
    color: T.muted,
    marginBottom: 8,
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
        <section style={{ padding: "138px 32px 110px", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle at 50% 12%, rgba(" + themeGlowRGB + ",.16), transparent 50%)",
            }}
          />

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

            {/* === HERO === */}
            <div style={{ textAlign: "center", maxWidth: 980, margin: "0 auto 56px" }}>
              <div
                style={{
                  display: "inline-flex",
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
                  boxShadow: "0 18px 44px rgba(" + shadowRGB + ",.10)",
                }}
              >
                ✨ {t.eyebrow}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(40px,5.5vw,72px)",
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
                  maxWidth: 720,
                  color: T.muted,
                  fontSize: 18,
                  lineHeight: 1.78,
                  fontWeight: 650,
                }}
              >
                {t.sub}
              </p>
            </div>

            {/* === PATH CARDS === */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 36,
              }}
            >
              {t.paths.map((p) => {
                const active = reasonId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setReasonId(p.id)}
                    style={{
                      cursor: "pointer",
                      textAlign: isRTL ? "right" : "left",
                      borderRadius: 26,
                      padding: 24,
                      border: active ? ("2px solid " + themeColor) : ("1px solid " + T.hairline),
                      background: active
                        ? "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")"
                        : "rgba(255,255,255,.92)",
                      color: active ? "#fff" : T.ink,
                      boxShadow: active
                        ? "0 24px 60px rgba(" + themeGlowRGB + ",.30)"
                        : "0 16px 36px rgba(" + shadowRGB + ",.06)",
                      transition: "all 0.25s ease",
                      fontFamily: "inherit",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 950, letterSpacing: "-0.02em" }}>
                      {p.title}
                    </h3>
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: active ? "rgba(255,255,255,.78)" : T.muted,
                        fontSize: 13,
                        lineHeight: 1.6,
                        fontWeight: 650,
                      }}
                    >
                      {p.desc}
                    </p>
                    <div style={{ marginTop: 16, fontWeight: 950, fontSize: 13 }}>
                      {p.cta} {arrow}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* === FORM + ASSISTANT === */}
            <div
              id="contact-form"
              style={{
                display: "grid",
                gridTemplateColumns: "1.15fr .85fr",
                gap: 26,
                alignItems: "stretch",
              }}
            >
              {/* LEFT: Form */}
              <div style={{ ...cardBase, padding: 36 }}>
                <div style={{ color: themeColor, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                  {t.formEyebrow}
                </div>
                <h2 style={{ margin: 0, fontSize: 34, fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1.18 }}>
                  {t.formTitle}
                </h2>
                <p style={{ marginTop: 12, color: T.muted, fontSize: 15, lineHeight: 1.65, fontWeight: 650 }}>
                  {t.formSelected}: <strong style={{ color: themeColor, fontWeight: 950 }}>{selectedPath.title}</strong>
                </p>

                {submitted ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div
                      style={{
                        width: 64, height: 64, borderRadius: 999,
                        display: "grid", placeItems: "center", margin: "0 auto 20px",
                        background: "linear-gradient(135deg, " + C.emerald + ", #047857)",
                        color: "#fff", fontSize: 28, fontWeight: 950,
                      }}
                    >✓</div>
                    <h3 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: "-0.03em" }}>
                      {t.successTitle}
                    </h3>
                    <p style={{ marginTop: 10, color: T.muted, fontSize: 16, fontWeight: 650 }}>
                      {t.successBody}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={labelStyle}>{t.formName}</label>
                        <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.formEmail}</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.formCompany}</label>
                        <input name="company" value={form.company} onChange={handleChange} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.formTeam}</label>
                        <input name="team" value={form.team} onChange={handleChange} placeholder="1-10, 11-50, 50+" style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <label style={labelStyle}>{t.formMessage}</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder={t.formMessagePh}
                        style={{ ...inputStyle, resize: "vertical", minHeight: 120, fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          minWidth: 200,
                          padding: "17px 28px",
                          borderRadius: 16,
                          border: "none",
                          cursor: "pointer",
                          color: "#fff",
                          background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                          fontSize: 16,
                          fontWeight: 950,
                          fontFamily: "inherit",
                          boxShadow: "0 22px 56px rgba(" + themeGlowRGB + ",.30)",
                        }}
                      >
                        {t.formSubmit} {arrow}
                      </button>
                      <Link
                        to="/onboarding"
                        style={{
                          padding: "16px 24px",
                          borderRadius: 16,
                          color: T.ink,
                          background: "#fff",
                          border: "1px solid " + T.hairline,
                          textDecoration: "none",
                          fontSize: 15,
                          fontWeight: 950,
                          display: "inline-flex",
                          alignItems: "center",
                          fontFamily: "inherit",
                        }}
                      >
                        {t.formAlt}
                      </Link>
                    </div>
                  </form>
                )}
              </div>

              {/* RIGHT: Assistant */}
              <div
                style={{
                  borderRadius: 30,
                  padding: 32,
                  background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                  color: "#fff",
                  boxShadow: "0 34px 90px rgba(" + shadowRGB + ",.26)",
                }}
              >
                <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px" }}>
                  {t.assistEyebrow}
                </div>
                <h2 style={{ margin: "12px 0 0", fontSize: 26, fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1.22 }}>
                  {assistant.title}
                </h2>
                <p style={{ marginTop: 14, opacity: 0.78, fontSize: 15, lineHeight: 1.7, fontWeight: 650 }}>
                  {assistant.text}
                </p>

                <div
                  style={{
                    marginTop: 22,
                    borderRadius: 22,
                    padding: 18,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                    fontWeight: 850,
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {assistant.action}
                </div>

                <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
                  {t.trust.map((x) => (
                    <div
                      key={x}
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        background: "rgba(255,255,255,.08)",
                        border: "1px solid rgba(255,255,255,.13)",
                        fontWeight: 850,
                        fontSize: 14,
                      }}
                    >
                      ✓ {x}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* === TRUST STRIP === */}
            <div
              style={{
                marginTop: 36,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {t.trust.map((x) => (
                <div
                  key={x + "-strip"}
                  style={{
                    borderRadius: 18,
                    padding: 16,
                    background: "#fff",
                    border: "1px solid " + T.hairline,
                    textAlign: "center",
                    fontWeight: 950,
                    fontSize: 13,
                    boxShadow: "0 16px 36px rgba(" + shadowRGB + ",.07)",
                  }}
                >
                  ✓ {x}
                </div>
              ))}
            </div>

            {/* === FINAL CTA === */}
            <div
              style={{
                marginTop: 64,
                borderRadius: 36,
                padding: "52px 32px",
                background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 34px 90px rgba(" + shadowRGB + ",.26)",
              }}
            >
              <div style={{ opacity: 0.75, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 12 }}>
                {t.ctaEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(32px,4vw,48px)", fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1.1 }}>
                {t.ctaTitle}
              </h2>
              <p style={{ margin: "14px auto 0", maxWidth: 660, opacity: 0.78, fontSize: 16, lineHeight: 1.7, fontWeight: 650 }}>
                {t.ctaText}
              </p>
              <div style={{ marginTop: 28 }}>
                <Link
                  to="/onboarding"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 18,
                    padding: "18px 32px",
                    color: T.ink,
                    background: "#fff",
                    textDecoration: "none",
                    fontSize: 16,
                    fontWeight: 950,
                    fontFamily: "inherit",
                  }}
                >
                  {t.ctaBtn} {arrow}
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

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

const TXT = {
  TR: {
    back: "Geri",
    badge: "BIZE ULAS",
    h1a: "Bir konusma",
    h1b: "ile baslayalim.",
    sub: "Sektorune, ekibine ve nakit akisi hedeflerine ozel bir Zyrix demosu hazirlayabiliriz. Mesajini birak, sana donelim.",
    formName: "Adin",
    formEmail: "Is e-postan",
    formCompany: "Sirket adi",
    formMessage: "Mesaj",
    formMessagePh: "Bize ekibinden, faturalama akisindan ve ulasmak istedigin nakit akisi nettiginden bahset.",
    formSubmit: "Mesaji Gonder",
    altEyebrow: "ALTERNATIF YOLLAR",
    altTitle: "Direkt iletisim icin.",
    altEmail: "E-posta",
    altSupport: "Destek",
    altSales: "Satis",
    altResponseTime: "Yaklasik 24 saat icinde donus.",
    successTitle: "Mesaj alindi.",
    successBody: "Yakinda sana donecegiz.",
  },
  EN: {
    back: "Back",
    badge: "GET IN TOUCH",
    h1a: "Let us start",
    h1b: "a conversation.",
    sub: "We can prepare a Zyrix demo tailored to your sector, team, and cashflow goals. Leave a message and we will get back to you.",
    formName: "Your name",
    formEmail: "Work email",
    formCompany: "Company",
    formMessage: "Message",
    formMessagePh: "Tell us about your team, billing flow, and the cashflow clarity you want to reach.",
    formSubmit: "Send Message",
    altEyebrow: "OTHER WAYS",
    altTitle: "Direct contact.",
    altEmail: "Email",
    altSupport: "Support",
    altSales: "Sales",
    altResponseTime: "Reply within ~24 hours.",
    successTitle: "Message received.",
    successBody: "We will get back to you shortly.",
  },
  AR: {
    back: "رجوع",
    badge: "تواصل معنا",
    h1a: "لنبدأ",
    h1b: "محادثة.",
    sub: "يمكننا تجهيز عرض توضيحي لـ زيركس يناسب قطاعك وفريقك وأهداف تدفقك النقدي. اترك رسالة وسنعود إليك.",
    formName: "الاسم",
    formEmail: "البريد الإلكتروني العملي",
    formCompany: "الشركة",
    formMessage: "الرسالة",
    formMessagePh: "أخبرنا عن فريقك وتدفق الفوترة ووضوح التدفق النقدي الذي تريد الوصول إليه.",
    formSubmit: "إرسال الرسالة",
    altEyebrow: "طرق أخرى",
    altTitle: "تواصل مباشر.",
    altEmail: "البريد",
    altSupport: "الدعم",
    altSales: "المبيعات",
    altResponseTime: "رد خلال حوالي 24 ساعة.",
    successTitle: "تم استلام الرسالة.",
    successBody: "سنعود إليك قريباً.",
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
  const arrow = isRTL ? "\u2190" : "\u2192";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.88)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
    backdropFilter: "blur(16px)",
  };

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
    background: "rgba(255,255,255,.88)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
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
      <section style={{ padding: "148px 32px 110px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle at 50% 12%, rgba(" + themeGlowRGB + ",.14), transparent 50%)",
          }}
        />

        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 2 }}>
          
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px" }}>
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
              }}
            >
              ✦ {t.badge}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(40px,5vw,72px)",
                lineHeight: 1.06,
                letterSpacing: "-0.06em",
                fontWeight: 950,
              }}
            >
              {t.h1a} <span style={{ color: themeColor }}>{t.h1b}</span>
            </h1>
            <p
              style={{
                margin: "22px auto 0",
                maxWidth: 640,
                color: T.muted,
                fontSize: 17,
                lineHeight: 1.78,
                fontWeight: 650,
              }}
            >
              {t.sub}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 26 }}>
            <div style={{ ...cardBase, padding: 36 }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div
                    style={{
                      width: 64, height: 64, borderRadius: 999,
                      display: "grid", placeItems: "center", margin: "0 auto 20px",
                      background: "linear-gradient(135deg, " + C.emerald + ", #047857)",
                      color: "#fff", fontSize: 28, fontWeight: 950,
                    }}
                  >
                    ✓
                  </div>
                  <h3 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: "-0.03em" }}>
                    {t.successTitle}
                  </h3>
                  <p style={{ marginTop: 10, color: T.muted, fontSize: 16, fontWeight: 650 }}>
                    {t.successBody}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>{t.formName}</label>
                    <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>{t.formEmail}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>{t.formCompany}</label>
                    <input name="company" value={form.company} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 22 }}>
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
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "18px 32px",
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
                </form>
              )}
            </div>

            <div style={{ ...cardBase, padding: 32 }}>
              <div style={{ color: themeColor, fontSize: 13, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 10 }}>
                {t.altEyebrow}
              </div>
              <h3 style={{ margin: 0, fontSize: 26, fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1.18 }}>
                {t.altTitle}
              </h3>

              <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: "1.2px", color: T.muted, marginBottom: 4 }}>
                    {t.altEmail}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 850, color: T.ink }}>hello@zyrix.co</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: "1.2px", color: T.muted, marginBottom: 4 }}>
                    {t.altSupport}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 850, color: T.ink }}>support@zyrix.co</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: "1.2px", color: T.muted, marginBottom: 4 }}>
                    {t.altSales}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 850, color: T.ink }}>sales@zyrix.co</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(" + themeGlowRGB + ",.06)",
                  border: "1px solid " + T.hairline,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.muted,
                }}
              >
                {t.altResponseTime}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

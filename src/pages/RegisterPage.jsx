import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";
import { useAuth } from "../context/AuthContext";
import { useCountry } from "../hooks/useCountry.jsx";
import { COUNTRY_PROFILES, SUPPORTED_COUNTRIES } from "../utils/countryProfiles.js";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ---------- Palettes ----------
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

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ---------- Translations ----------
const TXT = {
  TR: {
    eyebrow: "ANALIZINI KAYDET",
    h1a: "AI nakit akisi analizini kaydet",
    h1b: "icgoru kaybolmadan once.",
    sub: "Calisma alanini olustur ve fatura risk profilin, geri kazanilabilir nakit tahminin ve AI tarafindan olusturulan takip planini eylem icin hazir tut.",

    outcomes: [
      { num: "99",      label: "riskli fatura tespit edildi" },
      { num: "32",      label: "takip hazir" },
      { num: "$6,048",  label: "geri kazanilabilir nakit tahmini" },
    ],

    smartEyebrow: "AKILLI ASISTAN",
    smartTitle: "Analizin calisma alaninda seni bekliyor olacak.",
    smartText: "Kayittan sonra Zyrix sifirdan baslamak yerine mevcut nakit akisi baglamindan devam eder.",

    formEyebrow: "CALISMA ALANI OLUSTUR",
    formTitle: "Nakit akisini hemen duzeltmeye basla.",
    formSub: "Calisma alanini olusturmak icin bilgilerini gir.",

    fName:    "AD SOYAD",
    fEmail:   "IS E-POSTASI",
    fPhone:   "TELEFON (OPSIYONEL)",
    fCompany: "SIRKET ADI",
    fPassword:"SIFRE",
    fCountry: "ULKE",
    fRegion:  "BOLGE",

    fNamePh:    "Adin",
    fEmailPh:   "ornek@sirket.com",
    fCompanyPh: "Sirket adi",
    fPasswordPh: "En az 8 karakter",

    submitBtn: "Calisma Alanini Olustur",
    submitting: "Olusturuluyor...",

    secondaryLogin: "Giris Yap",
    secondaryOtp:   "OTP ile Devam Et",

    legalPrefix: "Hesap olusturarak ",
    legalAnd: " ve ",
    legalSuffix: " kabul etmis olursun.",
    legalTerms: "Kullanim Sartlari",
    legalPrivacy: "Gizlilik Politikasi",

    trust: ["Kurulum gerekmez", "Guvenli calisma alani", "Dakikalar icinde hazir", "Istediginde iptal et"],

    errInvalid: "Lutfen gerekli alanlari doldur.",
    errEmail:   "Gecerli bir e-posta adresi gir.",
    errPass:    "Sifre en az 8 karakter olmali.",

    detected: "tespit edildi",
    selectCountry: "Ulke sec",
    selectRegion: "Bolge sec",
  },

  EN: {
    eyebrow: "SAVE YOUR ANALYSIS",
    h1a: "Save your AI cashflow analysis",
    h1b: "before the insight disappears.",
    sub: "Create your workspace to keep your invoice risk profile, recoverable cash estimate, and AI-generated follow-up plan ready for action.",

    outcomes: [
      { num: "99",      label: "risky invoices detected" },
      { num: "32",      label: "follow-ups ready" },
      { num: "$6,048",  label: "recoverable cash estimated" },
    ],

    smartEyebrow: "SMART ASSISTANT",
    smartTitle: "Your analysis will be waiting inside your workspace.",
    smartText: "After registration, Zyrix continues from your current cashflow context instead of starting from zero.",

    formEyebrow: "CREATE WORKSPACE",
    formTitle: "Start fixing cashflow now.",
    formSub: "Enter your details to create a secure Zyrix workspace.",

    fName:    "FULL NAME",
    fEmail:   "WORK EMAIL",
    fPhone:   "PHONE (OPTIONAL)",
    fCompany: "COMPANY NAME",
    fPassword:"PASSWORD",
    fCountry: "COUNTRY",
    fRegion:  "REGION",

    fNamePh:    "Your name",
    fEmailPh:   "you@company.com",
    fCompanyPh: "Company name",
    fPasswordPh: "Minimum 8 characters",

    submitBtn: "Create Workspace",
    submitting: "Creating...",

    secondaryLogin: "Login",
    secondaryOtp:   "Continue with OTP",

    legalPrefix: "By creating an account, you agree to ",
    legalAnd: " and ",
    legalSuffix: ".",
    legalTerms: "Terms of Use",
    legalPrivacy: "Privacy Policy",

    trust: ["No setup", "Secure workspace", "Ready in minutes", "Cancel anytime"],

    errInvalid: "Please fill in all required fields.",
    errEmail:   "Enter a valid email address.",
    errPass:    "Password must be at least 8 characters.",

    detected: "detected",
    selectCountry: "Select country",
    selectRegion: "Select region",
  },

  AR: {
    eyebrow: "احفظ تحليلك",
    h1a: "احفظ تحليل AI لتدفّقك النقدي",
    h1b: "قبل أن تختفي الرؤية.",
    sub: "أنشئ مساحة عملك لتحتفظ بملف مخاطر الفواتير وتقدير النقد القابل للاسترداد وخطت المتابعة الجاهزة للتنفيذ.",

    outcomes: [
      { num: "99",      label: "فاتورة عالية المخاطر مكتشفة" },
      { num: "32",      label: "متابعة جاهزة" },
      { num: "$6,048",  label: "نقد قابل للاسترداد مقدّر" },
    ],

    smartEyebrow: "المساعد الذكي",
    smartTitle: "تحليلك سيكون بانتظارك داخل مساحة عملك.",
    smartText: "بعد التسجيل، يواصل زيركس من سياق تدفّقك النقدي الحالي بدلاً من البدء من الصفر.",

    formEyebrow: "أنشئ مساحة عمل",
    formTitle: "ابدأ إصلاح التدفّق النقدي الآن.",
    formSub: "أدخل بياناتك لإنشاء مساحة عمل آمنة.",

    fName:    "الاسم الكامل",
    fEmail:   "البريد الإلكتروني",
    fPhone:   "الهاتف (اختياري)",
    fCompany: "اسم الشركة",
    fPassword:"كلمة السر",
    fCountry: "الدولة",
    fRegion:  "المنطقة",

    fNamePh:    "اسمك",
    fEmailPh:   "you@company.com",
    fCompanyPh: "اسم الشركة",
    fPasswordPh: "8 أحرف على الأقل",

    submitBtn: "أنشئ مساحة العمل",
    submitting: "جارٍ الإنشاء...",

    secondaryLogin: "تسجيل الدخول",
    secondaryOtp:   "المتابعة بـ OTP",

    legalPrefix: "بإنشاء حساب، أنت توافق على ",
    legalAnd: " و ",
    legalSuffix: ".",
    legalTerms: "الشروط",
    legalPrivacy: "سياسة الخصوصية",

    trust: ["بدون إعداد", "مساحة عمل آمنة", "جاهزة في دقائق", "إلغاء في أي وقت"],

    errInvalid: "يرجى ملء الحقول المطلوبة.",
    errEmail:   "أدخل بريداً إلكترونيّاً صالحاً.",
    errPass:    "يجب أن تكون كلمة السر 8 أحرف على الأقل.",

    detected: "تم التعرف",
    selectCountry: "اختر الدولة",
    selectRegion: "اختر المنطقة",
  },
};

export default function RegisterPage() {
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

  const { login } = useAuth() || {};
  const { country: detectedCountry, profile, setCountry, source } = useCountry();

  // Form state â `country` initialized from useCountry (auto-detected)
  // and the user can override via the dropdown.
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    country: detectedCountry,
    region: profile.defaultRegion || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // When the auto-detected country changes (IP detection finishes after mount),
  // sync form.country with it â but only if user hasn't manually picked one yet.
  useEffect(() => {
    if (source !== "user") {
      setForm((f) => ({
        ...f,
        country: detectedCountry,
        region: COUNTRY_PROFILES[detectedCountry]
          ? COUNTRY_PROFILES[detectedCountry].defaultRegion || ""
          : "",
      }));
    }
  }, [detectedCountry, source]);

  // Resolve the active profile (form-driven, may differ from detected)
  const activeProfile = useMemo(
    () => COUNTRY_PROFILES[form.country] || profile,
    [form.country, profile]
  );

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setServerError("");
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const newProfile = COUNTRY_PROFILES[newCountry];
    setForm((f) => ({
      ...f,
      country: newCountry,
      region: newProfile ? newProfile.defaultRegion || "" : "",
    }));
    // Persist user's choice via useCountry so the rest of the app updates too.
    setCountry(newCountry);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = t.errInvalid;
    if (!form.email.trim())   e.email = t.errInvalid;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.errEmail;
    if (!form.company.trim()) e.company = t.errInvalid;
    if (!form.password)       e.password = t.errInvalid;
    else if (form.password.length < 8) e.password = t.errPass;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setServerError("");
    try {
      const res = await fetch(API + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          businessName: form.company,
          country: form.country,
          region: form.region,
          language: activeProfile.lang,
          currency: activeProfile.currency,
          taxRate: activeProfile.tax.rate,
          taxName: activeProfile.tax.name,
          compliance: activeProfile.compliance.dataProtection,
          eInvoiceSystem: activeProfile.compliance.eInvoice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.error ? data.error : "Registration failed");

      const token = data.data && data.data.token;
      const merchant = data.data && data.data.merchant;
      const user = Object.assign({}, merchant, { role: "MERCHANT", _type: "merchant" });
      if (typeof window !== "undefined") {
        localStorage.setItem("zyrix_token", token);
        localStorage.setItem("zyrix_user", JSON.stringify(user));
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.92)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
    backdropFilter: "blur(16px)",
  };

  const inputStyle = {
    width: "100%",
    height: 56,
    borderRadius: 16,
    border: "1px solid " + T.hairline,
    background: "#fff",
    padding: "0 16px",
    fontSize: 15,
    fontWeight: 700,
    color: T.ink,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const selectStyle = Object.assign({}, inputStyle, {
    appearance: "none",
    cursor: "pointer",
    paddingRight: 36,
  });

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 950,
    color: T.muted,
    marginBottom: 8,
    letterSpacing: "1.1px",
  };

  // Preferred order for the dropdown: TR/SA/AE/EG first, then alphabetical
  const preferredOrder = ["TR", "SA", "AE", "EG", "KW", "QA", "BH", "OM", "JO", "US"];

  return (
    <>
      <NavV2 />
      <main
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          direction: isRTL ? "rtl" : "ltr",
          minHeight: "100vh",
          color: T.ink,
          background: "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 50%,#fff 100%)",
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
              background: "radial-gradient(circle at 50% 18%, rgba(" + themeGlowRGB + ",.16), transparent 52%)",
            }}
          />

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

            {/* === MAIN PANEL === */}
            <div
              style={{
                ...cardBase,
                padding: 40,
                display: "grid",
                gridTemplateColumns: "1.05fr 0.95fr",
                gap: 36,
                alignItems: "stretch",
              }}
            >
              {/* LEFT: narrative + outcomes + smart card */}
              <div>
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
                    boxShadow: "0 18px 44px rgba(" + shadowRGB + ",.08)",
                  }}
                >
                  ✨ {t.eyebrow}
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(36px,4.5vw,60px)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.05em",
                    fontWeight: 950,
                  }}
                >
                  {t.h1a} — <span style={{ color: themeColor }}>{t.h1b}</span>
                </h1>

                <p
                  style={{
                    margin: "20px 0 0",
                    color: T.muted,
                    fontSize: 17,
                    lineHeight: 1.75,
                    fontWeight: 650,
                  }}
                >
                  {t.sub}
                </p>

                {/* Outcome cards */}
                <div
                  style={{
                    marginTop: 28,
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 12,
                  }}
                >
                  {t.outcomes.map((o, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 22,
                        padding: 20,
                        background: "rgba(255,255,255,.96)",
                        border: "1px solid " + T.hairline,
                        boxShadow: "0 16px 40px rgba(" + shadowRGB + ",.06)",
                      }}
                    >
                      <div
                        style={{
                          color: themeColor,
                          fontSize: 28,
                          fontWeight: 950,
                          letterSpacing: "-0.04em",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {o.num}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          color: T.muted,
                          fontSize: 12,
                          lineHeight: 1.45,
                          fontWeight: 850,
                        }}
                      >
                        {o.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Smart Assistant card */}
                <div
                  style={{
                    marginTop: 22,
                    borderRadius: 28,
                    padding: 24,
                    background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                    color: "#fff",
                    boxShadow: "0 28px 70px rgba(" + shadowRGB + ",.22)",
                  }}
                >
                  <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 8 }}>
                    {t.smartEyebrow}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.18, letterSpacing: "-0.04em", fontWeight: 950 }}>
                    {t.smartTitle}
                  </h3>
                  <p style={{ margin: "10px 0 0", opacity: 0.78, fontSize: 14, lineHeight: 1.65, fontWeight: 650 }}>
                    {t.smartText}
                  </p>
                </div>

                {/* Country-aware compliance hint */}
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(" + themeGlowRGB + ",.06)",
                    border: "1px solid " + T.hairline,
                    color: T.muted,
                    fontSize: 12.5,
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  ✓ {activeProfile.compliance.eInvoice}
                  {" · "}
                  {activeProfile.compliance.dataProtection}
                  {" · "}
                  {activeProfile.tax.name} {activeProfile.tax.rate}%
                  {" · "}
                  {activeProfile.currencySymbol} {activeProfile.currency}
                </div>
              </div>

              {/* RIGHT: Form */}
              <div
                style={{
                  borderRadius: 30,
                  padding: 30,
                  background: "rgba(255,255,255,.96)",
                  border: "1px solid " + T.hairline,
                  boxShadow: "0 24px 64px rgba(" + shadowRGB + ",.10)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ color: themeColor, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 8 }}>
                  {t.formEyebrow}
                </div>
                <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.04em", fontWeight: 950 }}>
                  {t.formTitle}
                </h2>
                <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 14, lineHeight: 1.6, fontWeight: 650 }}>
                  {t.formSub}
                </p>

                <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
                  {/* Country dropdown â full width */}
                  <div>
                    <label style={labelStyle}>
                      {t.fCountry}
                      {source === "ip" && (
                        <span style={{ marginLeft: 8, color: themeColor, fontSize: 10, letterSpacing: "1px" }}>
                          · {t.detected}
                        </span>
                      )}
                    </label>
                    <select
                      value={form.country}
                      onChange={handleCountryChange}
                      style={selectStyle}
                    >
                      {preferredOrder.filter(c => SUPPORTED_COUNTRIES.indexOf(c) !== -1).map((code) => {
                        const cp = COUNTRY_PROFILES[code];
                        const cName = (cp.name && cp.name[lang]) || cp.name.EN || code;
                        return (
                          <option key={code} value={code}>
                            {cName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Region dropdown â only if the country has regions */}
                  {activeProfile.regions && activeProfile.regions.length > 0 && (
                    <div>
                      <label style={labelStyle}>
                        {(activeProfile.regionType && activeProfile.regionType[lang]) || t.fRegion}
                      </label>
                      <select
                        value={form.region}
                        onChange={(e) => set("region", e.target.value)}
                        style={selectStyle}
                      >
                        {activeProfile.regions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name + Company in 2 columns */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>{t.fName}</label>
                      <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder={t.fNamePh}
                        style={Object.assign({}, inputStyle, errors.name ? { borderColor: themeColor } : {})}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.fCompany}</label>
                      <input
                        value={form.company}
                        onChange={(e) => set("company", e.target.value)}
                        placeholder={t.fCompanyPh}
                        style={Object.assign({}, inputStyle, errors.company ? { borderColor: themeColor } : {})}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>{t.fEmail}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder={t.fEmailPh}
                      style={Object.assign({}, inputStyle, errors.email ? { borderColor: themeColor } : {})}
                    />
                  </div>

                  {/* Phone â OPTIONAL, free format, placeholder follows country */}
                  <div>
                    <label style={labelStyle}>{t.fPhone}</label>
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder={activeProfile.phonePlaceholder}
                      style={inputStyle}
                    />
                  </div>

                  {/* Password with show/hide */}
                  <div>
                    <label style={labelStyle}>{t.fPassword}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder={t.fPasswordPh}
                        style={Object.assign({}, inputStyle, { paddingRight: 60 }, errors.password ? { borderColor: themeColor } : {})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        style={{
                          position: "absolute",
                          right: isRTL ? "auto" : 12,
                          left: isRTL ? 12 : "auto",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          color: T.muted,
                          fontSize: 11,
                          fontWeight: 950,
                          letterSpacing: "1px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {showPass ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                </div>

                {serverError && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      padding: "12px 14px",
                      background: "rgba(" + themeGlowRGB + ",.08)",
                      border: "1px solid " + T.hairline,
                      color: themeColor,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {serverError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    marginTop: 18,
                    width: "100%",
                    border: 0,
                    cursor: loading ? "not-allowed" : "pointer",
                    borderRadius: 18,
                    padding: "18px 24px",
                    color: "#fff",
                    background: loading
                      ? "rgba(0,0,0,.28)"
                      : "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                    fontSize: 16,
                    fontWeight: 950,
                    boxShadow: "0 22px 56px rgba(" + themeGlowRGB + ",.30)",
                    fontFamily: "inherit",
                  }}
                >
                  {loading ? t.submitting : (t.submitBtn + " " + arrow)}
                </button>

                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <Link
                    to="/login"
                    style={{
                      borderRadius: 14,
                      padding: "13px 14px",
                      color: T.ink,
                      background: "#fff",
                      border: "1px solid " + T.hairline,
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {t.secondaryLogin}
                  </Link>

                  <Link
                    to="/login/otp"
                    style={{
                      borderRadius: 14,
                      padding: "13px 14px",
                      color: T.ink,
                      background: "#fff",
                      border: "1px solid " + T.hairline,
                      textDecoration: "none",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {t.secondaryOtp}
                  </Link>
                </div>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: T.muted,
                    fontSize: 11.5,
                    lineHeight: 1.55,
                    fontWeight: 650,
                    textAlign: "center",
                  }}
                >
                  {t.legalPrefix}
                  <Link to="/terms" style={{ color: themeColor, textDecoration: "none", fontWeight: 950 }}>{t.legalTerms}</Link>
                  {t.legalAnd}
                  <Link to="/privacy" style={{ color: themeColor, textDecoration: "none", fontWeight: 950 }}>{t.legalPrivacy}</Link>
                  {t.legalSuffix}
                </p>
              </div>
            </div>

            {/* === TRUST STRIP === */}
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {t.trust.map((x, i) => (
                <div
                  key={i}
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

          </div>
        </section>
      </main>
      <FooterV2 />
    </>
  );
}

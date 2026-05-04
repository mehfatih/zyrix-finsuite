import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";
import { useCountry } from "../hooks/useCountry.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

const C = {
  red: "#E30A17",
  redDeep: "#B30810",
  redBright: "#FF1A2A",
  wine900: "#3A0509",
  wine950: "#1F0205",
  bgTinted: "#FFF7F4",
  ink: "#1B0F11",
  muted: "#5C4F52",
  hairline: "rgba(0,0,0,.08)",
  emerald: "#10B981",
};

const SA = {
  green: "#006C35",
  greenDeep: "#004D26",
  greenBright: "#00A050",
  green900: "#00190C",
  green950: "#000B05",
  bgTinted: "#F4FBF7",
  ink: "#0B1A12",
  muted: "#4A5C50",
  hairline: "rgba(0,0,0,.08)",
  emerald: "#10B981",
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TXT = {
  TR: {
    eyebrow: "GÜVENLİ OTP ERİŞİMİ",
    h1Default: "Güvenli kodla giriş yap —",
    h1Highlight: "nakit akışı eylemlerin hazır kalsın.",
    h1Personal: "Tekrar hoş geldin —",
    h1PersonalHighlight: "tek dokunuşla analizin korundu.",
    sub: "Şifreyi atla. Güvenli erişim kodu al ve kayıtlı analizine, risk sinyallerine ve sıradaki tavsiyelere devam et.",

    cardRiskyLabel: "riskli fatura tespit edildi",
    cardFollowupsLabel: "takip hazır",
    cardRecoverableLabel: "geri kazanılabilir nakit",
    cardDefaultLabels: ["fatura risk hazır", "güvenli erişim", "nakit akışı sinyalleri"],
    cardDefaultValues: ["AI", "Hızlı", "Canlı"],

    smartEyebrow: "AKILLI ERİŞİM ASİSTANI",
    smartTitleDefault: "Çalışma alanına şifresiz güvenli erişim.",
    smartTitlePersonalPrefix: "",
    smartTitlePersonalMid: " analizin korundu.",
    smartTextDefault: "Daha hızlı erişim, güvenli doğrulama ve daha az sürtünme istediğinde OTP kullan.",
    smartTextPersonal: "Önceki nakit akışı bağlamından devam et ve sıradaki tavsiyelere göre hareket et.",

    formEyebrow: "ŞİFRESİZ GİRİŞ",
    formTitleStep1: "Güvenli kodunu al.",
    formTitleStep2: "Kodu doğrula.",
    formSubStep1: "İş e-postanı veya telefon numaranı gir. Tek kullanımlık güvenli kod gönderilecek.",
    formSubStep2Prefix: "Kod gönderildi: ",
    formSubStep2Suffix: ". 6 haneli kodu gir (10 dakika geçerli).",

    channelEmail: "E-posta",
    channelPhone: "Telefon",

    fEmail: "İŞ E-POSTASI",
    fPhone: "TELEFON",
    fEmailPh: "ornek@sirket.com",
    fPhonePh: "+90 532 123 4567",
    fCode: "GÜVENLİ KOD",

    btnSend: "Güvenli Kodu Gönder",
    btnSending: "Gönderiliyor...",
    btnVerify: "Çalışma Alanına Devam",
    btnVerifying: "Doğrulanıyor...",
    btnBack: "Geri Dön",

    secondaryPassword: "Şifre ile Giriş",
    secondaryRegister: "Hesap Oluştur",

    trust: ["Tek seferlik güvenli erişim", "Özel çalışma alanı", "Şifre gerekmez", "Anında dönüş"],

    errMissing: "Lütfen e-posta veya telefon gir.",
    errCode: "6 haneli kodu gir.",
    errSend: "Kod gönderilemedi.",
    errVerify: "Kod geçersiz.",
    errConn: "Bağlantı hatası.",
  },

  EN: {
    eyebrow: "SECURE OTP ACCESS",
    h1Default: "Enter with a secure code —",
    h1Highlight: "your cashflow actions stay ready.",
    h1Personal: "Welcome back —",
    h1PersonalHighlight: "your analysis is preserved.",
    sub: "Skip the password. Get a secure access code and continue to your saved analysis, risk signals, and next recommended actions.",

    cardRiskyLabel: "risky invoices detected",
    cardFollowupsLabel: "follow-ups ready",
    cardRecoverableLabel: "recoverable cash",
    cardDefaultLabels: ["invoice risk ready", "secure access", "cashflow signals"],
    cardDefaultValues: ["AI", "Fast", "Live"],

    smartEyebrow: "SMART ACCESS ASSISTANT",
    smartTitleDefault: "Your workspace can be accessed securely without a password.",
    smartTitlePersonalPrefix: "Your ",
    smartTitlePersonalMid: " analysis is preserved.",
    smartTextDefault: "Use OTP when you want faster access, secure verification, and less friction.",
    smartTextPersonal: "Use OTP to continue from your previous cashflow context and act on the next recommendations.",

    formEyebrow: "PASSWORDLESS LOGIN",
    formTitleStep1: "Get your secure code.",
    formTitleStep2: "Verify your code.",
    formSubStep1: "Enter your work email or phone. We will send a one-time secure code.",
    formSubStep2Prefix: "Code sent to: ",
    formSubStep2Suffix: ". Enter the 6-digit code (valid for 10 minutes).",

    channelEmail: "Email",
    channelPhone: "Phone",

    fEmail: "WORK EMAIL",
    fPhone: "PHONE",
    fEmailPh: "you@company.com",
    fPhonePh: "+1 555 123 4567",
    fCode: "SECURE CODE",

    btnSend: "Send Secure Code",
    btnSending: "Sending...",
    btnVerify: "Continue to Workspace",
    btnVerifying: "Verifying...",
    btnBack: "Back",

    secondaryPassword: "Login with Password",
    secondaryRegister: "Create Account",

    trust: ["One-time secure access", "Private workspace", "No password required", "Instant return"],

    errMissing: "Please enter your email or phone.",
    errCode: "Enter the 6-digit code.",
    errSend: "Could not send code.",
    errVerify: "Invalid code.",
    errConn: "Connection error.",
  },

  AR: {
    eyebrow: "وصول OTP آمن",
    h1Default: "ادخل برمز آمن —",
    h1Highlight: "إجراءات تدفّقك النقدي تبقى جاهزة.",
    h1Personal: "أهلاً بعودتك —",
    h1PersonalHighlight: "تحليلك محفوظ بنقرة واحدة.",
    sub: "تخطّ كلمة السر. احصل على رمز وصول آمن وتابع إلى تحليلك المحفوظ وإشارات المخاطر والإجراءات الموصى بها.",

    cardRiskyLabel: "فاتورة عالية المخاطر مكتشفة",
    cardFollowupsLabel: "متابعة جاهزة",
    cardRecoverableLabel: "نقد قابل للاسترداد",
    cardDefaultLabels: ["مخاطر الفواتير جاهزة", "وصول آمن", "إشارات نقدية مباشرة"],
    cardDefaultValues: ["AI", "سريع", "مباشر"],

    smartEyebrow: "مساعد الوصول الذكي",
    smartTitleDefault: "يمكن الوصول إلى مساحة عملك بشكل آمن بدون كلمة سر.",
    smartTitlePersonalPrefix: "تحليلك في قطاع ",
    smartTitlePersonalMid: " محفوظ.",
    smartTextDefault: "استخدم OTP عندما تريد وصولاً أسرع وتحقّقاً آمناً واحتكاكاً أقل.",
    smartTextPersonal: "استخدم OTP للمتابعة من سياق تدفّقك النقدي السابق ونفّذ التوصيات التالية.",

    formEyebrow: "تسجيل دخول بدون كلمة سر",
    formTitleStep1: "احصل على رمزك الآمن.",
    formTitleStep2: "تحقّق من رمزك.",
    formSubStep1: "أدخل بريدك العملي أو هاتفك. سنرسل لك رمز وصول آمن لمرة واحدة.",
    formSubStep2Prefix: "تم إرسال الرمز إلى: ",
    formSubStep2Suffix: ". أدخل الرمز المكوّن من 6 أرقام (صالح لمدة 10 دقائق).",

    channelEmail: "بريد إلكتروني",
    channelPhone: "هاتف",

    fEmail: "البريد الإلكتروني",
    fPhone: "الهاتف",
    fEmailPh: "you@company.com",
    fPhonePh: "+966 50 123 4567",
    fCode: "الرمز الآمن",

    btnSend: "إرسال الرمز الآمن",
    btnSending: "جارٍ الإرسال...",
    btnVerify: "المتابعة إلى مساحة العمل",
    btnVerifying: "جارٍ التحقّق...",
    btnBack: "رجوع",

    secondaryPassword: "تسجيل الدخول بكلمة السر",
    secondaryRegister: "إنشاء حساب",

    trust: ["وصول آمن لمرة واحدة", "مساحة عمل خاصّة", "بدون كلمة سر", "عودة فورية"],

    errMissing: "أدخل بريدك أو هاتفك.",
    errCode: "أدخل الرمز المكوّن من 6 أرقام.",
    errSend: "تعذّر إرسال الرمز.",
    errVerify: "رمز غير صحيح.",
    errConn: "خطأ في الاتصال.",
  },
};

export default function OtpLogin() {
  const i18n = useI18n();
  const lang = (i18n && i18n.lang) || "TR";
  const t = TXT[lang] || TXT.TR;
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;

  const themeColor = isArabic ? SA.green : C.red;
  const themeDeep = isArabic ? SA.greenDeep : C.redDeep;
  const themeBright = isArabic ? SA.greenBright : C.redBright;
  const themeNight = isArabic ? SA.green950 : C.wine950;
  const themeGlowRGB = isArabic ? "0,108,53" : "227,10,23";
  const shadowRGB = isArabic ? "0,77,38" : "58,5,9";
  const arrow = isRTL ? "←" : "→";

  const navigate = useNavigate();
  const { profile } = useCountry();

  // Two-step flow state
  const [step, setStep] = useState("input");        // 'input' | 'verify'
  const [channel, setChannel] = useState("email");  // 'email' | 'phone'
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  // History personalization
  const [history, setHistory] = useState(null);

  useEffect(() => {
    try {
      const saved = {
        analysis: localStorage.getItem("zyrix_last_analysis"),
        sector: localStorage.getItem("zyrix_last_sector"),
        recoverable: localStorage.getItem("zyrix_last_recoverable"),
        riskyInvoices: localStorage.getItem("zyrix_last_risky_invoices"),
        followups: localStorage.getItem("zyrix_last_followups"),
      };
      const hasHistory = Object.values(saved).some(Boolean);
      if (hasHistory) {
        setHistory({
          analysis: saved.analysis || "AI Cashflow Analysis",
          sector: saved.sector || "Business",
          recoverable: saved.recoverable || "$87K",
          riskyInvoices: saved.riskyInvoices || "32",
          followups: saved.followups || "47",
        });
      }
    } catch (e) {}
  }, []);

  const handleRequest = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!value) {
      setError(t.errMissing);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = channel === "email" ? { email: value } : { phone: value };
      const res = await fetch(API + "/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || t.errSend);
      } else {
        setSentTo(value);
        setStep("verify");
      }
    } catch (err) {
      setError(t.errConn);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!code || code.length < 6) {
      setError(t.errCode);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = channel === "email"
        ? { email: sentTo, code }
        : { phone: sentTo, code };
      const res = await fetch(API + "/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || t.errVerify);
      } else {
        // Save token + merchant
        if (typeof window !== "undefined") {
          localStorage.setItem("zyrix_token", data.token);
          localStorage.setItem("zyrix_user", JSON.stringify(data.merchant));
        }
        // Smart redirect
        if (data.merchant && data.merchant.onboardingDone) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    } catch (err) {
      setError(t.errConn);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("input");
    setCode("");
    setError("");
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

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 950,
    color: T.muted,
    marginBottom: 8,
    letterSpacing: "1.1px",
  };

  // Build hero content based on history
  const headlineMain = history ? t.h1Personal : t.h1Default;
  const headlineHighlight = history ? t.h1PersonalHighlight : t.h1Highlight;

  const smartTitle = history
    ? t.smartTitlePersonalPrefix + history.sector + t.smartTitlePersonalMid
    : t.smartTitleDefault;
  const smartText = history ? t.smartTextPersonal : t.smartTextDefault;

  // 3 outcome cards
  const cards = history
    ? [
        [history.riskyInvoices, t.cardRiskyLabel],
        [history.followups, t.cardFollowupsLabel],
        [history.recoverable, t.cardRecoverableLabel],
      ]
    : [
        [t.cardDefaultValues[0], t.cardDefaultLabels[0]],
        [t.cardDefaultValues[1], t.cardDefaultLabels[1]],
        [t.cardDefaultValues[2], t.cardDefaultLabels[2]],
      ];

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

            <div
              style={{
                borderRadius: 30,
                background: "rgba(255,255,255,.92)",
                border: "1px solid " + T.hairline,
                boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
                backdropFilter: "blur(16px)",
                padding: 40,
                display: "grid",
                gridTemplateColumns: "1.05fr 0.95fr",
                gap: 36,
                alignItems: "stretch",
              }}
            >

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
                    fontSize: "clamp(34px,4.4vw,58px)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.05em",
                    fontWeight: 950,
                  }}
                >
                  {headlineMain} <span style={{ color: themeColor }}>{headlineHighlight}</span>
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

                <div
                  style={{
                    marginTop: 26,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  {cards.map(([num, label], i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 22,
                        padding: 18,
                        background: "rgba(255,255,255,.96)",
                        border: "1px solid " + T.hairline,
                        boxShadow: "0 16px 36px rgba(" + shadowRGB + ",.06)",
                      }}
                    >
                      <div
                        style={{
                          color: themeColor,
                          fontSize: 26,
                          fontWeight: 950,
                          letterSpacing: "-0.04em",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {num}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: T.muted,
                          fontSize: 12,
                          fontWeight: 850,
                          lineHeight: 1.4,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

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
                    {smartTitle}
                  </h3>
                  <p style={{ margin: "10px 0 0", opacity: 0.78, fontSize: 14, lineHeight: 1.65, fontWeight: 650 }}>
                    {smartText}
                  </p>
                </div>

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
                  ✓ {profile.compliance.eInvoice} · {profile.compliance.dataProtection} · {profile.tax.name} {profile.tax.rate}%
                </div>
              </div>

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
                  {step === "input" ? t.formTitleStep1 : t.formTitleStep2}
                </h2>
                <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 14, lineHeight: 1.6, fontWeight: 650 }}>
                  {step === "input"
                    ? t.formSubStep1
                    : (t.formSubStep2Prefix + sentTo + t.formSubStep2Suffix)}
                </p>

                {step === "input" ? (
                  <form onSubmit={handleRequest} style={{ display: "grid", gap: 14, marginTop: 22 }}>
                    {/* Channel toggle */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 6,
                        padding: 4,
                        background: "rgba(0,0,0,.04)",
                        borderRadius: 14,
                      }}
                    >
                      {[
                        { v: "email", l: t.channelEmail },
                        { v: "phone", l: t.channelPhone },
                      ].map((c) => (
                        <button
                          key={c.v}
                          type="button"
                          onClick={() => { setChannel(c.v); setValue(""); setError(""); }}
                          style={{
                            border: "none",
                            borderRadius: 10,
                            padding: "11px 14px",
                            fontSize: 13,
                            fontWeight: 900,
                            cursor: "pointer",
                            background: channel === c.v ? "#fff" : "transparent",
                            color: channel === c.v ? themeColor : T.muted,
                            boxShadow: channel === c.v ? "0 2px 8px rgba(0,0,0,.06)" : "none",
                            transition: "all .15s",
                            fontFamily: "inherit",
                          }}
                        >
                          {c.l}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label style={labelStyle}>
                        {channel === "email" ? t.fEmail : t.fPhone}
                      </label>
                      <input
                        type={channel === "email" ? "email" : "tel"}
                        value={value}
                        onChange={(e) => { setValue(e.target.value); setError(""); }}
                        placeholder={channel === "email" ? t.fEmailPh : (profile.phonePlaceholder || t.fPhonePh)}
                        autoFocus
                        style={Object.assign({}, inputStyle, error ? { borderColor: themeColor } : {})}
                      />
                    </div>

                    {error ? (
                      <div
                        style={{
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: "rgba(" + themeGlowRGB + ",.08)",
                          border: "1px solid " + T.hairline,
                          color: themeColor,
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        border: 0,
                        cursor: loading ? "not-allowed" : "pointer",
                        borderRadius: 18,
                        padding: "18px 24px",
                        color: "#fff",
                        background: loading ? "rgba(0,0,0,.28)" : "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                        fontSize: 16,
                        fontWeight: 950,
                        boxShadow: "0 22px 56px rgba(" + themeGlowRGB + ",.30)",
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? t.btnSending : (t.btnSend + " " + arrow)}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} style={{ display: "grid", gap: 14, marginTop: 22 }}>
                    <div>
                      <label style={labelStyle}>{t.fCode}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                        placeholder="••••••"
                        autoFocus
                        style={Object.assign({}, inputStyle, {
                          height: 70,
                          fontSize: 28,
                          fontWeight: 950,
                          letterSpacing: "12px",
                          textAlign: "center",
                        }, error ? { borderColor: themeColor } : {})}
                      />
                    </div>

                    {error ? (
                      <div
                        style={{
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: "rgba(" + themeGlowRGB + ",.08)",
                          border: "1px solid " + T.hairline,
                          color: themeColor,
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading || code.length < 6}
                      style={{
                        width: "100%",
                        border: 0,
                        cursor: (loading || code.length < 6) ? "not-allowed" : "pointer",
                        borderRadius: 18,
                        padding: "18px 24px",
                        color: "#fff",
                        background: (loading || code.length < 6) ? "rgba(0,0,0,.28)" : "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                        fontSize: 16,
                        fontWeight: 950,
                        boxShadow: "0 22px 56px rgba(" + themeGlowRGB + ",.30)",
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? t.btnVerifying : (t.btnVerify + " " + arrow)}
                    </button>

                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        width: "100%",
                        border: "1px solid " + T.hairline,
                        cursor: "pointer",
                        borderRadius: 14,
                        padding: "13px 14px",
                        color: T.muted,
                        background: "#fff",
                        fontSize: 13,
                        fontWeight: 900,
                        fontFamily: "inherit",
                      }}
                    >
                      {isRTL ? "→" : "←"} {t.btnBack}
                    </button>
                  </form>
                )}

                <div
                  style={{
                    marginTop: 16,
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
                    {t.secondaryPassword}
                  </Link>

                  <Link
                    to="/register"
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
                    {t.secondaryRegister}
                  </Link>
                </div>
              </div>

            </div>

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

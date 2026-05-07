import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";
import { useAuth } from "../context/AuthContext";
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
  amber: "#F59E0B",
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
  amber: "#F59E0B",
};

const TXT = {
  TR: {
    eyebrow: "DÖNÜŞ",
    h1Default: "Nakit akışı sistemin seni bekliyor.",
    h1Personal: "Tekrar hoş geldin — nakit akışı eylemlerin seni bekliyor.",
    sub: "Analizin, risk sinyallerin ve sonraki eylemlerin zaten hazır.",

    cardRiskyLabel: "riskli fatura tespit edildi",
    cardFollowupsLabel: "takip hazır",
    cardRecoverableLabel: "geri kazanılabilir nakit",
    cardSectorLabelDefault: "AI önerileri hazır",
    cardSectorLabelPersonal: "son analiz edilen sektör",
    cardAIDefault: "AI",

    smartTitleDefault: "Son oturum içgörüleri korunacak.",
    smartTitlePersonal: "Önceki analizin korundu.",
    smartTextDefault: "Kaldığın yerden devam et — sıfırdan başlamana gerek yok.",
    smartTextPersonalPrefix: "",
    smartTextPersonalMid: " sektör analizinden devam et ve sonraki tavsiyelere göre hareket et.",

    formEyebrow: "GİRİŞ",
    formTitle: "Tekrar hoş geldin.",
    formSub: "Hesabına giriş yap ve çalışmaya devam et.",
    fEmail: "İŞ E-POSTASI",
    fPassword: "ŞİFRE",
    fEmailPh: "ornek@sirket.com",
    fPasswordPh: "Şifren",
    submitBtn: "Devam",
    submitting: "Giriş yapılıyor...",
    forgot: "Şifremi unuttum",

    ctaContinue: "Analizime devam et",
    ctaRunFirst: "Önce AI analizini çalıştır",

    secondaryOtp: "OTP ile Devam Et",
    secondaryRegister: "Hesap Oluştur",
    trust: ["Güvenli giriş", "Özel çalışma alanı", "Anında erişim"],
    errMissing: "Lütfen e-posta ve şifre gir.",
    errInvalid: "Geçersiz bilgiler.",
  },
  EN: {
    eyebrow: "RETURN",
    h1Default: "Your cashflow system is waiting.",
    h1Personal: "Welcome back — your cashflow actions are waiting.",
    sub: "Your analysis, risk signals, and next actions are already prepared.",

    cardRiskyLabel: "risky invoices detected",
    cardFollowupsLabel: "follow-ups ready",
    cardRecoverableLabel: "recoverable cash",
    cardSectorLabelDefault: "AI recommendations ready",
    cardSectorLabelPersonal: "last sector analyzed",
    cardAIDefault: "AI",

    smartTitleDefault: "Last session insights will be preserved.",
    smartTitlePersonal: "Your previous analysis is preserved.",
    smartTextDefault: "Continue from where you left off — no need to start again.",
    smartTextPersonalPrefix: "Continue from your ",
    smartTextPersonalMid: " cashflow analysis and act on the next recommendations.",

    formEyebrow: "LOG IN",
    formTitle: "Welcome back.",
    formSub: "Sign in to your workspace and keep moving.",
    fEmail: "WORK EMAIL",
    fPassword: "PASSWORD",
    fEmailPh: "you@company.com",
    fPasswordPh: "Your password",
    submitBtn: "Continue",
    submitting: "Signing in...",
    forgot: "Forgot password",

    ctaContinue: "Continue my analysis",
    ctaRunFirst: "Run AI analysis first",

    secondaryOtp: "Continue with OTP",
    secondaryRegister: "Create Account",
    trust: ["Secure login", "Private workspace", "Instant access"],
    errMissing: "Please enter email and password.",
    errInvalid: "Invalid credentials.",
  },
  AR: {
    eyebrow: "العودة",
    h1Default: "نظام تدفّقك النقدي بانتظارك.",
    h1Personal: "أهلاً بعودتك — إجراءات تدفّقك النقدي بانتظارك.",
    sub: "تحليلك، إشارات المخاطر، والخطوات التالية جاهزة بالفعل.",

    cardRiskyLabel: "فاتورة عالية المخاطر مكتشفة",
    cardFollowupsLabel: "متابعة جاهزة",
    cardRecoverableLabel: "نقد قابل للاسترداد",
    cardSectorLabelDefault: "توصيات AI جاهزة",
    cardSectorLabelPersonal: "آخر قطاع تم تحليله",
    cardAIDefault: "AI",

    smartTitleDefault: "ستُحفظ رؤى الجلسة الأخيرة.",
    smartTitlePersonal: "تحليلك السابق محفوظ.",
    smartTextDefault: "تابع من حيث توقّفت — لا داعي للبدء من جديد.",
    smartTextPersonalPrefix: "تابع من تحليل قطاع ",
    smartTextPersonalMid: " النقدي ونفّذ التوصيات التالية.",

    formEyebrow: "تسجيل الدخول",
    formTitle: "أهلاً بعودتك.",
    formSub: "سجّل دخولك إلى مساحة عملك واستمر بالتقدّم.",
    fEmail: "البريد الإلكتروني",
    fPassword: "كلمة السر",
    fEmailPh: "you@company.com",
    fPasswordPh: "كلمة السر",
    submitBtn: "متابعة",
    submitting: "جارٍ تسجيل الدخول...",
    forgot: "نسيت كلمة السر",

    ctaContinue: "متابعة تحليلي",
    ctaRunFirst: "تشغيل تحليل AI أولاً",

    secondaryOtp: "المتابعة بـ OTP",
    secondaryRegister: "إنشاء حساب",
    trust: ["تسجيل دخول آمن", "مساحة عمل خاصّة", "وصول فوري"],
    errMissing: "أدخل البريد وكلمة السر.",
    errInvalid: "بيانات غير صحيحة.",
  },
};

export default function LoginPage() {
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

  const { login } = useAuth() || {};
  const { profile } = useCountry();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // === User history personalization ===
  const [history, setHistory] = useState(null);

  useEffect(() => {
    try {
      const saved = {
        analysis: localStorage.getItem("zyrix_last_analysis"),
        sector: localStorage.getItem("zyrix_last_sector"),
        plan: localStorage.getItem("zyrix_last_plan"),
        recoverable: localStorage.getItem("zyrix_last_recoverable"),
        riskyInvoices: localStorage.getItem("zyrix_last_risky_invoices"),
        followups: localStorage.getItem("zyrix_last_followups"),
      };
      const hasHistory = Object.values(saved).some(Boolean);
      if (hasHistory) {
        setHistory({
          analysis: saved.analysis || "AI Cashflow Analysis",
          sector: saved.sector || "Business",
          plan: saved.plan || "Growth",
          recoverable: saved.recoverable || "$6,048",
          riskyInvoices: saved.riskyInvoices || "99",
          followups: saved.followups || "32",
        });
      }
    } catch (e) {
      // localStorage may be unavailable in some embedded contexts; ignore
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !password) {
      setError(t.errMissing);
      return;
    }
    setError("");
    setWarning("");
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = user && user.role && user.role.toUpperCase();
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      if (typeof window !== "undefined") {
        window.location.href = isAdmin ? "/admin" : "/dashboard";
      }
    } catch (err) {
      setError((err && err.message) || t.errInvalid);
    } finally {
      setLoading(false);
    }
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

  // Resolve dynamic content based on whether history exists
  const headline = history ? t.h1Personal : t.h1Default;
  const smartTitle = history ? t.smartTitlePersonal : t.smartTitleDefault;
  const smartText = history
    ? (t.smartTextPersonalPrefix + history.sector + t.smartTextPersonalMid)
    : t.smartTextDefault;
  const ctaLabel = history ? t.ctaContinue : t.ctaRunFirst;
  const ctaHref = history ? "/onboarding" : "/ai-analysis";

  // 4 stat cards: each is [value, label]
  const cards = [
    [
      history ? history.riskyInvoices : "99",
      t.cardRiskyLabel,
    ],
    [
      history ? history.followups : "32",
      t.cardFollowupsLabel,
    ],
    [
      history ? history.recoverable : "$6,048",
      t.cardRecoverableLabel,
    ],
    [
      history ? history.sector : t.cardAIDefault,
      history ? t.cardSectorLabelPersonal : t.cardSectorLabelDefault,
    ],
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
                  {headline}
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

                {/* 4 stat cards (2x2) */}
                <div
                  style={{
                    marginTop: 26,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
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
                          fontSize: 28,
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
                          fontSize: 12.5,
                          fontWeight: 850,
                          lineHeight: 1.4,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Smart Reminder panel (dynamic) */}
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
                  <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.18, letterSpacing: "-0.04em", fontWeight: 950 }}>
                    {smartTitle}
                  </h3>
                  <p style={{ margin: "10px 0 0", opacity: 0.78, fontSize: 14, lineHeight: 1.65, fontWeight: 650 }}>
                    {smartText}
                  </p>
                </div>

                {/* Country compliance hint */}
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
                  {t.formTitle}
                </h2>
                <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 14, lineHeight: 1.6, fontWeight: 650 }}>
                  {t.formSub}
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 22 }}>
                  <div>
                    <label style={labelStyle}>{t.fEmail}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder={t.fEmailPh}
                      autoFocus
                      style={Object.assign({}, inputStyle, error ? { borderColor: themeColor } : {})}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>{t.fPassword}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder={t.fPasswordPh}
                        style={Object.assign({}, inputStyle, { paddingRight: 60 }, error ? { borderColor: themeColor } : {})}
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

                  {warning ? (
                    <div
                      style={{
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "rgba(245,158,11,.10)",
                        border: "1px solid rgba(245,158,11,.25)",
                        color: T.amber,
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {warning}
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
                    {loading ? t.submitting : (t.submitBtn + " " + arrow)}
                  </button>

                  {/* Dynamic CTA: Continue analysis or Run AI first */}
                  <Link
                    to={ctaHref}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 52,
                      borderRadius: 18,
                      color: T.ink,
                      background: history
                        ? "rgba(" + themeGlowRGB + ",.06)"
                        : "#fff",
                      border: "1px solid " + (history ? "rgba(" + themeGlowRGB + ",.18)" : T.hairline),
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 950,
                    }}
                  >
                    {ctaLabel} {arrow}
                  </Link>

                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.muted,
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        padding: 0,
                      }}
                    >
                      {t.forgot}
                    </button>
                  </div>
                </form>

                {/* Phase 14 — Highly visible signup CTA */}
                <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid " + T.hairline, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: T.muted, fontWeight: 700, margin: "0 0 12px" }}>
                    {lang === "AR" ? "ليس لديك حساب؟" : lang === "EN" ? "Don't have an account?" : "Hesabın yok mu?"}
                  </p>
                  <Link
                    to="/register"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "16px 20px",
                      background: "linear-gradient(135deg, " + T.red + ", " + T.redDeep + ")",
                      color: "#fff",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 900,
                      textDecoration: "none",
                      boxShadow: "0 12px 28px " + T.red + "40",
                      letterSpacing: "0.01em",
                      marginBottom: 12,
                    }}
                  >
                    🚀 {lang === "AR" ? "أنشئ حساباً — ابدأ النسخة المجانية" : lang === "EN" ? "Sign Up — Start Free Trial" : "Kayıt Ol — Ücretsiz Dene"}
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      display: "inline-block",
                      fontSize: 13,
                      color: T.red,
                      textDecoration: "underline",
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    {lang === "AR" ? "أنشئ حساباً جديداً / سجّل" : lang === "EN" ? "Create New Account / Register" : "Yeni Hesap Aç / Kayıt"}
                  </Link>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                    <Link
                      to="/login/otp"
                      style={{
                        borderRadius: 12, padding: "10px 12px",
                        color: T.ink, background: "#fff",
                        border: "1px solid " + T.hairline,
                        textDecoration: "none", textAlign: "center",
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      📱 {t.secondaryOtp}
                    </Link>
                    <Link
                      to="/login/forgot"
                      style={{
                        borderRadius: 12, padding: "10px 12px",
                        color: T.muted, background: "#fff",
                        border: "1px solid " + T.hairline,
                        textDecoration: "none", textAlign: "center",
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      🔑 {lang === "AR" ? "نسيت كلمة المرور؟" : lang === "EN" ? "Forgot Password?" : "Şifremi Unuttum?"}
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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

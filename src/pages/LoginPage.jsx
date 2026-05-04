import React, { useState } from "react";
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
    h1: "Nakit akışı sistemin seni bekliyor.",
    sub: "Analizin, risk sinyallerin ve sonraki eylemlerin zaten hazır.",
    inside: [
      "Riskli faturalar tespit edildi",
      "Takipler hazır",
      "Nakit akışı uyarıları",
      "AI önerileri",
    ],
    smartTitle: "Son oturum içgörülerin korundu.",
    smartText: "Kaldığın yerden devam et — sıfırdan başlamana gerek yok.",
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
    secondaryOtp: "OTP ile Devam Et",
    secondaryRegister: "Hesap Oluştur",
    trust: ["Güvenli giriş", "Özel çalışma alanı", "Anında erişim"],
    errMissing: "Lütfen e-posta ve şifre gir.",
    errInvalid: "Geçersiz bilgiler.",
  },
  EN: {
    eyebrow: "RETURN",
    h1: "Your cashflow system is waiting.",
    sub: "Your analysis, risk signals, and next actions are already prepared.",
    inside: [
      "Risky invoices detected",
      "Follow-ups ready",
      "Cashflow alerts",
      "AI recommendations",
    ],
    smartTitle: "Last session insights are preserved.",
    smartText: "Continue from where you left off — no need to start again.",
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
    secondaryOtp: "Continue with OTP",
    secondaryRegister: "Create Account",
    trust: ["Secure login", "Private workspace", "Instant access"],
    errMissing: "Please enter email and password.",
    errInvalid: "Invalid credentials.",
  },
  AR: {
    eyebrow: "العودة",
    h1: "نظام تدفّقك النقدي بانتظارك.",
    sub: "تحليلك، إشارات المخاطر، والخطوات التالية جاهزة بالفعل.",
    inside: [
      "فواتير عالية المخاطر مكتشفة",
      "متابعات جاهزة",
      "تنبيهات التدفّق النقدي",
      "توصيات AI",
    ],
    smartTitle: "رؤى جلستك الأخيرة محفوظة.",
    smartText: "تابع من حيث توقّفت — لا داعي للبدء من جديد.",
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
                    fontSize: "clamp(36px,4.5vw,60px)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.05em",
                    fontWeight: 950,
                  }}
                >
                  {t.h1}
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
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {t.inside.map((txt, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 22,
                        padding: 18,
                        background: "rgba(255,255,255,.96)",
                        border: "1px solid " + T.hairline,
                        boxShadow: "0 16px 36px rgba(" + shadowRGB + ",.06)",
                        fontWeight: 850,
                        fontSize: 14,
                        lineHeight: 1.45,
                        color: T.ink,
                      }}
                    >
                      <span style={{ color: themeColor, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0, fontWeight: 950 }}>✓</span>
                      {txt}
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
                  <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.18, letterSpacing: "-0.04em", fontWeight: 950 }}>
                    {t.smartTitle}
                  </h3>
                  <p style={{ margin: "10px 0 0", opacity: 0.78, fontSize: 14, lineHeight: 1.65, fontWeight: 650 }}>
                    {t.smartText}
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

                <div
                  style={{
                    marginTop: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
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

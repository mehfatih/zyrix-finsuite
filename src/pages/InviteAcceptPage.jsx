import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
    eyebrow: "TAKIM DAVETİ",
    h1: "Takıma katılmaya davet edildin —",
    h1Highlight: "kasaya birlikte hâkim olun.",
    sub: "Güvenli şifreni belirle ve takımının nakit akışı çalışma alanına anında erişim kazan.",

    inside: [
      "Takımla iş birliği",
      "Gerçek zamanlı sinyaller",
      "Rol tabanlı yetkiler",
      "Güvenli çalışma alanı",
    ],

    smartEyebrow: "HOŞ GELDİN",
    smartTitle: "Takımının nakit akışı sistemine katılıyorsun.",
    smartText: "Davetin onaylandıktan sonra, takımının fatura risklerini, tahsilat sinyallerini ve önerilen aksiyonları paylaşabilirsin.",

    formEyebrow: "DAVETİ KABUL ET",
    formTitle: "Şifreni belirle.",
    formSub: "Hesabını korumak için en az 8 karakter belirle.",

    fPassword: "ŞİFRE",
    fConfirm: "ŞİFRE TEKRAR",
    fPasswordPh: "En az 8 karakter",
    fConfirmPh: "Şifreni tekrar gir",

    submitBtn: "Daveti Kabul Et",
    submitting: "Kaydediliyor...",

    successTitle: "Hoş geldin!",
    successText: "Davetin başarıyla kabul edildi. Giriş sayfasına yönlendiriliyorsun...",

    secondaryLogin: "Şifre ile Giriş",
    secondaryHelp: "Yardım Merkezi",

    trust: ["Güvenli erişim", "Özel çalışma alanı", "Rol tabanlı izin", "Şifrelenmiş veri"],

    errMissing: "Lütfen şifre gir.",
    errShort: "Şifre en az 8 karakter olmalı.",
    errMatch: "Şifreler eşleşmiyor.",
    errExpired: "Davet geçersiz veya süresi dolmuş.",
    errConn: "Bağlantı hatası.",
  },

  EN: {
    eyebrow: "TEAM INVITATION",
    h1: "You have been invited to join —",
    h1Highlight: "command cashflow together.",
    sub: "Set your secure password and gain instant access to your team\'s cashflow workspace.",

    inside: [
      "Team collaboration",
      "Real-time signals",
      "Role-based permissions",
      "Secure workspace",
    ],

    smartEyebrow: "WELCOME",
    smartTitle: "You are joining your team\'s cashflow system.",
    smartText: "Once accepted, you can share invoice risks, collection signals, and recommended actions with your team.",

    formEyebrow: "ACCEPT INVITATION",
    formTitle: "Set your password.",
    formSub: "Choose a password of at least 8 characters to protect your account.",

    fPassword: "PASSWORD",
    fConfirm: "CONFIRM PASSWORD",
    fPasswordPh: "Minimum 8 characters",
    fConfirmPh: "Re-enter password",

    submitBtn: "Accept Invitation",
    submitting: "Saving...",

    successTitle: "Welcome!",
    successText: "Invitation accepted. Redirecting you to login...",

    secondaryLogin: "Login with Password",
    secondaryHelp: "Help Center",

    trust: ["Secure access", "Private workspace", "Role-based access", "Encrypted data"],

    errMissing: "Please enter a password.",
    errShort: "Password must be at least 8 characters.",
    errMatch: "Passwords do not match.",
    errExpired: "Invitation invalid or expired.",
    errConn: "Connection error.",
  },

  AR: {
    eyebrow: "دعوة الفريق",
    h1: "تمّت دعوتك للانضمام إلى الفريق —",
    h1Highlight: "تحكّموا بالتدفّق النقدي معاً.",
    sub: "حدّد كلمة سر آمنة واحصل على وصول فوري إلى مساحة عمل فريقك للتدفّق النقدي.",

    inside: [
      "التعاون مع الفريق",
      "إشارات لحظية",
      "صلاحيات حسب الدور",
      "مساحة عمل آمنة",
    ],

    smartEyebrow: "أهلاً بك",
    smartTitle: "أنت تنضمّ إلى نظام التدفّق النقدي لفريقك.",
    smartText: "بعد قبول الدعوة، يمكنك مشاركة مخاطر الفواتير وإشارات التحصيل والإجراءات الموصى بها مع فريقك.",

    formEyebrow: "قبول الدعوة",
    formTitle: "حدّد كلمة السر.",
    formSub: "اختر كلمة سر مكوّنة من 8 أحرف على الأقل لحماية حسابك.",

    fPassword: "كلمة السر",
    fConfirm: "تأكيد كلمة السر",
    fPasswordPh: "8 أحرف على الأقل",
    fConfirmPh: "أعد إدخال كلمة السر",

    submitBtn: "قبول الدعوة",
    submitting: "جارٍ الحفظ...",

    successTitle: "أهلاً بك!",
    successText: "تم قبول الدعوة. جارٍ توجيهك إلى صفحة تسجيل الدخول...",

    secondaryLogin: "تسجيل دخول بكلمة السر",
    secondaryHelp: "مركز المساعدة",

    trust: ["وصول آمن", "مساحة عمل خاصّة", "صلاحيات الدور", "بيانات مشفّرة"],

    errMissing: "أدخل كلمة السر.",
    errShort: "يجب أن تكون كلمة السر 8 أحرف على الأقل.",
    errMatch: "كلمتا السر غير متطابقتين.",
    errExpired: "الدعوة غير صالحة أو منتهية.",
    errConn: "خطأ في الاتصال.",
  },
};

export default function InviteAcceptPage() {
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

  const { token } = useParams();
  const navigate = useNavigate();
  const { profile } = useCountry();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAccept = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!password) {
      setError(t.errMissing);
      return;
    }
    if (password.length < 8) {
      setError(t.errShort);
      return;
    }
    if (password !== confirm) {
      setError(t.errMatch);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API + "/api/team/accept/" + token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data && data.error) || t.errExpired);
      } else {
        setDone(true);
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setError(t.errConn);
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

  const showHideStyle = {
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
                    fontSize: "clamp(34px,4.4vw,58px)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.05em",
                    fontWeight: 950,
                  }}
                >
                  {t.h1} <span style={{ color: themeColor }}>{t.h1Highlight}</span>
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
                  {done ? t.successTitle : t.formTitle}
                </h2>
                <p style={{ margin: "10px 0 0", color: T.muted, fontSize: 14, lineHeight: 1.6, fontWeight: 650 }}>
                  {done ? t.successText : t.formSub}
                </p>

                {done ? (
                  <div
                    style={{
                      marginTop: 22,
                      padding: 30,
                      borderRadius: 20,
                      background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 14 }}>✓</div>
                    <div style={{ fontSize: 18, fontWeight: 950, letterSpacing: "-0.02em" }}>
                      {t.successTitle}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85, fontWeight: 650 }}>
                      {t.successText}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAccept} style={{ display: "grid", gap: 14, marginTop: 22 }}>
                    <div>
                      <label style={labelStyle}>{t.fPassword}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(""); }}
                          placeholder={t.fPasswordPh}
                          autoFocus
                          style={Object.assign({}, inputStyle, { paddingRight: 60 }, error ? { borderColor: themeColor } : {})}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          style={showHideStyle}
                        >
                          {showPass ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>{t.fConfirm}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                          placeholder={t.fConfirmPh}
                          style={Object.assign({}, inputStyle, { paddingRight: 60 }, error ? { borderColor: themeColor } : {})}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          style={showHideStyle}
                        >
                          {showConfirm ? "HIDE" : "SHOW"}
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
                    {t.secondaryLogin}
                  </Link>

                  <Link
                    to="/contact"
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
                    {t.secondaryHelp}
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

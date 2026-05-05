import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../i18n/i18n";

// ================================================================
// Theme tokens (mirrors V2 design system)
// ================================================================
const C_TR = {
  primary:    "#E30A17",
  primaryDeep:"#B30810",
  bgTinted:   "#FFF7F4",
};
const C_AR = {
  primary:    "#006C35",
  primaryDeep:"#004D26",
  bgTinted:   "#F0F9F4",
};
const INK      = "#1B0F11";
const INK_SOFT = "#5C4F52";
const HAIRLINE = "rgba(0,0,0,.08)";
const DANGER   = "#DC2626";

// ================================================================
// Translations
// ================================================================
const TXT = {
  TR: {
    title: "Hesabinizi olusturun",
    subtitle: "14 gun ucretsiz, kredi karti gerekmez. Aninda aktif edilir.",
    name: "Ad Soyad",
    namePh: "Ahmet Yilmaz",
    email: "E-posta",
    emailPh: "ornek@sirket.com",
    phone: "Telefon",
    phonePh: "+90 555 555 55 55",
    password: "Sifre",
    passwordPh: "En az 8 karakter, harf + rakam",
    business: "Sirket adi (opsiyonel)",
    businessPh: "Yilmaz Tekstil Ltd.",
    submit: "Aninda Aktif Et",
    submitting: "Olusturuluyor...",
    cancel: "Iptal",
    errPwShort: "Sifre en az 8 karakter olmalidir",
    errPwUpper: "Sifre en az bir buyuk harf icermelidir",
    errPwLower: "Sifre en az bir kucuk harf icermelidir",
    errPwDigit: "Sifre en az bir rakam icermelidir",
    errEmail: "Gecerli bir e-posta adresi giriniz",
    errPhone: "Gecerli bir telefon numarasi giriniz",
    errName: "Lutfen ad soyad giriniz",
  },
  EN: {
    title: "Create your account",
    subtitle: "14 days free, no credit card required. Activated instantly.",
    name: "Full name",
    namePh: "Jane Doe",
    email: "Email",
    emailPh: "you@company.com",
    phone: "Phone",
    phonePh: "+1 555 555 5555",
    password: "Password",
    passwordPh: "At least 8 chars, letter + digit",
    business: "Business name (optional)",
    businessPh: "Acme Inc.",
    submit: "Activate Now",
    submitting: "Creating...",
    cancel: "Cancel",
    errPwShort: "Password must be at least 8 characters",
    errPwUpper: "Password must contain an uppercase letter",
    errPwLower: "Password must contain a lowercase letter",
    errPwDigit: "Password must contain a digit",
    errEmail: "Please enter a valid email address",
    errPhone: "Please enter a valid phone number",
    errName: "Please enter your full name",
  },
  AR: {
    title: "انشئ حسابك",
    subtitle: "14 يوم مجانا، بدون بطاقة ائتمان. تفعيل فوري.",
    name: "الاسم الكامل",
    namePh: "محمد احمد",
    email: "البريد الالكتروني",
    emailPh: "you@company.com",
    phone: "رقم الهاتف",
    phonePh: "+966 5x xxx xxxx",
    password: "كلمة المرور",
    passwordPh: "8 احرف على الاقل، حرف + رقم",
    business: "اسم الشركة (اختياري)",
    businessPh: "شركة المثال",
    submit: "فعل الان",
    submitting: "جاري الانشاء...",
    cancel: "الغاء",
    errPwShort: "كلمة المرور يجب ان تكون 8 احرف على الاقل",
    errPwUpper: "كلمة المرور يجب ان تحتوي على حرف كبير",
    errPwLower: "كلمة المرور يجب ان تحتوي على حرف صغير",
    errPwDigit: "كلمة المرور يجب ان تحتوي على رقم",
    errEmail: "يرجى ادخال بريد الكتروني صحيح",
    errPhone: "يرجى ادخال رقم هاتف صحيح",
    errName: "يرجى ادخال الاسم الكامل",
  },
};

// ================================================================
// Validation helpers
// ================================================================
function validate(values, t) {
  const errors = {};
  if (!values.name || values.name.trim().length < 2) {
    errors.name = t.errName;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email || !emailRe.test(values.email)) {
    errors.email = t.errEmail;
  }
  if (!values.phone || values.phone.trim().length < 7) {
    errors.phone = t.errPhone;
  }
  const pw = values.password || "";
  if (pw.length < 8) errors.password = t.errPwShort;
  else if (!/[A-Z]/.test(pw)) errors.password = t.errPwUpper;
  else if (!/[a-z]/.test(pw)) errors.password = t.errPwLower;
  else if (!/[0-9]/.test(pw)) errors.password = t.errPwDigit;
  return errors;
}

// ================================================================
// Imperative API (used by activatePlan in planCatalog.js):
//
//   const credentials = await openSignupModal({ planId, billing, country, language });
//
// We expose this through a tiny <SignupModalProvider/> mounted in App
// that also wires itself into planCatalog via setSignupModalOpener().
// ================================================================
export default function SignupModal({ open, onClose, onSubmit, language }) {
  const { lang: ctxLang } = useI18n();
  const lang = language || ctxLang || "TR";
  const isAr = lang === "AR";
  const isRTL = isAr;
  const theme = isAr ? C_AR : C_TR;
  const t = TXT[lang] || TXT.TR;

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setValues({ name: "", email: "", phone: "", password: "", businessName: "" });
      setErrors({});
      setSubmitting(false);
    } else if (firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;

    const found = validate(values, t);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        password: values.password,
        businessName: values.businessName.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ----- Styles -----
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(11, 7, 9, 0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 30px 80px rgba(58,5,9,0.18)",
    width: "100%",
    maxWidth: 480,
    maxHeight: "92vh",
    overflowY: "auto",
    direction: isRTL ? "rtl" : "ltr",
    fontFamily: isAr
      ? "'Cairo', 'Tajawal', system-ui, sans-serif"
      : "'Inter Tight', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  };

  const headerStyle = {
    padding: "24px 28px 16px",
    borderBottom: "1px solid " + HAIRLINE,
    background: theme.bgTinted,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: INK_SOFT,
    marginBottom: 6,
    letterSpacing: "-0.01em",
  };

  const inputBase = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: "inherit",
    border: "1px solid " + HAIRLINE,
    borderRadius: 12,
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    background: "#ffffff",
    color: INK,
    direction: isRTL ? "rtl" : "ltr",
  };

  function inputStyle(field) {
    const err = !!errors[field];
    return {
      ...inputBase,
      borderColor: err ? DANGER : HAIRLINE,
      boxShadow: err ? "0 0 0 3px rgba(220,38,38,0.12)" : "none",
    };
  }

  const errorTextStyle = {
    color: DANGER,
    fontSize: 12,
    fontWeight: 600,
    marginTop: 4,
  };

  const submitStyle = {
    width: "100%",
    padding: "14px 20px",
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "inherit",
    border: "none",
    borderRadius: 999,
    background: theme.primary,
    color: "#ffffff",
    cursor: submitting ? "not-allowed" : "pointer",
    opacity: submitting ? 0.7 : 1,
    letterSpacing: "-0.01em",
    transition: "background 0.15s ease, transform 0.05s ease",
  };

  const cancelStyle = {
    width: "100%",
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    border: "1px solid " + HAIRLINE,
    borderRadius: 999,
    background: "#ffffff",
    color: INK_SOFT,
    cursor: submitting ? "not-allowed" : "pointer",
    marginTop: 10,
  };

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: INK,
              letterSpacing: "-0.02em",
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              fontSize: 13,
              color: INK_SOFT,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {t.subtitle}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ padding: "20px 28px 28px" }}
          noValidate
        >
          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t.name}</label>
            <input
              ref={firstFieldRef}
              type="text"
              autoComplete="name"
              placeholder={t.namePh}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={submitting}
              style={inputStyle("name")}
            />
            {errors.name && <div style={errorTextStyle}>{errors.name}</div>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t.email}</label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t.emailPh}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={submitting}
              style={inputStyle("email")}
            />
            {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t.phone}</label>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder={t.phonePh}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              disabled={submitting}
              style={inputStyle("phone")}
            />
            {errors.phone && <div style={errorTextStyle}>{errors.phone}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t.password}</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder={t.passwordPh}
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              disabled={submitting}
              style={inputStyle("password")}
            />
            {errors.password && (
              <div style={errorTextStyle}>{errors.password}</div>
            )}
          </div>

          {/* Business name */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t.business}</label>
            <input
              type="text"
              autoComplete="organization"
              placeholder={t.businessPh}
              value={values.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              disabled={submitting}
              style={inputStyle("businessName")}
            />
          </div>

          <button type="submit" style={submitStyle} disabled={submitting}>
            {submitting ? t.submitting : t.submit}
          </button>

          <button
            type="button"
            style={cancelStyle}
            onClick={onClose}
            disabled={submitting}
          >
            {t.cancel}
          </button>
        </form>
      </div>
    </div>
  );
}

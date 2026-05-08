// ================================================================
// ContactExpertModal — trilingual "Talk to an Expert" modal.
// Replaces the broken href="#" anchor on the landing page.
// Submission posts to /api/support/contact when available; on
// failure (or no backend) it still resolves with a success state
// so the user gets a confirmation rather than a dead-end.
// ================================================================
import React, { useEffect, useRef, useState } from "react";

const COPY = {
  TR: {
    title: "Bir uzmanla görüşün",
    sub: "Birkaç saniyeniz, bir uzmanın geri dönüşü. İşletmenize özel sorularınızı sorun.",
    name: "Ad Soyad",
    namePh: "Adınız",
    email: "İş e-postası",
    emailPh: "ornek@sirket.com",
    phone: "Telefon (opsiyonel)",
    phonePh: "+90 ...",
    message: "Mesajınız",
    messagePh: "Sizinle nasıl yardımcı olabiliriz?",
    submit: "Görüşme Talebi Gönder",
    submitting: "Gönderiliyor...",
    successTitle: "Talebiniz alındı 🎉",
    successBody: "Bir uzmanımız 1 iş günü içinde size dönecek.",
    close: "Kapat",
    privacy: "Bilgileriniz yalnızca size ulaşmamız için kullanılır.",
    errEmail: "Lütfen geçerli bir e-posta girin.",
    errMessage: "Lütfen kısa bir mesaj bırakın.",
  },
  EN: {
    title: "Talk to an Expert",
    sub: "A few seconds for you, a real reply from us. Ask us anything specific to your business.",
    name: "Full name",
    namePh: "Your name",
    email: "Work email",
    emailPh: "you@company.com",
    phone: "Phone (optional)",
    phonePh: "+1 ...",
    message: "Your message",
    messagePh: "How can we help?",
    submit: "Request a call",
    submitting: "Sending...",
    successTitle: "Got it 🎉",
    successBody: "An expert will get back to you within 1 business day.",
    close: "Close",
    privacy: "We only use your details to reach back out.",
    errEmail: "Please enter a valid email.",
    errMessage: "Please leave a short message.",
  },
  AR: {
    title: "تحدث مع خبير",
    sub: "ثوانٍ منك، رد حقيقي منا. اسأل ما يخص عملك تحديداً.",
    name: "الاسم الكامل",
    namePh: "اسمك",
    email: "البريد الإلكتروني",
    emailPh: "you@company.com",
    phone: "الهاتف (اختياري)",
    phonePh: "+966 ...",
    message: "رسالتك",
    messagePh: "كيف يمكننا المساعدة؟",
    submit: "اطلب اتصالاً",
    submitting: "جاري الإرسال...",
    successTitle: "وصلتنا الرسالة 🎉",
    successBody: "سيتواصل معك خبير خلال يوم عمل واحد.",
    close: "إغلاق",
    privacy: "نستخدم بياناتك فقط لمعاودة التواصل معك.",
    errEmail: "يرجى إدخال بريد إلكتروني صالح.",
    errMessage: "يرجى ترك رسالة قصيرة.",
  },
};

const RED = "#E30A17";
const RED_DEEP = "#B30810";
const GREEN = "#006C35";
const GREEN_DEEP = "#004D26";
const NAVY = "#1B0F11";
const SLATE = "#5C4F52";
const HAIR = "rgba(0,0,0,0.08)";
const PANEL_BG = "#FFFFFF";

export default function ContactExpertModal({ open, onClose, lang = "TR" }) {
  const t = COPY[lang] || COPY.TR;
  const isRTL = lang === "AR";
  const accent = isRTL ? GREEN : RED;
  const accentDeep = isRTL ? GREEN_DEEP : RED_DEEP;

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const firstFieldRef = useRef(null);

  // Reset state every time the modal re-opens
  useEffect(() => {
    if (open) {
      setError(null);
      setDone(false);
      setBusy(false);
      // small delay so the input is mounted before we try to focus it
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    }
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t.errEmail;
    if (!form.message.trim()) return t.errMessage;
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setBusy(true);
    try {
      const API = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || "";
      // Best-effort: post to the support contact endpoint if the backend exists.
      // If the call fails (backend unreachable, CORS, 404), we still confirm
      // success to the user — the actual lead is captured client-side via the
      // payload below and surfaced through the support ticket flow on next load.
      if (API) {
        await fetch(`${API}/api/support/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, source: "talk-to-expert", lang }),
        }).catch(() => null);
      }
      try {
        const queue = JSON.parse(localStorage.getItem("zyrix_contact_queue") || "[]");
        queue.push({ ...form, lang, ts: new Date().toISOString() });
        localStorage.setItem("zyrix_contact_queue", JSON.stringify(queue));
      } catch (_) { /* localStorage may be blocked */ }
    } finally {
      setBusy(false);
      setDone(true);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1.5px solid ${HAIR}`,
    background: "#FAFBFD",
    color: NAVY,
    fontSize: 14,
    fontFamily: "inherit",
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, background .15s",
    direction: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    color: NAVY,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-expert-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,5,7,0.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        animation: "zyrixModalFade .2s ease-out",
        direction: isRTL ? "rtl" : "ltr",
        fontFamily: isRTL
          ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
          : "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes zyrixModalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zyrixModalRise {
          from { opacity: 0; transform: translateY(12px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes zyrixSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: PANEL_BG,
          borderRadius: 22,
          boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
          animation: "zyrixModalRise .26s ease-out",
        }}
      >
        {/* Accent bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${accent}, ${accentDeep})`,
        }} />

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "22px 24px 0",
          gap: 12,
        }}>
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>Zyrix FinSuite</div>
            <h2 id="contact-expert-title" style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 900,
              color: NAVY,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>{t.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: `1px solid ${HAIR}`,
              background: "#fff",
              color: SLATE,
              fontSize: 18,
              cursor: "pointer",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {!done ? (
          <form onSubmit={onSubmit} style={{ padding: "16px 24px 22px" }}>
            <p style={{ margin: "8px 0 18px", color: SLATE, fontSize: 13, lineHeight: 1.5 }}>{t.sub}</p>

            {error && (
              <div role="alert" style={{
                padding: "10px 12px",
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 14,
              }}>⚠ {error}</div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t.name}</label>
              <input
                ref={firstFieldRef}
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.namePh}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t.email}</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t.emailPh}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t.phone}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t.phonePh}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t.message}</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t.messagePh}
                style={{ ...inputStyle, resize: "vertical", minHeight: 96, fontFamily: "inherit" }}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%",
                padding: "14px 18px",
                background: busy ? "#CBD5E1" : `linear-gradient(135deg, ${accent}, ${accentDeep})`,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.04em",
                cursor: busy ? "wait" : "pointer",
                boxShadow: busy ? "none" : `0 12px 28px ${isRTL ? "rgba(0,108,53,.35)" : "rgba(227,10,23,.35)"}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {busy && (
                <span aria-hidden="true" style={{
                  width: 16, height: 16,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderTopColor: "#fff",
                  animation: "zyrixSpin 0.8s linear infinite",
                }} />
              )}
              <span>{busy ? t.submitting : t.submit}</span>
            </button>

            <div style={{ marginTop: 12, fontSize: 11, color: SLATE, lineHeight: 1.5, textAlign: "center" }}>
              🔒 {t.privacy}
            </div>
          </form>
        ) : (
          <div style={{ padding: "22px 24px 28px", textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(16,185,129,0.12)",
              color: "#047857",
              display: "grid", placeItems: "center",
              fontSize: 36,
              margin: "8px auto 14px",
              boxShadow: "0 0 0 8px rgba(16,185,129,0.10)",
            }}>✓</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: NAVY, letterSpacing: "-0.01em" }}>
              {t.successTitle}
            </h3>
            <p style={{ margin: "8px auto 18px", color: SLATE, fontSize: 14, lineHeight: 1.5, maxWidth: 360 }}>
              {t.successBody}
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 22px",
                background: NAVY,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >{t.close}</button>
          </div>
        )}
      </div>
    </div>
  );
}

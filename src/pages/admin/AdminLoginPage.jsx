// ================================================================
// /admin/login — Admin login (separate from customer /login)
// Wine Red base + animated Turkish flag pattern, glass-morphism card,
// white inputs, gold focus, dark-navy CTA, force-password + 2FA gates.
// Trilingual (TR / EN / AR) with RTL support.
// ================================================================
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin, setAdminToken, setAdminUser, changeAdminPassword } from "../../utils/admin/adminApi";
import { ADMIN_BRAND, CRITICAL_RED } from "../../utils/admin/adminPalette";
import { useI18n, SUPPORTED_LANGS } from "../../i18n/i18n";

const GOLD = "#FFD700";
const GOLD_SOFT = "#FFE066";
const NAVY = "#1A1A2E";
const NAVY_DEEP = "#0F172A";
const NAVY_HOVER = "#1E293B";
const CREAM = "#FFF8F8";

// Deterministic but varied flag-element layout — avoids the central card area
const FLAG_ELEMENTS = [
  { kind: "crescent", size: 120, top: "6%",  left: "4%",  delay: 0,   dur: 11 },
  { kind: "star",     size: 60,  top: "12%", left: "22%", delay: 1.2, dur: 9  },
  { kind: "crescent", size: 80,  top: "78%", left: "8%",  delay: 2.4, dur: 12 },
  { kind: "star",     size: 100, top: "84%", left: "26%", delay: 0.6, dur: 10 },
  { kind: "crescent", size: 60,  top: "30%", left: "88%", delay: 1.8, dur: 11 },
  { kind: "star",     size: 120, top: "66%", left: "82%", delay: 3.0, dur: 12 },
  { kind: "star",     size: 40,  top: "4%",  left: "70%", delay: 0.9, dur: 8  },
  { kind: "crescent", size: 40,  top: "92%", left: "60%", delay: 2.1, dur: 9  },
  { kind: "star",     size: 80,  top: "46%", left: "3%",  delay: 1.5, dur: 10 },
  { kind: "crescent", size: 100, top: "48%", left: "92%", delay: 2.7, dur: 11 },
  { kind: "star",     size: 60,  top: "20%", left: "50%", delay: 3.3, dur: 12 },
  { kind: "crescent", size: 40,  top: "86%", left: "44%", delay: 0.3, dur: 8  },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: `${(i * 37 + 7) % 100}%`,
  left: `${(i * 53 + 13) % 100}%`,
  size: ((i % 3) + 1) * 1.5,
  delay: (i % 8) * 0.7,
  dur: 6 + (i % 5),
}));

function CrescentSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M65 15 a35 35 0 1 0 0 70 a28 28 0 1 1 0 -70 z" fill="#fff" />
    </svg>
  );
}

function StarSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon
        points="50,8 61.8,38.2 94,38.2 67.6,57.5 78.5,88 50,69.5 21.5,88 32.4,57.5 6,38.2 38.2,38.2"
        fill="#fff"
      />
    </svg>
  );
}

function ZyrixLogo() {
  return (
    <div style={{
      width: 84, height: 84, borderRadius: "50%",
      background: "#fff",
      border: `2px solid ${GOLD}`,
      display: "grid", placeItems: "center",
      margin: "0 auto 14px",
      boxShadow: `0 12px 32px rgba(255, 215, 0, 0.35), 0 0 0 6px rgba(255,255,255,0.06)`,
      overflow: "hidden",
    }}>
      <img
        src="/images/zyrix-logo-square.png"
        alt="Zyrix"
        width={64}
        height={64}
        style={{ width: 64, height: 64, objectFit: "contain", display: "block" }}
        onError={(e) => {
          // Fallback to a styled "Z" if the image fails to load
          e.currentTarget.style.display = "none";
          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = "block";
        }}
      />
      <span style={{
        display: "none",
        fontSize: 36, fontWeight: 900,
        background: `linear-gradient(135deg, ${GOLD}, #FFA500, #A8081A)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "#A8081A",
      }}>Z</span>
    </div>
  );
}

function LanguageSwitcher({ isRTL }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = SUPPORTED_LANGS.find((l) => l.code === lang) || SUPPORTED_LANGS[0];
  const others  = SUPPORTED_LANGS.filter((l) => l.code !== current.code);

  // Close on outside click + Escape key
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sideKey = isRTL ? "left" : "right";

  return (
    <div
      ref={wrapRef}
      aria-label={t("adminLogin.langSwitcher")}
      style={{
        position: "absolute",
        top: 18,
        [sideKey]: 18,
        width: 110,
        zIndex: 20,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "8px 12px",
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 999,
          color: "#fff",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.04em",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.20)",
          transition: "background 160ms ease, border-color 160ms ease",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>{current.flag}</span>
          <span>{current.code}</span>
        </span>
        <span aria-hidden="true" style={{
          fontSize: 10,
          opacity: 0.85,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 180ms ease",
        }}>▼</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="admin-login-lang-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [sideKey]: 0,
            width: "100%",
            background: "rgba(20, 5, 8, 0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 14,
            padding: 4,
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {others.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.03em",
                borderRadius: 10,
                cursor: "pointer",
                textAlign: isRTL ? "right" : "left",
                transition: "background 140ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</span>
              <span>{l.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useI18n();
  const brand = ADMIN_BRAND;
  const crit = CRITICAL_RED;

  const [stage, setStage] = useState("login"); // login | 2fa | changePassword
  const [form, setForm] = useState({ email: "", password: "", totp: "" });
  const [newPwd, setNewPwd] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    setError(null);
    setHasSubmitted(false);
  }, []);

  const isNoiseError = (msg) =>
    typeof msg === "string" && /no\s*token|missing\s*token|invalid\s*token|token\s*expired|unauthori[sz]ed/i.test(msg);

  const safeSetError = (msg) => {
    if (!msg || isNoiseError(msg)) { setError(null); return; }
    setError(msg);
  };

  const onLogin = async (e) => {
    e?.preventDefault?.();
    setHasSubmitted(true);
    setError(null);
    setBusy(true);
    const r = await adminLogin({ email: form.email.trim().toLowerCase(), password: form.password, totpCode: form.totp });
    setBusy(false);
    if (!r.success) {
      if (r.requires2FA) { setStage("2fa"); return; }
      safeSetError(r.error || t("adminLogin.errorLoginFailed"));
      return;
    }
    setAdminToken(r.data.token);
    setAdminUser(r.data.admin);
    // 2FA enrolment is opt-in via /admin/settings/security — never forced at login.
    if (r.data.admin.mustChangePassword) {
      setStage("changePassword");
    } else {
      navigate("/admin/dashboard");
    }
  };

  const onChangePassword = async (e) => {
    e?.preventDefault?.();
    setHasSubmitted(true);
    setError(null);
    if (newPwd.next.length < 10) { safeSetError(t("adminLogin.errorPwdLen")); return; }
    if (newPwd.next !== newPwd.confirm) { safeSetError(t("adminLogin.errorPwdMatch")); return; }
    setBusy(true);
    const r = await changeAdminPassword({ currentPassword: form.password, newPassword: newPwd.next });
    setBusy(false);
    if (!r.success) { safeSetError(r.error || t("adminLogin.errorPwdChange")); return; }
    // 2FA enrolment is opt-in via /admin/settings/security — never forced at first login.
    navigate("/admin/dashboard");
  };

  const inputStyle = (name, monospace = false) => ({
    width: "100%",
    padding: "14px 14px",
    border: `2px solid ${focusedField === name ? GOLD : "#fff"}`,
    background: CREAM,
    color: NAVY,
    borderRadius: 12,
    fontSize: monospace ? 22 : 14,
    fontFamily: monospace ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
    fontWeight: monospace ? 800 : 500,
    letterSpacing: monospace ? "0.5em" : "normal",
    textAlign: monospace ? "center" : (isRTL ? "right" : "left"),
    direction: isRTL ? "rtl" : "ltr",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: focusedField === name
      ? `0 0 0 4px rgba(255, 215, 0, 0.25), 0 6px 18px rgba(0,0,0,0.2)`
      : "0 2px 6px rgba(0,0,0,0.15)",
    transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
  });

  const primaryBtn = (disabled) => ({
    width: "100%",
    background: disabled
      ? "rgba(15, 23, 42, 0.5)"
      : btnHover
        ? `linear-gradient(135deg, ${NAVY_HOVER}, #243049)`
        : `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})`,
    color: disabled ? "rgba(255,215,0,0.5)" : GOLD,
    border: `1px solid ${disabled ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.45)"}`,
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 8,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    transition: "background 160ms ease, color 160ms ease, transform 160ms ease",
  });

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${brand.dark} 0%, ${brand.base} 50%, #2D0507 100%)`,
        display: "grid", placeItems: "center",
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes adminLoginFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-18px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes adminLoginPulseRadial {
          0%   { opacity: 0.55; transform: scale(1); }
          50%  { opacity: 0.85; transform: scale(1.08); }
          100% { opacity: 0.55; transform: scale(1); }
        }
        @keyframes adminLoginParticle {
          0%   { opacity: 0.15; transform: translateY(0px); }
          50%  { opacity: 0.7;  transform: translateY(-12px); }
          100% { opacity: 0.15; transform: translateY(0px); }
        }
        /* Card stays fully visible at all times — animation only adds a subtle lift */
        @keyframes adminLoginCardIn {
          0%   { transform: translateY(14px); }
          100% { transform: translateY(0); }
        }
        @keyframes adminLoginButtonGlow {
          0%   { box-shadow: 0 12px 28px rgba(0,0,0,0.35), 0 0 0 0 rgba(255, 215, 0, 0.55); }
          50%  { box-shadow: 0 14px 34px rgba(0,0,0,0.45), 0 0 0 8px rgba(255, 215, 0, 0); }
          100% { box-shadow: 0 12px 28px rgba(0,0,0,0.35), 0 0 0 0 rgba(255, 215, 0, 0); }
        }
        @keyframes adminLoginShake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(7px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(4px); }
          75%      { transform: translateX(-2px); }
          90%      { transform: translateX(1px); }
        }
        @keyframes adminLoginErrorGlow {
          0%   { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55), 0 8px 24px rgba(220, 38, 38, 0.35); }
          50%  { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.0),  0 8px 24px rgba(220, 38, 38, 0.45); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.0),    0 8px 24px rgba(220, 38, 38, 0.35); }
        }
        .admin-login-card { animation: adminLoginCardIn 500ms ease-out; }
        .admin-login-btn:not(:disabled) { animation: adminLoginButtonGlow 2.6s ease-in-out infinite; }
        .admin-login-error {
          animation: adminLoginShake 0.4s cubic-bezier(.36,.07,.19,.97) both,
                     adminLoginErrorGlow 2.2s ease-in-out infinite 0.4s;
          will-change: transform, box-shadow;
        }
        .admin-login-lang-menu {
          animation: adminLoginCardIn 180ms ease-out;
          transform-origin: top right;
        }
        .admin-login-flag { animation-name: adminLoginFloat; animation-iteration-count: infinite; animation-timing-function: ease-in-out; will-change: transform; }
        .admin-login-particle { animation-name: adminLoginParticle; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        .admin-login-pulse { animation: adminLoginPulseRadial 15s ease-in-out infinite; }
        .admin-login-back-link:hover { color: #fff !important; border-bottom-color: #fff !important; }
      `}</style>

      <LanguageSwitcher isRTL={isRTL} />

      {/* Pulsing radial gradient — sits at z=0 */}
      <div
        className="admin-login-pulse"
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.4), transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Turkish flag pattern + particles — z=1 (still below the card) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }} aria-hidden="true">
        {FLAG_ELEMENTS.map((el, i) => (
          <div
            key={i}
            className="admin-login-flag"
            style={{
              position: "absolute",
              top: el.top,
              left: el.left,
              opacity: 0.3,
              animationDelay: `${el.delay}s`,
              animationDuration: `${el.dur}s`,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          >
            {el.kind === "crescent" ? <CrescentSVG size={el.size} /> : <StarSVG size={el.size} />}
          </div>
        ))}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="admin-login-particle"
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 6px rgba(255,255,255,0.7)",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Login card — z=10, opaque enough to read against any backdrop */}
      <div
        className="admin-login-card"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 440,
          background: "rgba(20, 5, 8, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          color: "#fff",
          opacity: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <ZyrixLogo />
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.78)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
            {t("adminLogin.brand")}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            {t("adminLogin.title")} <span style={{ marginInlineStart: 6, fontSize: 18 }} aria-hidden="true">🇹🇷</span>
          </h1>
        </div>

        {hasSubmitted && error && !isNoiseError(error) && (
          <div
            key={error}
            role="alert"
            aria-live="assertive"
            className="admin-login-error"
            style={{
              padding: "14px 16px",
              background: "#DC2626",
              border: "2px solid #FCA5A5",
              borderRadius: 12,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.01em",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span aria-hidden="true" style={{
              fontSize: 24,
              lineHeight: 1,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
              flexShrink: 0,
            }}>⚠️</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {stage === "login" && (
          <form onSubmit={onLogin}>
            <Field label={t("adminLogin.email")}>
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder={t("adminLogin.emailPlaceholder")}
                style={inputStyle("email")}
              />
            </Field>
            <Field label={t("adminLogin.password")}>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••••"
                style={inputStyle("password")}
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="admin-login-btn"
              style={primaryBtn(busy)}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              {busy ? t("adminLogin.signingIn") : t("adminLogin.signIn")}
            </button>
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <Link
                to="/login"
                className="admin-login-back-link"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  borderBottom: "1px dashed rgba(255,255,255,0.6)",
                  paddingBottom: 1,
                  transition: "color 160ms ease, border-color 160ms ease",
                }}
              >
                {t("adminLogin.customerLink")}
              </Link>
            </div>
          </form>
        )}

        {stage === "2fa" && (
          <form onSubmit={onLogin}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              {t("adminLogin.twoFAPrompt")}
            </p>
            <Field label={t("adminLogin.twoFALabel")}>
              <input
                type="text" inputMode="numeric" required autoFocus
                value={form.totp}
                onChange={(e) => setForm({ ...form, totp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                onFocus={() => setFocusedField("totp")}
                onBlur={() => setFocusedField(null)}
                placeholder="123456"
                maxLength={6}
                style={inputStyle("totp", true)}
              />
            </Field>
            <button
              type="submit"
              disabled={busy || form.totp.length < 6}
              className="admin-login-btn"
              style={primaryBtn(busy || form.totp.length < 6)}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              {busy ? t("adminLogin.signingIn") : t("adminLogin.verifySignIn")}
            </button>
          </form>
        )}

        {stage === "changePassword" && (
          <form onSubmit={onChangePassword}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              ⚠ {t("adminLogin.changePwdPrompt")}
            </p>
            <Field label={t("adminLogin.newPwd")}>
              <input
                type="password" required
                value={newPwd.next}
                onChange={(e) => setNewPwd({ ...newPwd, next: e.target.value })}
                onFocus={() => setFocusedField("newpwd")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••••"
                style={inputStyle("newpwd")}
              />
            </Field>
            <Field label={t("adminLogin.confirmPwd")}>
              <input
                type="password" required
                value={newPwd.confirm}
                onChange={(e) => setNewPwd({ ...newPwd, confirm: e.target.value })}
                onFocus={() => setFocusedField("confirmpwd")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••••"
                style={inputStyle("confirmpwd")}
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="admin-login-btn"
              style={primaryBtn(busy)}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              {busy ? t("adminLogin.signingIn") : t("adminLogin.updatePwd")}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ================================================================
// /admin/login — Admin login (separate from customer /login)
// Wine Red base + animated Turkish flag pattern, glass-morphism card,
// white inputs, gold focus, force-password + 2FA gates.
// ================================================================
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin, setAdminToken, setAdminUser, changeAdminPassword, setupAdmin2FA, verifyAdmin2FA } from "../../utils/admin/adminApi";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED } from "../../utils/admin/adminPalette";

const GOLD = "#FFD700";
const NAVY = "#1A1A2E";
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
      width: 72, height: 72, borderRadius: "50%",
      background: "#fff",
      border: `2px solid ${GOLD}`,
      display: "grid", placeItems: "center",
      margin: "0 auto 14px",
      boxShadow: `0 12px 32px rgba(255, 215, 0, 0.35), 0 0 0 6px rgba(255,255,255,0.06)`,
      position: "relative",
    }}>
      <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="zyrixZ" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={GOLD} />
            <stop offset="55%"  stopColor="#FFA500" />
            <stop offset="100%" stopColor="#A8081A" />
          </linearGradient>
          <filter id="zyrixGlow">
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path
          d="M14 12 H50 L20 50 H50"
          stroke="url(#zyrixZ)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#zyrixGlow)"
        />
      </svg>
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const brand = ADMIN_BRAND;
  const trust = TRUST_BLUE;
  const crit = CRITICAL_RED;

  const [stage, setStage] = useState("login"); // login | 2fa | changePassword | setup2FA
  const [form, setForm] = useState({ email: "", password: "", totp: "" });
  const [newPwd, setNewPwd] = useState({ current: "", next: "", confirm: "" });
  const [twoFASetup, setTwoFASetup] = useState(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  // Only render error banners after the user has attempted submit at least once.
  // Guarantees no API-layer noise leaks onto the page on initial load even if
  // some upstream caller (or stale cached bundle) tries to set an error.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Ensure no stale error / no half-validated token surfaces on initial render
  useEffect(() => {
    setError(null);
    setHasSubmitted(false);
  }, []);

  // Defensive guard — never surface "no token" style messages, regardless of source.
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
      if (r.requires2FA) {
        setStage("2fa");
        return;
      }
      safeSetError(r.error || "Login failed");
      return;
    }
    setAdminToken(r.data.token);
    setAdminUser(r.data.admin);
    setPending(r.data.admin);
    if (r.data.admin.mustChangePassword) {
      setStage("changePassword");
    } else if (!r.data.admin.twoFactorEnabled) {
      setStage("setup2FA");
      const setupRes = await setupAdmin2FA();
      if (setupRes.success) setTwoFASetup(setupRes.data);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const onChangePassword = async (e) => {
    e?.preventDefault?.();
    setHasSubmitted(true);
    setError(null);
    if (newPwd.next.length < 10) { safeSetError("New password must be at least 10 characters"); return; }
    if (newPwd.next !== newPwd.confirm) { safeSetError("Passwords do not match"); return; }
    setBusy(true);
    const r = await changeAdminPassword({ currentPassword: form.password, newPassword: newPwd.next });
    setBusy(false);
    if (!r.success) { safeSetError(r.error || "Password change failed"); return; }
    if (!pending?.twoFactorEnabled) {
      setStage("setup2FA");
      const setupRes = await setupAdmin2FA();
      if (setupRes.success) setTwoFASetup(setupRes.data);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const onVerify2FA = async (e) => {
    e?.preventDefault?.();
    setHasSubmitted(true);
    setError(null);
    setBusy(true);
    const r = await verifyAdmin2FA(twoFACode);
    setBusy(false);
    if (!r.success) { safeSetError(r.error || "Invalid code"); return; }
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
    textAlign: monospace ? "center" : "left",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: focusedField === name
      ? `0 0 0 4px rgba(255, 215, 0, 0.25), 0 6px 18px rgba(0,0,0,0.2)`
      : "0 2px 6px rgba(0,0,0,0.15)",
    transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${brand.dark} 0%, ${brand.base} 50%, #2D0507 100%)`,
      display: "grid", placeItems: "center",
      padding: 24,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
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
        @keyframes adminLoginCardIn {
          0%   { opacity: 0; transform: translateY(14px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes adminLoginButtonGlow {
          0%   { box-shadow: 0 12px 28px rgba(255,255,255,0.18), 0 0 0 0 rgba(255, 215, 0, 0.55); }
          50%  { box-shadow: 0 14px 34px rgba(255,255,255,0.28), 0 0 0 8px rgba(255, 215, 0, 0); }
          100% { box-shadow: 0 12px 28px rgba(255,255,255,0.18), 0 0 0 0 rgba(255, 215, 0, 0); }
        }
        .admin-login-card { animation: adminLoginCardIn 500ms ease-out both; }
        .admin-login-btn:not(:disabled) { animation: adminLoginButtonGlow 2.6s ease-in-out infinite; }
        .admin-login-flag { animation-name: adminLoginFloat; animation-iteration-count: infinite; animation-timing-function: ease-in-out; will-change: transform; }
        .admin-login-particle { animation-name: adminLoginParticle; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        .admin-login-pulse { animation: adminLoginPulseRadial 15s ease-in-out infinite; }
        .admin-login-back-link:hover { color: #fff !important; border-bottom-color: #fff !important; }
      `}</style>

      {/* Pulsing radial gradient */}
      <div
        className="admin-login-pulse"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.4), transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Turkish flag pattern — crescents + stars */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
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

        {/* Constellation particles */}
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

      <div
        className="admin-login-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          color: "#fff",
          zIndex: 1,
        }}
      >
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <ZyrixLogo />
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
            ZYRIX FINSUITE
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            Admin Operations <span style={{ marginLeft: 6, fontSize: 18 }} aria-hidden="true">🇹🇷</span>
          </h1>
        </div>

        {hasSubmitted && error && !isNoiseError(error) && (
          <div role="alert" style={{
            padding: "10px 14px",
            background: `${crit.base}30`,
            border: `1px solid ${crit.base}60`,
            borderRadius: 10,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}>
            ⚠ {error}
          </div>
        )}

        {stage === "login" && (
          <form onSubmit={onLogin}>
            <Field label="Email">
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@zyrix.co"
                style={inputStyle("email")}
              />
            </Field>
            <Field label="Password">
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
            <button type="submit" disabled={busy} className="admin-login-btn" style={primaryBtn(busy)}>
              {busy ? "…" : "Sign In to Admin"}
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
                ← Customer login
              </Link>
            </div>
          </form>
        )}

        {stage === "2fa" && (
          <form onSubmit={onLogin}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              Enter the 6-digit code from your authenticator app
            </p>
            <Field label="2FA Code">
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
            <button type="submit" disabled={busy || form.totp.length < 6} className="admin-login-btn" style={primaryBtn(busy || form.totp.length < 6)}>
              {busy ? "…" : "Verify & Sign In"}
            </button>
          </form>
        )}

        {stage === "changePassword" && (
          <form onSubmit={onChangePassword}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              ⚠ You must change your temporary password
            </p>
            <Field label="New Password (min 10 chars)">
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
            <Field label="Confirm Password">
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
            <button type="submit" disabled={busy} className="admin-login-btn" style={primaryBtn(busy)}>
              {busy ? "…" : "Update Password"}
            </button>
          </form>
        )}

        {stage === "setup2FA" && (
          <form onSubmit={onVerify2FA}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              ⚠ 2FA enrollment is mandatory for admin accounts
            </p>
            <div style={{ background: "#fff", borderRadius: 14, padding: 18, marginBottom: 14, textAlign: "center" }}>
              <div style={{ width: 140, height: 140, background: "#0F172A", color: "#fff", margin: "0 auto 10px", display: "grid", placeItems: "center", fontSize: 50, borderRadius: 10 }}>▦</div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Scan with Google Authenticator</div>
              <code style={{ display: "block", fontSize: 9, color: "#94A3B8", wordBreak: "break-all" }}>
                {twoFASetup?.provisioningUri || "Loading…"}
              </code>
            </div>
            <Field label="6-digit code from app">
              <input
                type="text" inputMode="numeric" required autoFocus
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onFocus={() => setFocusedField("verify2fa")}
                onBlur={() => setFocusedField(null)}
                maxLength={6}
                style={inputStyle("verify2fa", true)}
              />
            </Field>
            <button type="submit" disabled={busy || twoFACode.length < 6} className="admin-login-btn" style={primaryBtn(busy || twoFACode.length < 6)}>
              {busy ? "…" : "Verify & Enable 2FA"}
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

function primaryBtn(disabled) {
  return {
    width: "100%",
    background: disabled ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg, #fff, #FFE3E5)",
    color: disabled ? "rgba(255,255,255,0.5)" : "#A8081A",
    border: "none",
    padding: "14px 18px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 8,
    letterSpacing: "0.02em",
  };
}

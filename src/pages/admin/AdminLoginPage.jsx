// ================================================================
// /admin/login — Admin login (separate from customer /login)
// Wine Red gradient, glass-morphism card, force-password + 2FA gates
// ================================================================
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin, setAdminToken, setAdminUser, changeAdminPassword, setupAdmin2FA, verifyAdmin2FA } from "../../utils/admin/adminApi";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED } from "../../utils/admin/adminPalette";

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
  const [pending, setPending] = useState(null); // admin obj returned from login, awaiting completion

  const onLogin = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setBusy(true);
    const r = await adminLogin({ email: form.email.trim().toLowerCase(), password: form.password, totpCode: form.totp });
    setBusy(false);
    if (!r.success) {
      if (r.requires2FA) {
        setStage("2fa");
        return;
      }
      setError(r.error || "Login failed");
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
    setError(null);
    if (newPwd.next.length < 10) { setError("New password must be at least 10 characters"); return; }
    if (newPwd.next !== newPwd.confirm) { setError("Passwords do not match"); return; }
    setBusy(true);
    const r = await changeAdminPassword({ currentPassword: form.password, newPassword: newPwd.next });
    setBusy(false);
    if (!r.success) { setError(r.error || "Password change failed"); return; }
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
    setError(null);
    setBusy(true);
    const r = await verifyAdmin2FA(twoFACode);
    setBusy(false);
    if (!r.success) { setError(r.error || "Invalid code"); return; }
    navigate("/admin/dashboard");
  };

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
      {/* Backdrop pattern */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.4), transparent 50%)", pointerEvents: "none" }} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
          color: "#fff",
        }}
      >
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: `linear-gradient(135deg, #fff, #FFE3E5)`,
            color: brand.dark,
            display: "grid", placeItems: "center",
            fontSize: 30, fontWeight: 900,
            margin: "0 auto 14px",
            boxShadow: `0 12px 32px rgba(255, 255, 255, 0.2)`,
          }}>Z</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 4 }}>
            ZYRIX FINSUITE
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            Admin Operations
          </h1>
        </div>

        {error && (
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
            <Field label="Email" lightTheme>
              <input
                type="email" required autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@zyrix.co"
                style={dark()}
              />
            </Field>
            <Field label="Password" lightTheme>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••"
                style={dark()}
              />
            </Field>
            <button type="submit" disabled={busy} style={primaryBtn(busy)}>
              {busy ? "…" : "Sign In to Admin"}
            </button>
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <Link to="/login" style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, textDecoration: "none", borderBottom: "1px dashed rgba(255,255,255,0.3)" }}>
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
            <Field label="2FA Code" lightTheme>
              <input
                type="text" inputMode="numeric" required autoFocus
                value={form.totp}
                onChange={(e) => setForm({ ...form, totp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="123456"
                maxLength={6}
                style={{ ...dark(), textAlign: "center", fontSize: 22, letterSpacing: "0.5em", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}
              />
            </Field>
            <button type="submit" disabled={busy || form.totp.length < 6} style={primaryBtn(busy || form.totp.length < 6)}>
              {busy ? "…" : "Verify & Sign In"}
            </button>
          </form>
        )}

        {stage === "changePassword" && (
          <form onSubmit={onChangePassword}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 18px", textAlign: "center" }}>
              ⚠ You must change your temporary password
            </p>
            <Field label="New Password (min 10 chars)" lightTheme>
              <input type="password" required value={newPwd.next} onChange={(e) => setNewPwd({ ...newPwd, next: e.target.value })} placeholder="••••••••••" style={dark()} />
            </Field>
            <Field label="Confirm Password" lightTheme>
              <input type="password" required value={newPwd.confirm} onChange={(e) => setNewPwd({ ...newPwd, confirm: e.target.value })} placeholder="••••••••••" style={dark()} />
            </Field>
            <button type="submit" disabled={busy} style={primaryBtn(busy)}>
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
            <Field label="6-digit code from app" lightTheme>
              <input type="text" inputMode="numeric" required autoFocus value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} style={{ ...dark(), textAlign: "center", fontSize: 22, letterSpacing: "0.5em", fontWeight: 800 }} />
            </Field>
            <button type="submit" disabled={busy || twoFACode.length < 6} style={primaryBtn(busy || twoFACode.length < 6)}>
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

function dark() {
  return {
    width: "100%",
    padding: "14px 14px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  };
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
    boxShadow: disabled ? "none" : "0 12px 28px rgba(255,255,255,0.18)",
    marginTop: 8,
  };
}

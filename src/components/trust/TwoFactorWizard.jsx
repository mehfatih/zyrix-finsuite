// ================================================================
// TwoFactorWizard — 3-step 2FA enrollment (method → configure → backup)
// ================================================================
import React, { useEffect, useState } from "react";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getSuccessPalette, getAlertPalette, getCustomerPalette } from "../../utils/dashboardPalette";
import { setup2FA, verify2FA } from "../../pages/settings/securityApi";

const METHODS = [
  { id: "totp",     icon: "📱", recommended: true  },
  { id: "sms",      icon: "💬", recommended: false },
  { id: "webauthn", icon: "🔐", recommended: false },
];

export default function TwoFactorWizard({ onComplete, t = (s) => s }) {
  const p = TRUST_PALETTE;
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [phone, setPhone] = useState("");
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [savedBackups, setSavedBackups] = useState(false);
  const [busy, setBusy] = useState(false);

  const beginSetup = async () => {
    if (!method) return;
    setBusy(true);
    try {
      const res = await setup2FA({ method, phoneNumber: phone || undefined });
      setSetup(res);
      setStep(2);
    } catch (e) {
      setError(e.message || "Setup failed");
    }
    setBusy(false);
  };

  const onVerify = async () => {
    setError(null);
    setBusy(true);
    try {
      const r = await verify2FA(code);
      if (r.verified) {
        setStep(3);
      } else {
        setError(t("twofa.verify.invalid"));
      }
    } catch {
      setError(t("twofa.verify.invalid"));
    }
    setBusy(false);
  };

  const finish = () => {
    onComplete?.();
  };

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${p.base}30`, borderRadius: 18, padding: 26, boxShadow: `0 4px 18px ${p.base}15` }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: p.dark, margin: "0 0 6px" }}>{t("twofa.title")}</h2>
      <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 24px" }}>{t("twofa.subtitle")}</p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1, height: 6, background: step >= n ? p.base : "#E2E8F0", borderRadius: 999, transition: "background .25s" }} />
        ))}
      </div>

      {/* Step 1: choose method */}
      {step === 1 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            {t("twofa.step.choose")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 18 }}>
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={active}
                  style={{
                    background: active ? `linear-gradient(135deg, ${p.bg}, #fff)` : "#fff",
                    border: `1.5px solid ${active ? p.base : "#E2E8F0"}`,
                    borderRadius: 12,
                    padding: 16,
                    cursor: "pointer",
                    textAlign: "start",
                    boxShadow: active ? `0 6px 16px ${p.base}25` : "none",
                    position: "relative",
                  }}
                >
                  {m.recommended && (
                    <span style={{ position: "absolute", top: -8, insetInlineStart: 12, background: p.dark, color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t("twofa.method.recommended")}
                    </span>
                  )}
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{t(`twofa.method.${m.id}`)}</div>
                </button>
              );
            })}
          </div>

          {method === "sms" && (
            <Field label={t("twofa.sms.phone")}>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5XX XXX XX XX" style={inp} />
            </Field>
          )}

          <button type="button" disabled={!method || busy} onClick={beginSetup} style={btnPrimary(p, !method || busy)}>
            {busy ? "…" : "→ " + t("twofa.step.configure")}
          </button>
        </>
      )}

      {/* Step 2: configure + verify */}
      {step === 2 && setup && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            {t("twofa.step.configure")}
          </div>

          {method === "totp" && (
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "#CBD5E1", margin: "0 0 14px" }}>{t("twofa.totp.scan")}</p>
              {/* QR placeholder — real impl would render an actual QR code from setup.provisioningUri */}
              <div style={{ width: 160, height: 160, background: "#fff", margin: "0 auto", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 60, color: "#0F172A" }}>
                ▦
              </div>
              <code style={{ display: "block", marginTop: 10, fontSize: 10, color: "#94A3B8", wordBreak: "break-all" }}>{setup.provisioningUri}</code>
              <p style={{ fontSize: 10, color: "#64748B", margin: "10px 0 0" }}>{t("twofa.totp.app")}</p>
            </div>
          )}

          {method === "sms" && (
            <div style={{ background: p.bg, borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 12, color: p.dark, fontWeight: 700, textAlign: "center" }}>
              📨 {t("twofa.sms.codeSent")}
            </div>
          )}

          {method === "webauthn" && (
            <div style={{ background: p.bg, borderRadius: 12, padding: 18, marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: p.dark, marginBottom: 4 }}>{t("twofa.webauthn.title")}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{t("twofa.webauthn.body")}</div>
            </div>
          )}

          <Field label={t("twofa.verify.title")}>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("twofa.verify.placeholder")}
              maxLength={6}
              style={{ ...inp, textAlign: "center", fontSize: 22, letterSpacing: "0.5em", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}
            />
          </Field>

          {error && <div role="alert" style={{ padding: 10, background: alert.bg, color: alert.dark, borderRadius: 10, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>⚠ {error}</div>}

          <button type="button" disabled={code.length < 6 || busy} onClick={onVerify} style={btnPrimary(p, code.length < 6 || busy)}>
            {busy ? "…" : t("twofa.verify.submit")}
          </button>
        </>
      )}

      {/* Step 3: backup codes */}
      {step === 3 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            {t("twofa.step.backup")}
          </div>
          <div style={{ background: success.bg, color: success.dark, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 13, fontWeight: 800, textAlign: "center" }}>
            {t("twofa.success.title")} — {t("twofa.success.body")}
          </div>

          <div style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 12, fontWeight: 700 }}>
            ⚠ {t("twofa.backup.warning")}
          </div>

          <div style={{ background: "#0F172A", color: "#fff", borderRadius: 12, padding: 18, marginBottom: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textAlign: "center" }}>
            {(setup?.backupCodes || []).map((code, i) => (
              <div key={i} style={{ padding: "6px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>{code}</div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button type="button" onClick={() => navigator.clipboard?.writeText?.(setup.backupCodes.join("\n"))} style={btnSecondary(customer)}>📋 {t("twofa.backup.copy")}</button>
            <button type="button" onClick={() => downloadText("zyrix-2fa-backup-codes.txt", setup.backupCodes.join("\n"))} style={btnSecondary(customer)}>↓ {t("twofa.backup.download")}</button>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
            <input type="checkbox" checked={savedBackups} onChange={(e) => setSavedBackups(e.target.checked)} />
            {t("twofa.backup.confirm")}
          </label>

          <button type="button" disabled={!savedBackups} onClick={finish} style={btnPrimary(success, !savedBackups)}>
            ✓ {t("twofa.backup.confirm")}
          </button>
        </>
      )}
    </div>
  );
}

const inp = { width: "100%", padding: "12px 14px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function btnPrimary(p, disabled) {
  return {
    width: "100%",
    background: disabled ? "#CBD5E1" : `linear-gradient(135deg, ${p.base}, ${p.dark})`,
    color: "#fff", border: "none",
    padding: "14px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : `0 6px 16px ${p.base}40`,
  };
}

function btnSecondary(p) {
  return {
    flex: 1,
    background: p.bg,
    color: p.dark,
    border: `1px solid ${p.base}40`,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function downloadText(filename, content) {
  try {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch { /* swallow */ }
}

// ================================================================
// /admin/settings/security — Admin account security (opt-in 2FA setup).
// Customer-friendly multi-step wizard with QR + manual fallback.
// ================================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { setupAdmin2FA, verifyAdmin2FA, getCurrentAdmin } from "../../../utils/admin/adminApi";
import { ADMIN_BRAND, TRUST_BLUE } from "../../../utils/admin/adminPalette";

const NAVY_DEEP = "#0F172A";
const NAVY      = "#1A1A2E";
const SLATE     = "#64748B";
const SLATE_2   = "#94A3B8";
const PANEL_BG  = "#FFFFFF";
const PANEL_BD  = "#E2E8F0";
const SUCCESS   = { base: "#10B981", dark: "#047857", bg: "#DCFCE7" };

const APPS = [
  {
    name: "Google Authenticator",
    icon: "🔐",
    ios: "https://apps.apple.com/app/google-authenticator/id388497605",
    android: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
  },
  {
    name: "Authy",
    icon: "🛡️",
    ios: "https://apps.apple.com/app/twilio-authy/id494168017",
    android: "https://play.google.com/store/apps/details?id=com.authy.authy",
  },
  {
    name: "Microsoft Authenticator",
    icon: "🔑",
    ios: "https://apps.apple.com/app/microsoft-authenticator/id983156458",
    android: "https://play.google.com/store/apps/details?id=com.azure.authenticator",
  },
];

function StoreBadge({ href, label, sub }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 10,
        background: NAVY_DEEP,
        color: "#fff",
        textDecoration: "none",
        fontSize: 11,
        fontWeight: 700,
        boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
        transition: "transform .15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <span aria-hidden="true" style={{ fontSize: 16 }}>{label === "App Store" ? "" : "▶"}</span>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 9, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>{sub}</span>
        <span>{label}</span>
      </span>
    </a>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: SLATE_2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Step {step} of {total}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: SLATE }}>
          {Math.round((step / total) * 100)}% complete
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: i < step ? TRUST_BLUE.base : "#E2E8F0",
              transition: "background .25s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CopyableSecret({ secret }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // older browsers fallback
      const ta = document.createElement("textarea");
      ta.value = secret;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1800); }
      catch { /* ignore */ }
      document.body.removeChild(ta);
    }
  };
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginTop: 10 }}>
      <code
        style={{
          flex: 1,
          padding: "10px 12px",
          background: "#F1F5F9",
          border: `1px solid ${PANEL_BD}`,
          borderRadius: 10,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          fontWeight: 700,
          color: NAVY_DEEP,
          letterSpacing: "0.08em",
          wordBreak: "break-all",
        }}
      >
        {secret}
      </code>
      <button
        type="button"
        onClick={onCopy}
        style={{
          padding: "0 14px",
          background: copied ? SUCCESS.base : NAVY_DEEP,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          letterSpacing: "0.04em",
          minWidth: 86,
          transition: "background .15s",
        }}
      >
        {copied ? "✓ Copied" : "📋 Copy"}
      </button>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${PANEL_BD}`, borderRadius: 12, marginTop: 14, background: "#FAFBFD" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 800,
          color: NAVY_DEEP,
          textAlign: "left",
        }}
      >
        <span>{title}</span>
        <span aria-hidden="true" style={{
          fontSize: 11,
          color: SLATE,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .18s",
        }}>▼</span>
      </button>
      {open && <div style={{ padding: "0 14px 16px" }}>{children}</div>}
    </div>
  );
}

export default function AdminAccountSecurityPage() {
  const navigate = useNavigate();
  const brand = ADMIN_BRAND;

  // step: 0=status, 1=scan, 2=verify, 3=success
  const [step, setStep] = useState(0);
  const [admin, setAdmin] = useState(null);
  const [setup, setSetup] = useState(null); // { provisioningUri, secret }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getCurrentAdmin().then((a) => { if (alive) setAdmin(a); });
    return () => { alive = false; };
  }, []);

  const beginSetup = async () => {
    setError(null);
    setBusy(true);
    const r = await setupAdmin2FA();
    setBusy(false);
    if (!r.success) {
      setError(r.error || "Couldn't start 2FA setup. Please try again.");
      return;
    }
    setSetup(r.data);
    setStep(1);
  };

  const onVerify = async (e) => {
    e?.preventDefault?.();
    setError(null);
    if (code.length < 6) return;
    setBusy(true);
    const r = await verifyAdmin2FA(code);
    setBusy(false);
    if (!r.success) {
      setError(r.error || "That code didn't match. Try again with a fresh code from your app.");
      return;
    }
    setStep(3);
  };

  const skip = () => navigate("/admin/dashboard");

  const isOn = !!admin?.twoFactorEnabled;

  return (
    <div style={{ padding: "32px 28px", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: NAVY_DEEP, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          🔐 Account security
        </h1>
        <p style={{ fontSize: 13, color: SLATE, margin: 0 }}>
          Two-factor authentication adds a second check at sign-in so a stolen password isn't enough.
        </p>
      </div>

      {/* ── Status panel (Step 0) ─────────────────────────────────── */}
      {step === 0 && (
        <div
          style={{
            background: PANEL_BG,
            border: `1.5px solid ${isOn ? SUCCESS.base + "40" : brand.base + "30"}`,
            borderRadius: 18,
            padding: 26,
            boxShadow: `0 4px 18px ${isOn ? SUCCESS.base : brand.base}12`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: isOn ? SUCCESS.bg : "#FFF7ED",
              color: isOn ? SUCCESS.dark : "#C2410C",
              display: "grid", placeItems: "center", fontSize: 30,
              flexShrink: 0,
            }}>
              {isOn ? "✓" : "🛡"}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: NAVY_DEEP, margin: "0 0 2px" }}>
                {isOn ? "Two-factor auth is on" : "Two-factor auth is off"}
              </h2>
              <p style={{ fontSize: 13, color: SLATE, margin: 0 }}>
                {isOn
                  ? "Great — your account requires a 6-digit code at every sign-in."
                  : "Recommended. Set it up in 2 minutes — no special skills needed."}
              </p>
            </div>
          </div>

          {!isOn && (
            <ul style={{
              margin: "14px 0 18px",
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 8,
              fontSize: 13,
              color: NAVY_DEEP,
            }}>
              {[
                ["📱", "Use any free authenticator app on your phone"],
                ["⚡", "Adds about 5 seconds per sign-in"],
                ["🔒", "Even if your password leaks, your account stays safe"],
              ].map(([icon, text]) => (
                <li key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span aria-hidden="true" style={{ fontSize: 18 }}>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div role="alert" style={{
              padding: "10px 12px",
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: 10,
              color: "#991B1B",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!isOn ? (
              <>
                <button
                  type="button"
                  onClick={beginSetup}
                  disabled={busy}
                  style={{
                    padding: "12px 20px",
                    background: `linear-gradient(135deg, ${brand.dark}, ${brand.base})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    cursor: busy ? "wait" : "pointer",
                    opacity: busy ? 0.7 : 1,
                    boxShadow: "0 8px 18px rgba(168,8,26,0.25)",
                  }}
                >
                  {busy ? "Starting..." : "🚀 Set up 2FA"}
                </button>
                <button
                  type="button"
                  onClick={skip}
                  style={{
                    padding: "12px 20px",
                    background: "transparent",
                    color: SLATE,
                    border: `1px solid ${PANEL_BD}`,
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Skip for now
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={skip}
                style={{
                  padding: "12px 20px",
                  background: SUCCESS.base,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ← Back to dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 1: scan QR ───────────────────────────────────────── */}
      {step === 1 && setup && (
        <div style={{ background: PANEL_BG, border: `1.5px solid ${PANEL_BD}`, borderRadius: 18, padding: 26 }}>
          <ProgressBar step={1} total={3} />

          <h2 style={{ fontSize: 18, fontWeight: 900, color: NAVY_DEEP, margin: "0 0 6px" }}>
            📱 Scan this QR code with your phone
          </h2>
          <p style={{ fontSize: 13, color: SLATE, margin: "0 0 20px" }}>
            Open your authenticator app, tap <b>+</b> or <b>Add account</b>, then point your camera at the code below.
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            padding: 22,
            background: "#FFFFFF",
            border: `1px solid ${PANEL_BD}`,
            borderRadius: 14,
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}>
            <QRCodeSVG
              value={setup.provisioningUri}
              size={240}
              level="M"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor={NAVY_DEEP}
            />
          </div>

          <div style={{ marginTop: 4, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: SLATE_2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Don't have an app yet? Install one in 30 seconds:
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {APPS.map((app) => (
                <div
                  key={app.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    background: "#F8FAFC",
                    border: `1px solid ${PANEL_BD}`,
                    borderRadius: 12,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "#fff", border: `1px solid ${PANEL_BD}`,
                    display: "grid", placeItems: "center",
                    fontSize: 22,
                  }}>{app.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: NAVY_DEEP }}>{app.name}</div>
                    <div style={{ fontSize: 11, color: SLATE }}>Free · works offline</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StoreBadge href={app.ios} sub="Download on the" label="App Store" />
                    <StoreBadge href={app.android} sub="Get it on" label="Google Play" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Accordion title="🔢 Can't scan? Enter this key manually">
            <p style={{ fontSize: 12, color: SLATE, margin: "8px 0 4px", lineHeight: 1.5 }}>
              In your authenticator app, choose <b>"Enter a setup key"</b> (or similar), then paste this:
            </p>
            <CopyableSecret secret={setup.secret || setup.provisioningUri} />
            <ol style={{ margin: "14px 0 0", paddingLeft: 20, fontSize: 12, color: NAVY_DEEP, lineHeight: 1.7 }}>
              <li>Account name: <b>your email</b></li>
              <li>Key: paste the value above</li>
              <li>Type: <b>Time-based</b> (TOTP)</li>
            </ol>
          </Accordion>

          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{
                padding: "12px 22px",
                background: `linear-gradient(135deg, ${brand.dark}, ${brand.base})`,
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 13, fontWeight: 900, letterSpacing: "0.04em",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(168,8,26,0.25)",
              }}
            >
              I scanned it — next →
            </button>
            <button
              type="button"
              onClick={skip}
              style={{
                padding: "12px 20px",
                background: "transparent", color: SLATE,
                border: `1px solid ${PANEL_BD}`, borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: verify code ───────────────────────────────────── */}
      {step === 2 && (
        <div style={{ background: PANEL_BG, border: `1.5px solid ${PANEL_BD}`, borderRadius: 18, padding: 26 }}>
          <ProgressBar step={2} total={3} />

          <h2 style={{ fontSize: 18, fontWeight: 900, color: NAVY_DEEP, margin: "0 0 6px" }}>
            ✅ Now enter the 6-digit code
          </h2>
          <p style={{ fontSize: 13, color: SLATE, margin: "0 0 20px" }}>
            Open your authenticator app and type the code shown for <b>Zyrix Admin</b>. Codes refresh every 30 seconds.
          </p>

          {error && (
            <div role="alert" style={{
              padding: "10px 12px",
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: 10,
              color: "#991B1B",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={onVerify}>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              placeholder="123456"
              style={{
                width: "100%",
                padding: "16px 14px",
                fontSize: 28,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontWeight: 800,
                letterSpacing: "0.5em",
                textAlign: "center",
                color: NAVY_DEEP,
                background: "#F8FAFC",
                border: `2px solid ${code.length === 6 ? brand.base : PANEL_BD}`,
                borderRadius: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color .15s",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={busy || code.length < 6}
                style={{
                  padding: "12px 22px",
                  background: code.length < 6 || busy
                    ? "#CBD5E1"
                    : `linear-gradient(135deg, ${brand.dark}, ${brand.base})`,
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 13, fontWeight: 900, letterSpacing: "0.04em",
                  cursor: code.length < 6 || busy ? "not-allowed" : "pointer",
                  boxShadow: code.length < 6 ? "none" : "0 8px 18px rgba(168,8,26,0.25)",
                }}
              >
                {busy ? "Verifying..." : "🔓 Verify & enable"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: "12px 20px",
                  background: "transparent", color: NAVY_DEEP,
                  border: `1px solid ${PANEL_BD}`, borderRadius: 12,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={skip}
                style={{
                  padding: "12px 20px",
                  background: "transparent", color: SLATE,
                  border: "none", borderRadius: 12,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  marginInlineStart: "auto",
                }}
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3: success ───────────────────────────────────────── */}
      {step === 3 && (
        <div style={{
          background: PANEL_BG,
          border: `1.5px solid ${SUCCESS.base}40`,
          borderRadius: 18,
          padding: 32,
          textAlign: "center",
          boxShadow: `0 4px 18px ${SUCCESS.base}20`,
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: SUCCESS.bg, color: SUCCESS.dark,
            display: "grid", placeItems: "center",
            fontSize: 44, margin: "0 auto 18px",
            boxShadow: `0 0 0 8px ${SUCCESS.base}15`,
          }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: NAVY_DEEP, margin: "0 0 8px" }}>
            Two-factor auth is on 🎉
          </h2>
          <p style={{ fontSize: 14, color: SLATE, margin: "0 0 24px", maxWidth: 460, marginInline: "auto", lineHeight: 1.6 }}>
            Next time you sign in we'll ask for the 6-digit code from your authenticator app right after your password.
          </p>
          <div style={{
            background: "#F1F5F9",
            border: `1px solid ${PANEL_BD}`,
            borderRadius: 12,
            padding: 16,
            margin: "0 auto 24px",
            maxWidth: 460,
            textAlign: "left",
            fontSize: 12,
            color: NAVY_DEEP,
            lineHeight: 1.7,
          }}>
            <b>📌 Keep your authenticator app safe.</b> If you lose access to it,
            contact your team's super-admin to help restore your account.
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            style={{
              padding: "12px 24px",
              background: `linear-gradient(135deg, ${brand.dark}, ${brand.base})`,
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 13, fontWeight: 900, letterSpacing: "0.04em",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(168,8,26,0.25)",
            }}
          >
            Go to dashboard →
          </button>
        </div>
      )}
    </div>
  );
}

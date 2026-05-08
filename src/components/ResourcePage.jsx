// ================================================================
// ResourcePage — shared brand-consistent shell for KAYNAKLAR pages
// (Blog, Academy, Help Center, Webinars, etc.). Every resource page
// renders inside this wrapper so they all carry NavV2 + branded hero
// + FooterV2 and stop looking "disconnected from the rest of the site".
// ================================================================
import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavV2 from "./NavV2.jsx";
import FooterV2 from "./FooterV2.jsx";
import { useI18n } from "../i18n/i18n.jsx";

const C = {
  red: "#E30A17", redDeep: "#B30810", redBright: "#FF1A2A",
  wine900: "#3A0509", wine950: "#1F0205",
  ink: "#1B0F11", muted: "#5C4F52",
  hairline: "rgba(255,255,255,0.10)",
  hairlineLight: "rgba(0,0,0,0.08)",
};
const SA = {
  green: "#006C35", greenDeep: "#004D26",
  green900: "#00190C", green950: "#000B05",
};

/**
 * Newsletter signup that POSTs best-effort to ${VITE_API_URL}/api/support/newsletter
 * and falls back to a localStorage queue when the backend isn't reachable.
 * Trilingual labels are passed in as props.
 */
function NewsletterForm({ lang, labels, isRTL, accent, accentDeep }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(labels.errEmail);
      return;
    }
    setBusy(true);
    try {
      const API = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) || "";
      if (API) {
        await fetch(`${API}/api/support/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang, source: "resource-page" }),
        }).catch(() => null);
      }
      try {
        const queue = JSON.parse(localStorage.getItem("zyrix_newsletter_queue") || "[]");
        queue.push({ email, lang, ts: new Date().toISOString() });
        localStorage.setItem("zyrix_newsletter_queue", JSON.stringify(queue));
      } catch (_) { /* localStorage may be blocked */ }
    } finally {
      setBusy(false);
      setDone(true);
    }
  };

  if (done) {
    return (
      <div role="status" style={{
        marginTop: 18,
        padding: "14px 18px",
        background: "rgba(16,185,129,0.16)",
        border: "1px solid rgba(16,185,129,0.40)",
        borderRadius: 14,
        color: "#A7F3D0",
        fontSize: 14,
        fontWeight: 700,
        textAlign: "center",
        maxWidth: 480,
        marginInline: "auto",
      }}>✓ {labels.successMsg}</div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{
      display: "flex", gap: 10, flexWrap: "wrap",
      maxWidth: 520, margin: "18px auto 0",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <label style={{
        flex: "1 1 240px",
        minWidth: 220,
        display: "flex",
        alignItems: "stretch",
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${error ? "#FCA5A5" : C.hairline}`,
        borderRadius: 14,
        padding: "0 4px 0 14px",
      }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
          placeholder={labels.emailPh}
          aria-label={labels.email}
          style={{
            flex: 1,
            padding: "14px 8px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: 14,
            fontFamily: "inherit",
            fontWeight: 500,
          }}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        style={{
          padding: "14px 22px",
          background: `linear-gradient(135deg, ${accent}, ${accentDeep})`,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.04em",
          cursor: busy ? "wait" : "pointer",
          fontFamily: "inherit",
          opacity: busy ? 0.85 : 1,
          boxShadow: `0 12px 28px ${accent}55`,
          whiteSpace: "nowrap",
        }}
      >
        {busy ? labels.busy : labels.submit}
      </button>
      {error && (
        <div role="alert" style={{
          width: "100%",
          fontSize: 12,
          fontWeight: 700,
          color: "#FCA5A5",
          textAlign: isRTL ? "right" : "left",
        }}>{error}</div>
      )}
    </form>
  );
}

/**
 * ResourcePage
 *
 * Props:
 *   - eyebrow      string  (uppercase top label)
 *   - title        string  (hero h1, can include <span class="accent">)
 *   - subtitle     string  (hero p)
 *   - showNewsletter boolean
 *   - newsletterLabels { tagline, email, emailPh, submit, busy, successMsg, errEmail }
 *   - children     react node (rendered on light surface below the dark hero)
 */
export default function ResourcePage({
  eyebrow,
  title,
  subtitle,
  children,
  showNewsletter = false,
  newsletterLabels = null,
  newsletterTagline = null,
}) {
  const { lang, isRTL } = useI18n();
  const isAr = lang === "AR";
  const accent = isAr ? SA.green : C.red;
  const accentDeep = isAr ? SA.greenDeep : C.redDeep;
  const heroBg = `linear-gradient(135deg, ${isAr ? SA.green950 : C.wine950} 0%, ${isAr ? SA.green900 : C.wine900} 60%, #2D0507 100%)`;

  return (
    <>
      <NavV2 />
      <main
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "#fff",
          fontFamily: isAr
            ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
            : "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
          color: C.ink,
        }}
      >
        {/* HERO — wine/green dark gradient matching landing aesthetic */}
        <section
          style={{
            position: "relative",
            background: heroBg,
            color: "#fff",
            padding: "120px 24px 96px",
            overflow: "hidden",
          }}
        >
          {/* Soft radial glow + subtle dotted overlay (artistic touch) */}
          <div aria-hidden="true" style={{
            position: "absolute",
            inset: 0,
            background:
              `radial-gradient(ellipse 700px 480px at 75% 30%, ${accent}40, transparent 60%), ` +
              `radial-gradient(ellipse 500px 400px at 20% 80%, rgba(0,0,0,0.4), transparent 60%)`,
            pointerEvents: "none",
          }} />
          <div aria-hidden="true" style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 80%)",
            pointerEvents: "none",
          }} />

          <div style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 920,
            margin: "0 auto",
            textAlign: "center",
          }}>
            <Link to="/" style={{
              display: "inline-block",
              marginBottom: 18,
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.78)",
              textDecoration: "none",
              borderBottom: "1px dashed rgba(255,255,255,0.4)",
              paddingBottom: 1,
            }}>{isAr ? "← الرئيسية" : (lang === "EN" ? "← Home" : "← Anasayfa")}</Link>

            {eyebrow && (
              <div style={{
                display: "inline-block",
                marginBottom: 18,
                padding: "8px 16px",
                background: `linear-gradient(135deg, ${accent}, ${accentDeep})`,
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                boxShadow: `0 12px 28px ${accent}55`,
              }}>{eyebrow}</div>
            )}

            {title && (
              <h1 style={{
                margin: "0 0 16px",
                fontSize: "clamp(34px, 5vw, 60px)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.025em",
                lineHeight: 1.08,
              }}>{title}</h1>
            )}

            {subtitle && (
              <p style={{
                margin: "0 auto",
                maxWidth: 720,
                fontSize: 17,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
              }}>{subtitle}</p>
            )}

            {showNewsletter && newsletterLabels && (
              <>
                {newsletterTagline && (
                  <div style={{
                    marginTop: 26,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "rgba(255,215,0,0.95)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}>{newsletterTagline}</div>
                )}
                <NewsletterForm
                  lang={lang}
                  isRTL={isRTL}
                  accent={accent}
                  accentDeep={accentDeep}
                  labels={newsletterLabels}
                />
              </>
            )}
          </div>
        </section>

        {/* CONTENT — light surface */}
        <section style={{
          background: "#FFF8F8",
          padding: "72px 24px 96px",
        }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            {children}
          </div>
        </section>
      </main>
      <FooterV2 />
    </>
  );
}

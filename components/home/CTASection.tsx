"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function CTASection() {
  const t      = useTranslations("cta");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const [email, setEmail] = useState("");

  return (
    <section style={{
      background: "#2563EB",
      padding: "60px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative orbs */}
      <div aria-hidden style={{
        position: "absolute", top: "-40%", left: "-8%",
        width: 360, height: 360,
        background: "rgba(255,255,255,.06)", borderRadius: "50%", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "-40%", right: "-5%",
        width: 300, height: 300,
        background: "rgba(255,255,255,.06)", borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1, direction: isRTL ? "rtl" : "ltr" }}>
        <h2 style={{
          fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 900,
          color: "#fff", marginBottom: 12, lineHeight: 1.2,
        }}>{t("title")}</h2>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,.82)", marginBottom: 28 }}>{t("subtitle")}</p>

        {/* Email form */}
        <div style={{
          display: "flex", gap: 10, maxWidth: 460, margin: "0 auto 18px",
          flexDirection: "row",
        }} className="cta-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            style={{
              flex: 1, padding: "13px 16px",
              border: "none", borderRadius: 8,
              fontSize: 15, outline: "none",
              fontFamily: "inherit",
              background: "rgba(255,255,255,.95)",
              color: "#111827",
              direction: isRTL ? "rtl" : "ltr",
            }}
          />
          <button
            onClick={() => { /* TODO: handle signup */ }}
            style={{
              padding: "13px 22px",
              background: "#111827", color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#000")}
            onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
          >
            {t("button")}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>{t("note")}</p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .cta-form { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
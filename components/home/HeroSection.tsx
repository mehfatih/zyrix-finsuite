"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export function HeroSection() {
  const t      = useTranslations("hero");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <section style={{
      background: "#111827",
      padding: "52px 24px 48px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(37,99,235,.16) 0%, transparent 65%)",
      }} />

      <div style={{
        maxWidth: 1160, margin: "0 auto", position: "relative",
        display: "grid", gridTemplateColumns: "1fr 420px",
        gap: 48, alignItems: "center",
        direction: isRTL ? "rtl" : "ltr",
      }}>

        {/* Left — Text */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(37,99,235,.15)",
            border: "1px solid rgba(37,99,235,.3)",
            borderRadius: 100, padding: "5px 14px",
            fontSize: 12, fontWeight: 700, color: "#93C5FD",
            marginBottom: 18, letterSpacing: ".3px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB",
              display: "inline-block", animation: "pulse 2s infinite" }} />
            {t("badge")}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(34px, 4.2vw, 52px)",
            fontWeight: 900, lineHeight: 1.12,
            letterSpacing: "-1.2px", marginBottom: 18,
            color: "#fff",
          }}>
            {t("title1")}<br />
            <span style={{ color: "#2563EB" }}>{t("title2")}</span><br />
            <span style={{ color: "rgba(255,255,255,.85)" }}>{t("title3")}</span>
          </h1>

          <p style={{
            fontSize: 17, color: "#9CA3AF", lineHeight: 1.7,
            marginBottom: 28, maxWidth: 480, fontWeight: 400,
          }}>
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap",
            marginBottom: 28, justifyContent: isRTL ? "flex-end" : "flex-start" }}>
            <Link href={`/${locale}/signup`} style={{
              padding: "13px 28px", background: "#2563EB", color: "#fff",
              borderRadius: 8, fontWeight: 700, fontSize: 16,
              textDecoration: "none", transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1D4ED8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563EB")}>
              {t("cta_main")}
            </Link>
            <Link href={`/${locale}/demo`} style={{
              padding: "13px 24px", background: "transparent",
              border: "1.5px solid rgba(255,255,255,.2)", color: "#fff",
              borderRadius: 8, fontWeight: 600, fontSize: 16,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
              transition: "border-color .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.5)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.2)")}>
              ▶ {t("cta_demo")}
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap",
            justifyContent: isRTL ? "flex-end" : "flex-start" }}>
            {[t("trust1"), t("trust2"), t("trust3")].map(txt => (
              <span key={txt} style={{
                fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ color: "#4ADE80", fontWeight: 700 }}>✓</span> {txt}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Dashboard mockup */}
        <div className="hero-visual" style={{ position: "relative" }}>
          <div style={{
            background: "#1F2937", borderRadius: 14,
            border: "1px solid #374151", overflow: "hidden",
            boxShadow: "0 28px 72px rgba(0,0,0,.4)",
          }}>
            {/* Topbar */}
            <div style={{
              background: "#111827", padding: "10px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                  <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "block" }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: "#4B5563", fontFamily: "'Nunito Sans', sans-serif" }}>
                finsuite.zyrix.co — Dashboard
              </span>
              <span style={{ width: 60 }} />
            </div>

            {/* Body */}
            <div style={{ padding: 14 }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Gelir", value: "₺284K", change: "+18.4%" },
                  { label: "Müşteri", value: "1,247", change: "+7.2%" },
                  { label: "AI Skoru", value: "94/100", change: "Mükemmel" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#111827", borderRadius: 8, padding: "10px 11px",
                  }}>
                    <div style={{ fontSize: 10, color: "#4B5563", marginBottom: 3, fontFamily: "'Nunito Sans', sans-serif" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "'Nunito Sans', sans-serif" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 10, color: "#4ADE80", marginTop: 2, fontFamily: "'Nunito Sans', sans-serif" }}>
                      ▲ {s.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div style={{ background: "#111827", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#4B5563", marginBottom: 8, fontFamily: "'Nunito Sans', sans-serif" }}>
                  Aylık Gelir 2026
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 52 }}>
                  {[42, 58, 48, 72, 55, 78, 88, 65, 100].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: "3px 3px 0 0",
                      background: i % 2 === 0 ? "#2563EB" : "#1F2937",
                      height: `${h}%`, border: "1px solid #374151",
                    }} />
                  ))}
                </div>
              </div>

              {/* AI box */}
              <div style={{
                background: "linear-gradient(135deg,#1E3A5F,#1F2937)",
                border: "1px solid rgba(37,99,235,.3)",
                borderRadius: 8, padding: "10px 12px",
                display: "flex", gap: 9, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 28, height: 28, background: "#2563EB", borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, flexShrink: 0,
                }}>🤖</div>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: "#60A5FA", fontSize: 11 }}>
                    {locale === "ar" ? "AI CFO:" : locale === "tr" ? "Yapay Zeka CFO:" : "AI CFO:"}
                  </strong>{" "}
                  {locale === "tr"
                    ? "Gelirleriniz %18 arttı. Tedarikçi faturası #1242'yi bu hafta sonuna kadar ödemenizi öneririm."
                    : locale === "ar"
                    ? "إيراداتك ارتفعت 18٪. أنصح بتسديد الفاتورة #1242 قبل نهاية الأسبوع."
                    : "Revenue up 18%. Recommend paying invoice #1242 before end of week to avoid late fee."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1) }
          50% { opacity:.4; transform:scale(1.3) }
        }
        @media (max-width: 860px) {
          .hero-visual { display: none; }
        }
      `}</style>
    </section>
  );
}
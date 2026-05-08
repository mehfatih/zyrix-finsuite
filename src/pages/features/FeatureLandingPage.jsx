// ================================================================
// FeatureLandingPage — shared trilingual layout for product feature
// landing pages (E-Fatura, CRM, AI, Mobil, etc.).
// Sections: hero · highlights · breakdown · use cases · pricing
// summary · FAQ · final CTA. NavV2 + FooterV2 reused.
// ================================================================
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import NavV2 from "../../components/NavV2.jsx";
import FooterV2 from "../../components/FooterV2.jsx";

const C = {
  red: "#E30A17", redDeep: "#B30810", redBright: "#FF1A2A",
  redSoft: "#FFE3E5",
  wine900: "#3A0509", wine950: "#1F0205",
  bgTinted: "#FFF7F4", bg: "#FFF8F8",
  ink: "#1B0F11", inkSoft: "#3A2A30", muted: "#5C4F52",
  hairline: "rgba(0,0,0,.08)",
  emerald: "#10B981", emeraldSoft: "#D1FAE5", amber: "#F59E0B",
};
const SA = {
  green: "#006C35", greenDeep: "#004D26", greenBright: "#00A050",
  green900: "#00190C", green950: "#000B05",
  bgTinted: "#F4FBF7", bg: "#F5FBF7",
  hairline: "rgba(0,0,0,.08)",
};

const COMMON = {
  TR: {
    backToHome: "← Anasayfa",
    highlightsEyebrow: "ÖNE ÇIKAN ÖZELLİKLER",
    breakdownEyebrow: "DETAYLAR",
    useCasesEyebrow: "KİMLER İÇİN?",
    pricingEyebrow: "FİYATLANDIRMA",
    pricingDefault: "Tüm planlarda dahil. Ekstra ücret yok.",
    faqEyebrow: "SIK SORULAN SORULAR",
    finalEyebrow: "ŞİMDİ BAŞLAYIN",
    ctaPrimary: "Ücretsiz Dene",
    ctaSecondary: "Demoyu İzle",
    pricingCta: "Fiyatlandırmaya Bak",
  },
  EN: {
    backToHome: "← Back to home",
    highlightsEyebrow: "FEATURE HIGHLIGHTS",
    breakdownEyebrow: "INSIDE THE FEATURE",
    useCasesEyebrow: "WHO IT'S FOR",
    pricingEyebrow: "PRICING",
    pricingDefault: "Included in every plan. No extras.",
    faqEyebrow: "FREQUENTLY ASKED",
    finalEyebrow: "GET STARTED",
    ctaPrimary: "Try free",
    ctaSecondary: "Watch demo",
    pricingCta: "See pricing",
  },
  AR: {
    backToHome: "← الرئيسية",
    highlightsEyebrow: "أبرز المزايا",
    breakdownEyebrow: "داخل الميزة",
    useCasesEyebrow: "لمن هذه الميزة؟",
    pricingEyebrow: "الأسعار",
    pricingDefault: "مشمولة في كل الباقات. بدون إضافات.",
    faqEyebrow: "أسئلة متكررة",
    finalEyebrow: "ابدأ الآن",
    ctaPrimary: "جرّب مجاناً",
    ctaSecondary: "شاهد العرض",
    pricingCta: "اطّلع على الأسعار",
  },
};

function Section({ children, bg, padY = "120px" }) {
  return (
    <section style={{ background: bg, padding: `${padY} 24px` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function Eyebrow({ text, color }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 800, letterSpacing: "0.18em",
      textTransform: "uppercase", color, marginBottom: 14,
    }}>{text}</div>
  );
}

function Card({ children, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${C.hairline}`,
      borderRadius: 22,
      padding: 28,
      boxShadow: `0 14px 36px rgba(58,5,9,0.06)`,
      borderTop: accent ? `3px solid ${accent}` : `1px solid ${C.hairline}`,
      height: "100%",
    }}>{children}</div>
  );
}

function FAQItem({ q, a, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderTop: `1px solid ${C.hairline}`,
      padding: "18px 0",
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: 0,
          background: "transparent",
          border: "none",
          textAlign: "inherit",
          cursor: "pointer",
          fontFamily: "inherit",
          color: C.ink,
          fontSize: 17,
          fontWeight: 800,
        }}
      >
        <span>{q}</span>
        <span aria-hidden="true" style={{
          color: accent,
          fontSize: 22,
          fontWeight: 900,
          flexShrink: 0,
          transform: open ? "rotate(45deg)" : "rotate(0)",
          transition: "transform .18s ease",
        }}>+</span>
      </button>
      {open && (
        <div style={{
          marginTop: 12,
          fontSize: 15,
          lineHeight: 1.7,
          color: C.muted,
          fontWeight: 500,
          maxWidth: 760,
        }}>{a}</div>
      )}
    </div>
  );
}

export default function FeatureLandingPage({ content }) {
  const { lang, isRTL } = useI18n();
  const isAr = lang === "AR";
  const T = isAr ? SA : C;
  const accent = isAr ? SA.green : C.red;
  const accentDeep = isAr ? SA.greenDeep : C.redDeep;
  const ctaGradient = `linear-gradient(135deg, ${accent}, ${accentDeep})`;
  const ctaShadow = isAr
    ? "0 24px 60px rgba(0,108,53,.30)"
    : "0 24px 60px rgba(227,10,23,.30)";

  const common = COMMON[lang] || COMMON.TR;
  const data = (content && (content[lang] || content.TR)) || null;
  if (!data) return null;

  return (
    <>
      <NavV2 />
      <main
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          background: T.bg,
          color: C.ink,
          fontFamily: isAr
            ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
            : "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
        }}
      >
        {/* HERO */}
        <Section
          bg={`linear-gradient(180deg, ${T.bg} 0%, ${T.bgTinted} 60%, #fff 100%)`}
          padY="100px"
        >
          <Link
            to="/"
            style={{
              fontSize: 13, fontWeight: 700, color: T.muted || C.muted,
              textDecoration: "none", borderBottom: `1px dashed ${C.hairline}`,
              paddingBottom: 1,
            }}
          >{common.backToHome}</Link>

          <div style={{ marginTop: 28, maxWidth: 820 }}>
            <Eyebrow text={data.eyebrow} color={accent} />
            <h1 style={{
              margin: 0,
              fontSize: "clamp(38px, 5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 900,
              color: C.ink,
            }}>
              {data.h1Pre}{" "}
              <span style={{
                backgroundImage: ctaGradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{data.h1Highlight}</span>
            </h1>
            <p style={{
              margin: "22px 0 0",
              fontSize: 18, lineHeight: 1.65,
              color: C.muted, fontWeight: 500,
              maxWidth: 720,
            }}>{data.sub}</p>
          </div>

          <div style={{ marginTop: 30, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 28px", borderRadius: 16,
              background: ctaGradient, color: "#fff",
              fontSize: 15, fontWeight: 900, textDecoration: "none",
              boxShadow: ctaShadow, letterSpacing: "0.02em",
            }}>
              <span>{common.ctaPrimary}</span>
              <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
            </Link>
            <Link to="/how-it-works" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 24px", borderRadius: 16,
              background: "#fff", color: C.ink,
              fontSize: 15, fontWeight: 800, textDecoration: "none",
              border: `1px solid ${C.hairline}`,
            }}>{common.ctaSecondary}</Link>
          </div>
        </Section>

        {/* HIGHLIGHTS */}
        {data.highlights && data.highlights.length > 0 && (
          <Section bg="#fff" padY="100px">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              <Eyebrow text={common.highlightsEyebrow} color={accent} />
              <h2 style={{ fontSize: 36, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: "-0.02em" }}>
                {data.highlightsTitle || data.h1Highlight}
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
              gap: 18,
            }}>
              {data.highlights.map((h, i) => (
                <Card key={i} accent={accent}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{h.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.ink, marginBottom: 8 }}>{h.title}</div>
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, fontWeight: 500 }}>{h.body}</div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* BREAKDOWN */}
        {data.sections && data.sections.length > 0 && (
          <Section bg={T.bgTinted} padY="100px">
            <div style={{ maxWidth: 740, margin: "0 auto 48px", textAlign: "center" }}>
              <Eyebrow text={common.breakdownEyebrow} color={accent} />
              <h2 style={{ fontSize: 32, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: "-0.02em" }}>
                {data.breakdownTitle}
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.sections.map((s, i) => (
                <div key={i} style={{
                  background: "#fff",
                  border: `1px solid ${C.hairline}`,
                  borderRadius: 22,
                  padding: 28,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
                  gap: 28,
                  alignItems: "start",
                }}
                  className="feat-breakdown-row"
                >
                  <div>
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      width: 44, height: 44, borderRadius: 12,
                      background: `${accent}18`, color: accent,
                      fontWeight: 900, justifyContent: "center",
                      marginBottom: 12, fontSize: 16,
                    }}>{String(i + 1).padStart(2, "0")}</div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.ink, letterSpacing: "-0.01em" }}>
                      {s.title}
                    </h3>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, color: C.muted, lineHeight: 1.7, fontWeight: 500 }}>{s.body}</p>
                    {s.bullets && s.bullets.length > 0 && (
                      <ul style={{
                        marginTop: 14, padding: 0, listStyle: "none",
                        display: "grid", gap: 8,
                      }}>
                        {s.bullets.map((b, j) => (
                          <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: C.ink, fontWeight: 600 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5" style={{ flexShrink: 0, width: 18, height: 18, marginTop: 2 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <style>{`
              @media (max-width: 720px) {
                .feat-breakdown-row { grid-template-columns: 1fr !important; gap: 14px !important; }
              }
            `}</style>
          </Section>
        )}

        {/* USE CASES */}
        {data.useCases && data.useCases.length > 0 && (
          <Section bg="#fff" padY="96px">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 40px" }}>
              <Eyebrow text={common.useCasesEyebrow} color={accent} />
              <h2 style={{ fontSize: 32, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: "-0.02em" }}>
                {data.useCasesTitle}
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
              gap: 16,
            }}>
              {data.useCases.map((u, i) => (
                <Card key={i}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{u.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: C.ink, marginBottom: 6 }}>{u.title}</div>
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, fontWeight: 500 }}>{u.body}</div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* PRICING SUMMARY */}
        <Section bg={T.bgTinted} padY="80px">
          <div style={{
            maxWidth: 760, margin: "0 auto",
            background: "#fff",
            border: `1px solid ${C.hairline}`,
            borderRadius: 24,
            padding: 36,
            textAlign: "center",
            boxShadow: "0 18px 48px rgba(58,5,9,0.06)",
          }}>
            <Eyebrow text={common.pricingEyebrow} color={accent} />
            <h2 style={{ fontSize: 26, fontWeight: 900, color: C.ink, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              {data.pricingTitle || common.pricingDefault}
            </h2>
            {data.pricingBody && (
              <p style={{ margin: "0 0 18px", fontSize: 15, color: C.muted, lineHeight: 1.7, fontWeight: 500 }}>{data.pricingBody}</p>
            )}
            <Link to="/pricing" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 12,
              background: ctaGradient, color: "#fff",
              fontSize: 14, fontWeight: 900, textDecoration: "none",
              letterSpacing: "0.04em",
            }}>{common.pricingCta} <span aria-hidden="true">{isRTL ? "←" : "→"}</span></Link>
          </div>
        </Section>

        {/* FAQ */}
        {data.faq && data.faq.length > 0 && (
          <Section bg="#fff" padY="100px">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 32px" }}>
              <Eyebrow text={common.faqEyebrow} color={accent} />
              <h2 style={{ fontSize: 32, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: "-0.02em" }}>
                {data.faqTitle || (isAr ? "أسئلة تتكرر كثيراً" : (lang === "EN" ? "Questions we hear a lot" : "Sıkça gelen sorular"))}
              </h2>
            </div>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {data.faq.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} accent={accent} />)}
            </div>
          </Section>
        )}

        {/* FINAL CTA */}
        <Section
          bg={`linear-gradient(135deg, ${isAr ? SA.green950 : C.wine950} 0%, ${isAr ? SA.green900 : C.wine900} 100%)`}
          padY="96px"
        >
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", color: "#fff" }}>
            <Eyebrow text={common.finalEyebrow} color={"rgba(255,215,0,0.9)"} />
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, margin: "0 0 14px",
              letterSpacing: "-0.02em", color: "#fff",
            }}>{data.finalTitle}</h2>
            {data.finalSub && (
              <p style={{ margin: "0 0 26px", fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontWeight: 500 }}>{data.finalSub}</p>
            )}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 28px", borderRadius: 16,
                background: "#fff", color: accent,
                fontSize: 15, fontWeight: 900, textDecoration: "none",
                boxShadow: "0 18px 44px rgba(0,0,0,0.30)",
              }}>
                <span>{common.ctaPrimary}</span>
                <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
              </Link>
              <Link to="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 24px", borderRadius: 16,
                background: "rgba(255,255,255,0.10)", color: "#fff",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.22)",
              }}>{common.ctaSecondary}</Link>
            </div>
          </div>
        </Section>
      </main>
      <FooterV2 />
    </>
  );
}

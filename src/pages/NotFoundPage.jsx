import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ---------- Palettes ----------
const C = {
  red:        "#E30A17",
  redDeep:    "#B30810",
  redBright:  "#FF1A2A",
  wine900:    "#3A0509",
  wine950:    "#1F0205",
  bgTinted:   "#FFF7F4",
  ink:        "#1B0F11",
  muted:      "#5C4F52",
  hairline:   "rgba(0,0,0,.08)",
  emerald:    "#10B981",
};

const SA = {
  green:        "#006C35",
  greenDeep:    "#004D26",
  greenBright:  "#00A050",
  green900:     "#00190C",
  green950:     "#000B05",
  bgTinted:     "#F4FBF7",
  ink:          "#0B1A12",
  muted:        "#4A5C50",
  hairline:     "rgba(0,0,0,.08)",
  emerald:      "#10B981",
};

// ---------- Translations ----------
const TXT = {
  TR: {
    eyebrow: "SAYFA BULUNAMADI",
    h1a: "Bu yol kayboldu",
    h1b: "ama nakit akisin kaybolmak zorunda degil.",
    sub: "Aradiginiz sayfa tasinmis olabilir. Asagidan akilli bir yol secin ve fatura zekasi, risk gorunurlugu ve nakit akisi kontrolune dogru ilerlemeye devam edin.",

    primaryBtn: "AI Analizi Calistir",
    homeBtn: "Ana Sayfa",

    actions: [
      { id: "ai",       title: "AI Analizi Calistir", desc: "Fatura davranisindan basla ve gizli nakit akisi riskini kesfet.", href: "/onboarding" },
      { id: "features", title: "Ozellikleri Kesfet", desc: "Zyrix'in faturalari, tahsilati ve nakit akisini nasil karara cevirdigini gor.", href: "/features" },
      { id: "pricing",  title: "Fiyatlandirmayi Gor", desc: "Plani karsilastir ve geri kazanabileceginiz nakit akisini tahmin et.",        href: "/pricing" },
      { id: "contact",  title: "Ekibe Ulas",          desc: "Entegrasyonlar, kurulum veya satis hakkinda dogru ekiple konus.",                href: "/contact" },
    ],

    smartEyebrow: "AKILLI ONERI",
    smartTitle: "Cogu ziyaretci AI nakit akisi analizi ile devam ediyor.",
    smartText: "Gizli fatura riskini gormek ve ilk eylem planini olusturmak sadece bir dakika suruyor.",

    trust: ["Fatura zekasi", "Nakit akisi analizi", "Risk gorunurlugu", "Aksiyon hazir icgoruler"],

    ctaEyebrow: "DEGERE EN HIZLI YOL",
    ctaTitle: "Aradigin oraya gitmek yerine, ondan akilli bir yol sec.",
    ctaBtn: "Ana Sayfaya Don",
  },

  EN: {
    eyebrow: "PAGE NOT FOUND",
    h1a: "This path is lost",
    h1b: "but your cashflow doesn't have to be.",
    sub: "The page you are looking for may have moved. Choose a smart path below and keep moving toward invoice intelligence, risk visibility, and cashflow control.",

    primaryBtn: "Run AI Analysis",
    homeBtn: "Go Home",

    actions: [
      { id: "ai",       title: "Run AI Analysis",  desc: "Start with invoice behavior and discover hidden cashflow risk.",        href: "/onboarding" },
      { id: "features", title: "Explore Features", desc: "See how Zyrix turns invoices, collections, and cashflow into decisions.", href: "/features" },
      { id: "pricing",  title: "See Pricing",      desc: "Compare plans and estimate how much cashflow you may recover.",         href: "/pricing" },
      { id: "contact",  title: "Contact Team",     desc: "Talk to the right team about integrations, onboarding, or sales.",      href: "/contact" },
    ],

    smartEyebrow: "SMART RECOMMENDATION",
    smartTitle: "Most visitors continue with AI cashflow analysis.",
    smartText: "It only takes a minute to see hidden invoice risk and generate your first action plan.",

    trust: ["Invoice intelligence", "Cashflow analysis", "Risk visibility", "Action-ready insights"],

    ctaEyebrow: "FASTEST PATH TO VALUE",
    ctaTitle: "Instead of chasing the page you wanted, choose a smarter path forward.",
    ctaBtn: "Back to Home",
  },

  AR: {
    eyebrow: "الصفحة غير موجودة",
    h1a: "هذا المسار مفقود",
    h1b: "لكن تدفّقك النقدي ليس مضطرّاً لذلك.",
    sub: "الصفحة التي تبحث عنها ربّما انتقلت. اختر مساراً ذكيّاً وتابع التحرّك نحو ذكاء الفواتير، ووضوح المخاطر، والتحكّم في التدفّق النقدي.",

    primaryBtn: "شغّل تحليل AI",
    homeBtn: "الصفحة الرئيسية",

    actions: [
      { id: "ai",       title: "شغّل تحليل AI",                          desc: "ابدأ بسلوك الفواتير واكتشف مخاطر التدفّق النقدي الخفية.",                                                                                                                                                                                                          href: "/onboarding" },
      { id: "features", title: "استكشف الميزات", desc: "شاهد كيف يحوّل زيركس الفواتير والتحصيل والتدفّق النقدي إلى قرارات.",                                                                                  href: "/features" },
      { id: "pricing",  title: "شاهد الأسعار",               desc: "قارن بين الخطط وقدّر كم من التدفّق النقدي تستطيع استرداده.",                                                                                                                       href: "/pricing" },
      { id: "contact",  title: "تواصل مع الفريق", desc: "تحدّث إلى الفريق المناسب عن التكاملات أو الإعداد أو المبيعات.",                                                                                                href: "/contact" },
    ],

    smartEyebrow: "توصية ذكيّة",
    smartTitle: "معظم الزوّار يكملون بتحليل AI للتدفّق النقدي.",
    smartText: "تستغرق دقيقة واحدة فقط لترى مخاطر الفواتير الخفية وتبني خطّة العمل الأولى.",

    trust: ["ذكاء الفواتير", "تحليل التدفّق النقدي", "وضوح المخاطر", "رؤى جاهزة للتنفيذ"],

    ctaEyebrow: "أسرع مسار للقيمة",
    ctaTitle: "بدل البحث عن الصفحة، اختر مساراً أذكى للأمام.",
    ctaBtn: "العودة للرئيسية",
  },
};

export default function NotFoundPage() {
  const i18n = useI18n();
  const lang = (i18n && i18n.lang) || "TR";
  const t = TXT[lang] || TXT.TR;
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;

  const themeColor   = isArabic ? SA.green       : C.red;
  const themeDeep    = isArabic ? SA.greenDeep   : C.redDeep;
  const themeBright  = isArabic ? SA.greenBright : C.redBright;
  const themeNight   = isArabic ? SA.green950    : C.wine950;
  const themeGlowRGB = isArabic ? "0,108,53"     : "227,10,23";
  const shadowRGB    = isArabic ? "0,77,38"      : "58,5,9";
  const arrow = isRTL ? "←" : "→";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.92)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
    backdropFilter: "blur(16px)",
  };

  return (
    <>
      <NavV2 />
      <main
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          direction: isRTL ? "rtl" : "ltr",
          minHeight: "100vh",
          color: T.ink,
          background: "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 50%,#fff 100%)",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <section style={{ padding: "138px 32px 110px", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle at 50% 18%, rgba(" + themeGlowRGB + ",.16), transparent 52%)",
            }}
          />

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

            {/* === HERO PANEL: 404 + content === */}
            <div
              style={{
                ...cardBase,
                padding: 44,
                display: "grid",
                gridTemplateColumns: "0.95fr 1.05fr",
                gap: 38,
                alignItems: "center",
                marginBottom: 26,
              }}
            >
              {/* LEFT: 404 + headline + CTAs */}
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.86)",
                    border: "1px solid " + T.hairline,
                    color: themeColor,
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "1.3px",
                    marginBottom: 18,
                    boxShadow: "0 18px 44px rgba(" + shadowRGB + ",.08)",
                  }}
                >
                  ✨ {t.eyebrow}
                </div>

                <div
                  style={{
                    fontSize: "clamp(96px,14vw,180px)",
                    lineHeight: 0.86,
                    letterSpacing: "-0.09em",
                    fontWeight: 950,
                    background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "'Inter Tight', 'Plus Jakarta Sans', system-ui, sans-serif",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: 22,
                  }}
                >
                  404
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(32px,4.2vw,56px)",
                    lineHeight: 1.04,
                    letterSpacing: "-0.05em",
                    fontWeight: 950,
                  }}
                >
                  {t.h1a} — <span style={{ color: themeColor }}>{t.h1b}</span>
                </h1>

                <p
                  style={{
                    margin: "20px 0 0",
                    color: T.muted,
                    fontSize: 17,
                    lineHeight: 1.75,
                    fontWeight: 650,
                  }}
                >
                  {t.sub}
                </p>

                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link
                    to="/onboarding"
                    style={{
                      borderRadius: 18,
                      padding: "18px 30px",
                      color: "#fff",
                      background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
                      textDecoration: "none",
                      fontSize: 16,
                      fontWeight: 950,
                      boxShadow: "0 22px 56px rgba(" + themeGlowRGB + ",.30)",
                      fontFamily: "inherit",
                    }}
                  >
                    {t.primaryBtn} {arrow}
                  </Link>

                  <Link
                    to="/"
                    style={{
                      borderRadius: 18,
                      padding: "17px 26px",
                      color: T.ink,
                      background: "#fff",
                      border: "1px solid " + T.hairline,
                      textDecoration: "none",
                      fontSize: 16,
                      fontWeight: 950,
                      fontFamily: "inherit",
                    }}
                  >
                    {t.homeBtn}
                  </Link>
                </div>
              </div>

              {/* RIGHT: Smart recommendation panel + 4 action cards */}
              <div>
                <div
                  style={{
                    borderRadius: 28,
                    padding: 28,
                    background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                    color: "#fff",
                    boxShadow: "0 34px 90px rgba(" + shadowRGB + ",.26)",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px" }}>
                    {t.smartEyebrow}
                  </div>
                  <h2
                    style={{
                      margin: "12px 0 0",
                      fontSize: 26,
                      lineHeight: 1.18,
                      letterSpacing: "-0.04em",
                      fontWeight: 950,
                    }}
                  >
                    {t.smartTitle}
                  </h2>
                  <p style={{ marginTop: 12, opacity: 0.78, fontSize: 14.5, lineHeight: 1.7, fontWeight: 650 }}>
                    {t.smartText}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {t.actions.map((a) => (
                    <Link
                      key={a.id}
                      to={a.href}
                      style={{
                        borderRadius: 22,
                        padding: 20,
                        background: "rgba(255,255,255,.94)",
                        border: "1px solid " + T.hairline,
                        textDecoration: "none",
                        color: T.ink,
                        boxShadow: "0 16px 40px rgba(" + shadowRGB + ",.06)",
                        transition: "all 0.25s ease",
                        fontFamily: "inherit",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 950, letterSpacing: "-0.025em" }}>
                        {a.title}
                      </h3>
                      <p
                        style={{
                          margin: "8px 0 0",
                          color: T.muted,
                          fontSize: 13,
                          lineHeight: 1.55,
                          fontWeight: 650,
                        }}
                      >
                        {a.desc}
                      </p>
                      <div style={{ marginTop: 12, color: themeColor, fontWeight: 950, fontSize: 13 }}>
                        {arrow}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* === TRUST STRIP === */}
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {t.trust.map((x, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 18,
                    padding: 16,
                    background: "#fff",
                    border: "1px solid " + T.hairline,
                    textAlign: "center",
                    fontWeight: 950,
                    fontSize: 13,
                    boxShadow: "0 16px 36px rgba(" + shadowRGB + ",.07)",
                  }}
                >
                  ✓ {x}
                </div>
              ))}
            </div>

            {/* === FINAL CTA === */}
            <div
              style={{
                marginTop: 56,
                borderRadius: 36,
                padding: "48px 32px",
                background: "linear-gradient(135deg, " + themeDeep + ", " + themeNight + ")",
                color: "#fff",
                textAlign: "center",
                boxShadow: "0 34px 90px rgba(" + shadowRGB + ",.26)",
              }}
            >
              <div style={{ opacity: 0.75, fontSize: 12, fontWeight: 950, letterSpacing: "1.5px", marginBottom: 12 }}>
                {t.ctaEyebrow}
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1.15 }}>
                {t.ctaTitle}
              </h2>
              <div style={{ marginTop: 26 }}>
                <Link
                  to="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 18,
                    padding: "16px 30px",
                    color: T.ink,
                    background: "#fff",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 950,
                    fontFamily: "inherit",
                  }}
                >
                  {t.ctaBtn} {arrow}
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>
      <FooterV2 />
    </>
  );
}

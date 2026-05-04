import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

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

const TXT = {
  TR: {
    code: "404",
    title: "Bu sayfa bulunamadi.",
    sub: "Bagli oldugun link kirilmis ya da sayfa tasinmis olabilir. Aradigini bulmana yardim edelim.",
    home: "Ana sayfa",
    features: "Ozellikler",
    pricing: "Fiyatlandirma",
    contact: "Iletisim",
  },
  EN: {
    code: "404",
    title: "Page not found.",
    sub: "The link may be broken or the page may have moved. Let us help you find what you need.",
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    contact: "Contact",
  },
  AR: {
    code: "404",
    title: "الصفحة غير موجودة.",
    sub: "الرابط قد يكون مكسوراً أو الصفحة انتقلت. دعنا نساعدك لتجد ما تحتاج.",
    home: "الرئيسية",
    features: "الميزات",
    pricing: "الأسعار",
    contact: "تواصل",
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
  const arrow = isRTL ? "\u2190" : "\u2192";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.88)",
    border: "1px solid " + T.hairline,
    boxShadow: "0 28px 74px rgba(" + shadowRGB + ",.10)",
    backdropFilter: "blur(16px)",
  };

  const links = [
    [t.home, "/"],
    [t.features, "/features"],
    [t.pricing, "/pricing"],
    [t.contact, "/contact"],
  ];

  return (
    <>
      <NavV2 />
      <main
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        direction: isRTL ? "rtl" : "ltr",
        minHeight: "100vh",
        color: T.ink,
        background: "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 46%,#fff 100%)",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: "grid",
        placeItems: "center",
        padding: 32,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <div
          style={{
            fontSize: "clamp(120px,18vw,220px)",
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: "-0.08em",
            background: "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 12,
            fontFamily: "'Inter Tight', system-ui, sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {t.code}
        </div>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 950, letterSpacing: "-0.04em" }}>
          {t.title}
        </h1>
        <p style={{ margin: "16px auto 32px", color: T.muted, fontSize: 17, lineHeight: 1.7, fontWeight: 650, maxWidth: 480 }}>
          {t.sub}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {links.map(([label, to], i) => (
            <Link
              key={i}
              to={to}
              style={{
                padding: "104px 22px",
                borderRadius: 16,
                color: i === 0 ? "#fff" : T.ink,
                background: i === 0
                  ? "linear-gradient(135deg, " + themeBright + ", " + themeDeep + ")"
                  : "rgba(255,255,255,.86)",
                border: i === 0 ? "none" : "1px solid " + T.hairline,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 950,
                boxShadow: i === 0 ? "0 18px 44px rgba(" + themeGlowRGB + ",.30)" : "none",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
      <FooterV2 />
    </>
  );
}

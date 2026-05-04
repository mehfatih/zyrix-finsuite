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
  "TR": {
    "back": "Geri",
    "badge": "GUVENLIK",
    "title": "Verini ciddiye aliyoruz.",
    "lastUpdated": "Son guncelleme: 4 Mayis 2026",
    "intro": "Zyrix; modern guvenlik standartlari, sifreleme ve sinirli erisim ilkesiyle calisir. Bu sayfa, guvenlik yaklasimimizin ozetini sunar.",
    "sections": [
      [
        "Sifreleme",
        "Veri aktarimi TLS 1.2+ ile, durmus veri AES-256 ile sifrelenir."
      ],
      [
        "Erisim kontrolu",
        "Calisanlar yalnizca isin gerektirdigi minimum yetkiyle erisir; tum erisimler kayit altina alinir."
      ],
      [
        "Yedekleme",
        "Veriler duzenli olarak yedeklenir ve farkli bolgelerde saklanir."
      ],
      [
        "Hesap koruma",
        "Hassas islemler icin iki adimli dogrulama sunulur. Sifreler hashlenmis olarak saklanir."
      ],
      [
        "Olay yanitlama",
        "Bir guvenlik olayi tespit edilirse, etkilenen kullanicilarla zamaninda iletisime geceriz."
      ],
      [
        "Bagimsiz dogrulama",
        "Altyapimiz periyodik olarak bagimsiz guvenlik denetimlerinden gecer."
      ]
    ],
    "contactNote": "Guvenlik konulari icin: security@zyrix.co"
  },
  "EN": {
    "back": "Back",
    "badge": "SECURITY",
    "title": "We take your data seriously.",
    "lastUpdated": "Last updated: May 4, 2026",
    "intro": "Zyrix runs on modern security standards, encryption, and least-privilege access. This page summarizes our security approach.",
    "sections": [
      [
        "Encryption",
        "Data in transit uses TLS 1.2+ and data at rest is encrypted with AES-256."
      ],
      [
        "Access control",
        "Employees access only the minimum required for their job; all access is logged."
      ],
      [
        "Backups",
        "Data is backed up regularly and stored across multiple regions."
      ],
      [
        "Account protection",
        "Two-factor authentication for sensitive operations. Passwords are stored hashed."
      ],
      [
        "Incident response",
        "If a security incident is detected, we communicate with affected users in a timely manner."
      ],
      [
        "Independent audits",
        "Our infrastructure undergoes periodic independent security audits."
      ]
    ],
    "contactNote": "For security matters: security@zyrix.co"
  },
  "AR": {
    "back": "\u0631\u062c\u0648\u0639",
    "badge": "\u0627\u0644\u0623\u0645\u0627\u0646",
    "title": "\u0646\u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0628\u062c\u062f\u0651\u064a\u0629.",
    "lastUpdated": "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: 4 \u0645\u0627\u064a\u0648 2026",
    "intro": "\u064a\u0639\u0645\u0644 \u0632\u064a\u0631\u0643\u0633 \u0648\u0641\u0642\u0627\u064b \u0644\u0645\u0639\u0627\u064a\u064a\u0631 \u0623\u0645\u0627\u0646 \u062d\u062f\u064a\u062b\u0629\u060c \u062a\u0634\u0641\u064a\u0631\u060c \u0648\u0645\u0628\u062f\u0623 \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0623\u062f\u0646\u0649. \u062a\u0644\u062e\u0635 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0646\u0647\u062c\u0646\u0627 \u0641\u064a \u0627\u0644\u0623\u0645\u0627\u0646.",
    "sections": [
      [
        "\u0627\u0644\u062a\u0634\u0641\u064a\u0631",
        "\u062a\u0646\u0642\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 TLS 1.2+ \u0648\u062a\u064f\u062e\u0632\u0651\u0646 \u0645\u0634\u0641\u0631\u0629 \u0628\u0640 AES-256."
      ],
      [
        "\u0627\u0644\u062a\u062d\u0643\u0651\u0645 \u0641\u064a \u0627\u0644\u0648\u0635\u0648\u0644",
        "\u064a\u062d\u0635\u0644 \u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0623\u062f\u0646\u0649 \u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0644\u0627\u0632\u0645\u0629\u061b \u0648\u062a\u064f\u0633\u0651\u062c\u0644 \u0643\u0644 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0648\u0635\u0648\u0644."
      ],
      [
        "\u0627\u0644\u0646\u0633\u062e \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a",
        "\u062a\u064f\u0646\u0633\u062e \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u062f\u0648\u0631\u064a\u0627\u064b \u0648\u062a\u064f\u062e\u0632\u0651\u0646 \u0641\u064a \u0645\u0646\u0627\u0637\u0642 \u0645\u062a\u0639\u062f\u0651\u062f\u0629."
      ],
      [
        "\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u062d\u0633\u0627\u0628",
        "\u062a\u062d\u0642\u0651\u0642 \u0628\u062e\u0637\u0648\u062a\u064a\u0646 \u0644\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0633\u0629. \u062a\u064f\u062e\u0632\u0651\u0646 \u0643\u0644\u0645\u0627\u062a \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064a \u0635\u064a\u063a\u0629 hashed."
      ],
      [
        "\u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629 \u0644\u0644\u062d\u0648\u0627\u062f\u062b",
        "\u0639\u0646\u062f \u0627\u0643\u062a\u0634\u0627\u0641 \u062d\u0627\u062f\u062b \u0623\u0645\u0646\u060c \u0646\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0627\u0644\u0645\u062a\u0623\u062b\u0631\u064a\u0646 \u0641\u064a \u0648\u0642\u062a \u0645\u0646\u0627\u0633\u0628."
      ],
      [
        "\u062a\u062f\u0642\u064a\u0642 \u0645\u0633\u062a\u0642\u0644",
        "\u062a\u062e\u0636\u0639 \u0628\u0646\u064a\u062a\u0646\u0627 \u0627\u0644\u062a\u062d\u062a\u064a\u0629 \u0644\u062a\u062f\u0642\u064a\u0642\u0627\u062a \u0623\u0645\u0646 \u062f\u0648\u0631\u064a\u0629 \u0645\u0633\u062a\u0642\u0644\u0629."
      ]
    ],
    "contactNote": "\u0644\u0644\u0623\u0645\u0648\u0631 \u0627\u0644\u0623\u0645\u0646\u064a\u0629: security@zyrix.co"
  }
};

export default function SecurityPage() {
  const i18n = useI18n();
  const lang = (i18n && i18n.lang) || "TR";
  const t = TXT[lang] || TXT.TR;
  const isArabic = lang === "AR";
  const isRTL = isArabic;
  const T = isArabic ? SA : C;

  const themeColor   = isArabic ? SA.green       : C.red;
  const themeDeep    = isArabic ? SA.greenDeep   : C.redDeep;
  const themeBright  = isArabic ? SA.greenBright : C.redBright;
  const themeGlowRGB = isArabic ? "0,108,53"     : "227,10,23";
  const shadowRGB    = isArabic ? "0,77,38"      : "58,5,9";

  const cardBase = {
    borderRadius: 30,
    background: "rgba(255,255,255,.88)",
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
        background: "linear-gradient(180deg,#fff 0%," + T.bgTinted + " 46%,#fff 100%)",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <section style={{ padding: "148px 32px 110px", position: "relative" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          
          <div style={{ marginBottom: 48 }}>
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
                marginBottom: 20,
              }}
            >
              ✦ {t.badge}
            </div>
            <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.06, letterSpacing: "-0.06em", fontWeight: 950 }}>
              {t.title}
            </h1>
            <div style={{ marginTop: 14, color: T.muted, fontSize: 14, fontWeight: 700 }}>
              {t.lastUpdated}
            </div>
            <p style={{ marginTop: 24, color: T.muted, fontSize: 18, lineHeight: 1.85, fontWeight: 650 }}>
              {t.intro}
            </p>
          </div>

          <div style={{ ...cardBase, padding: 38 }}>
            {t.sections.map((sec, i) => (
              <div key={i} style={{ marginBottom: i < t.sections.length - 1 ? 32 : 0 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, letterSpacing: "-0.025em", color: themeColor }}>
                  {sec[0]}
                </h2>
                <p style={{ margin: "10px 0 0", color: T.ink, fontSize: 16, lineHeight: 1.85, fontWeight: 600 }}>
                  {sec[1]}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 16,
              background: "rgba(" + themeGlowRGB + ",.06)",
              border: "1px solid " + T.hairline,
              fontSize: 14,
              fontWeight: 700,
              color: T.muted,
              textAlign: "center",
            }}
          >
            {t.contactNote}
          </div>
        </div>
      </section>
    </main>
      <FooterV2 />
    </>
  );
}

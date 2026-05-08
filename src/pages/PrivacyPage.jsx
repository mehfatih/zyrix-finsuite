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
    "badge": "GIZLILIK",
    "title": "Gizlilik Politikasi",
    "lastUpdated": "Son guncelleme: 4 Mayis 2026",
    "intro": "Bu politika, Zyrix'i kullandiginda hangi bilgileri topladigimizi, neden topladigimizi ve haklarini nasil koruduguzu aciklar.",
    "sections": [
      [
        "Topladigimiz bilgiler",
        "Hesap bilgileri (ad, e-posta, sirket), faturalama verisi, kullanim analitigi ve tarayicidan gelen teknik veriler."
      ],
      [
        "Nasil kullanilir",
        "Hizmeti saglamak, AI nakit akisi analizi olusturmak, urunu iyilestirmek ve seninle iletisim kurmak icin."
      ],
      [
        "Veri saklama",
        "Aktif kullanim suresi boyunca; hesap silindikten sonra makul bir surede silinir."
      ],
      [
        "Veri paylasimi",
        "Verini ucuncu taraflara satmiyoruz. Yalnizca hizmeti saglamak icin gerekli alt yapi saglayicilarla paylasiyoruz."
      ],
      [
        "Senin haklarin",
        "Verine erisim, duzeltme veya silme talep edebilirsin. privacy@zyrix.co adresinden ulas."
      ],
      [
        "Cerezler",
        "Hizmeti dogru sunmak ve kullanim olculmek icin cerez kullaniyoruz. Tarayici ayarlarindan kontrol edebilirsin."
      ]
    ],
    "contactNote": "Sorularin icin: privacy@zyrix.co"
  },
  "EN": {
    "back": "Back",
    "badge": "PRIVACY",
    "title": "Privacy Policy",
    "lastUpdated": "Last updated: May 4, 2026",
    "intro": "This policy explains what information we collect when you use Zyrix, why we collect it, and how we protect your rights.",
    "sections": [
      [
        "Information we collect",
        "Account information (name, email, company), billing data, usage analytics, and technical data from your browser."
      ],
      [
        "How it is used",
        "To provide the service, generate AI cashflow analyses, improve the product, and communicate with you."
      ],
      [
        "Data retention",
        "For the duration of active use; deleted within a reasonable period after account closure."
      ],
      [
        "Data sharing",
        "We do not sell your data. We share only with infrastructure providers needed to deliver the service."
      ],
      [
        "Your rights",
        "You may request access, correction, or deletion of your data. Reach us at privacy@zyrix.co."
      ],
      [
        "Cookies",
        "We use cookies to deliver the service correctly and measure usage. You can control these from your browser settings."
      ]
    ],
    "contactNote": "Questions? privacy@zyrix.co"
  },
  "AR": {
    "back": "\u0631\u062c\u0648\u0639",
    "badge": "\u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
    "title": "\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
    "lastUpdated": "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: 4 \u0645\u0627\u064a\u0648 2026",
    "intro": "\u062a\u0648\u0636\u0651\u062d \u0647\u0630\u0647 \u0627\u0644\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u0646\u062c\u0645\u0639\u0647\u0627 \u0639\u0646\u062f \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0640 \u0632\u064a\u0631\u0643\u0633\u060c \u0648\u0644\u0645\u0627\u0630\u0627\u060c \u0648\u0643\u064a\u0641 \u0646\u062d\u0645\u064a \u062d\u0642\u0648\u0642\u0643.",
    "sections": [
      [
        "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u0646\u062c\u0645\u0639\u0647\u0627",
        "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0628 (\u0627\u0644\u0627\u0633\u0645\u060c \u0627\u0644\u0628\u0631\u064a\u062f\u060c \u0627\u0644\u0634\u0631\u0643\u0629)\u060c \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0641\u0648\u062a\u0631\u0629\u060c \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u060c \u0648\u0628\u064a\u0627\u0646\u0627\u062a \u062a\u0642\u0646\u064a\u0629 \u0645\u0646 \u0627\u0644\u0645\u062a\u0635\u0641\u062d."
      ],
      [
        "\u0643\u064a\u0641 \u0646\u0633\u062a\u062e\u062f\u0645\u0647\u0627",
        "\u0644\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u062a\u0648\u0644\u064a\u062f \u062a\u062d\u0644\u064a\u0644\u0627\u062a \u062a\u062f\u0641\u0642 \u0627\u0644\u0646\u0642\u062f\u0640 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\u060c \u0648\u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0645\u0646\u062a\u062c\u060c \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643."
      ],
      [
        "\u0627\u0644\u0627\u062d\u062a\u0641\u0627\u0638 \u0628\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
        "\u0637\u0648\u0627\u0644 \u0641\u062a\u0631\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0641\u0639\u0651\u0627\u0644\u061b \u062a\u064f\u062d\u0630\u0641 \u062e\u0644\u0627\u0644 \u0641\u062a\u0631\u0629 \u0645\u0639\u0642\u0648\u0644\u0629 \u0628\u0639\u062f \u0625\u0639\u0644\u0627\u0642 \u0627\u0644\u062d\u0633\u0627\u0628."
      ],
      [
        "\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
        "\u0644\u0627 \u0646\u0628\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a\u0643. \u0646\u0634\u0627\u0631\u0643\u0647\u0627 \u0641\u0642\u0637 \u0645\u0639 \u0645\u0648\u0641\u0631\u064a \u0627\u0644\u0628\u0646\u064a\u0629 \u0627\u0644\u062a\u062d\u062a\u064a\u0629 \u0627\u0644\u0644\u0627\u0632\u0645\u064a\u0646 \u0644\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062e\u062f\u0645\u0629."
      ],
      [
        "\u062d\u0642\u0648\u0642\u0643",
        "\u064a\u0645\u0643\u0646\u0643 \u0637\u0644\u0628 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0623\u0648 \u062a\u0635\u062d\u064a\u062d\u0647\u0627 \u0623\u0648 \u062d\u0630\u0641\u0647\u0627. \u062a\u0648\u0627\u0635\u0644 \u0639\u0644\u0649 privacy@zyrix.co."
      ],
      [
        "\u0627\u0644\u0643\u0648\u0643\u064a\u0632",
        "\u0646\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0643\u0648\u0643\u064a\u0632 \u0644\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0628\u0634\u0643\u0644 \u0635\u062d\u064a\u062d \u0648\u0642\u064a\u0627\u0633 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u062d\u0643\u0651\u0645 \u0641\u064a\u0647\u0627 \u0645\u0646 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u0635\u0641\u062d."
      ]
    ],
    "contactNote": "\u0644\u0644\u0623\u0633\u0626\u0644\u0629: privacy@zyrix.co"
  }
};

export default function PrivacyPage() {
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

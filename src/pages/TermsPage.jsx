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
    "badge": "KOSULLAR",
    "title": "Hizmet Sartlari",
    "lastUpdated": "Son guncelleme: 4 Mayis 2026",
    "intro": "Zyrix'i kullandiginda bu sartlari kabul etmis olursun. Sartlar hesap olusturma, urunun kullanimi ve iliskimizin sinirlarini tanimlar.",
    "sections": [
      [
        "Hesabin",
        "Hesabinin guvenliginden sen sorumlusun. Erisim bilgilerini paylasma; supheli durumda bize haber ver."
      ],
      [
        "Kabul edilebilir kullanim",
        "Yasalara aykiri, kotu niyetli veya hizmeti bozacak sekilde Zyrix'i kullanmamayi kabul edersin."
      ],
      [
        "Faturalama",
        "Abonelik ucretleri pesin alinir. Iptal etmedigin surece donemsel olarak yenilenir."
      ],
      [
        "Veri sahipligi",
        "Hesabina ekledigin veriler senindir. Biz yalnizca hizmeti saglamak icin isleriz."
      ],
      [
        "Sorumluluk siniri",
        "Zyrix \"oldugu gibi\" sunulur. Yasalarin izin verdigi olcude dolayli zararlardan sorumlu degiliz."
      ],
      [
        "Degisiklikler",
        "Bu sartlari guncelleyebiliriz. Onemli degisiklikler olursa seni bilgilendiririz."
      ]
    ],
    "contactNote": "Sorularin icin: privacy@zyrix.co"
  },
  "EN": {
    "back": "Back",
    "badge": "TERMS",
    "title": "Terms of Service",
    "lastUpdated": "Last updated: May 4, 2026",
    "intro": "By using Zyrix you agree to these terms. They define account creation, product usage, and the boundaries of our relationship.",
    "sections": [
      [
        "Your account",
        "You are responsible for your account security. Do not share credentials; let us know if anything looks suspicious."
      ],
      [
        "Acceptable use",
        "You agree not to use Zyrix illegally, maliciously, or in ways that disrupt the service."
      ],
      [
        "Billing",
        "Subscription fees are charged in advance. They renew periodically unless you cancel."
      ],
      [
        "Data ownership",
        "Data you add to your account is yours. We only process it to provide the service."
      ],
      [
        "Liability",
        "Zyrix is provided \"as is\". To the extent permitted by law, we are not liable for indirect damages."
      ],
      [
        "Changes",
        "We may update these terms. We will notify you of significant changes."
      ]
    ],
    "contactNote": "Questions? privacy@zyrix.co"
  },
  "AR": {
    "back": "\u0631\u062c\u0648\u0639",
    "badge": "\u0627\u0644\u0634\u0631\u0648\u0637",
    "title": "\u0634\u0631\u0648\u0637 \u0627\u0644\u062e\u062f\u0645\u0629",
    "lastUpdated": "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: 4 \u0645\u0627\u064a\u0648 2026",
    "intro": "\u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0640 \u0632\u064a\u0631\u0643\u0633\u060c \u0641\u0625\u0646\u0643 \u062a\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0648\u0637. \u062a\u062d\u062f\u062f \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628 \u0648\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0645\u0646\u062a\u062c \u0648\u062d\u062f\u0648\u062f \u0639\u0644\u0627\u0642\u062a\u0646\u0627.",
    "sections": [
      [
        "\u062d\u0633\u0627\u0628\u0643",
        "\u0623\u0646\u062a \u0645\u0633\u0624\u0648\u0644 \u0639\u0646 \u0623\u0645\u0627\u0646 \u062d\u0633\u0627\u0628\u0643. \u0644\u0627 \u062a\u0634\u0627\u0631\u0643 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062f\u062e\u0648\u0644\u061b \u0623\u0639\u0644\u0645\u0646\u0627 \u0639\u0646\u062f \u0623\u064a \u0627\u0634\u062a\u0628\u0627\u0647."
      ],
      [
        "\u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0645\u0642\u0628\u0648\u0644",
        "\u062a\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0639\u062f\u0645 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0632\u064a\u0631\u0643\u0633 \u0628\u0637\u0631\u064a\u0642\u0629 \u063a\u064a\u0631 \u0642\u0627\u0646\u0648\u0646\u064a\u0629 \u0623\u0648 \u062e\u0628\u064a\u062b\u0629 \u0623\u0648 \u062a\u0639\u0637\u0651\u0644 \u0627\u0644\u062e\u062f\u0645\u0629."
      ],
      [
        "\u0627\u0644\u0641\u0648\u062a\u0631\u0629",
        "\u062a\u064f\u0641\u0631\u0636 \u0631\u0633\u0648\u0645 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0642\u062f\u0651\u0645\u0627\u064b \u0648\u062a\u064f\u062c\u062f\u0651\u062f \u062f\u0648\u0631\u064a\u0627\u064b \u0625\u0644\u0627 \u0625\u0630\u0627 \u0623\u0644\u063a\u064a\u062a\u0647\u0627."
      ],
      [
        "\u0645\u0644\u0643\u064a\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a",
        "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u062a\u0636\u064a\u0641\u0647\u0627 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u0643 \u0645\u0644\u0643\u064f\u0643. \u0646\u0639\u0627\u0644\u062c\u0647\u0627 \u0641\u0642\u0637 \u0644\u0640\u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u062e\u062f\u0645\u0629."
      ],
      [
        "\u062d\u062f\u0648\u062f \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064a\u0629",
        "\u062a\u064f\u0642\u062f\u0645 \u0632\u064a\u0631\u0643\u0633 \"\u0643\u0645\u0627 \u0647\u064a\". \u0641\u064a \u062d\u062f\u0648\u062f \u0645\u0627 \u062a\u0633\u0645\u062d \u0628\u0647 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u060c \u0644\u0633\u0646\u0627 \u0645\u0633\u0624\u0648\u0644\u064a\u0646 \u0639\u0646 \u0627\u0644\u0623\u0636\u0631\u0627\u0631 \u0627\u0644\u063a\u064a\u0631 \u0645\u0628\u0627\u0634\u0631\u0629."
      ],
      [
        "\u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a",
        "\u0642\u062f \u0646\u062d\u062f\u0651\u062b \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0648\u0637. \u0633\u0646\u0639\u0644\u0645\u0643 \u0628\u0623\u064a \u062a\u063a\u064a\u064a\u0631\u0627\u062a \u062c\u0648\u0647\u0631\u064a\u0629."
      ]
    ],
    "contactNote": "\u0644\u0644\u0623\u0633\u0626\u0644\u0629: privacy@zyrix.co"
  }
};

export default function TermsPage() {
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

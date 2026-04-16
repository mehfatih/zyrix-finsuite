"use client";

import { useLocale, useTranslations } from "next-intl";

const STATS = [
  { num: "14",    key: "features" },
  { num: "5",     key: "clients"  },
  { num: "3",     key: "languages"},
  { num: "81/110",key: "score"    },
  { num: "$19",   key: "starting" },
  { num: "14",    key: "trial"    },
];

export function StatsStrip() {
  const t      = useTranslations("strip");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <div style={{
      background: "#F9FAFB",
      borderTop: "1px solid #E5E7EB",
      borderBottom: "1px solid #E5E7EB",
      padding: "20px 24px",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "center", flexWrap: "wrap", gap: 10,
        direction: isRTL ? "rtl" : "ltr",
      }}>
        {STATS.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Stat box */}
            <div style={{
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 18px",
              background: "#fff",
              textAlign: "center",
              minWidth: 82,
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 900, color: "#2563EB",
                fontFamily: "'Nunito Sans', sans-serif", lineHeight: 1.1,
              }}>
                {s.num}
              </div>
              <div style={{
                fontSize: 11, color: "#6B7280", fontWeight: 600,
                marginTop: 4, lineHeight: 1.3,
              }}>
                {t(s.key as "features")}
              </div>
            </div>

            {/* Divider between items */}
            {i < STATS.length - 1 && (
              <div style={{ width: 1, height: 36, background: "#E5E7EB" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const FAQ_KEYS = ["q1","q2","q3","q4","q5","q6"] as const;

export function FAQSection() {
  const t      = useTranslations("faq");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ padding: "52px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", direction: isRTL ? "rtl" : "ltr" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{
            display: "inline-block", background: "#EFF6FF", color: "#1D4ED8",
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100, marginBottom: 10,
          }}>{t("tag")}</span>
          <h2 style={{ fontSize: "clamp(26px,3vw,34px)", fontWeight: 900, color: "#111827", lineHeight: 1.25 }}>
            {t("title")}
          </h2>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQ_KEYS.map((key, i) => (
            <div key={key} style={{
              border: `1px solid ${open === i ? "#2563EB" : "#E5E7EB"}`,
              borderRadius: 10, overflow: "hidden", transition: "border-color .2s",
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", padding: "15px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 700, color: "#111827",
                  fontFamily: "inherit", textAlign: isRTL ? "right" : "left",
                  gap: 12,
                }}
              >
                <span>{t(key)}</span>
                <span style={{
                  fontSize: 16, color: open === i ? "#2563EB" : "#9CA3AF",
                  transform: open === i ? "rotate(180deg)" : "none",
                  transition: "transform .25s", flexShrink: 0,
                }}>▾</span>
              </button>

              <div style={{
                maxHeight: open === i ? 200 : 0,
                overflow: "hidden", transition: "max-height .3s ease",
              }}>
                <p style={{
                  padding: "0 18px 16px",
                  fontSize: 14, color: "#6B7280", lineHeight: 1.7, margin: 0,
                }}>
                  {t(key.replace("q","a") as "a1")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}